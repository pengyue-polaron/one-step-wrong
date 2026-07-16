export type AvailabilityAction = {
  id: string;
  kind: string;
  phase: "containment" | "recovery" | "either";
  availableAfterAllActionIds: readonly string[];
  availableAfterAnyActionIds: readonly string[];
  requiredAfterActionIds: readonly string[];
};

export type AvailabilityScenario = {
  criticalActions: readonly AvailabilityAction[];
  exclusiveActionGroups: readonly {
    actionIds: readonly string[];
  }[];
  recoveryActionIds: readonly string[];
};

function prerequisitesAreSatisfied(action: AvailabilityAction, performed: Set<string>) {
  const allSatisfied = action.availableAfterAllActionIds.every((id) => performed.has(id));
  const anySatisfied = action.availableAfterAnyActionIds.length === 0
    || action.availableAfterAnyActionIds.some((id) => performed.has(id));
  return allSatisfied && anySatisfied;
}

function baseActionIsAvailable(
  scenario: AvailabilityScenario,
  action: AvailabilityAction,
  performed: Set<string>,
) {
  if (performed.has(action.id)) return false;
  const exclusiveGroup = scenario.exclusiveActionGroups.find((group) =>
    group.actionIds.includes(action.id),
  );
  if (exclusiveGroup?.actionIds.some((id) => performed.has(id))) return false;
  const recoveryStarted = scenario.recoveryActionIds.some((id) => performed.has(id));
  if (recoveryStarted && action.phase !== "recovery") return false;
  return prerequisitesAreSatisfied(action, performed);
}

export function actionIsAvailableForTrace(
  scenario: AvailabilityScenario,
  actionId: string,
  performedActionIds: readonly string[],
) {
  const action = scenario.criticalActions.find((candidate) => candidate.id === actionId);
  if (!action) return false;
  const performed = new Set(performedActionIds);
  if (!baseActionIsAvailable(scenario, action, performed)) return false;
  if (action.phase !== "recovery") return true;

  const incidentTriggered = action.requiredAfterActionIds.some((id) => performed.has(id));
  if (!incidentTriggered) return false;
  const consequenceStillHidden = scenario.criticalActions.some(
    (candidate) =>
      candidate.kind === "inspect"
      && baseActionIsAvailable(scenario, candidate, performed),
  );
  return !consequenceStillHidden;
}

export function reachableActionIdsForScenario(scenario: AvailabilityScenario) {
  const queue: string[][] = [[]];
  const visited = new Set([""]);
  const reachableActionIds = new Set<string>();

  for (let index = 0; index < queue.length; index += 1) {
    const performedActionIds = queue[index];
    for (const action of scenario.criticalActions) {
      if (!actionIsAvailableForTrace(scenario, action.id, performedActionIds)) continue;
      reachableActionIds.add(action.id);
      const next = [...performedActionIds, action.id];
      const key = [...next].sort().join("|");
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push(next);
    }
  }

  return reachableActionIds;
}
