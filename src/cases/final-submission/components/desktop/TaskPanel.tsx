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
    [state.sessionsRevoked, "Signed-in devices"],
    [state.profileRemoved, "Network profile"],
    [state.classmatesWarned, "Sent messages"],
    [state.itReported, "IT report"],
  ] as const;

  return (
    <aside className={`task-panel ${isResponse ? "task-panel--incident" : ""}`}>
      <div className="task-kicker">
        {isResponse ? <ShieldAlert size={14} /> : <Clock3 size={14} />}
        <span>CURRENT TASK</span>
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
            Finish response and review
          </PixelButton>
        </>
      ) : (
        <>
          <div className="task-file">
            <FileText size={15} />
            <span>Final_Assignment.pdf</span>
          </div>
          <div className="deadline">
            <span>Time remaining</span>
            <strong aria-label={`Time remaining ${formatCountdown(state.deadlineSeconds)}`}>
              {formatCountdown(state.deadlineSeconds)}
            </strong>
            {state.countdownPaused ? <small>Countdown paused</small> : null}
          </div>
        </>
      )}
      <div className="official-note">
        <span>Bobst Library Wi-Fi</span>
        <p>Official networks: nyu / nyuguest / eduroam</p>
      </div>
    </aside>
  );
}
