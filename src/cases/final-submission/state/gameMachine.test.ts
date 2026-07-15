import { describe, expect, it } from "vitest";
import { createIncidentReplayState, createInitialState, gameReducer, type GameAction, type GameState } from "@/cases/final-submission/state/gameMachine";
import { selectScore } from "@/cases/final-submission/state/selectors";

function run(state: GameState, ...actions: GameAction[]) {
  return actions.reduce(gameReducer, state);
}

function connectedState(network: "campus-secure" | "campus-guest" | "mobile-hotspot" | "campus-free-5g") {
  const state = run(createInitialState(), { type: "START_GAME" }, { type: "RETRY_UPLOAD" }, { type: "SELECT_NETWORK", network });
  if (network === "campus-free-5g") {
    return run(state, { type: "PORTAL_IDENTITY" }, { type: "REQUEST_INSTALL" }, { type: "CONFIRM_INSTALL" });
  }
  if (network === "mobile-hotspot") return gameReducer(state, { type: "ENABLE_HOTSPOT" });
  return gameReducer(state, { type: "AUTHENTICATE_NETWORK" });
}

function submittedState(network: "campus-secure" | "campus-guest" | "mobile-hotspot" | "campus-free-5g") {
  return run(
    connectedState(network),
    { type: "SET_UPLOAD_PROGRESS", progress: 100 },
    { type: "TOGGLE_INTEGRITY" },
    { type: "FINAL_SUBMIT" },
  );
}

describe("game machine", () => {
  it.each(["campus-secure", "campus-guest", "mobile-hotspot"] as const)("completes the %s route safely", (network) => {
    const state = gameReducer(submittedState(network), { type: "CONCLUDE_SAFE" });
    expect(state.phase).toBe("debrief");
    expect(state.endingId).toBe("verified-path");
    expect(state.assignmentSubmitted).toBe(true);
    expect(state.profileInstalled).toBe(false);
  });

  it("keeps the dangerous route successful before delayed consequences appear", () => {
    const state = submittedState("campus-free-5g");
    expect(state.phase).toBe("calm");
    expect(state.assignmentSubmitted).toBe(true);
    expect(state.suspiciousLoginTriggered).toBe(false);
    expect(state.eventLog.at(-1)?.title).toBe("作业提交成功");
  });

  it("preserves both pre-install stop points", () => {
    let state = run(
      createInitialState(),
      { type: "START_GAME" },
      { type: "RETRY_UPLOAD" },
      { type: "SELECT_NETWORK", network: "campus-free-5g" },
      { type: "PORTAL_IDENTITY" },
      { type: "REQUEST_INSTALL" },
      { type: "CANCEL_INSTALL" },
    );
    expect(state.installDialogOpen).toBe(false);
    expect(state.profileInstalled).toBe(false);
    expect(state.phase).toBe("captive-portal");
    state = gameReducer(state, { type: "DEFER_PROFILE" });
    expect(state.phase).toBe("network-selection");
    expect(state.selectedNetwork).toBeNull();
    expect(state.networkPanelOpen).toBe(true);
  });

  it("triggers the delayed login only once after two distinct calm actions", () => {
    let state = submittedState("campus-free-5g");
    state = gameReducer(state, { type: "CALM_ACTION", action: "receipt" });
    state = gameReducer(state, { type: "CALM_ACTION", action: "receipt" });
    expect(state.phase).toBe("calm");
    state = gameReducer(state, { type: "CALM_ACTION", action: "calendar" });
    state = gameReducer(state, { type: "CALM_ACTION", action: "reply" });
    expect(state.phase).toBe("incident");
    expect(state.eventLog.filter((event) => event.id === "suspicious-login")).toHaveLength(1);
  });

  it("reaches the contained ending only after all critical response actions", () => {
    let state = createIncidentReplayState();
    state = run(
      state,
      { type: "HANDLE_LOGIN_ALERT", choice: "review" },
      { type: "ADVANCE_INCIDENT" },
      { type: "ADVANCE_INCIDENT" },
      { type: "ADVANCE_INCIDENT" },
      { type: "RESPONSE_ACTION", action: "revoke-session" },
      { type: "RESPONSE_ACTION", action: "remove-profile" },
      { type: "RESPONSE_ACTION", action: "warn-clear" },
      { type: "RESPONSE_ACTION", action: "report-it" },
      { type: "FINISH_RESPONSE" },
    );
    expect(state.endingId).toBe("contained");
    expect(state.eventLog.some((event) => event.title === "作业提交成功")).toBe(true);
    expect(selectScore(state).response).toBeGreaterThan(70);
  });

  it("reaches the expanded ending when critical actions are skipped", () => {
    const state = gameReducer(createIncidentReplayState(), { type: "FINISH_RESPONSE" });
    expect(state.endingId).toBe("expanded");
  });

  it("resets every incident field when replaying network selection", () => {
    const state = gameReducer(createIncidentReplayState(), { type: "REPLAY_NETWORK" });
    expect(state.phase).toBe("network-selection");
    expect(state.networkPanelOpen).toBe(true);
    expect(state.assignmentSubmitted).toBe(false);
    expect(state.profileInstalled).toBe(false);
    expect(state.eventLog).toEqual([]);
    expect(state.notifications).toHaveLength(1);
  });

  it("restores the exact incident checkpoint without leaking response actions", () => {
    let state = createIncidentReplayState();
    state = run(state, { type: "RESPONSE_ACTION", action: "remove-profile" }, { type: "REPLAY_INCIDENT" });
    expect(state.phase).toBe("incident");
    expect(state.incidentStep).toBe(1);
    expect(state.profileInstalled).toBe(true);
    expect(state.profileRemoved).toBe(false);
    expect(state.assignmentSubmitted).toBe(true);
  });
});
