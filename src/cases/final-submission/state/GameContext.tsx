"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { finalSubmissionScenario } from "@/cases/final-submission/definition";
import type { ScenarioDefinition } from "@/cases/final-submission/types";
import { createInitialState, gameReducer, type GameAction, type GameState } from "@/cases/final-submission/state/gameMachine";

type GameContextValue = {
  state: GameState;
  scenario: ScenarioDefinition;
  dispatch: (action: GameAction) => void;
};

const GameContext = createContext<GameContextValue | null>(null);

function playTone(tone: "tap" | "success" | "alert") {
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const frequencies = { tap: 420, success: 660, alert: 240 };
  oscillator.type = "square";
  oscillator.frequency.value = frequencies[tone];
  gain.gain.setValueAtTime(0.035, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.06);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.065);
  oscillator.addEventListener("ended", () => void context.close(), { once: true });
}

export function GameProvider({
  children,
  initialState = createInitialState(),
  scenario = finalSubmissionScenario,
}: {
  children: React.ReactNode;
  initialState?: GameState;
  scenario?: ScenarioDefinition;
}) {
  const [state, rawDispatch] = useReducer(gameReducer, initialState);

  const dispatch = useCallback(
    (action: GameAction) => {
      rawDispatch(action);
      if (!state.muted && action.type !== "TICK" && action.type !== "SET_UPLOAD_PROGRESS") {
        const tone =
          action.type === "FINAL_SUBMIT" || action.type === "FINISH_RESPONSE"
            ? "success"
            : action.type === "HANDLE_LOGIN_ALERT"
              ? "alert"
              : "tap";
        try {
          playTone(tone);
        } catch {
          // Audio feedback must never block a game action on restricted browsers.
        }
      }
    },
    [state.muted],
  );

  useEffect(() => {
    const timer = window.setInterval(() => rawDispatch({ type: "TICK" }), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!state.assignmentUploading) return;
    const timer = window.setInterval(() => {
      rawDispatch({ type: "SET_UPLOAD_PROGRESS", progress: Math.min(100, state.uploadProgress + 7) });
    }, state.reducedMotion ? 45 : 140);
    return () => window.clearInterval(timer);
  }, [state.assignmentUploading, state.reducedMotion, state.uploadProgress]);

  const value = useMemo(() => ({ state, scenario, dispatch }), [state, scenario, dispatch]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used inside GameProvider");
  return context;
}
