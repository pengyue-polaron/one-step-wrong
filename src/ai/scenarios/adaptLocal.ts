import type OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { OPENAI_MODEL } from "@/ai/openai/server";
import { getAdaptiveProvider } from "@/ai/providers/server";
import { shortTextSchema } from "@/ai/schemas/common";
import { validateProfileForApproval } from "@/ai/schemas/institution";
import { scenarioPackageSchema } from "@/ai/schemas/scenario";
import {
  scenarioGenerationRequestSchema,
  validateScenarioAgainstProfile,
  validateScenarioPublicationMode,
} from "@/ai/scenarios/generate";
import { assertScenarioCoverage } from "@/engine/simulation/coverage";
import {
  getReviewedScenario,
  reviewedScenarioIds,
  reviewedScenarioRegistry,
} from "@/fixtures/reviewedScenarioRegistry";

const localScenarioPlanSchema = z.object({
  templateId: z.enum(reviewedScenarioIds),
  title: shortTextSchema,
  tagline: shortTextSchema,
});

export type LocalScenarioAdaptationProvider = Pick<OpenAI, "responses">;

export async function adaptReviewedScenarioWithCodex(
  request: z.infer<typeof scenarioGenerationRequestSchema>,
  provider: LocalScenarioAdaptationProvider | null = getAdaptiveProvider(),
) {
  const approval = validateProfileForApproval(request.profile);
  if (!approval.success || request.profile.approval.status !== "approved") {
    throw new Error("Institution profile must be approved before generation.");
  }
  if (!provider) throw new Error("Local adaptive generation is not configured.");

  const candidates = reviewedScenarioIds.map((id) => {
    const scenario = reviewedScenarioRegistry[id].scenario;
    return {
      id,
      title: scenario.title,
      summary: scenario.summary,
      ordinaryTask: scenario.intro.ordinaryTask,
      learningObjective: scenario.intro.learningObjective,
    };
  });
  const response = await provider.responses.parse({
    model: OPENAI_MODEL,
    instructions: `Select the reviewed rehearsal whose judgment pattern best fits the teaching brief. Then write a concise title and tagline that remain faithful to that selected rehearsal's existing task, actions, evidence, and outcomes. Do not invent a new task, institution fact, service, person, action, or policy. Do not use any protected term. Return only the selected template ID, title, and tagline.`,
    input: JSON.stringify({
      teachingBrief: request.brief,
      protectedTerms: request.profile.protectedTerms,
      candidates,
    }),
    text: { format: zodTextFormat(localScenarioPlanSchema, "local_scenario_plan") },
  }, { timeout: 30_000 });
  const plan = response.output_parsed;
  if (!plan) throw new Error("Local Codex returned no scenario plan.");

  const selected = structuredClone(getReviewedScenario(plan.templateId).scenario);
  if (selected.sourceProfileId !== request.profile.id) {
    throw new Error("The selected reviewed rehearsal does not match the approved profile.");
  }
  selected.title = plan.title;
  selected.tagline = plan.tagline;

  const scenario = scenarioPackageSchema.parse(selected);
  const approvedFactIds = new Set(
    request.profile.facts
      .filter((fact) => fact.status === "verified" && fact.sourceIds.some(
        (sourceId) => request.profile.sources.find((source) => source.id === sourceId)?.reviewStatus === "approved",
      ))
      .map((fact) => fact.id),
  );
  validateScenarioAgainstProfile(scenario, approvedFactIds);
  validateScenarioPublicationMode(scenario, request.profile);
  assertScenarioCoverage(scenario);
  return { scenario, templateId: plan.templateId };
}
