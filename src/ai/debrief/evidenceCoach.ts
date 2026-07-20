import type OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getOpenAIModel } from "@/ai/openai/server";
import { getAdaptiveProvider } from "@/ai/providers/server";
import { idSchema } from "@/ai/schemas/common";
import { institutionProfileSchema } from "@/ai/schemas/institution";
import { scenarioPackageSchema } from "@/ai/schemas/scenario";
import {
  applyCriticalAction,
  createCanonicalTrace,
  createSimulationState,
} from "@/engine/simulation/physics";

export const evidenceCoachRequestSchema = z.object({
  scenario: scenarioPackageSchema,
  profile: institutionProfileSchema,
  actionIds: z.array(idSchema).max(20),
  question: z.string().trim().min(3).max(500),
});

const evidenceCoachOutputSchema = z.object({
  answer: z.string().trim().min(1).max(900),
  evidenceIds: z.array(idSchema).max(6),
  sourceFactIds: z.array(idSchema).max(6),
});

export type EvidenceCoachProvider = Pick<OpenAI, "responses">;
export type EvidenceCoachAnswer = z.infer<typeof evidenceCoachOutputSchema> & {
  provenance: "live-coach" | "reviewed-coach";
};

function buildTrace(request: z.infer<typeof evidenceCoachRequestSchema>) {
  const validActionIds = new Set(request.scenario.criticalActions.map((action) => action.id));
  if (request.actionIds.some((id) => !validActionIds.has(id))) {
    throw new Error("Question includes an unknown action history.");
  }
  const state = request.actionIds.reduce(
    (current, actionId) => applyCriticalAction(request.scenario, current, actionId),
    createSimulationState(request.scenario),
  );
  return createCanonicalTrace(request.scenario, state);
}

function relevantEvidenceIds(
  question: string,
  scenario: z.infer<typeof scenarioPackageSchema>,
  availableEvidence: Array<{ id: string; label: string; description: string }>,
) {
  const normalized = question.trim().toLowerCase();
  const exactPrompt = scenario.learnerPresentation.coachPrompts.find(
    (prompt) => prompt.question.trim().toLowerCase() === normalized,
  );
  if (exactPrompt && availableEvidence.some((item) => item.id === exactPrompt.evidenceId)) {
    return [exactPrompt.evidenceId];
  }

  const queryTerms = new Set(
    normalized
      .split(/[^a-z0-9]+/)
      .filter((term) => term.length >= 4),
  );
  const ranked = availableEvidence
    .map((item) => {
      const promptText = scenario.learnerPresentation.coachPrompts
        .filter((prompt) => prompt.evidenceId === item.id)
        .map((prompt) => prompt.question)
        .join(" ");
      const terms = (text: string) => new Set(
        text.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length >= 4),
      );
      const labelTerms = terms(item.label);
      const descriptionTerms = terms(item.description);
      const promptTerms = terms(promptText);
      const score = [...queryTerms].reduce(
        (total, term) =>
          total
          + (labelTerms.has(term) ? 3 : 0)
          + (promptTerms.has(term) ? 2 : 0)
          + (descriptionTerms.has(term) ? 1 : 0),
        0,
      );
      return { id: item.id, score };
    })
    .sort((left, right) => right.score - left.score);
  const highestScore = ranked[0]?.score ?? 0;
  const preferred = ranked
    .filter((item) => item.score > 0 && item.score === highestScore)
    .slice(0, 3)
    .map((item) => item.id);
  return preferred.length ? preferred : availableEvidence.slice(0, 3).map((item) => item.id);
}

export function createReviewedEvidenceAnswer(
  request: z.infer<typeof evidenceCoachRequestSchema>,
): EvidenceCoachAnswer {
  const trace = buildTrace(request);
  const availableEvidence = request.scenario.evidence.filter((item) => trace.evidenceIds.includes(item.id));
  const evidenceIds = relevantEvidenceIds(request.question, request.scenario, availableEvidence);
  const selectedEvidence = evidenceIds
    .map((id) => availableEvidence.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const answer = selectedEvidence.length
    ? `${selectedEvidence.map((item) => `${item.label}: ${item.description}`).join(" ")} ${trace.transferRules[0]}`
    : `This run did not collect evidence that answers the question directly. Replay the rehearsal and compare what each available route establishes before the high-impact action. ${trace.transferRules[0]}`;
  return {
    answer,
    evidenceIds,
    sourceFactIds: [],
    provenance: "reviewed-coach",
  };
}

export async function answerEvidenceQuestion(
  request: z.infer<typeof evidenceCoachRequestSchema>,
  provider: EvidenceCoachProvider | null = getAdaptiveProvider(),
): Promise<EvidenceCoachAnswer> {
  if (request.scenario.sourceProfileId !== request.profile.id) {
    throw new Error("Scenario and institution context do not match.");
  }
  const trace = buildTrace(request);
  const evidence = request.scenario.evidence.filter((item) => trace.evidenceIds.includes(item.id));
  const approvedSourceIds = new Set(
    request.profile.sources
      .filter((source) => source.reviewStatus === "approved")
      .map((source) => source.id),
  );
  const approvedFacts = request.profile.facts.filter(
    (fact) =>
      fact.status === "verified"
      && request.scenario.sourceFactIds.includes(fact.id)
      && fact.sourceIds.some((sourceId) => approvedSourceIds.has(sourceId)),
  );
  if (!provider) return createReviewedEvidenceAnswer(request);

  try {
    const response = await provider.responses.parse({
      model: getOpenAIModel(),
      instructions: `You are the Evidence Coach for a completed digital-judgment rehearsal. Answer the learner's question using only the supplied recorded trace, revealed evidence, approved facts, and transfer rules. Explain what a verification channel did and did not establish. Do not add events, actions, policies, attack instructions, or facts. Do not shame or score the learner. Cite only listed evidenceIds and sourceFactIds. Keep the answer under 120 words.`,
      input: JSON.stringify({
        question: request.question,
        trace,
        evidence,
        approvedFacts: approvedFacts.map(({ id, label, value }) => ({ id, label, value })),
        transferRules: trace.transferRules,
      }),
      text: { format: zodTextFormat(evidenceCoachOutputSchema, "evidence_coach") },
    }, { timeout: 6_000 });
    const output = response.output_parsed;
    if (!output) throw new Error("No grounded answer.");
    if (output.evidenceIds.some((id) => !trace.evidenceIds.includes(id))) {
      throw new Error("Answer cited undiscovered evidence.");
    }
    const approvedFactIds = new Set(approvedFacts.map((fact) => fact.id));
    if (output.sourceFactIds.some((id) => !approvedFactIds.has(id))) {
      throw new Error("Answer cited an unapproved fact.");
    }
    return { ...output, provenance: "live-coach" };
  } catch {
    return createReviewedEvidenceAnswer(request);
  }
}
