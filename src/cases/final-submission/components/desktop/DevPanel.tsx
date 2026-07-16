"use client";

import { Bug, RotateCcw, ShieldAlert, Wifi } from "lucide-react";
import { useSyncExternalStore } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { useGame } from "@/cases/final-submission/state/GameContext";

export function DevPanel() {
  const { state, dispatch } = useGame();
  const isClient = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const enabled = isClient && new URLSearchParams(window.location.search).get("dev") === "1";
  if (!enabled) return null;
  return (
    <aside className="dev-panel" aria-label="Development checkpoint panel">
      <div><Bug size={13} /><strong>DEV</strong><span>{state.phase} · step {state.incidentStep}</span></div>
      <IconButton label="Jump to network choice" icon={<Wifi size={14} />} onClick={() => dispatch({ type: "REPLAY_NETWORK" })} />
      <IconButton label="Jump to incident alert" icon={<ShieldAlert size={14} />} onClick={() => dispatch({ type: "REPLAY_INCIDENT" })} />
      <IconButton label="Reset case" icon={<RotateCcw size={14} />} onClick={() => dispatch({ type: "RESET_FULL" })} />
    </aside>
  );
}
