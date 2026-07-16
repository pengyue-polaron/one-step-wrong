"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  FileSearch,
  Flag,
  LoaderCircle,
  MessageSquareText,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  Users,
  X,
} from "lucide-react";
import type { InstitutionProfile } from "@/ai/schemas/institution";
import { validateProfileForApproval } from "@/ai/schemas/institution";
import type { ScenarioPackage } from "@/ai/schemas/scenario";
import {
  applyCriticalAction,
  createSimulationState,
  type CanonicalTrace,
  type SimulationState,
} from "@/engine/simulation/physics";

type StudioStage = "research" | "profile" | "brief" | "preview" | "live" | "debrief";
type Provenance = "live-research" | "live-generation" | "reviewed-fixture" | "live-role" | "reviewed-fallback" | "live-debrief" | "deterministic-fallback";
type DialogueLine = { id: string; roleId: string; roleName: string; content: string; provenance: Provenance };
type Debrief = {
  trace: CanonicalTrace;
  coaching: { headline: string; summary: string; nextTime: string };
  provenance: Provenance;
};

const workflow: Array<{ id: StudioStage; label: string; meta: string }> = [
  { id: "research", label: "Research", meta: "Public sources" },
  { id: "profile", label: "Review", meta: "Human approval" },
  { id: "brief", label: "Architect", meta: "Teaching brief" },
  { id: "preview", label: "Validate", meta: "Runtime package" },
  { id: "live", label: "Rehearse", meta: "Bounded roles" },
  { id: "debrief", label: "Debrief", meta: "Canonical trace" },
];

const initialBrief = {
  threatTopic: "Voice impersonation and urgent payment changes",
  targetLearner: "Student organization treasurers, ages 18+",
  ordinaryTask: "Finalize a guest-speaker reimbursement before an event begins.",
  environment: "Student organization finance workspace and group chat",
  pressure: "The event begins in twenty minutes",
  learningObjective: "Verify high-impact requests through an independently known channel, then contain and recover from unsafe actions.",
  durationMinutes: 8,
  tone: "realistic" as const,
};

function ProvenanceBadge({ value }: { value: Provenance | null }) {
  if (!value) return null;
  const isLive = value.startsWith("live");
  const label = value === "deterministic-fallback" ? "Deterministic" : isLive ? "GPT-5.6 live" : "Reviewed fallback";
  return <span className={`studio-provenance ${isLive ? "is-live" : ""}`}><span />{label}</span>;
}

function StageRail({ stage }: { stage: StudioStage }) {
  const current = workflow.findIndex((item) => item.id === stage);
  return (
    <aside className="studio-rail" aria-label="Scenario workflow">
      <div className="studio-rail-title"><Sparkles size={15} /><span>Build Week Studio</span></div>
      <ol>
        {workflow.map((item, index) => (
          <li className={index === current ? "is-current" : index < current ? "is-complete" : ""} key={item.id}>
            <span className="studio-step-index">{index < current ? <Check size={13} /> : String(index + 1).padStart(2, "0")}</span>
            <div><strong>{item.label}</strong><small>{item.meta}</small></div>
          </li>
        ))}
      </ol>
      <div className="studio-rail-principle"><span>TRUST MODEL</span><strong>Agents perform the world.</strong><p>Typed actions define what actually happened.</p></div>
    </aside>
  );
}

