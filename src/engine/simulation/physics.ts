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

export function applyCriticalAction(
  scenario: ScenarioPackage,
  state: SimulationState,
  actionId: string,
): SimulationState {
  const action = scenario.criticalActions.find((candidate) => candidate.id === actionId);
  if (!action) throw new Error(`Unknown critical action: ${actionId}`);
  if (state.actionIds.includes(actionId)) return state;

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
  const matched = [...scenario.endings]
    .sort((left, right) => right.priority - left.priority)
    .find(
      (ending) =>
        ending.requiredActionIds.every((id) => performed.has(id)) &&
        ending.forbiddenActionIds.every((id) => !performed.has(id)),
    );
  return matched?.id ?? "expanded";
}

export function createCanonicalTrace(scenario: ScenarioPackage, state: SimulationState): CanonicalTrace {
  const completedRecoveryActionIds = scenario.recoveryActionIds.filter((id) => state.actionIds.includes(id));
  const recoveryRequired = scenario.criticalActions.some(
    (action) => state.actionIds.includes(action.id) && (action.kind === "approve" || action.kind === "share"),
  );
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
      ? scenario.recoveryActionIds.filter((id) => !completedRecoveryActionIds.includes(id))
      : [],
    endingId: selectEnding(scenario, state),
    transferRules: [...scenario.transferRules],
  };
}

export function eventIsAllowed(scenario: ScenarioPackage, eventId: string, actionIds: string[]) {
  const event = scenario.allowedEvents.find((candidate) => candidate.id === eventId);
  return Boolean(event && event.allowedAfterActionIds.every((id) => actionIds.includes(id)));
}
