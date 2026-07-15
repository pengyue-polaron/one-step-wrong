"use client";

import { CalendarDays, Check, Clock3 } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/state/GameContext";
import { WindowFrame } from "@/components/windows/WindowFrame";

export function CalendarWindow() {
  const { state, dispatch } = useGame();
  const viewed = state.calmActions.includes("calendar");
  return (
    <WindowFrame id="calendar" title="日程" icon={<CalendarDays size={15} />} tone="system">
      <div className="calendar-page">
        <header><span>周五</span><div><h2>明天 · 12 月 13 日</h2><p>3 项日程</p></div></header>
        <div className="agenda-list">
          <article><time>09:00</time><i className="agenda-blue" /><div><strong>Media and Society</strong><p>West Hall · 204</p></div></article>
          <article><time>13:30</time><i className="agenda-amber" /><div><strong>图书馆借阅到期</strong><p>归还《Ways of Seeing》</p></div></article>
          <article><time>16:00</time><i className="agenda-green" /><div><strong>小组讨论</strong><p>Student Commons</p></div></article>
        </div>
        <div className="calendar-footer"><Clock3 size={14} /><span>下一项日程在 9 小时后</span><PixelButton disabled={viewed} icon={viewed ? <Check size={13} /> : undefined} onClick={() => dispatch({ type: "CALM_ACTION", action: "calendar" })}>{viewed ? "已查看" : "确认日程"}</PixelButton></div>
      </div>
    </WindowFrame>
  );
}
