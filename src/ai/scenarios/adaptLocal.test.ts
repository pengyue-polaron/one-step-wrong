import { describe, expect, it, vi } from "vitest";
import { adaptReviewedScenario, type ScenarioAdaptationProvider } from "@/ai/scenarios/adaptLocal";
import { reviewedNyuInstitutionProfile } from "@/fixtures/institutionProfile";

const brief = {
  threatTopic: "Overshared research material",
  targetLearner: "Student documentary teams",
  ordinaryTask: "Give teammates enough access to review interview quotations.",
  environment: "A shared campus document workspace",
  pressure: "The rough cut is due tonight",
  learningObjective: "Choose an audience and permission scope that fits the task.",
  durationMinutes: 8,
  tone: "realistic" as const,
};

function providerFor(output: unknown) {
  return {
    responses: { parse: vi.fn().mockResolvedValue({ output_parsed: output }) },
  } as unknown as ScenarioAdaptationProvider;
}

describe("reviewed-scenario adaptation", () => {
  it("matches a brief to a reviewed topology and revalidates its bounded copy", async () => {
    const result = await adaptReviewedScenario(
      { profile: reviewedNyuInstitutionProfile, brief, useFixture: false, reviewedScenarioId: "the-voice-you-know" },
      providerFor({
        templateId: "sharing-scope",
        title: "Who Can See the Draft?",
        tagline: "Choose the audience before the deadline chooses for you.",
      }),
    );

    expect(result.templateId).toBe("sharing-scope");
    expect(result.scenario.id).toBe("sharing-scope");
    expect(result.scenario.title).toBe("Who Can See the Draft?");
    expect(result.scenario.criticalActions).not.toHaveLength(0);
  });

  it("rejects protected institution terms in adapted labels", async () => {
    await expect(adaptReviewedScenario(
      { profile: reviewedNyuInstitutionProfile, brief, useFixture: false, reviewedScenarioId: "the-voice-you-know" },
      providerFor({
        templateId: "sharing-scope",
        title: "NYU Draft Review",
        tagline: "Choose the audience before sharing.",
      }),
    )).rejects.toThrow("leaked a protected term");
  });
});
