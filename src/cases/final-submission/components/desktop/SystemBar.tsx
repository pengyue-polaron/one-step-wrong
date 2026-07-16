"use client";

import { Bell, BatteryMedium, LayoutGrid, Pause, Play, Volume2, VolumeX, Wifi, Zap } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { useGame } from "@/cases/final-submission/state/GameContext";

export function SystemBar({ onExit }: { onExit?: () => void }) {
  const { state, dispatch } = useGame();
  const connected = state.connectionReady;
  const unread = state.notifications.filter((item) => !item.read).length;
  return (
    <header className="system-bar">
      <div className="system-brand">
        <span className="brand-mark" aria-hidden="true">N</span>
        <span>NYU Study Desk</span>
      </div>
      <div className="system-status">
        {onExit ? <IconButton label="Return to case library" icon={<LayoutGrid size={15} />} onClick={onExit} /> : null}
        <IconButton
          label={state.countdownPaused ? "Resume countdown" : "Pause countdown"}
          icon={state.countdownPaused ? <Play size={15} /> : <Pause size={15} />}
          active={state.countdownPaused}
          onClick={() => dispatch({ type: "TOGGLE_PAUSE" })}
        />
        <IconButton
          label={state.reducedMotion ? "Enable motion" : "Reduce motion"}
          icon={<Zap size={15} />}
          active={state.reducedMotion}
          onClick={() => dispatch({ type: "TOGGLE_REDUCED_MOTION" })}
        />
        <IconButton
          label={state.muted ? "Enable sound" : "Mute sound"}
          icon={state.muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          active={state.muted}
          onClick={() => dispatch({ type: "TOGGLE_MUTE" })}
        />
        <IconButton
          label="Open network list"
          icon={<Wifi size={16} />}
          active={state.networkPanelOpen}
          onClick={() => dispatch({ type: "TOGGLE_NETWORK_PANEL" })}
        />
        <BatteryMedium size={17} aria-label="Battery 68%" />
        <button
          className="status-notification"
          aria-label={`Notification center, ${unread} unread`}
          title="Notification center"
          onClick={() => dispatch({ type: "TOGGLE_NOTIFICATION_CENTER" })}
        >
          <Bell size={16} />
          {unread > 0 ? <span>{unread}</span> : null}
        </button>
        <time>23:47</time>
        <span className={`connection-dot ${connected ? "is-online" : ""}`} title={connected ? "Connected" : "Connection unstable"} />
      </div>
    </header>
  );
}
