import { describe, expect, it } from "vitest";
import { voiceYouKnowScenario } from "@/fixtures/voiceYouKnow";
import {
  applyCriticalAction,
  createCanonicalTrace,
  createSimulationState,
  evaluateTransferProbe,
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
      "notify-team",
      "report-incident",
    ]);
    const trace = createCanonicalTrace(voiceYouKnowScenario, contained);
    expect(trace.endingId).toBe("contained");
    expect(trace.recoveryRequired).toBe(true);
    expect(trace.missedRecoveryActionIds).toEqual([]);
    expect(trace.completedRecoveryActionIds).not.toContain("revoke-access");
  });

  it("blocks premature recovery and requires only recovery for affected layers", () => {
    expect(() => run(["revoke-access"])).toThrow("not available");

    const exposedAccess = run(["share-folder", "preserve-evidence", "notify-team", "report-incident"]);
    const incomplete = createCanonicalTrace(voiceYouKnowScenario, exposedAccess);
    expect(incomplete.endingId).toBe("expanded");
    expect(incomplete.missedRecoveryActionIds).toEqual(["revoke-access"]);

    const contained = createCanonicalTrace(
      voiceYouKnowScenario,
      applyCriticalAction(voiceYouKnowScenario, exposedAccess, "revoke-access"),
    );
    expect(contained.endingId).toBe("contained");
    expect(contained.missedRecoveryActionIds).toEqual([]);
  });

  it("covers the caution ending when useful friction is incomplete", () => {
    const trace = createCanonicalTrace(voiceYouKnowScenario, run(["pause-payment"]));
    expect(trace.endingId).toBe("caution");
    expect(trace.recoveryRequired).toBe(false);
  });

  it("distinguishes same-channel reassurance from independent verification", () => {
    const callback = run(["call-request-number"]);
    expect(callback.canonical.identity).toBe("claimed-legitimate");
    expect(callback.evidenceIds).toEqual(["callback-controlled"]);
    expect(createCanonicalTrace(voiceYouKnowScenario, callback).endingId).toBe("caution");

    const groupChat = run(["ask-team-chat"]);
    expect(groupChat.canonical.identity).toBe("unverified");
    expect(groupChat.evidenceIds).toEqual(["team-cannot-confirm"]);

    const independent = run(["verify-adviser"]);
    expect(independent.canonical.identity).toBe("verified-false");
    expect(independent.evidenceIds).toEqual(["adviser-denial"]);
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

  it("evaluates the transfer probe only from its validated explicit action", () => {
    expect(evaluateTransferProbe(voiceYouKnowScenario, "open-known-drive")).toMatchObject({
      probeId: "familiar-name-new-channel",
      outcome: "demonstrated",
      headline: "Rule transferred",
    });
    expect(evaluateTransferProbe(voiceYouKnowScenario, "ask-same-chat").outcome).toBe("developing");
    expect(evaluateTransferProbe(voiceYouKnowScenario, "use-replacement-link").outcome).toBe("not-yet");
    expect(() => evaluateTransferProbe(voiceYouKnowScenario, "invented-action")).toThrow("Unknown transfer action");
  });
});
