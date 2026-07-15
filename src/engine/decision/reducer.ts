import type { CaseEnding } from "@/cases/types";
import type { DecisionCaseDefinition, DecisionEvent, DecisionOption, DecisionStage } from "@/engine/decision/types";

export type DecisionState = {
  stage: DecisionStage;
  choice: DecisionOption | null;
  completedActions: string[];
  showPath: boolean;
  events: DecisionEvent[];
};

export type DecisionAction =
  | { type: "START" }
  | { type: "CHOOSE"; option: DecisionOption }
  | { type: "CONTINUE_OUTCOME" }
  | { type: "PERFORM_RESPONSE"; id: string }
  | { type: "FINISH_RESPONSE" }
  | { type: "TOGGLE_PATH" }
  | { type: "REPLAY" };

function formatTime(base: string, offset: number) {
  const [hours, minutes] = base.split(":").map(Number);
  const total = (hours ?? 0) * 60 + (minutes ?? 0) + offset;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function createDecisionState(definition: DecisionCaseDefinition): DecisionState {
  return {
    stage: "intro",
    choice: null,
    completedActions: [],
    showPath: false,
    events: [{ id: "task-opened", time: definition.intro.time, title: definition.intro.task, tone: "info" }],
  };
}

export function decisionReducer(
  definition: DecisionCaseDefinition,
  state: DecisionState,
  action: DecisionAction,
): DecisionState {
  switch (action.type) {
    case "START":
      return { ...state, stage: "decision" };
    case "CHOOSE": {
      const events: DecisionEvent[] = [
        ...state.events,
        {
          id: `choice-${action.option.id}`,
          time: formatTime(definition.intro.time, 1),
          title: action.option.event,
          detail: action.option.meta,
          tone: action.option.route === "incident" ? "notice" : "success",
        },
      ];
      if (action.option.route === "incident") {
        events.push({
          id: "incident",
          time: formatTime(definition.intro.time, 7),
          title: definition.incident.title,
          detail: definition.incident.evidence[0]?.value,
          tone: "incident",
        });
      }
      return { ...state, choice: action.option, events, stage: "outcome" };
    }
    case "CONTINUE_OUTCOME":
      return { ...state, stage: state.choice?.route === "incident" ? "response" : "debrief" };
    case "PERFORM_RESPONSE": {
      if (state.completedActions.includes(action.id)) return state;
      const step = definition.responseSteps.find((item) => item.id === action.id);
      if (!step) return state;
      const completedActions = [...state.completedActions, action.id];
      return {
        ...state,
        completedActions,
        events: [
          ...state.events,
          {
            id: `response-${action.id}`,
            time: formatTime(definition.intro.time, 8 + completedActions.length),
            title: step.event,
            tone: "success",
          },
        ],
      };
    }
    case "FINISH_RESPONSE":
      return { ...state, stage: "debrief" };
    case "TOGGLE_PATH":
      return { ...state, showPath: !state.showPath };
    case "REPLAY":
      return createDecisionState(definition);
    default:
      return state;
  }
}

export function selectDecisionEnding(definition: DecisionCaseDefinition, state: DecisionState): CaseEnding {
  if (!state.choice) return "expanded";
  if (state.choice.route === "verified") return "verified";
  if (state.choice.route === "caution") return "caution";
  const requiredComplete = definition.responseSteps
    .filter((step) => step.required)
    .every((step) => state.completedActions.includes(step.id));
  return requiredComplete ? "contained" : "expanded";
}
