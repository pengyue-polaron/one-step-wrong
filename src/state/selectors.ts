import { finalSubmissionScenario } from "@/scenarios/final-submission";
import type { EndingDefinition, ScenarioDefinition } from "@/scenarios/types";
import type { GameState } from "@/state/gameMachine";

export type Score = {
  recognition: number;
  awareness: number;
  response: number;
};

export function selectEnding(state: GameState, scenario: ScenarioDefinition = finalSubmissionScenario): EndingDefinition {
  return (
    scenario.endings.find((ending) => ending.id === state.endingId) ??
    scenario.endings[2]
  );
}

export function selectScore(state: GameState): Score {
  const recognition = clamp(
    35 +
      (state.networkDetailsViewed ? 20 : 0) +
      (state.profileDetailsViewed ? 20 : 0) +
      (state.suspiciousLoginReviewed ? 25 : 0) -
      (state.suspiciousLoginIgnored ? 20 : 0),
  );
  const safeNetwork = state.selectedNetwork !== "campus-free-5g";
  const awareness = clamp(
    30 + (safeNetwork ? 60 : 0) + (!state.profileInstalled ? 10 : 0) + (state.mfaEnabled ? 10 : 0),
  );
  const responseActions = [
    state.sessionsRevoked,
    state.passwordChanged,
    state.profileRemoved,
    state.unsafeNetworkForgotten,
    state.maliciousMessageDeleted,
    state.classmatesWarned,
    state.itReported,
  ].filter(Boolean).length;
  const response = safeNetwork ? 100 : clamp(15 + responseActions * 12 + state.warningQuality * 4);
  return { recognition, awareness, response };
}

export function selectClues(state: GameState, scenario: ScenarioDefinition = finalSubmissionScenario): string[] {
  if (state.endingId === "verified-path") {
    return state.networkDetailsViewed
      ? ["你查看了网络详情，确认了运营方和连接方式。"]
      : ["你选择了来源与验证方式更清楚的连接。"];
  }
  const clues = [
    scenario.debrief.clueLabels["naming-mismatch"],
    scenario.debrief.clueLabels["portal-address"],
  ];
  if (state.networkDetailsViewed) clues.push(scenario.debrief.clueLabels["network-details"]);
  if (state.profileInstalled || state.profileDetailsViewed) {
    clues.push(scenario.debrief.clueLabels["profile-publisher"]);
  }
  if (state.suspiciousLoginIgnored) clues.push(scenario.debrief.clueLabels["login-ignored"]);
  return clues;
}

export function selectEffectiveActions(state: GameState, scenario: ScenarioDefinition = finalSubmissionScenario): string[] {
  const entries: Array<[keyof GameState, string]> = [
    ["sessionsRevoked", "sessionsRevoked"],
    ["passwordChanged", "passwordChanged"],
    ["mfaEnabled", "mfaEnabled"],
    ["profileRemoved", "profileRemoved"],
    ["unsafeNetworkForgotten", "unsafeNetworkForgotten"],
    ["maliciousMessageDeleted", "maliciousMessageDeleted"],
    ["classmatesWarned", "classmatesWarned"],
    ["itReported", "itReported"],
  ];
  return entries
    .filter(([key]) => Boolean(state[key]))
    .map(([, label]) => scenario.debrief.actionLabels[label]);
}

export function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}
