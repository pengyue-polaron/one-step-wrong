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
    <aside className="dev-panel" aria-label="开发调试面板">
      <div><Bug size={13} /><strong>DEV</strong><span>{state.phase} · step {state.incidentStep}</span></div>
      <IconButton label="跳到网络选择" icon={<Wifi size={14} />} onClick={() => dispatch({ type: "REPLAY_NETWORK" })} />
      <IconButton label="跳到异常提醒" icon={<ShieldAlert size={14} />} onClick={() => dispatch({ type: "REPLAY_INCIDENT" })} />
      <IconButton label="重置案例" icon={<RotateCcw size={14} />} onClick={() => dispatch({ type: "RESET_FULL" })} />
    </aside>
  );
}
