"use client";

import { useState } from "react";
import { CaseLibrary } from "@/components/cases/CaseLibrary";
import { DecisionCaseRunner } from "@/components/cases/DecisionCaseRunner";
import { DebriefScreen } from "@/components/debrief/DebriefScreen";
import { DesktopShell } from "@/components/desktop/DesktopShell";
import { decisionCases, type CaseEnding, type ProductCaseId } from "@/scenarios/caseCatalog";
import { GameProvider, useGame } from "@/state/GameContext";

function GameView({ onExit, onComplete }: { onExit: () => void; onComplete: (ending: string) => void }) {
  const { state } = useGame();
  if (state.phase === "debrief") return <DebriefScreen onExit={() => onComplete(state.endingId ?? "expanded")} />;
  return <DesktopShell onExit={onExit} />;
}

export function Game() {
  const [activeCase, setActiveCase] = useState<ProductCaseId | null>(null);
  const [completed, setCompleted] = useState<Partial<Record<ProductCaseId, CaseEnding | string>>>({});

  const finishCase = (id: ProductCaseId, ending: CaseEnding | string) => {
    setCompleted((current) => ({ ...current, [id]: ending }));
    setActiveCase(null);
  };

  if (!activeCase) return <CaseLibrary completed={completed} onStart={setActiveCase} />;
  if (activeCase === "final-submission") {
    return (
      <GameProvider>
        <GameView onExit={() => setActiveCase(null)} onComplete={(ending) => finishCase(activeCase, ending)} />
      </GameProvider>
    );
  }
  return (
    <DecisionCaseRunner
      definition={decisionCases[activeCase]}
      onExit={() => setActiveCase(null)}
      onComplete={(ending) => finishCase(activeCase, ending)}
    />
  );
}
