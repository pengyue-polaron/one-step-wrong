import { describe, expect, it } from "vitest";
import { voiceYouKnowScenario } from "@/fixtures/voiceYouKnow";
import { sharingScopeScenario } from "@/fixtures/sharingScope";
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
    expect(createCanonicalTrace(voiceYouKnowScenario, run(["verify-adviser"])).endingId).toBe("safe");
  });

  it("distinguishes expanded and contained outcomes", () => {
    expect(createCanonicalTrace(voiceYouKnowScenario, run(["approve-change"])).endingId).toBe("expanded");
    const contained = run([
      "approve-change",
      "review-payment-status",
      "request-payment-hold",
      "preserve-evidence",
      "notify-team",
      "report-incident",
    ]);
    const trace = createCanonicalTrace(voiceYouKnowScenario, contained);
    expect(trace.endingId).toBe("contained");
    expect(trace.recoveryRequired).toBe(true);
    expect(trace.missedRecoveryActionIds).toEqual([]);
    expect(trace.completedRecoveryActionIds).not.toContain("revoke-access");
    expect(trace.finalState.payment).toBe("paused");
  });

  it("blocks premature recovery and requires only recovery for affected layers", () => {
    expect(() => run(["revoke-access"])).toThrow("not available");
    expect(() => run(["preserve-evidence"])).toThrow("not available");

    const exposedAccess = run([
      "call-request-number",
      "share-folder",
      "review-folder-access",
      "preserve-evidence",
      "notify-team",
      "report-incident",
    ]);
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

  it("keeps verified identity from being downgraded by weaker later evidence", () => {
    const scenario = structuredClone(voiceYouKnowScenario);
    scenario.exclusiveActionGroups = [];
    const state = ["verify-adviser", "call-request-number"].reduce(
      (current, action) => applyCriticalAction(scenario, current, action),
      createSimulationState(scenario),
    );
    expect(state.canonical.identity).toBe("verified-false");
    expect(createCanonicalTrace(scenario, state).endingId).toBe("safe");
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

  it("locks alternative decisions after one action in an exclusive group", () => {
    const firstChoice = applyCriticalAction(
      voiceYouKnowScenario,
      createSimulationState(voiceYouKnowScenario),
      "call-request-number",
    );
    expect(() => applyCriticalAction(voiceYouKnowScenario, firstChoice, "verify-adviser")).toThrow("not available");
    expect(() => applyCriticalAction(voiceYouKnowScenario, firstChoice, "ask-team-chat")).toThrow("not available");
  });

  it("creates fresh replay state without canonical or trace leakage", () => {
    const firstRun = run(["call-request-number", "approve-change", "share-folder"]);
    const replay = createSimulationState(voiceYouKnowScenario);
    expect(replay).toEqual({
      canonical: voiceYouKnowScenario.worldBible.initialState,
      actionIds: [],
      evidenceIds: [],
    });
    expect(replay.canonical.content).toBe("intact");
    expect(replay.canonical).not.toBe(firstRun.canonical);
    expect(JSON.stringify(createCanonicalTrace(voiceYouKnowScenario, firstRun))).not.toContain("Dr. Maya Chen");
  });

  it("requires the consequence check before recovery can begin", () => {
    const unsafe = run(["approve-change"]);
    expect(() => applyCriticalAction(voiceYouKnowScenario, unsafe, "request-payment-hold")).toThrow("not available");
    const revealed = applyCriticalAction(voiceYouKnowScenario, unsafe, "review-payment-status");
    const recovering = applyCriticalAction(voiceYouKnowScenario, revealed, "request-payment-hold");
    expect(recovering.canonical.payment).toBe("paused");
    expect(() => applyCriticalAction(voiceYouKnowScenario, recovering, "call-request-number")).toThrow("not available");
  });

  it("waits for every triggered consequence before exposing recovery", () => {
    const bothAffected = run(["call-request-number", "approve-change", "share-folder", "review-payment-status"]);
    expect(() => applyCriticalAction(voiceYouKnowScenario, bothAffected, "preserve-evidence")).toThrow("not available");
    const bothRevealed = applyCriticalAction(voiceYouKnowScenario, bothAffected, "review-folder-access");
    expect(applyCriticalAction(voiceYouKnowScenario, bothRevealed, "preserve-evidence").canonical.evidence).toBe("preserved");
  });

  it("does not unlock recovery through an unrelated OR prerequisite", () => {
    const scenario = structuredClone(voiceYouKnowScenario);
    scenario.criticalActions
      .find((action) => action.id === "preserve-evidence")!
      .availableAfterAnyActionIds = ["pause-payment"];
    const paused = applyCriticalAction(scenario, createSimulationState(scenario), "pause-payment");
    expect(() => applyCriticalAction(scenario, paused, "preserve-evidence")).toThrow("not available");
  });

  it("does not award containment when a completed recovery leaves the incident state in place", () => {
    const scenario = structuredClone(voiceYouKnowScenario);
    scenario.criticalActions
      .find((action) => action.id === "request-payment-hold")!
      .stateChanges = [{ field: "payment", value: "redirected" }];
    const state = [
      "approve-change",
      "review-payment-status",
      "request-payment-hold",
      "preserve-evidence",
      "notify-team",
      "report-incident",
    ].reduce(
      (current, action) => applyCriticalAction(scenario, current, action),
      createSimulationState(scenario),
    );
    expect(createCanonicalTrace(scenario, state).endingId).toBe("expanded");
    expect(state.canonical.payment).toBe("redirected");
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
      headline: "Known-channel pattern applied",
    });
    expect(evaluateTransferProbe(voiceYouKnowScenario, "ask-same-chat").outcome).toBe("developing");
    expect(evaluateTransferProbe(voiceYouKnowScenario, "use-replacement-link").outcome).toBe("not-yet");
    expect(() => evaluateTransferProbe(voiceYouKnowScenario, "invented-action")).toThrow("Unknown transfer action");
  });

  it("contains access and content independently in Sharing Scope", () => {
    const unsafe = [
      "share-public-edit-link",
      "review-sharing-activity",
    ].reduce(
      (state, action) => applyCriticalAction(sharingScopeScenario, state, action),
      createSimulationState(sharingScopeScenario),
    );
    expect(createCanonicalTrace(sharingScopeScenario, unsafe).endingId).toBe("expanded");
    expect(unsafe.canonical.content).toBe("modified");
    expect(() => applyCriticalAction(sharingScopeScenario, unsafe, "share-named-commenters")).toThrow("not available");
    expect(() => applyCriticalAction(sharingScopeScenario, unsafe, "report-sharing-incident")).toThrow("not available");

    const contained = [
      "restrict-public-link",
      "restore-participant-sheet",
      "preserve-activity-record",
      "notify-affected-people",
      "report-sharing-incident",
    ].reduce(
      (state, action) => applyCriticalAction(sharingScopeScenario, state, action),
      unsafe,
    );
    const trace = createCanonicalTrace(sharingScopeScenario, contained);
    expect(trace.endingId).toBe("contained");
    expect(trace.finalState.access).toBe("restricted");
    expect(trace.finalState.content).toBe("restored");
    expect(trace.missedRecoveryActionIds).toEqual([]);
  });
});
