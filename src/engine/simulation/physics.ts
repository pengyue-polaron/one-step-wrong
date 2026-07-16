import type { CanonicalState, ScenarioPackage } from "@/ai/schemas/scenario";

export type SimulationState = {
  canonical: CanonicalState;
  actionIds: string[];
  evidenceIds: string[];
};

export type CanonicalTrace = {
  scenarioId: string;
  objective: string;
  actionIds: string[];
  actionLabels: string[];
  evidenceIds: string[];
  recoveryRequired: boolean;
  completedRecoveryActionIds: string[];
  missedRecoveryActionIds: string[];
  endingId: "safe" | "caution" | "contained" | "expanded";
  transferRules: string[];
};

export function createSimulationState(scenario: ScenarioPackage): SimulationState {
  return {
    canonical: structuredClone(scenario.worldBible.initialState),
    actionIds: [],
    evidenceIds: [],
  };
}

export function actionIsAvailable(scenario: ScenarioPackage, actionId: string, performedActionIds: string[]) {
  const action = scenario.criticalActions.find((candidate) => candidate.id === actionId);
  if (!action || performedActionIds.includes(action.id)) return false;
  const performed = new Set(performedActionIds);
  const allSatisfied = action.availableAfterAllActionIds.every((id) => performed.has(id));
  const anySatisfied = action.availableAfterAnyActionIds.length === 0
    || action.availableAfterAnyActionIds.some((id) => performed.has(id));
  return allSatisfied && anySatisfied;
}

export function requiredRecoveryActionIds(scenario: ScenarioPackage, performedActionIds: string[]) {
  const performed = new Set(performedActionIds);
  return scenario.recoveryActionIds.filter((id) => {
    const action = scenario.criticalActions.find((candidate) => candidate.id === id);
    return Boolean(action?.requiredAfterActionIds.some((triggerId) => performed.has(triggerId)));
  });
}

export function applyCriticalAction(
  scenario: ScenarioPackage,
  state: SimulationState,
  actionId: string,
): SimulationState {
  const action = scenario.criticalActions.find((candidate) => candidate.id === actionId);
  if (!action) throw new Error(`Unknown critical action: ${actionId}`);
  if (state.actionIds.includes(actionId)) return state;
  if (!actionIsAvailable(scenario, actionId, state.actionIds)) {
    throw new Error(`Critical action is not available: ${actionId}`);
  }

  const canonical = { ...state.canonical };
  for (const change of action.stateChanges) {
    Object.assign(canonical, { [change.field]: change.value });
  }
  const actionIds = [...state.actionIds, actionId];
  const evidenceIds = scenario.evidence
    .filter((item) => item.revealedByActionIds.some((id) => actionIds.includes(id)))
    .map((item) => item.id);
  return { canonical, actionIds, evidenceIds };
}

export function selectEnding(scenario: ScenarioPackage, state: SimulationState): CanonicalTrace["endingId"] {
  const performed = new Set(state.actionIds);
  const requiredRecovery = requiredRecoveryActionIds(scenario, state.actionIds);
  const matched = [...scenario.endings]
    .sort((left, right) => right.priority - left.priority)
    .find(
      (ending) =>
        ending.requiredActionIds.every((id) => performed.has(id)) &&
        (ending.requiredAnyActionIds.length === 0 || ending.requiredAnyActionIds.some((id) => performed.has(id))) &&
        (!ending.requiresTriggeredRecoveryComplete
          || (requiredRecovery.length > 0 && requiredRecovery.every((id) => performed.has(id)))) &&
        ending.forbiddenActionIds.every((id) => !performed.has(id)),
    );
  return matched?.id ?? "expanded";
}

export function createCanonicalTrace(scenario: ScenarioPackage, state: SimulationState): CanonicalTrace {
  const completedRecoveryActionIds = scenario.recoveryActionIds.filter((id) => state.actionIds.includes(id));
  const requiredRecovery = requiredRecoveryActionIds(scenario, state.actionIds);
  const recoveryRequired = requiredRecovery.length > 0;
  return {
    scenarioId: scenario.id,
    objective: scenario.intro.learningObjective,
    actionIds: [...state.actionIds],
    actionLabels: state.actionIds.map(
      (id) => scenario.criticalActions.find((action) => action.id === id)?.label ?? id,
    ),
    evidenceIds: [...state.evidenceIds],
    recoveryRequired,
    completedRecoveryActionIds,
    missedRecoveryActionIds: recoveryRequired
      ? requiredRecovery.filter((id) => !completedRecoveryActionIds.includes(id))
      : [],
    endingId: selectEnding(scenario, state),
    transferRules: [...scenario.transferRules],
  };
}

export function eventIsAllowed(scenario: ScenarioPackage, eventId: string, actionIds: string[]) {
  const event = scenario.allowedEvents.find((candidate) => candidate.id === eventId);
  return Boolean(event && event.allowedAfterActionIds.every((id) => actionIds.includes(id)));
}
