import type { ScenarioPackage } from "@/ai/schemas/scenario";
import {
  actionIsAvailable,
  applyCriticalAction,
  createCanonicalTrace,
  createSimulationState,
  type CanonicalTrace,
  type SimulationState,
} from "@/engine/simulation/physics";

export const scenarioEndingIds = ["safe", "caution", "contained", "expanded"] as const;

export type ScenarioEndingCoverage = {
  endingId: CanonicalTrace["endingId"];
  reachable: boolean;
  actionIds: string[];
  actionLabels: string[];
  evidenceIds: string[];
  recoveryRequired: boolean;
  missedRecoveryActionIds: string[];
};

export type ScenarioCoverage = {
  reachableStateCount: number;
  reachableActionIds: string[];
  endingCoverage: ScenarioEndingCoverage[];
  uncoveredEndingIds: CanonicalTrace["endingId"][];
  allOutcomesReachable: boolean;
};

function actionSetKey(state: SimulationState) {
  // Ending and recovery rules depend on performed action IDs, so equivalent orders share one search node.
  return [...state.actionIds].sort().join("|");
}

export function evaluateScenarioCoverage(scenario: ScenarioPackage): ScenarioCoverage {
  const initial = createSimulationState(scenario);
  const queue = [initial];
  const visited = new Set([actionSetKey(initial)]);
  const reachableActionIds = new Set<string>();
  const representatives = new Map<CanonicalTrace["endingId"], CanonicalTrace>();

  for (let index = 0; index < queue.length; index += 1) {
    const state = queue[index];
    if (state.actionIds.length > 0) {
      const trace = createCanonicalTrace(scenario, state);
      if (!representatives.has(trace.endingId)) representatives.set(trace.endingId, trace);
    }

    for (const action of scenario.criticalActions) {
      if (!actionIsAvailable(scenario, action.id, state.actionIds)) continue;
      const next = applyCriticalAction(scenario, state, action.id);
      const key = actionSetKey(next);
      reachableActionIds.add(action.id);
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push(next);
    }
  }

  const endingCoverage = scenarioEndingIds.map((endingId) => {
    const trace = representatives.get(endingId);
    return {
      endingId,
      reachable: Boolean(trace),
      actionIds: trace?.actionIds ?? [],
      actionLabels: trace?.actionLabels ?? [],
      evidenceIds: trace?.evidenceIds ?? [],
      recoveryRequired: trace?.recoveryRequired ?? false,
      missedRecoveryActionIds: trace?.missedRecoveryActionIds ?? [],
    };
  });
  const uncoveredEndingIds = endingCoverage
    .filter((result) => !result.reachable)
    .map((result) => result.endingId);

  return {
    reachableStateCount: visited.size,
    reachableActionIds: [...reachableActionIds],
    endingCoverage,
    uncoveredEndingIds,
    allOutcomesReachable: uncoveredEndingIds.length === 0,
  };
}

export function assertScenarioCoverage(scenario: ScenarioPackage) {
  const coverage = evaluateScenarioCoverage(scenario);
  if (!coverage.allOutcomesReachable) {
    throw new Error(`Scenario has unreachable outcomes: ${coverage.uncoveredEndingIds.join(", ")}`);
  }
  return coverage;
}
