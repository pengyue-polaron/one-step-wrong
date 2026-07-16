import { describe, expect, it, vi } from "vitest";
import { generateScenario, type ScenarioGenerationProvider } from "@/ai/scenarios/generate";
import { northbridgeInstitutionProfile } from "@/fixtures/institutionProfile";
import { voiceYouKnowScenario } from "@/fixtures/voiceYouKnow";

const brief = {
  threatTopic: "Voice impersonation",
  targetLearner: "Student organization treasurers",
  ordinaryTask: "Finalize a guest-speaker reimbursement before an event.",
  environment: "Student organization finance workspace",
  pressure: "The event begins in twenty minutes",
  learningObjective: "Verify high-impact requests through an independently known channel.",
  durationMinutes: 8,
  tone: "realistic" as const,
};

describe("Scenario Architect adapter", () => {
  it("accepts only a validated package grounded in approved profile facts", async () => {
    const parse = vi.fn().mockResolvedValue({ output_parsed: voiceYouKnowScenario });
    const provider = { responses: { parse } } as unknown as ScenarioGenerationProvider;
    const scenario = await generateScenario(
      { profile: northbridgeInstitutionProfile, brief, useFixture: false },
      provider,
    );
    expect(scenario.id).toBe("the-voice-you-know");
    expect(parse).toHaveBeenCalledOnce();
    expect(parse.mock.calls[0][0].tools).toBeUndefined();
  });

  it("rejects a generated institution fact outside the approved profile", async () => {
    const generated = structuredClone(voiceYouKnowScenario);
    generated.sourceFactIds.push("invented-campus-service");
    const provider = { responses: { parse: vi.fn().mockResolvedValue({ output_parsed: generated }) } } as unknown as ScenarioGenerationProvider;
    await expect(generateScenario({ profile: northbridgeInstitutionProfile, brief, useFixture: false }, provider)).rejects.toThrow("unapproved institution facts");
  });
});
