import { describe, expect, it, vi } from "vitest";
import {
  generateScenario,
  validateScenarioPublicationMode,
  type ScenarioGenerationProvider,
} from "@/ai/scenarios/generate";
import { reviewedNyuInstitutionProfile } from "@/fixtures/institutionProfile";
import { voiceYouKnowScenario } from "@/fixtures/voiceYouKnow";
import { sharingScopeScenario } from "@/fixtures/sharingScope";
import type { InstitutionProfile } from "@/ai/schemas/institution";
import type { ScenarioPackage } from "@/ai/schemas/scenario";

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
      { profile: reviewedNyuInstitutionProfile, brief, useFixture: false },
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
    await expect(generateScenario({ profile: reviewedNyuInstitutionProfile, brief, useFixture: false }, provider)).rejects.toThrow("unapproved institution facts");
  });

  it("rejects protected institution terms in brand-safe output", () => {
    const leaked = structuredClone(voiceYouKnowScenario);
    leaked.summary = "An NYU student handles an urgent payment request.";
    expect(() => validateScenarioPublicationMode(leaked, reviewedNyuInstitutionProfile)).toThrow("protected term");
  });

  it("keeps both reviewed rehearsals within the fictionalized publication boundary", () => {
    expect(() => validateScenarioPublicationMode(voiceYouKnowScenario, reviewedNyuInstitutionProfile)).not.toThrow();
    expect(() => validateScenarioPublicationMode(sharingScopeScenario, reviewedNyuInstitutionProfile)).not.toThrow();
  });

  it("rejects a generated package with a declared but unreachable ending", async () => {
    const generated = structuredClone(voiceYouKnowScenario);
    const safe = generated.endings.find((ending) => ending.id === "safe")!;
    safe.forbiddenActionIds.push("verify-adviser");
    const provider = { responses: { parse: vi.fn().mockResolvedValue({ output_parsed: generated }) } } as unknown as ScenarioGenerationProvider;
    await expect(generateScenario({ profile: reviewedNyuInstitutionProfile, brief, useFixture: false }, provider)).rejects.toThrow("unreachable outcomes: safe");
  });

  it("allows approved terminology only in matching authorized-exact mode", () => {
    const profile: InstitutionProfile = structuredClone(reviewedNyuInstitutionProfile);
    profile.publicationMode = "authorized-exact";
    const exact: ScenarioPackage = structuredClone(voiceYouKnowScenario);
    exact.publicationMode = "authorized-exact";
    exact.summary = "An NYU student handles an urgent payment request.";
    expect(() => validateScenarioPublicationMode(exact, profile)).not.toThrow();
  });
});
