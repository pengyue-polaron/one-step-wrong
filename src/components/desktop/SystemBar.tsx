"use client";

import { Bell, BatteryMedium, Pause, Play, Volume2, VolumeX, Wifi, Zap } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { useGame } from "@/state/GameContext";

export function SystemBar() {
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
        <IconButton
          label={state.countdownPaused ? "继续倒计时" : "暂停倒计时"}
          icon={state.countdownPaused ? <Play size={15} /> : <Pause size={15} />}
          active={state.countdownPaused}
          onClick={() => dispatch({ type: "TOGGLE_PAUSE" })}
        />
        <IconButton
          label={state.reducedMotion ? "启用动画" : "减少动画"}
          icon={<Zap size={15} />}
          active={state.reducedMotion}
          onClick={() => dispatch({ type: "TOGGLE_REDUCED_MOTION" })}
        />
        <IconButton
          label={state.muted ? "打开音效" : "静音"}
          icon={state.muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          active={state.muted}
          onClick={() => dispatch({ type: "TOGGLE_MUTE" })}
        />
        <IconButton
          label="打开网络列表"
          icon={<Wifi size={16} />}
          active={state.networkPanelOpen}
          onClick={() => dispatch({ type: "TOGGLE_NETWORK_PANEL" })}
        />
        <BatteryMedium size={17} aria-label="电量 68%" />
        <button
          className="status-notification"
          aria-label={`通知中心，${unread} 条未读`}
          title="通知中心"
          onClick={() => dispatch({ type: "TOGGLE_NOTIFICATION_CENTER" })}
        >
          <Bell size={16} />
          {unread > 0 ? <span>{unread}</span> : null}
        </button>
        <time>23:47</time>
        <span className={`connection-dot ${connected ? "is-online" : ""}`} title={connected ? "已连接" : "连接不稳定"} />
      </div>
    </header>
  );
}
