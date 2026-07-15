import { finalSubmissionScenario } from "@/scenarios/final-submission";
import type { ScenarioDefinition } from "@/scenarios/types";

export const scenarioRegistry: Record<string, ScenarioDefinition> = {
  [finalSubmissionScenario.id]: finalSubmissionScenario,
};

export const defaultScenario = finalSubmissionScenario;