export function ScenarioStudio() {
  const [stage, setStage] = useState<StudioStage>("research");
  const [institutionName, setInstitutionName] = useState("New York University");
  const [officialDomain, setOfficialDomain] = useState("nyu.edu");
  const [publicationMode, setPublicationMode] = useState<InstitutionProfile["publicationMode"]>("brand-safe-fictionalized");
  const [profile, setProfile] = useState<InstitutionProfile | null>(null);
  const [profileProvenance, setProfileProvenance] = useState<Provenance | null>(null);
  const [brief, setBrief] = useState(initialBrief);
  const [scenario, setScenario] = useState<ScenarioPackage | null>(null);
  const [scenarioProvenance, setScenarioProvenance] = useState<Provenance | null>(null);
  const [simulation, setSimulation] = useState<SimulationState | null>(null);
  const [messages, setMessages] = useState<DialogueLine[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [suggestedActionId, setSuggestedActionId] = useState<string | null>(null);
  const [debrief, setDebrief] = useState<Debrief | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const sourceById = useMemo(() => new Map(profile?.sources.map((source) => [source.id, source]) ?? []), [profile]);

  async function research(useFixture: boolean) {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/institutions/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionName,
          officialDomains: officialDomain.trim() ? [officialDomain.trim()] : [],
          publicationMode,
          useFixture,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Institution research failed.");
      setProfile(result.profile); setProfileProvenance(result.provenance); setNotice(result.notice); setStage("profile");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Institution research failed.");
    } finally { setBusy(false); }
  }

  function approveProfile() {
    if (!profile) return;
    const approved: InstitutionProfile = {
      ...profile,
      sources: profile.sources.map((source) => ({ ...source, reviewStatus: source.reviewStatus === "rejected" ? "rejected" : "approved" })),
      approval: { status: "approved", reviewedAt: new Date().toISOString(), reviewerNote: "Reviewed in Scenario Studio." },
    };
    const validation = validateProfileForApproval(approved);
    if (!validation.success) {
      setError(validation.issues[0]?.message ?? "Resolve profile issues before approval.");
      return;
    }
    setProfile(approved); setError(""); setNotice("Institution Profile approved for scenario compilation."); setStage("brief");
  }

  async function generateScenario(useFixture: boolean) {
    if (!profile) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/scenarios/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, brief, useFixture }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Scenario generation failed.");
      setScenario(result.scenario); setScenarioProvenance(result.provenance); setNotice(result.notice); setStage("preview");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Scenario generation failed.");
    } finally { setBusy(false); }
  }

  function launchScenario() {
    if (!scenario) return;
    const opening = scenario.fallbackDialogue.find((line) => line.eventId === "urgent-request") ?? scenario.fallbackDialogue[0];
    const role = scenario.roleCards.find((item) => item.id === opening.roleId)!;
    setSimulation(createSimulationState(scenario));
    setMessages([{ id: opening.id, roleId: opening.roleId, roleName: role.displayName, content: opening.content, provenance: "reviewed-fallback" }]);
    setSelectedRoleId(opening.roleId); setSuggestedActionId(null); setDebrief(null); setStage("live");
  }

  function performAction(actionId: string) {
    if (!scenario || !simulation) return;
    setSimulation(applyCriticalAction(scenario, simulation, actionId));
    if (suggestedActionId === actionId) setSuggestedActionId(null);
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!scenario || !simulation || !messageDraft.trim()) return;
    const learnerContent = messageDraft.trim();
    setMessages((current) => [...current, { id: `learner-${Date.now()}`, roleId: "learner", roleName: "You", content: learnerContent, provenance: "reviewed-fallback" }]);
    setMessageDraft(""); setBusy(true); setError("");
    try {
      const response = await fetch("/api/simulation/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          learnerMessage: learnerContent,
          completedActionIds: simulation.actionIds,
          preferredRoleId: selectedRoleId,
          conversationHistory: messages.slice(-8).map((line) => ({
            speaker: line.roleId === "learner" ? "learner" : "role",
            roleId: line.roleId === "learner" ? null : line.roleId,
            content: line.content,
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Role response failed.");
      const turn = result.turn;
      const role = scenario.roleCards.find((item) => item.id === turn.roleId)!;
      setMessages((current) => [...current, { id: `role-${Date.now()}`, roleId: turn.roleId, roleName: role.displayName, content: turn.content, provenance: turn.provenance }]);
      setSelectedRoleId(turn.roleId); setSuggestedActionId(turn.suggestedActionId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Role response failed.");
    } finally { setBusy(false); }
  }

  async function finishScenario() {
    if (!scenario || !simulation) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/debrief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, actionIds: simulation.actionIds }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Debrief failed.");
      setDebrief(result); setStage("debrief");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Debrief failed.");
    } finally { setBusy(false); }
  }

  function restart() {
    setStage("research"); setProfile(null); setScenario(null); setSimulation(null); setMessages([]); setDebrief(null); setNotice(""); setError("");
  }

  return (
    <main className="studio-shell">
      <header className="studio-topbar">
        <Link href="/" className="studio-home-link"><ArrowLeft size={15} /><span>Case Library</span></Link>
        <div className="studio-brand"><span className="studio-brand-mark">1</span><strong>One Step Wrong</strong><span>/ Scenario Studio</span></div>
        <div className="studio-model-status"><span /> GPT-5.6 + FALLBACK</div>
      </header>

      <div className="studio-layout">
        <StageRail stage={stage} />
        <section className="studio-workspace">
          {notice && <div className="studio-notice"><CheckCircle2 size={16} /><span>{notice}</span></div>}
          {error && <div className="studio-notice is-error"><CircleAlert size={16} /><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError("")}><X size={15} /></button></div>}

          {stage === "research" && (
            <div className="studio-section" data-testid="studio-research">
              <header className="studio-section-heading"><span>01 / INSTITUTION RESEARCH</span><h1>Ground the rehearsal in a real learning environment.</h1><p>Start with a school and public official domain. Every retained fact will stay attached to reviewable evidence.</p></header>
              <div className="studio-form-grid">
                <label className="studio-field studio-field-wide"><span>Institution</span><input value={institutionName} maxLength={120} onChange={(event) => setInstitutionName(event.target.value)} /></label>
                <label className="studio-field"><span>Official domain</span><input value={officialDomain} maxLength={253} onChange={(event) => setOfficialDomain(event.target.value)} /></label>
                <fieldset className="studio-field studio-mode"><legend>Publication mode</legend><div><button className={publicationMode === "brand-safe-fictionalized" ? "is-active" : ""} onClick={() => setPublicationMode("brand-safe-fictionalized")} type="button">Brand-safe</button><button className={publicationMode === "authorized-exact" ? "is-active" : ""} onClick={() => setPublicationMode("authorized-exact")} type="button">Authorized exact</button></div></fieldset>
              </div>
              <div className="studio-actions"><button className="studio-button studio-button-primary" disabled={busy || institutionName.trim().length < 2} onClick={() => research(false)}>{busy ? <LoaderCircle className="is-spinning" size={16} /> : <FileSearch size={16} />}Research official sources</button><button className="studio-button" disabled={busy} onClick={() => research(true)}><BookOpenCheck size={16} />Load reviewed example</button></div>
              <div className="studio-process-strip"><div><span>1</span><strong>Search</strong><small>Public official pages</small></div><ArrowRight size={16} /><div><span>2</span><strong>Validate</strong><small>Domains and citations</small></div><ArrowRight size={16} /><div><span>3</span><strong>Approve</strong><small>Educator decision</small></div></div>
            </div>
          )}

          {stage === "profile" && profile && (
            <div className="studio-section" data-testid="studio-profile">
              <header className="studio-section-heading studio-heading-row"><div><span>02 / PROFILE REVIEW</span><h1>{profile.displayName}</h1><p>{profile.officialDomains.join(" · ")} · {profile.facts.filter((fact) => fact.status === "verified").length} verified facts · {profile.unresolvedFields.length} unknown</p></div><ProvenanceBadge value={profileProvenance} /></header>
              <div className="profile-table" role="table" aria-label="Institution facts">
                {profile.facts.map((fact, factIndex) => (
                  <div className="profile-row" role="row" key={fact.id}>
                    <div className="profile-fact-meta"><span>{fact.category.replaceAll("-", " ")}</span><strong>{fact.label}</strong><small className={`fact-status is-${fact.status}`}>{fact.status} · {fact.confidence}</small></div>
                    <div className="profile-fact-value">
                      {fact.status === "unknown" ? <p className="unknown-value">Unknown remains unknown</p> : <textarea aria-label={`${fact.label} value`} value={fact.value ?? ""} maxLength={700} onChange={(event) => setProfile((current) => current ? { ...current, facts: current.facts.map((item, index) => index === factIndex ? { ...item, value: event.target.value } : item) } : current)} />}
                      <div className="source-chips">{fact.sourceIds.map((sourceId) => { const source = sourceById.get(sourceId); return source ? <a href={source.url} target="_blank" rel="noreferrer" key={sourceId}><ExternalLink size={11} />{source.title}</a> : null; })}</div>
                    </div>
                  </div>
                ))}
              </div>
              {profile.unresolvedFields.length > 0 && <div className="profile-unknowns"><CircleAlert size={16} /><div><strong>Explicit unknowns</strong><p>{profile.unresolvedFields.join(" · ")}</p></div></div>}
              <div className="studio-actions"><button className="studio-button studio-button-primary" onClick={approveProfile}><UserRoundCheck size={16} />Approve profile</button><button className="studio-button" onClick={() => research(profileProvenance === "reviewed-fixture")} disabled={busy}><RefreshCw size={16} />Reload</button><button className="studio-button studio-button-danger" onClick={() => { setProfile(null); setStage("research"); }}><X size={16} />Reject</button></div>
            </div>
          )}

          {stage === "brief" && profile && (
            <div className="studio-section" data-testid="studio-brief">
              <header className="studio-section-heading"><span>03 / SCENARIO ARCHITECT</span><h1>Frame one ordinary task under pressure.</h1><p>The architect receives only the approved profile and this bounded teaching brief.</p></header>
              <div className="studio-form-grid">
                <label className="studio-field studio-field-wide"><span>Threat topic</span><input value={brief.threatTopic} onChange={(e) => setBrief({ ...brief, threatTopic: e.target.value })} /></label>
                <label className="studio-field"><span>Target learner</span><input value={brief.targetLearner} onChange={(e) => setBrief({ ...brief, targetLearner: e.target.value })} /></label>
                <label className="studio-field"><span>Duration</span><select value={brief.durationMinutes} onChange={(e) => setBrief({ ...brief, durationMinutes: Number(e.target.value) })}><option value={5}>5 minutes</option><option value={8}>8 minutes</option><option value={12}>12 minutes</option></select></label>
                <label className="studio-field studio-field-wide"><span>Ordinary task</span><textarea value={brief.ordinaryTask} onChange={(e) => setBrief({ ...brief, ordinaryTask: e.target.value })} /></label>
                <label className="studio-field"><span>Environment</span><textarea value={brief.environment} onChange={(e) => setBrief({ ...brief, environment: e.target.value })} /></label>
                <label className="studio-field"><span>Pressure</span><textarea value={brief.pressure} onChange={(e) => setBrief({ ...brief, pressure: e.target.value })} /></label>
                <label className="studio-field studio-field-wide"><span>Learning objective</span><textarea value={brief.learningObjective} onChange={(e) => setBrief({ ...brief, learningObjective: e.target.value })} /></label>
              </div>
              <div className="studio-actions"><button className="studio-button studio-button-primary" disabled={busy} onClick={() => generateScenario(false)}>{busy ? <LoaderCircle className="is-spinning" size={16} /> : <Sparkles size={16} />}Compile scenario</button><button className="studio-button" disabled={busy} onClick={() => generateScenario(true)}><BookOpenCheck size={16} />Compile flagship example</button></div>
            </div>
          )}

          {stage === "preview" && scenario && (
            <div className="studio-section" data-testid="studio-preview">
              <header className="studio-section-heading studio-heading-row"><div><span>04 / VALIDATED PACKAGE</span><h1>{scenario.title}</h1><p>{scenario.tagline} · {scenario.durationMinutes} minutes</p></div><div className="validation-passed"><ShieldCheck size={18} /><span><strong>VALID</strong><small>Runtime schema passed</small></span></div></header>
              <div className="scenario-summary-band"><div><span>Ordinary task</span><p>{scenario.intro.ordinaryTask}</p></div><div><span>Pressure</span><p>{scenario.intro.pressure}</p></div></div>
              <div className="scenario-columns">
                <section><header><Users size={15} /><strong>Bounded cast</strong><ProvenanceBadge value={scenarioProvenance} /></header>{scenario.roleCards.map((role) => <div className="role-line" key={role.id}><span className={`role-dot is-${role.identityStatus}`} /><div><strong>{role.displayName}</strong><small>{role.identityStatus} · {role.allowedChannels[0]}</small></div></div>)}</section>
                <section><header><Flag size={15} /><strong>Critical actions</strong><span>{scenario.criticalActions.length}</span></header>{scenario.criticalActions.map((action) => <div className="action-line" key={action.id}><span>{action.phase}</span><strong>{action.label}</strong></div>)}</section>
              </div>
              <div className="package-ledger"><span>{scenario.worldBible.immutableFacts.length} immutable facts</span><span>{scenario.allowedEvents.length} allowlisted events</span><span>{scenario.recoveryActionIds.length} recovery actions</span><span>4 deterministic endings</span></div>
              <div className="studio-actions"><button className="studio-button studio-button-primary" onClick={launchScenario}><Play size={16} />Launch rehearsal</button><button className="studio-button" onClick={() => setStage("brief")}><ArrowLeft size={16} />Edit brief</button></div>
            </div>
          )}

          {stage === "live" && scenario && simulation && (
            <div className="studio-section studio-live" data-testid="studio-live">
              <header className="studio-section-heading studio-heading-row"><div><span>05 / LIVE REHEARSAL</span><h1>{scenario.title}</h1><p>{scenario.intro.ordinaryTask}</p></div><div className="rehearsal-clock"><span>EVENT STARTS</span><strong>00:20:00</strong></div></header>
              <div className="rehearsal-grid">
                <section className="dialogue-workspace">
                  <header><MessageSquareText size={16} /><strong>Conversation</strong><ProvenanceBadge value={messages.at(-1)?.provenance ?? null} /></header>
                  <div className="dialogue-log" aria-live="polite">{messages.map((line) => <article className={line.roleId === "learner" ? "is-learner" : ""} key={line.id}><div><strong>{line.roleName}</strong><small>{line.roleId === "learner" ? "learner" : scenario.roleCards.find((role) => role.id === line.roleId)?.identityStatus}</small></div><p>{line.content}</p></article>)}</div>
                  <div className="role-picker">{scenario.roleCards.map((role) => <button className={selectedRoleId === role.id ? "is-active" : ""} key={role.id} onClick={() => setSelectedRoleId(role.id)}><span className={`role-dot is-${role.identityStatus}`} />{role.displayName}</button>)}</div>
                  <form className="dialogue-compose" onSubmit={sendMessage}><textarea aria-label="Message a role" maxLength={500} placeholder="Ask a natural question…" value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} /><button aria-label="Send message" disabled={busy || !messageDraft.trim()}>{busy ? <LoaderCircle className="is-spinning" size={17} /> : <Send size={17} />}</button></form>
                </section>
                <aside className="action-console">
                  <header><ShieldCheck size={16} /><div><strong>Decision console</strong><small>{simulation.actionIds.length} actions recorded</small></div></header>
                  <div className="canonical-state"><span>PAYMENT <strong>{simulation.canonical.payment}</strong></span><span>IDENTITY <strong>{simulation.canonical.identity}</strong></span><span>ACCESS <strong>{simulation.canonical.access}</strong></span></div>
                  <div className="action-groups">
                    <ActionGroup title="Containment" actions={scenario.criticalActions.filter((action) => action.phase === "containment")} performed={simulation.actionIds} suggested={suggestedActionId} onAction={performAction} />
                    <ActionGroup title="Recovery" actions={scenario.criticalActions.filter((action) => action.phase === "recovery")} performed={simulation.actionIds} suggested={suggestedActionId} onAction={performAction} />
                  </div>
                  <button className="studio-button studio-button-primary finish-button" disabled={simulation.actionIds.length === 0 || busy} onClick={finishScenario}><Flag size={16} />Resolve and debrief</button>
                </aside>
              </div>
            </div>
          )}

          {stage === "debrief" && scenario && simulation && debrief && (
            <div className="studio-section studio-debrief" data-testid="studio-debrief">
              <header className="studio-section-heading studio-heading-row"><div><span>06 / EVIDENCE-GROUNDED DEBRIEF</span><h1>{debrief.coaching.headline}</h1><p>{debrief.coaching.summary}</p></div><ProvenanceBadge value={debrief.provenance} /></header>
              <div className={`ending-banner is-${debrief.trace.endingId}`}><span>DETERMINISTIC ENDING</span><strong>{debrief.trace.endingId.toUpperCase()}</strong><p>{scenario.endings.find((ending) => ending.id === debrief.trace.endingId)?.summary}</p></div>
              <div className="trace-grid">
                <section><header><CheckCircle2 size={16} /><strong>Recorded actions</strong></header>{debrief.trace.actionLabels.length ? <ol>{debrief.trace.actionLabels.map((label, index) => <li key={`${label}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span>{label}</li>)}</ol> : <p>No critical actions were recorded.</p>}</section>
                <section><header><CircleAlert size={16} /><strong>Recovery status</strong></header>{!debrief.trace.recoveryRequired ? <p>No recovery was required.</p> : debrief.trace.missedRecoveryActionIds.length ? <ul>{debrief.trace.missedRecoveryActionIds.map((id) => <li key={id}>{scenario.criticalActions.find((action) => action.id === id)?.label}</li>)}</ul> : <p>All required recovery actions were completed.</p>}</section>
              </div>
              <blockquote><span>TRANSFER RULE</span><p>{debrief.coaching.nextTime}</p></blockquote>
              <div className="studio-actions"><button className="studio-button studio-button-primary" onClick={launchScenario}><RotateCcw size={16} />Replay scenario</button><button className="studio-button" onClick={restart}><RefreshCw size={16} />New institution</button><Link className="studio-button" href="/"><ArrowLeft size={16} />Case library</Link></div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ActionGroup({ title, actions, performed, suggested, onAction }: { title: string; actions: ScenarioPackage["criticalActions"]; performed: string[]; suggested: string | null; onAction: (id: string) => void }) {
  return <section><h2>{title}</h2>{actions.map((action) => { const done = performed.includes(action.id); return <button className={`${done ? "is-done" : ""} ${suggested === action.id ? "is-suggested" : ""}`} disabled={done} key={action.id} onClick={() => onAction(action.id)}><span>{done ? <Check size={14} /> : action.kind === "pause" ? <Pause size={14} /> : <ArrowRight size={14} />}</span><div><strong>{action.label}</strong><small>{action.description}</small></div></button>; })}</section>;
}
