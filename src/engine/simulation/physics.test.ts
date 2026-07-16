import { describe, expect, it } from "vitest";
import { voiceYouKnowScenario } from "@/fixtures/voiceYouKnow";
import {
  applyCriticalAction,
  createCanonicalTrace,
  createSimulationState,
  eventIsAllowed,
} from "@/engine/simulation/physics";

function run(actions: string[]) {
  return actions.reduce(
    (state, action) => applyCriticalAction(voiceYouKnowScenario, state, action),
    createSimulationState(voiceYouKnowScenario),
  );
}

describe("deterministic simulation physics", () => {
  it("reaches the same safe ending for the same critical action trace", () => {
    const first = createCanonicalTrace(voiceYouKnowScenario, run(["pause-payment", "verify-adviser"]));
    const second = createCanonicalTrace(voiceYouKnowScenario, run(["pause-payment", "verify-adviser"]));
    expect(first).toEqual(second);
    expect(first.endingId).toBe("safe");
    expect(first.recoveryRequired).toBe(false);
    expect(first.missedRecoveryActionIds).toEqual([]);
  });

  it("distinguishes expanded and contained outcomes", () => {
    expect(createCanonicalTrace(voiceYouKnowScenario, run(["approve-change"])).endingId).toBe("expanded");
    const contained = run([
      "approve-change",
      "preserve-evidence",
      "revoke-access",
      "notify-team",
      "report-incident",
    ]);
    expect(createCanonicalTrace(voiceYouKnowScenario, contained).endingId).toBe("contained");
    expect(createCanonicalTrace(voiceYouKnowScenario, contained).recoveryRequired).toBe(true);
  });

  it("covers the caution ending when useful friction is incomplete", () => {
    const trace = createCanonicalTrace(voiceYouKnowScenario, run(["pause-payment"]));
    expect(trace.endingId).toBe("caution");
    expect(trace.recoveryRequired).toBe(false);
  });

  it("does not unlock verification dialogue from free text or unrelated actions", () => {
    expect(eventIsAllowed(voiceYouKnowScenario, "adviser-confirmation", [])).toBe(false);
    expect(eventIsAllowed(voiceYouKnowScenario, "adviser-confirmation", ["pause-payment"])).toBe(false);
    expect(eventIsAllowed(voiceYouKnowScenario, "adviser-confirmation", ["verify-adviser"])).toBe(true);
  });

  it("returns the same state when an action is repeated", () => {
    const once = run(["pause-payment"]);
    expect(applyCriticalAction(voiceYouKnowScenario, once, "pause-payment")).toBe(once);
  });

  it("creates fresh replay state without canonical or trace leakage", () => {
    const firstRun = run(["approve-change", "share-folder"]);
    const replay = createSimulationState(voiceYouKnowScenario);
    expect(replay).toEqual({
      canonical: voiceYouKnowScenario.worldBible.initialState,
      actionIds: [],
      evidenceIds: [],
    });
    expect(replay.canonical).not.toBe(firstRun.canonical);
    expect(JSON.stringify(createCanonicalTrace(voiceYouKnowScenario, firstRun))).not.toContain("Dr. Maya Chen");
  });

  it("selects endings from declarative package rules rather than flagship IDs", () => {
    const generated = JSON.parse(
      JSON.stringify(voiceYouKnowScenario).replaceAll('"verify-adviser"', '"check-known-channel"'),
    ) as typeof voiceYouKnowScenario;
    const state = ["pause-payment", "check-known-channel"].reduce(
      (current, action) => applyCriticalAction(generated, current, action),
      createSimulationState(generated),
    );
    expect(createCanonicalTrace(generated, state).endingId).toBe("safe");
  });
});
