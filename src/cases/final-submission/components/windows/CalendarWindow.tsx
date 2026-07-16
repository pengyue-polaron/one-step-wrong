"use client";

import { CalendarDays, Check, Clock3 } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/cases/final-submission/state/GameContext";
import { WindowFrame } from "@/cases/final-submission/components/windows/WindowFrame";

export function CalendarWindow() {
  const { state, dispatch } = useGame();
  const viewed = state.calmActions.includes("calendar");
  return (
    <WindowFrame id="calendar" title="Calendar" icon={<CalendarDays size={15} />} tone="system">
      <div className="calendar-page">
        <header><span>FRIDAY</span><div><h2>Tomorrow · December 13</h2><p>3 events</p></div></header>
        <div className="agenda-list">
          <article><time>09:00</time><i className="agenda-blue" /><div><strong>Media and Society</strong><p>West Hall · 204</p></div></article>
          <article><time>13:30</time><i className="agenda-amber" /><div><strong>Library loan due</strong><p>Return Ways of Seeing</p></div></article>
          <article><time>16:00</time><i className="agenda-green" /><div><strong>Group review</strong><p>Student Commons</p></div></article>
        </div>
        <div className="calendar-footer"><Clock3 size={14} /><span>Next event in 9 hours</span><PixelButton disabled={viewed} icon={viewed ? <Check size={13} /> : undefined} onClick={() => dispatch({ type: "CALM_ACTION", action: "calendar" })}>{viewed ? "Reviewed" : "Review schedule"}</PixelButton></div>
      </div>
    </WindowFrame>
  );
}
