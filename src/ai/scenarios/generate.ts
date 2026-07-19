import type OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { OPENAI_MODEL } from "@/ai/openai/server";
import { getAdaptiveProvider } from "@/ai/providers/server";
import { buildScenarioArchitectInput, scenarioArchitectInstructions } from "@/ai/prompts/scenarioArchitect";
import { institutionProfileSchema, validateProfileForApproval } from "@/ai/schemas/institution";
import {
  scenarioPackageOutputSchema,
  scenarioPackageSchema,
  type ScenarioPackage,
} from "@/ai/schemas/scenario";
import { assertScenarioCoverage } from "@/engine/simulation/coverage";
import { reviewedScenarioIds } from "@/fixtures/reviewedScenarioRegistry";

export const scenarioBriefSchema = z.object({
  threatTopic: z.string().trim().min(3).max(120),
  targetLearner: z.string().trim().min(3).max(120),
  ordinaryTask: z.string().trim().min(8).max(500),
  environment: z.string().trim().min(3).max(300),
  pressure: z.string().trim().min(3).max(300),
  learningObjective: z.string().trim().min(8).max(500),
  durationMinutes: z.number().int().min(3).max(30),
  tone: z.enum(["supportive", "realistic", "challenging"]),
});

export type ScenarioBrief = z.infer<typeof scenarioBriefSchema>;

export const scenarioGenerationRequestSchema = z.object({
  profile: institutionProfileSchema,
  brief: scenarioBriefSchema,
  useFixture: z.boolean().default(false),
  reviewedScenarioId: z.enum(reviewedScenarioIds).default("the-voice-you-know"),
});

export type ScenarioGenerationProvider = Pick<OpenAI, "responses">;

export function validateScenarioAgainstProfile(scenario: ScenarioPackage, profileFactIds: Set<string>) {
  const missing = scenario.sourceFactIds.filter((id) => !profileFactIds.has(id));
  const nestedMissing = scenario.worldBible.immutableFacts.flatMap((fact) =>
    fact.sourceFactIds.filter((id) => !profileFactIds.has(id)),
  );
  if (missing.length || nestedMissing.length) {
    throw new Error(`Scenario references unapproved institution facts: ${[...missing, ...nestedMissing].join(", ")}`);
  }
}

export function validateScenarioPublicationMode(scenario: ScenarioPackage, profile: z.infer<typeof institutionProfileSchema>) {
  if (scenario.sourceProfileId !== profile.id) {
    throw new Error("Scenario does not reference the approved Institution Profile.");
  }
  if (scenario.publicationMode !== profile.publicationMode) {
    throw new Error("Scenario publication mode does not match the approved profile.");
  }
  if (profile.publicationMode !== "brand-safe-fictionalized") return;

  const serialized = JSON.stringify(scenario).toLowerCase();
  const leakedTerm = profile.protectedTerms.find((term) => serialized.includes(term.toLowerCase()));
  if (leakedTerm) throw new Error(`Brand-safe scenario leaked a protected term: ${leakedTerm}`);
}

export async function generateScenario(
  request: z.input<typeof scenarioGenerationRequestSchema>,
  provider: ScenarioGenerationProvider | null = getAdaptiveProvider(),
) {
  const approval = validateProfileForApproval(request.profile);
  if (!approval.success || request.profile.approval.status !== "approved") {
    throw new Error("Institution profile must be approved before generation.");
  }
  if (!provider) throw new Error("Adaptive generation is not configured.");

  const response = await provider.responses.parse({
    model: OPENAI_MODEL,
    instructions: scenarioArchitectInstructions,
    input: buildScenarioArchitectInput(request.profile, request.brief),
    text: { format: zodTextFormat(scenarioPackageOutputSchema, "scenario_package") },
  });
  if (!response.output_parsed) throw new Error("Scenario generation returned no structured package.");

  const scenario = scenarioPackageSchema.parse(response.output_parsed);
  const approvedFactIds = new Set(
    request.profile.facts
      .filter((fact) => fact.status === "verified" && fact.sourceIds.some((sourceId) => request.profile.sources.find((source) => source.id === sourceId)?.reviewStatus === "approved"))
      .map((fact) => fact.id),
  );
  validateScenarioAgainstProfile(scenario, approvedFactIds);
  validateScenarioPublicationMode(scenario, request.profile);
  assertScenarioCoverage(scenario);
  return scenario;
}
