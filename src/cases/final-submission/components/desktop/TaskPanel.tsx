"use client";

import { Check, Clock3, FileText, ShieldAlert } from "lucide-react";
import { copy } from "@/cases/final-submission/copy";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/cases/final-submission/state/GameContext";
import { formatCountdown } from "@/cases/final-submission/state/selectors";

export function TaskPanel() {
  const { state, dispatch } = useGame();
  const isResponse = state.phase === "response" || (state.phase === "incident" && state.incidentStep >= 5);
  const checklist = [
    [state.sessionsRevoked, "登录设备"],
    [state.profileRemoved, "网络配置"],
    [state.classmatesWarned, "已发送消息"],
    [state.itReported, "IT 报告"],
  ] as const;

  return (
    <aside className={`task-panel ${isResponse ? "task-panel--incident" : ""}`}>
      <div className="task-kicker">
        {isResponse ? <ShieldAlert size={14} /> : <Clock3 size={14} />}
        <span>当前任务</span>
      </div>
      <h1>{isResponse ? copy.task.response : copy.task.submission}</h1>
      <p>{isResponse ? copy.task.responseHint : copy.task.submissionHint}</p>
      {isResponse ? (
        <>
          <ul className="response-checklist">
            {checklist.map(([done, label]) => (
              <li key={label} className={done ? "is-done" : ""}>
                <span>{done ? <Check size={12} /> : null}</span>
                {label}
              </li>
            ))}
          </ul>
          <PixelButton variant="primary" onClick={() => dispatch({ type: "FINISH_RESPONSE" })}>
            完成处理并复盘
          </PixelButton>
        </>
      ) : (
        <>
          <div className="task-file">
            <FileText size={15} />
            <span>Final_Assignment.pdf</span>
          </div>
          <div className="deadline">
            <span>截止剩余</span>
            <strong aria-label={`截止剩余 ${formatCountdown(state.deadlineSeconds)}`}>
              {formatCountdown(state.deadlineSeconds)}
            </strong>
            {state.countdownPaused ? <small>倒计时已暂停</small> : null}
          </div>
        </>
      )}
      <div className="official-note">
        <span>Bobst Library Wi-Fi</span>
        <p>官方网络：nyu / nyuguest / eduroam</p>
      </div>
    </aside>
  );
}
