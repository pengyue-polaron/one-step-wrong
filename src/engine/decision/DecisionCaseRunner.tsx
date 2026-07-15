"use client";

import { useReducer } from "react";
import type { CaseRunnerProps } from "@/cases/types";
import { ChapterIntro, DecisionWorkspace } from "@/engine/decision/components/ChapterChrome";
import { createDecisionState, decisionReducer, selectDecisionEnding } from "@/engine/decision/reducer";
import type { DecisionCaseExperience } from "@/engine/decision/types";
import { CaseDebrief } from "@/engine/decision/views/CaseDebrief";
import { OutcomeScreen } from "@/engine/decision/views/OutcomeScreen";
import { ResponseScreen } from "@/engine/decision/views/ResponseScreen";

export function DecisionCaseRunner({ definition, IntroScene, DecisionScene, onExit, onComplete }: DecisionCaseExperience & CaseRunnerProps) {
  const [state, dispatch] = useReducer(
    (current: ReturnType<typeof createDecisionState>, action: Parameters<typeof decisionReducer>[2]) => decisionReducer(definition, current, action),
    definition,
    createDecisionState,
  );
  const endingId = selectDecisionEnding(definition, state);

  if (state.stage === "intro") {
    return <ChapterIntro definition={definition} IntroScene={IntroScene} onStart={() => dispatch({ type: "START" })} onExit={onExit} />;
  }
  if (state.stage === "decision") {
    return <DecisionWorkspace definition={definition} onExit={onExit}><DecisionScene definition={definition} onSelect={(option) => dispatch({ type: "CHOOSE", option })} /></DecisionWorkspace>;
  }
  if (state.stage === "outcome" && state.choice) {
    return <OutcomeScreen definition={definition} choice={state.choice} onContinue={() => dispatch({ type: "CONTINUE_OUTCOME" })} onExit={onExit} />;
  }
  if (state.stage === "response") {
    return <ResponseScreen definition={definition} completed={state.completedActions} onAction={(id) => dispatch({ type: "PERFORM_RESPONSE", id })} onFinish={() => dispatch({ type: "FINISH_RESPONSE" })} onExit={onExit} />;
  }
  if (!state.choice) return null;
  return (
    <CaseDebrief
      definition={definition}
      choice={state.choice}
      endingId={endingId}
      events={state.events}
      completedActions={state.completedActions}
      showPath={state.showPath}
      onTogglePath={() => dispatch({ type: "TOGGLE_PATH" })}
      onReplay={() => dispatch({ type: "REPLAY" })}
      onExit={() => onComplete(endingId)}
    />
  );
}
