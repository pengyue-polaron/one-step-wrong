"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  BookOpenCheck,
  Check,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  ExternalLink,
  FileQuestion,
  FileSearch,
  Flag,
  GitBranch,
  GitCompareArrows,
  LoaderCircle,
  LockKeyhole,
  MessageSquareText,
  Pause,
  Play,
  Printer,
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
  actionIsAvailable,
  applyCriticalAction,
  createSimulationState,
  type CanonicalTrace,
  type SimulationState,
  type TransferProbeResult,
  evaluateTransferProbe,
} from "@/engine/simulation/physics";
import { evaluateScenarioCoverage } from "@/engine/simulation/coverage";
import { reviewedNyuInstitutionProfile } from "@/fixtures/institutionProfile";
import { voiceYouKnowScenario } from "@/fixtures/voiceYouKnow";

type StudioStage = "research" | "profile" | "brief" | "preview" | "live" | "debrief" | "transfer" | "report";
type Provenance = "live-research" | "live-generation" | "reviewed-fixture" | "live-role" | "reviewed-fallback" | "live-debrief" | "deterministic-fallback";
type DialogueLine = { id: string; roleId: string; roleName: string; content: string; provenance: Provenance | null };
type Debrief = {
  trace: CanonicalTrace;
  coaching: { headline: string; summary: string; nextTime: string };
  provenance: Provenance;
};
type CoachAnswer = {
  question: string;
  answer: string;
  evidenceIds: string[];
  sourceFactIds: string[];
};

type ApiIssue = { path?: string; message?: string };

const authoringWorkflow: Array<{ id: StudioStage; label: string; meta: string }> = [
  { id: "research", label: "Research", meta: "Public sources" },
  { id: "profile", label: "Review", meta: "Approve context" },
  { id: "brief", label: "Design", meta: "Learning brief" },
  { id: "preview", label: "Preview", meta: "Scenario checks" },
];

const learnerWorkflow: Array<{ id: StudioStage; label: string; meta: string }> = [
  { id: "live", label: "Practice", meta: "Make the judgment" },
  { id: "debrief", label: "Review", meta: "See what changed" },
  { id: "transfer", label: "Apply", meta: "New context" },
];

function isLearnerStage(stage: StudioStage) {
  return stage === "live" || stage === "debrief" || stage === "transfer";
}

const facilitatorWorkflow: Array<{ id: StudioStage; label: string; meta: string }> = [
  { id: "report", label: "Facilitate", meta: "Discuss the evidence" },
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
  const labels: Record<Provenance, string> = {
    "live-research": "Current source review",
    "live-generation": "New scenario",
    "reviewed-fixture": "Reviewed example",
    "live-role": "Adaptive response",
    "reviewed-fallback": "Reviewed response",
    "live-debrief": "Personalized review",
    "deterministic-fallback": "Recorded review",
  };
  const label = labels[value];
  return <span className={`studio-provenance ${isLive ? "is-live" : ""}`}><span />{label}</span>;
}

function formatApiError(payload: { error?: string; issues?: ApiIssue[] }, fallback: string) {
  const heading = payload.error || fallback;
  const details = payload.issues
    ?.filter((issue) => issue.message)
    .slice(0, 4)
    .map((issue) => `${issue.path || "request"}: ${issue.message}`);
  return details?.length ? `${heading}\n${details.join("\n")}` : heading;
}

const stateLabels = {
  identity: {
    unverified: "not checked",
    "claimed-legitimate": "callback claim only",
    "verified-legitimate": "verified",
    "verified-false": "request disproved",
  },
  payment: {
    pending: "pending",
    paused: "paused",
    released: "released",
    redirected: "changed",
  },
  access: {
    restricted: "restricted",
    shared: "shared",
    revoked: "revoked",
  },
} as const;

const transferOutcomeLabels = {
  demonstrated: "applied independently",
  developing: "partly applied",
  "not-yet": "not applied yet",
} as const;

function StageRail({ stage }: { stage: StudioStage }) {
  const workflow = stage === "report" ? facilitatorWorkflow : isLearnerStage(stage) ? learnerWorkflow : authoringWorkflow;
  const current = workflow.findIndex((item) => item.id === stage);
  const title = stage === "report" ? "Facilitator" : isLearnerStage(stage) ? "Rehearsal" : "Scenario Studio";
  return (
    <aside className="studio-rail" aria-label="Scenario workflow">
      <div className="studio-rail-title"><Sparkles size={15} /><span>{title}</span></div>
      <ol>
        {workflow.map((item, index) => (
          <li className={index === current ? "is-current" : index < current ? "is-complete" : ""} key={item.id}>
            <span className="studio-step-index">{index < current ? <Check size={13} /> : String(index + 1).padStart(2, "0")}</span>
            <div><strong>{item.label}</strong><small>{item.meta}</small></div>
          </li>
        ))}
      </ol>
      <div className="studio-rail-principle"><span>LEARNING MODEL</span><strong>Practice the judgment, not the answer.</strong><p>The story responds to you. Consequences follow the actions you take.</p></div>
    </aside>
  );
}

function openingDialogue(scenario: ScenarioPackage) {
  const opening = scenario.fallbackDialogue.find((line) => line.eventId === "urgent-request") ?? scenario.fallbackDialogue[0];
  const role = scenario.roleCards.find((item) => item.id === opening.roleId)!;
  return {
    opening,
    role,
    message: {
      id: opening.id,
      roleId: opening.roleId,
      roleName: role.displayName,
      content: opening.content,
      provenance: "reviewed-fallback" as const,
    },
  };
}

