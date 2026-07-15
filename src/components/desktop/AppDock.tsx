"use client";

import { BookOpen, CalendarDays, MessageSquareText, Router, ShieldCheck, TicketCheck } from "lucide-react";
import type { WindowId } from "@/scenarios/types";
import { useGame } from "@/state/GameContext";

const apps: Array<{ id: WindowId; label: string; icon: React.ReactNode }> = [
  { id: "course", label: "课程系统", icon: <BookOpen size={20} /> },
  { id: "chat", label: "消息", icon: <MessageSquareText size={20} /> },
  { id: "calendar", label: "日程", icon: <CalendarDays size={20} /> },
  { id: "security", label: "账号安全", icon: <ShieldCheck size={20} /> },
  { id: "network", label: "网络设置", icon: <Router size={20} /> },
  { id: "it-report", label: "IT 支持", icon: <TicketCheck size={20} /> },
];

export function AppDock() {
  const { state, dispatch } = useGame();
  return (
    <nav className="app-dock" aria-label="应用程序">
      {apps.map((app) => (
        <button
          key={app.id}
          className={state.activeWindow === app.id && state.openWindows.includes(app.id) ? "is-active" : ""}
          aria-label={app.label}
          title={app.label}
          onClick={() => dispatch({ type: "OPEN_WINDOW", window: app.id })}
        >
          {app.icon}
          <span>{app.label}</span>
        </button>
      ))}
    </nav>
  );
}
