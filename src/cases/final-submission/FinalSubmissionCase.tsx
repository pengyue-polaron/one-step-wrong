"use client";

import { DebriefScreen } from "@/cases/final-submission/components/debrief/DebriefScreen";
import { DesktopShell } from "@/cases/final-submission/components/desktop/DesktopShell";
import type { CaseRunnerProps } from "@/cases/types";
import { GameProvider, useGame } from "@/cases/final-submission/state/GameContext";

function FinalSubmissionView({ onExit, onComplete }: CaseRunnerProps) {
  const { state } = useGame();
  if (state.phase === "debrief") {
    return <DebriefScreen onExit={() => onComplete(state.endingId ?? "expanded")} />;
  }
  return <DesktopShell onExit={onExit} />;
}

export function FinalSubmissionCase(props: CaseRunnerProps) {
  return <GameProvider><FinalSubmissionView {...props} /></GameProvider>;
}