export function ScenarioStudio({ mode = "studio" }: { mode?: "studio" | "featured" }) {
  const featured = mode === "featured";
  const featuredDialogue = openingDialogue(voiceYouKnowScenario);
  const [stage, setStage] = useState<StudioStage>(featured ? "live" : "research");
  const [institutionName, setInstitutionName] = useState("New York University");
  const [officialDomain, setOfficialDomain] = useState("nyu.edu");
  const [publicationMode, setPublicationMode] = useState<InstitutionProfile["publicationMode"]>("brand-safe-fictionalized");
  const [exactAuthorizationConfirmed, setExactAuthorizationConfirmed] = useState(false);
  const [profile, setProfile] = useState<InstitutionProfile | null>(featured ? reviewedNyuInstitutionProfile : null);
  const [profileProvenance, setProfileProvenance] = useState<Provenance | null>(featured ? "reviewed-fixture" : null);
  const [brief, setBrief] = useState(initialBrief);
  const [scenario, setScenario] = useState<ScenarioPackage | null>(featured ? voiceYouKnowScenario : null);
  const [scenarioProvenance, setScenarioProvenance] = useState<Provenance | null>(featured ? "reviewed-fixture" : null);
  const [simulation, setSimulation] = useState<SimulationState | null>(featured ? createSimulationState(voiceYouKnowScenario) : null);
  const [messages, setMessages] = useState<DialogueLine[]>(featured ? [featuredDialogue.message] : []);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(featured ? featuredDialogue.role.id : null);
  const [messageDraft, setMessageDraft] = useState("");
  const [debrief, setDebrief] = useState<Debrief | null>(null);
  const [transferResult, setTransferResult] = useState<TransferProbeResult | null>(null);
  const [coachQuestion, setCoachQuestion] = useState("");
  const [coachAnswers, setCoachAnswers] = useState<CoachAnswer[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [coachBusy, setCoachBusy] = useState(false);

  const sourceById = useMemo(() => new Map(profile?.sources.map((source) => [source.id, source]) ?? []), [profile]);
  const visibleVerificationActions = useMemo(() => scenario && simulation
    ? scenario.criticalActions.filter((action) => action.kind === "verify" && (simulation.actionIds.includes(action.id) || actionIsAvailable(scenario, action.id, simulation.actionIds)))
    : [], [scenario, simulation]);
  const visibleTaskActions = useMemo(() => scenario && simulation
    ? scenario.criticalActions.filter((action) => action.phase !== "recovery" && action.kind !== "verify" && (simulation.actionIds.includes(action.id) || actionIsAvailable(scenario, action.id, simulation.actionIds)))
    : [], [scenario, simulation]);
  const visibleResponseActions = useMemo(() => scenario && simulation
    ? scenario.criticalActions.filter((action) => action.phase === "recovery" && (simulation.actionIds.includes(action.id) || actionIsAvailable(scenario, action.id, simulation.actionIds)))
    : [], [scenario, simulation]);
  const reportFacts = useMemo(() => {
    if (!profile || !scenario) return [];
    return profile.facts.filter((fact) => fact.status === "verified" && scenario.sourceFactIds.includes(fact.id));
  }, [profile, scenario]);
  const scenarioCoverage = useMemo(
    () => scenario ? evaluateScenarioCoverage(scenario) : null,
    [scenario],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [stage]);

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
          authorizationConfirmed: exactAuthorizationConfirmed,
          useFixture,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(formatApiError(result, "Institution research failed."));
      setProfile(result.profile); setProfileProvenance(result.provenance); setNotice(result.notice); setStage("profile");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Institution research failed.");
    } finally { setBusy(false); }
  }

  function approveProfile() {
    if (!profile) return;
    const approved: InstitutionProfile = {
      ...profile,
      approval: {
        status: "approved",
        reviewedAt: new Date().toISOString(),
        reviewerNote: profile.publicationMode === "authorized-exact"
          ? "Reviewed in Scenario Studio after exact-brand authorization was confirmed."
          : "Reviewed in Scenario Studio for brand-safe fictionalized publication.",
      },
    };
    const validation = validateProfileForApproval(approved);
    if (!validation.success) {
      setError(validation.issues.slice(0, 4).map((issue) => `${issue.path}: ${issue.message}`).join("\n") || "Resolve profile issues before approval.");
      return;
    }
    setProfile(approved); setError(""); setNotice("Institution context approved. Add the learning brief."); setStage("brief");
  }

  function updateFactStatus(factIndex: number, status: InstitutionProfile["facts"][number]["status"]) {
    setProfile((current) => {
      if (!current) return current;
      return {
        ...current,
        approval: { status: "review-required" },
        facts: current.facts.map((fact, index) => {
          if (index !== factIndex) return fact;
          if (status === "unknown") {
            return { ...fact, status, value: null, confidence: "unknown", sourceIds: [] };
          }
          return {
            ...fact,
            status,
            value: fact.value ?? "",
            confidence: fact.confidence === "unknown" ? "medium" : fact.confidence,
          };
        }),
      };
    });
  }

  function updateSourceReview(sourceId: string, reviewStatus: InstitutionProfile["sources"][number]["reviewStatus"]) {
    setProfile((current) => current ? {
      ...current,
      approval: { status: "review-required" },
      sources: current.sources.map((source) => source.id === sourceId ? { ...source, reviewStatus } : source),
    } : current);
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
      if (!response.ok) throw new Error(formatApiError(result, "Scenario generation failed."));
      if (result.profile) {
        setProfile(result.profile);
        setProfileProvenance("reviewed-fixture");
      }
      setScenario(result.scenario); setScenarioProvenance(result.provenance); setNotice(result.notice); setStage("preview");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Scenario generation failed.");
    } finally { setBusy(false); }
  }

  function launchScenario() {
    if (!scenario) return;
    if (!scenarioCoverage?.allOutcomesReachable) {
      setError("Every declared outcome needs a legal learner-action path before rehearsal.");
      return;
    }
    const dialogue = openingDialogue(scenario);
    setSimulation(createSimulationState(scenario));
    setMessages([dialogue.message]);
    setSelectedRoleId(dialogue.role.id); setDebrief(null); setTransferResult(null); setCoachAnswers([]); setCoachQuestion(""); setNotice(""); setStage("live");
  }

  function performAction(actionId: string) {
    if (!scenario || !simulation) return;
    try {
      setSimulation(applyCriticalAction(scenario, simulation, actionId));
    } catch {
      setError("That action is not available yet.");
    }
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!scenario || !simulation || !messageDraft.trim()) return;
    const learnerContent = messageDraft.trim();
    setMessages((current) => [...current, { id: `learner-${Date.now()}`, roleId: "learner", roleName: "You", content: learnerContent, provenance: null }]);
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
      if (!response.ok) throw new Error(formatApiError(result, "Role response failed."));
      const turn = result.turn;
      const role = scenario.roleCards.find((item) => item.id === turn.roleId)!;
      setMessages((current) => [...current, { id: `role-${Date.now()}`, roleId: turn.roleId, roleName: role.displayName, content: turn.content, provenance: turn.provenance }]);
      setSelectedRoleId(turn.roleId);
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
      if (!response.ok) throw new Error(formatApiError(result, "Debrief failed."));
      setDebrief(result); setStage("debrief");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Debrief failed.");
    } finally { setBusy(false); }
  }

  async function askEvidenceCoach(question: string) {
    const trimmed = question.trim();
    if (!scenario || !profile || !simulation || !debrief || trimmed.length < 3) return;
    setCoachBusy(true); setError("");
    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          profile,
          actionIds: simulation.actionIds,
          question: trimmed,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(formatApiError(result, "The evidence question could not be answered."));
      setCoachAnswers((current) => [...current, {
        question: trimmed,
        answer: result.answer,
        evidenceIds: result.evidenceIds,
        sourceFactIds: result.sourceFactIds,
      }]);
      setCoachQuestion("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The evidence question could not be answered.");
    } finally {
      setCoachBusy(false);
    }
  }

  function selectTransferAction(actionId: string) {
    if (!scenario || transferResult) return;
    try {
      setTransferResult(evaluateTransferProbe(scenario, actionId));
    } catch {
      setError("That option is not available in this situation.");
    }
  }

  function restart() {
    setStage("research"); setProfile(null); setScenario(null); setSimulation(null); setMessages([]); setDebrief(null); setTransferResult(null); setCoachAnswers([]); setCoachQuestion(""); setNotice(""); setError(""); setExactAuthorizationConfirmed(false);
  }

  return (
    <main className="studio-shell">
      <header className="studio-topbar">
        <Link href="/" className="studio-home-link"><ArrowLeft size={15} /><span>Case Library</span></Link>
        <div className="studio-brand"><span className="studio-brand-mark">1</span><strong>One Step Wrong</strong><span>/ {stage === "report" ? "Facilitator Report" : isLearnerStage(stage) ? "Rehearsal" : "Scenario Studio"}</span></div>
      </header>

      <div className="studio-layout">
        <StageRail stage={stage} />
        <section className="studio-workspace">
          {notice && <div className="studio-notice"><CheckCircle2 size={16} /><span>{notice}</span></div>}
          {error && <div className="studio-notice is-error"><CircleAlert size={16} /><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError("")}><X size={15} /></button></div>}

          {stage === "research" && (
            <div className="studio-section" data-testid="studio-research">
              <header className="studio-section-heading"><span>01 / INSTITUTION CONTEXT</span><h1>Start with the environment students already know.</h1><p>Use public guidance to match the school&apos;s terminology, tools, and reporting routes.</p></header>
              <div className="studio-form-grid">
                <label className="studio-field studio-field-wide"><span>Institution</span><input value={institutionName} maxLength={120} onChange={(event) => { setInstitutionName(event.target.value); setExactAuthorizationConfirmed(false); }} /></label>
                <label className="studio-field"><span>Official domain</span><input value={officialDomain} maxLength={253} onChange={(event) => { setOfficialDomain(event.target.value); setExactAuthorizationConfirmed(false); }} /></label>
                <fieldset className="studio-field studio-mode"><legend>Institution naming</legend><div><button className={publicationMode === "brand-safe-fictionalized" ? "is-active" : ""} onClick={() => { setPublicationMode("brand-safe-fictionalized"); setExactAuthorizationConfirmed(false); }} type="button">Fictionalized</button><button className={publicationMode === "authorized-exact" ? "is-active" : ""} onClick={() => { setPublicationMode("authorized-exact"); setExactAuthorizationConfirmed(false); }} type="button">Use exact names</button></div></fieldset>
                {publicationMode === "authorized-exact" && <label className="studio-authorization studio-field-wide"><input checked={exactAuthorizationConfirmed} onChange={(event) => setExactAuthorizationConfirmed(event.target.checked)} type="checkbox" /><span><strong>Permission confirmed</strong>I have permission to use this institution&apos;s exact name and terminology in the rehearsal.</span></label>}
              </div>
              <div className="studio-actions"><button className="studio-button studio-button-primary" disabled={busy || institutionName.trim().length < 2 || (publicationMode === "authorized-exact" && !exactAuthorizationConfirmed)} onClick={() => research(false)}>{busy ? <LoaderCircle className="is-spinning" size={16} /> : <FileSearch size={16} />}Find public guidance</button><button className="studio-button" disabled={busy || (publicationMode === "authorized-exact" && !exactAuthorizationConfirmed)} onClick={() => research(true)}><BookOpenCheck size={16} />Use example institution</button></div>
              <div className="studio-process-strip"><div><span>1</span><strong>Find</strong><small>Public official pages</small></div><ArrowRight size={16} /><div><span>2</span><strong>Check</strong><small>Sources and terminology</small></div><ArrowRight size={16} /><div><span>3</span><strong>Approve</strong><small>What the scenario may use</small></div></div>
            </div>
          )}

          {stage === "profile" && profile && (
            <div className="studio-section" data-testid="studio-profile">
              <header className="studio-section-heading studio-heading-row"><div><span>02 / CONTEXT REVIEW</span><h1>{profile.displayName}</h1><p>{profile.officialDomains.join(" · ")} · {profile.publicationMode === "brand-safe-fictionalized" ? "fictionalized names" : "exact institution names"} · {profile.facts.filter((fact) => fact.status === "verified").length} supported facts · {profile.unresolvedFields.length} open questions</p></div><ProvenanceBadge value={profileProvenance} /></header>
              <div className="profile-table" role="table" aria-label="Institution facts">
                {profile.facts.map((fact, factIndex) => (
                  <div className="profile-row" role="row" key={fact.id}>
                    <div className="profile-fact-meta"><span>{fact.category.replaceAll("-", " ")}</span><strong>{fact.label}</strong><label className="fact-review-status"><span>Review status</span><select aria-label={`Status for ${fact.label}`} className={`fact-status is-${fact.status}`} value={fact.status} onChange={(event) => updateFactStatus(factIndex, event.target.value as InstitutionProfile["facts"][number]["status"])}><option value="verified">Verified</option><option value="conflicting">Conflicting</option><option value="unknown">Unknown</option></select></label><small>{fact.confidence} confidence</small></div>
                    <div className="profile-fact-value">
                      {fact.status === "unknown" ? <p className="unknown-value">Unknown remains unknown</p> : <textarea aria-label={`${fact.label} value`} value={fact.value ?? ""} maxLength={700} placeholder="Enter a source-supported value." onChange={(event) => setProfile((current) => current ? { ...current, approval: { status: "review-required" }, facts: current.facts.map((item, index) => index === factIndex ? { ...item, value: event.target.value } : item) } : current)} />}
                      <div className="source-chips">{fact.sourceIds.map((sourceId) => { const source = sourceById.get(sourceId); return source ? <a className={`is-${source.reviewStatus}`} href={source.url} target="_blank" rel="noreferrer" key={sourceId}><ExternalLink size={11} />{source.title}<small>{source.reviewStatus}</small></a> : null; })}</div>
                    </div>
                  </div>
                ))}
              </div>
              {profile.unresolvedFields.length > 0 && <div className="profile-unknowns"><CircleAlert size={16} /><div><strong>Open questions</strong><p>{profile.unresolvedFields.join(" · ")}</p></div></div>}
              {profile.researchWarnings.length > 0 && <div className="profile-unknowns profile-warnings"><CircleAlert size={16} /><div><strong>Review notes</strong>{profile.researchWarnings.map((warning) => <p key={warning}>{warning}</p>)}</div></div>}
              <section className="profile-sources" aria-label="Source review">
                <header><div><strong>Source review</strong><small>Approve the evidence that may support verified facts.</small></div><span>{profile.sources.filter((source) => source.reviewStatus === "approved").length} / {profile.sources.length} approved</span></header>
                {profile.sources.map((source) => (
                  <article key={source.id}>
                    <div><a href={source.url} target="_blank" rel="noreferrer"><ExternalLink size={13} />{source.title}</a><p>{source.publisher} · {source.authority.replace("-", " ")} · accessed {source.accessedAt.slice(0, 10)}</p><small>Supports {source.supportsFactIds.map((factId) => profile.facts.find((fact) => fact.id === factId)?.label ?? factId).join(" · ")}</small></div>
                    <div className="source-review-actions"><button aria-label={`Approve source ${source.title}`} className={source.reviewStatus === "approved" ? "is-approved" : ""} onClick={() => updateSourceReview(source.id, "approved")} type="button"><Check size={13} />Approve</button><button aria-label={`Reject source ${source.title}`} className={source.reviewStatus === "rejected" ? "is-rejected" : ""} onClick={() => updateSourceReview(source.id, "rejected")} type="button"><X size={13} />Reject</button></div>
                  </article>
                ))}
              </section>
              <div className="studio-actions"><button className="studio-button studio-button-primary" onClick={approveProfile}><UserRoundCheck size={16} />Approve profile</button><button className="studio-button" onClick={() => research(profileProvenance === "reviewed-fixture")} disabled={busy}><RefreshCw size={16} />Reload</button><button className="studio-button studio-button-danger" onClick={() => { setProfile(null); setStage("research"); }}><X size={16} />Reject</button></div>
            </div>
          )}

          {stage === "brief" && profile && (
            <div className="studio-section" data-testid="studio-brief">
              <header className="studio-section-heading"><span>03 / SCENARIO DESIGN</span><h1>Put one ordinary task under believable pressure.</h1><p>Define who is practicing, what they need to finish, and the judgment the rehearsal should exercise.</p></header>
              <div className="studio-form-grid">
                <label className="studio-field studio-field-wide"><span>Threat topic</span><input value={brief.threatTopic} onChange={(e) => setBrief({ ...brief, threatTopic: e.target.value })} /></label>
                <label className="studio-field"><span>Target learner</span><input value={brief.targetLearner} onChange={(e) => setBrief({ ...brief, targetLearner: e.target.value })} /></label>
                <label className="studio-field"><span>Duration</span><select value={brief.durationMinutes} onChange={(e) => setBrief({ ...brief, durationMinutes: Number(e.target.value) })}><option value={5}>5 minutes</option><option value={8}>8 minutes</option><option value={12}>12 minutes</option></select></label>
                <label className="studio-field studio-field-wide"><span>Ordinary task</span><textarea value={brief.ordinaryTask} onChange={(e) => setBrief({ ...brief, ordinaryTask: e.target.value })} /></label>
                <label className="studio-field"><span>Environment</span><textarea value={brief.environment} onChange={(e) => setBrief({ ...brief, environment: e.target.value })} /></label>
                <label className="studio-field"><span>Pressure</span><textarea value={brief.pressure} onChange={(e) => setBrief({ ...brief, pressure: e.target.value })} /></label>
                <label className="studio-field studio-field-wide"><span>Learning objective</span><textarea value={brief.learningObjective} onChange={(e) => setBrief({ ...brief, learningObjective: e.target.value })} /></label>
              </div>
              <div className="studio-actions"><button className="studio-button studio-button-primary" disabled={busy} onClick={() => generateScenario(false)}>{busy ? <LoaderCircle className="is-spinning" size={16} /> : <Sparkles size={16} />}Create rehearsal</button><button className="studio-button" disabled={busy} onClick={() => generateScenario(true)}><BookOpenCheck size={16} />Use example rehearsal</button></div>
            </div>
          )}

          {stage === "preview" && scenario && (
            <div className="studio-section" data-testid="studio-preview">
              <header className="studio-section-heading studio-heading-row"><div><span>04 / SCENARIO PREVIEW</span><h1>{scenario.title}</h1><p>{scenario.tagline} · {scenario.durationMinutes} minutes · {profile?.displayName} · {scenario.publicationMode === "brand-safe-fictionalized" ? "fictionalized names" : "exact institution names"}</p></div><div className={`validation-passed ${scenarioCoverage?.allOutcomesReachable ? "" : "is-blocked"}`}><ShieldCheck size={18} /><span><strong>{scenarioCoverage?.allOutcomesReachable ? "READY" : "BLOCKED"}</strong><small>{scenarioCoverage?.allOutcomesReachable ? "Scenario checks passed" : "Outcome coverage incomplete"}</small></span></div></header>
              <div className="scenario-summary-band"><div><span>Ordinary task</span><p>{scenario.intro.ordinaryTask}</p></div><div><span>Pressure</span><p>{scenario.intro.pressure}</p></div></div>
              <div className="scenario-columns">
                <section><header><Users size={15} /><strong>Scenario roles</strong><ProvenanceBadge value={scenarioProvenance} /></header>{scenario.roleCards.map((role) => <div className="role-line" key={role.id}><span className={`role-dot is-${role.identityStatus}`} /><div><strong>{role.displayName}</strong><small>{role.identityStatus} · {role.allowedChannels[0]}</small></div></div>)}</section>
                <section><header><Flag size={15} /><strong>Learner actions</strong><span>{scenario.criticalActions.length}</span></header>{scenario.criticalActions.map((action) => <div className="action-line" key={action.id}><span>{action.phase === "recovery" ? "response" : "during task"}</span><strong>{action.label}</strong></div>)}</section>
              </div>
              {scenarioCoverage && (
                <section className="scenario-coverage" aria-label="Outcome coverage">
                  <header><GitBranch size={16} /><div><strong>Outcome coverage</strong><small>{scenarioCoverage.reachableStateCount} legal action states checked</small></div><span>{scenarioCoverage.endingCoverage.filter((result) => result.reachable).length} / 4 reachable</span></header>
                  <div>
                    {scenarioCoverage.endingCoverage.map((result) => {
                      const ending = scenario.endings.find((item) => item.id === result.endingId);
                      return (
                        <article className={result.reachable ? "is-reachable" : "is-blocked"} key={result.endingId}>
                          <div><span>{result.endingId}</span><strong>{ending?.title}</strong><small>{result.reachable ? `${result.actionIds.length} actions · ${result.evidenceIds.length} evidence items` : "No legal action path"}</small></div>
                          <p>{result.reachable ? result.actionLabels.join(" → ") : "Revise the ending rules or action prerequisites."}</p>
                        </article>
                      );
                    })}
                  </div>
                  <footer>Each route uses the same prerequisites, recovery rules, and ending selection used during the rehearsal.</footer>
                </section>
              )}
              <div className="package-ledger"><span>{scenario.worldBible.immutableFacts.length} ground rules</span><span>{scenario.allowedEvents.length} conversation moments</span><span>{scenario.recoveryActionIds.length} response steps</span><span>4 possible outcomes</span></div>
              <div className="studio-actions"><button className="studio-button studio-button-primary" disabled={!scenarioCoverage?.allOutcomesReachable} onClick={launchScenario}><Play size={16} />Start rehearsal</button><button className="studio-button" onClick={() => setStage("brief")}><ArrowLeft size={16} />Edit brief</button></div>
            </div>
          )}

          {stage === "live" && scenario && simulation && (
            <div className="studio-section studio-live" data-testid="studio-live">
              <header className="studio-section-heading studio-heading-row"><div><span>05 / REHEARSAL</span><h1>{scenario.title}</h1><p>{scenario.intro.ordinaryTask}</p></div><div className="rehearsal-clock"><span>EVENT STARTS</span><strong>00:20:00</strong></div></header>
              <div className="rehearsal-grid">
                <section className="dialogue-workspace">
                  <header><MessageSquareText size={16} /><strong>Conversation</strong></header>
                  <div className="dialogue-log" aria-live="polite">{messages.map((line) => { const role = scenario.roleCards.find((candidate) => candidate.id === line.roleId); return <article className={line.roleId === "learner" ? "is-learner" : ""} key={line.id}><div><strong>{line.roleName}</strong><small>{line.roleId === "learner" ? "learner" : role?.allowedChannels[0]}</small></div><p>{line.content}</p></article>; })}</div>
                  <div className="role-picker">{scenario.roleCards.map((role) => <button className={selectedRoleId === role.id ? "is-active" : ""} key={role.id} onClick={() => setSelectedRoleId(role.id)} title={role.allowedChannels[0]}><span className="role-dot" />{role.displayName}</button>)}</div>
                  <form className="dialogue-compose" onSubmit={sendMessage}><textarea aria-label="Message a role" maxLength={500} placeholder="Ask a natural question…" value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} /><button aria-label="Send message" disabled={busy || !messageDraft.trim()}>{busy ? <LoaderCircle className="is-spinning" size={17} /> : <Send size={17} />}</button></form>
                </section>
                <aside className="action-console">
                  <header><ShieldCheck size={16} /><div><strong>Actions</strong><small>{simulation.actionIds.length} completed</small></div></header>
                  <div className="canonical-state"><span>PAYMENT <strong>{stateLabels.payment[simulation.canonical.payment]}</strong></span><span>IDENTITY <strong>{stateLabels.identity[simulation.canonical.identity]}</strong></span><span>ACCESS <strong>{stateLabels.access[simulation.canonical.access]}</strong></span></div>
                  <section className="evidence-board" aria-label="Evidence board">
                    <header><FileSearch size={14} /><strong>Evidence</strong><span>{simulation.evidenceIds.length}</span></header>
                    {simulation.evidenceIds.length === 0
                      ? <p>No evidence collected yet.</p>
                      : <div>{simulation.evidenceIds.map((evidenceId) => { const evidence = scenario.evidence.find((item) => item.id === evidenceId); return evidence ? <article key={evidence.id}><strong>{evidence.label}</strong><p>{evidence.description}</p></article> : null; })}</div>}
                  </section>
                  <div className="action-groups">
                    {visibleVerificationActions.length > 0 && <ActionGroup title="Choose a verification channel" actions={visibleVerificationActions} performed={simulation.actionIds} onAction={performAction} />}
                    {visibleTaskActions.length > 0 && <ActionGroup title="Other actions" actions={visibleTaskActions} performed={simulation.actionIds} onAction={performAction} />}
                    {visibleResponseActions.length > 0 && <ActionGroup title="Response actions" actions={visibleResponseActions} performed={simulation.actionIds} onAction={performAction} />}
                  </div>
                  <button className="studio-button studio-button-primary finish-button" disabled={simulation.actionIds.length === 0 || busy} onClick={finishScenario}><Flag size={16} />Finish and review</button>
                </aside>
              </div>
            </div>
          )}

          {stage === "debrief" && scenario && simulation && debrief && (
            <div className="studio-section studio-debrief" data-testid="studio-debrief">
              <header className="studio-section-heading"><span>06 / WHAT HAPPENED</span><h1>{debrief.coaching.headline}</h1><p>{debrief.coaching.summary}</p></header>
              <div className={`ending-banner is-${debrief.trace.endingId}`}><span>OUTCOME</span><strong>{debrief.trace.endingId.toUpperCase()}</strong><p>{scenario.endings.find((ending) => ending.id === debrief.trace.endingId)?.summary}</p></div>
              <div className="trace-grid">
                <section><header><CheckCircle2 size={16} /><strong>Recorded actions</strong></header>{debrief.trace.actionLabels.length ? <ol>{debrief.trace.actionLabels.map((label, index) => <li key={`${label}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span>{label}</li>)}</ol> : <p>No critical actions were recorded.</p>}</section>
                <section><header><CircleAlert size={16} /><strong>Recovery status</strong></header>{!debrief.trace.recoveryRequired ? <p>No recovery was required.</p> : debrief.trace.missedRecoveryActionIds.length ? <ul>{debrief.trace.missedRecoveryActionIds.map((id) => <li key={id}>{scenario.criticalActions.find((action) => action.id === id)?.label}</li>)}</ul> : <p>All required recovery actions were completed.</p>}</section>
              </div>
              <section className="trust-ledger" aria-label="How the result was determined">
                <header><LockKeyhole size={16} /><div><strong>How the result was determined</strong><small>The conversation could change. The recorded actions could not.</small></div></header>
                <div>
                  <article><span>CONVERSATION</span><strong>People and pressure</strong><p>Replies could respond to what you asked, challenged, or delayed.</p></article>
                  <article><span>CONSEQUENCES</span><strong>Your completed actions</strong><p>{debrief.trace.actionIds.length} actions and {debrief.trace.evidenceIds.length} evidence items led to this outcome.</p></article>
                </div>
              </section>
              <section className="evidence-coach" aria-label="Ask about the evidence">
                <header><FileQuestion size={17} /><div><strong>Ask about the evidence</strong><small>Explore what each verification channel did and did not establish.</small></div></header>
                <div className="coach-prompts">
                  {[
                    "Why did the callback not prove who sent the request?",
                    "What did the organization group chat actually confirm?",
                    "Why was the saved directory number stronger evidence?",
                  ].map((question) => (
                    <button disabled={coachBusy} key={question} onClick={() => askEvidenceCoach(question)} type="button">{question}</button>
                  ))}
                </div>
                {coachAnswers.length > 0 && (
                  <div className="coach-answers" aria-live="polite">
                    {coachAnswers.map((answer, index) => (
                      <article key={`${answer.question}-${index}`}>
                        <strong>{answer.question}</strong>
                        <p>{answer.answer}</p>
                        <footer>
                          {answer.evidenceIds.map((id) => <span key={id}>{scenario.evidence.find((item) => item.id === id)?.label ?? id}</span>)}
                          {answer.sourceFactIds.map((id) => <span key={id}>{profile?.facts.find((fact) => fact.id === id)?.label ?? id}</span>)}
                        </footer>
                      </article>
                    ))}
                  </div>
                )}
                <form className="coach-compose" onSubmit={(event) => { event.preventDefault(); askEvidenceCoach(coachQuestion); }}>
                  <input aria-label="Question about the evidence" maxLength={500} placeholder="Ask why a check was or was not enough…" value={coachQuestion} onChange={(event) => setCoachQuestion(event.target.value)} />
                  <button disabled={coachBusy || coachQuestion.trim().length < 3} type="submit">{coachBusy ? <LoaderCircle className="is-spinning" size={16} /> : <ArrowRight size={16} />}Ask</button>
                </form>
              </section>
              <blockquote><span>TRANSFER RULE</span><p>{debrief.coaching.nextTime}</p></blockquote>
              <div className="studio-actions"><button className="studio-button studio-button-primary" onClick={() => { setTransferResult(null); setStage("transfer"); }}><GitCompareArrows size={16} />Try a new situation</button><button className="studio-button" onClick={launchScenario}><RotateCcw size={16} />Replay scenario</button>{!featured && <button className="studio-button" onClick={restart}><RefreshCw size={16} />New institution</button>}<Link className="studio-button" href="/"><ArrowLeft size={16} />Case library</Link></div>
            </div>
          )}

          {stage === "transfer" && scenario && debrief && (
            <div className="studio-section studio-transfer" data-testid="studio-transfer">
              <header className="studio-section-heading"><span>07 / NEW SITUATION</span><h1>{scenario.transferProbe.title}</h1><p>A different task puts the same judgment under pressure.</p></header>
              <div className="scenario-summary-band transfer-summary-band"><div><span>Ordinary task</span><p>{scenario.transferProbe.ordinaryTask}</p></div><div><span>Pressure</span><p>{scenario.transferProbe.pressure}</p></div></div>
              <section className="transfer-situation"><BrainCircuit size={20} /><div><span>WHAT CHANGED</span><h2>Another request arrives</h2><p>{scenario.transferProbe.situation}</p></div></section>
              <div className="transfer-actions" aria-label="Transfer actions">
                {scenario.transferProbe.actions.map((action, index) => {
                  const selected = transferResult?.actionId === action.id;
                  return (
                    <button className={selected ? "is-selected" : transferResult ? "is-muted" : ""} disabled={Boolean(transferResult)} key={action.id} onClick={() => selectTransferAction(action.id)}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div><strong>{action.label}</strong><small>{action.description}</small></div>
                      <ArrowRight size={16} />
                    </button>
                  );
                })}
              </div>
              {transferResult && (
                <>
                  <section className={`transfer-result is-${transferResult.outcome}`} aria-live="polite">
                    <span>{transferOutcomeLabels[transferResult.outcome]}</span>
                    <h2>{transferResult.headline}</h2>
                    <p>{transferResult.summary}</p>
                  </section>
                  <section className="learning-evidence" aria-label="Learning evidence">
                    <header><GitCompareArrows size={16} /><div><strong>Learning evidence</strong><small>One rehearsal result and one new-context decision.</small></div></header>
                    <div>
                      <article><span>REHEARSAL</span><strong>{debrief.trace.endingId}</strong><p>{scenario.endings.find((ending) => ending.id === debrief.trace.endingId)?.title}</p></article>
                      <article><span>NEW SITUATION</span><strong>{transferOutcomeLabels[transferResult.outcome]}</strong><p>{transferResult.actionLabel}</p></article>
                      <article><span>PATTERN</span><strong>Rule carried forward</strong><p>{debrief.coaching.nextTime}</p></article>
                    </div>
                    <footer>This result follows the action selected in the new situation.</footer>
                  </section>
                </>
              )}
              <div className="studio-actions">{transferResult && <button className="studio-button studio-button-primary" onClick={() => setStage("report")}><ClipboardList size={16} />Open facilitator report</button>}<button className="studio-button" onClick={launchScenario}><RotateCcw size={16} />Replay rehearsal</button>{!featured && <button className="studio-button" onClick={restart}><RefreshCw size={16} />New institution</button>}<Link className="studio-button" href="/"><ArrowLeft size={16} />Case library</Link></div>
            </div>
          )}

          {stage === "report" && scenario && profile && simulation && debrief && transferResult && (
            <div className="studio-section facilitator-report" data-testid="studio-report">
              <header className="studio-section-heading studio-heading-row">
                <div><span>FACILITATOR REPORT</span><h1>{scenario.title}</h1><p>A discussion-ready summary of one rehearsal and one new-context decision.</p></div>
                <div className="report-privacy"><LockKeyhole size={16} /><span><strong>No learner identity stored</strong><small>This report exists only in the current browser session.</small></span></div>
              </header>
              <section className="report-outcomes">
                <article><span>REHEARSAL</span><strong>{debrief.trace.endingId}</strong><p>{scenario.endings.find((ending) => ending.id === debrief.trace.endingId)?.title}</p></article>
                <article><span>NEW SITUATION</span><strong>{transferOutcomeLabels[transferResult.outcome]}</strong><p>{transferResult.actionLabel}</p></article>
                <article><span>RECOVERY</span><strong>{!debrief.trace.recoveryRequired ? "not required" : debrief.trace.missedRecoveryActionIds.length ? "incomplete" : "complete"}</strong><p>{debrief.trace.missedRecoveryActionIds.length ? `${debrief.trace.missedRecoveryActionIds.length} response steps remained.` : "No required response step was left open."}</p></article>
              </section>
              <div className="report-grid">
                <section>
                  <header><strong>Learning objective</strong></header>
                  <p>{scenario.intro.learningObjective}</p>
                  <blockquote>{debrief.coaching.nextTime}</blockquote>
                </section>
                <section>
                  <header><strong>Recorded action sequence</strong><span>{debrief.trace.actionLabels.length}</span></header>
                  <ol>{debrief.trace.actionLabels.map((label, index) => <li key={`${label}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span>{label}</li>)}</ol>
                </section>
                <section>
                  <header><strong>Evidence considered</strong><span>{debrief.trace.evidenceIds.length}</span></header>
                  {debrief.trace.evidenceIds.length
                    ? <ul>{debrief.trace.evidenceIds.map((id) => { const item = scenario.evidence.find((evidence) => evidence.id === id); return item ? <li key={id}><strong>{item.label}</strong><p>{item.description}</p></li> : null; })}</ul>
                    : <p>No evidence was collected before the rehearsal ended.</p>}
                </section>
                <section>
                  <header><strong>Discussion prompts</strong></header>
                  <ol className="discussion-prompts">
                    <li>Which verification channel moved the check outside the original request?</li>
                    <li>What did the group recognize, and what could it not independently confirm?</li>
                    <li>Which response step would matter first if payment or access had already changed?</li>
                  </ol>
                </section>
              </div>
              <section className="report-guidance">
                <header><BookOpenCheck size={16} /><div><strong>Approved institution guidance</strong><small>Source-supported context used by this rehearsal.</small></div></header>
                {reportFacts.map((fact) => (
                  <article key={fact.id}>
                    <div><span>{fact.category.replaceAll("-", " ")}</span><strong>{fact.label}</strong><p>{fact.value}</p></div>
                    <div>{fact.sourceIds.map((sourceId) => { const source = profile.sources.find((item) => item.id === sourceId); return source ? <a href={source.url} key={sourceId} rel="noreferrer" target="_blank"><ExternalLink size={12} />{source.title}</a> : null; })}</div>
                  </article>
                ))}
              </section>
              <div className="studio-actions report-actions"><button className="studio-button studio-button-primary" onClick={() => window.print()}><Printer size={16} />Print report</button><button className="studio-button" onClick={() => setStage("transfer")}><ArrowLeft size={16} />Back to new situation</button><button className="studio-button" onClick={launchScenario}><RotateCcw size={16} />Replay rehearsal</button><Link className="studio-button" href="/"><ArrowLeft size={16} />Case library</Link></div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ActionGroup({ title, actions, performed, onAction }: { title: string; actions: ScenarioPackage["criticalActions"]; performed: string[]; onAction: (id: string) => void }) {
  return <section><h2>{title}</h2>{actions.map((action) => { const done = performed.includes(action.id); return <button className={done ? "is-done" : ""} disabled={done} key={action.id} onClick={() => onAction(action.id)}><span>{done ? <Check size={14} /> : action.kind === "pause" ? <Pause size={14} /> : <ArrowRight size={14} />}</span><div><strong>{action.label}</strong><small>{action.description}</small></div></button>; })}</section>;
}
