"use client";

import { BookOpen, CalendarDays, MessageSquareText, Router, ShieldCheck, TicketCheck } from "lucide-react";
import type { WindowId } from "@/cases/final-submission/types";
import { useGame } from "@/cases/final-submission/state/GameContext";

const apps: Array<{ id: WindowId; label: string; icon: React.ReactNode }> = [
  { id: "course", label: "Course system", icon: <BookOpen size={20} /> },
  { id: "chat", label: "Messages", icon: <MessageSquareText size={20} /> },
  { id: "calendar", label: "Calendar", icon: <CalendarDays size={20} /> },
  { id: "security", label: "Account security", icon: <ShieldCheck size={20} /> },
  { id: "network", label: "Network settings", icon: <Router size={20} /> },
  { id: "it-report", label: "IT support", icon: <TicketCheck size={20} /> },
];

export function AppDock() {
  const { state, dispatch } = useGame();
  return (
    <nav className="app-dock" aria-label="Applications">
      {apps.map((app) => (
        <button
          key={app.id}
          aria-pressed={state.activeWindow === app.id && state.openWindows.includes(app.id)}
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
