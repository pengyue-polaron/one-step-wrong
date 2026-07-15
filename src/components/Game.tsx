"use client";

import { DebriefScreen } from "@/components/debrief/DebriefScreen";
import { DesktopShell } from "@/components/desktop/DesktopShell";
import { GameProvider, useGame } from "@/state/GameContext";

function GameView() {
  const { state } = useGame();
  if (state.phase === "debrief") return <DebriefScreen />;
  return <DesktopShell />;
}

export function Game() {
  return (
    <GameProvider>
      <GameView />
    </GameProvider>
  );
}
