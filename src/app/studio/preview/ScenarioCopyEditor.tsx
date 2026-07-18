"use client";

import { CheckCircle2, CircleAlert, LockKeyhole } from "lucide-react";
import type { ScenarioPackage } from "@/ai/schemas/scenario";
import type { ScenarioCoverage } from "@/engine/simulation/coverage";
import type { ValidationResult } from "@/ai/schemas/common";

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="copy-editor-field">
      <span>{label}</span>
      <input autoComplete="off" maxLength={160} name={`label-${label.toLowerCase().replaceAll(" ", "-")}`} onChange={(event) => onChange(event.target.value)} value={value} />
    </label>
  );
}

export function ScenarioCopyEditor({
  value,
  validation,
  coverage,
  onChange,
  onApply,
  onCancel,
}: {
  value: ScenarioPackage;
  validation: ValidationResult<ScenarioPackage>;
  coverage: ScenarioCoverage | null;
  onChange: (scenario: ScenarioPackage) => void;
  onApply: () => void;
  onCancel: () => void;
}) {
  const ready = validation.success && Boolean(coverage?.allOutcomesReachable);

  function update(mutator: (scenario: ScenarioPackage) => void) {
    const next = structuredClone(value);
    mutator(next);
    onChange(next);
  }

  return (
    <section className="scenario-copy-editor" aria-label="Scenario label editor">
      <header>
        <div>
          <span>VISIBLE LABELS</span>
          <h2>Polish reviewed interface wording</h2>
        </div>
        <div className="copy-editor-lock"><LockKeyhole size={14} /><span>Story locked</span></div>
      </header>

      <div className="copy-editor-boundary">
        <LockKeyhole size={16} />
        <span>
          <strong>Only short interface labels change here.</strong>
          <small>Task facts, pressure, role dialogue, action meaning, evidence descriptions, status values, sources, and outcome logic remain linked to the reviewed scenario. Use Edit brief for a different lesson.</small>
        </span>
      </div>

      <div className="copy-editor-body">
        <section className="copy-editor-section">
          <header>
            <span>SCENARIO</span>
            <h3>Title and framing</h3>
          </header>
          <div className="copy-editor-grid">
            <TextField label="Title" value={value.title} onChange={(next) => update((draft) => { draft.title = next; })} />
            <TextField label="Tagline" value={value.tagline} onChange={(next) => update((draft) => { draft.tagline = next; })} />
          </div>
        </section>

        <section className="copy-editor-section">
          <header>
            <span>WORKSPACE</span>
            <h3>Tool and section labels</h3>
          </header>
          <div className="copy-editor-grid">
            <TextField label="Application name" value={value.learnerPresentation.workspace.appName} onChange={(next) => update((draft) => { draft.learnerPresentation.workspace.appName = next; })} />
            <TextField label="Section label" value={value.learnerPresentation.workspace.sectionLabel} onChange={(next) => update((draft) => { draft.learnerPresentation.workspace.sectionLabel = next; })} />
            <TextField label="Workspace item" value={value.learnerPresentation.workspace.itemTitle} onChange={(next) => update((draft) => { draft.learnerPresentation.workspace.itemTitle = next; })} />
          </div>
        </section>

        <section className="copy-editor-section">
          <header>
            <span>ACTION GROUPS</span>
            <h3>Section headings</h3>
          </header>
          <div className="copy-editor-grid">
            <TextField label="Verification heading" value={value.learnerPresentation.actionHeadings.verify} onChange={(next) => update((draft) => { draft.learnerPresentation.actionHeadings.verify = next; })} />
            <TextField label="Task heading" value={value.learnerPresentation.actionHeadings.task} onChange={(next) => update((draft) => { draft.learnerPresentation.actionHeadings.task = next; })} />
            <TextField label="Inspection heading" value={value.learnerPresentation.actionHeadings.inspect} onChange={(next) => update((draft) => { draft.learnerPresentation.actionHeadings.inspect = next; })} />
            <TextField label="Response heading" value={value.learnerPresentation.actionHeadings.recovery} onChange={(next) => update((draft) => { draft.learnerPresentation.actionHeadings.recovery = next; })} />
          </div>
        </section>
      </div>

      <footer>
        <div className={ready ? "copy-editor-status is-ready" : "copy-editor-status is-blocked"}>
          {ready ? <CheckCircle2 size={15} /> : <CircleAlert size={15} />}
          <span>
            <strong>{ready ? "Ready to apply" : "Needs revision"}</strong>
            <small>
              {ready
                ? `${coverage?.reachableStateCount ?? 0} legal states · 4 outcomes`
                : validation.success
                  ? `Missing outcomes: ${coverage?.uncoveredEndingIds.join(", ")}`
                  : validation.issues.slice(0, 2).map((issue) => issue.message).join(" · ")}
            </small>
          </span>
        </div>
        <div className="copy-editor-actions">
          <button className="studio-button" onClick={onCancel} type="button">Cancel</button>
          <button className="studio-button studio-button-primary" disabled={!ready} onClick={onApply} type="button">Apply labels</button>
        </div>
      </footer>
    </section>
  );
}
