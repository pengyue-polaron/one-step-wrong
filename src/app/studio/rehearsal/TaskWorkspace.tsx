import {
  ArrowRight,
  Check,
  FileText,
  Flag,
  FolderOpen,
  MessageSquareText,
  Pause,
  ShieldCheck,
} from "lucide-react";
import type { ScenarioPackage } from "@/ai/schemas/scenario";
import type { SimulationState } from "@/engine/simulation/physics";
import { formatCanonicalValue } from "@/app/studio/rehearsal/presentation";
import { ReviewedAudioPlayer } from "@/app/studio/rehearsal/ReviewedAudioPlayer";

type Action = ScenarioPackage["criticalActions"][number];

function ActionGroup({
  title,
  actions,
  performed,
  busy,
  onAction,
}: {
  title: string;
  actions: Action[];
  performed: string[];
  busy: boolean;
  onAction: (id: string) => void;
}) {
  return (
    <section>
      <h2>{title}</h2>
      {actions.map((action) => {
        const done = performed.includes(action.id);
        return (
          <button
            className={done ? "is-done" : ""}
            disabled={done || busy}
            key={action.id}
            onClick={() => onAction(action.id)}
            type="button"
          >
            <span>
              {done ? <Check size={14} /> : action.kind === "pause" ? <Pause size={14} /> : <ArrowRight size={14} />}
            </span>
            <div>
              <strong>{action.label}</strong>
              <small>{action.description}</small>
            </div>
          </button>
        );
      })}
    </section>
  );
}

export function TaskWorkspace({
  scenario,
  simulation,
  verificationActions,
  taskActions,
  inspectActions,
  recoveryActions,
  pendingInspection,
  busy,
  openingRequest,
  onAction,
  onFinish,
}: {
  scenario: ScenarioPackage;
  simulation: SimulationState;
  verificationActions: Action[];
  taskActions: Action[];
  inspectActions: Action[];
  recoveryActions: Action[];
  pendingInspection: boolean;
  busy: boolean;
  openingRequest: {
    roleName: string;
    channel: string;
    content: string;
    audioSrc?: string;
  };
  onAction: (id: string) => void;
  onFinish: () => void;
}) {
  const presentation = scenario.learnerPresentation;
  const finishStatus = busy
    ? "Waiting for the current response to finish…"
    : simulation.actionIds.length === 0
      ? "Choose at least one task action before review."
      : pendingInspection
        ? "Continue the task to reveal what changed."
        : `${simulation.actionIds.length} task ${simulation.actionIds.length === 1 ? "action" : "actions"} recorded · ready to review`;

  return (
    <section
      aria-label={`${presentation.workspace.appName} task workspace`}
      className="task-workspace"
    >
      <header className="task-appbar">
        <span><FolderOpen size={17} /></span>
        <div>
          <strong>{presentation.workspace.appName}</strong>
          <small>{presentation.workspace.sectionLabel}</small>
        </div>
        <span className="task-security"><ShieldCheck size={13} /> University workspace</span>
      </header>

      <div className="task-document">
        <header>
          <span><FileText size={19} /></span>
          <div>
            <small>{presentation.workspace.sectionLabel}</small>
            <h2>{presentation.workspace.itemTitle}</h2>
            <p>{presentation.workspace.itemDescription}</p>
          </div>
        </header>

        <aside className="task-request-summary" data-testid="task-request-summary">
          <header>
            <MessageSquareText size={15} />
            <span>
              <strong>{openingRequest.roleName}</strong>
              <small>{openingRequest.channel}</small>
            </span>
          </header>
          {openingRequest.audioSrc && (
            <ReviewedAudioPlayer
              label={`Play voice note from ${openingRequest.roleName}`}
              src={openingRequest.audioSrc}
            />
          )}
          <p>{openingRequest.content}</p>
        </aside>

        <dl className="task-metadata">
          {presentation.workspace.metadata.map((item) => (
            <div key={`${item.label}-${item.value}`}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>

        <div className="task-status" aria-label="Current task status">
          {presentation.statusFields.map((item) => {
            const revealed = item.revealAfterAnyActionIds.length === 0
              || item.revealAfterAnyActionIds.some((id) => simulation.actionIds.includes(id));
            return (
              <span key={item.field}>
                {item.label}
                <strong>
                  {revealed
                    ? formatCanonicalValue(item.field, simulation.canonical[item.field])
                    : item.concealedLabel}
                </strong>
              </span>
            );
          })}
        </div>

        <div className="task-action-groups">
          {verificationActions.length > 0 && (
            <ActionGroup
              actions={verificationActions}
              busy={busy}
              onAction={onAction}
              performed={simulation.actionIds}
              title={presentation.actionHeadings.verify}
            />
          )}
          {taskActions.length > 0 && (
            <ActionGroup
              actions={taskActions}
              busy={busy}
              onAction={onAction}
              performed={simulation.actionIds}
              title={presentation.actionHeadings.task}
            />
          )}
          {inspectActions.length > 0 && (
            <ActionGroup
              actions={inspectActions}
              busy={busy}
              onAction={onAction}
              performed={simulation.actionIds}
              title={presentation.actionHeadings.inspect}
            />
          )}
          {recoveryActions.length > 0 && (
            <ActionGroup
              actions={recoveryActions}
              busy={busy}
              onAction={onAction}
              performed={simulation.actionIds}
              title={presentation.actionHeadings.recovery}
            />
          )}
        </div>
      </div>

      <footer className="task-workspace-footer">
        <span aria-live="polite">{finishStatus}</span>
        <button
          className="studio-button studio-button-primary"
          disabled={simulation.actionIds.length === 0 || pendingInspection || busy}
          onClick={onFinish}
          title={pendingInspection ? "Continue the task to see what changed." : undefined}
          type="button"
        >
          <Flag size={16} />
          Finish and review
        </button>
      </footer>
    </section>
  );
}
