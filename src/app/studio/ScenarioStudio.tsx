"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
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
  FilePenLine,
  FileSearch,
  Flag,
  GitBranch,
  GitCompareArrows,
  LoaderCircle,
  LockKeyhole,
  MessageSquareText,
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
import { validateScenarioPackage } from "@/ai/schemas/scenario";
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
import { getReviewedOpeningAudio } from "@/fixtures/reviewedScenarioMedia";
import { voiceYouKnowScenario } from "@/fixtures/voiceYouKnow";
import { TaskWorkspace } from "@/app/studio/rehearsal/TaskWorkspace";
import { formatCanonicalValue } from "@/app/studio/rehearsal/presentation";
import { ReviewedAudioPlayer } from "@/app/studio/rehearsal/ReviewedAudioPlayer";
import { ScenarioCopyEditor } from "@/app/studio/preview/ScenarioCopyEditor";

type StudioStage = "research" | "profile" | "brief" | "preview" | "live" | "debrief" | "transfer" | "report";
type PendingOperation = "research" | "generate" | "role" | "debrief" | "coach";
type Provenance = "live-research" | "live-generation" | "local-adaptation" | "reviewed-fixture" | "live-role" | "reviewed-fallback" | "live-debrief" | "deterministic-fallback";
type DialogueLine = {
  id: string;
  eventId: string | null;
  roleId: string;
  roleName: string;
  content: string;
  provenance: Provenance | null;
};
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

const subscribeToHydration = () => () => {};

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
    "local-adaptation": "Matched scenario",
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

const transferOutcomeLabels = {
  demonstrated: "applied independently",
  developing: "partly applied",
  "not-yet": "not applied yet",
} as const;

const operationCopy: Record<PendingOperation, {
  eyebrow: string;
  title: string;
  detail: string;
  steps: [string, string, string];
}> = {
  research: {
    eyebrow: "Source review in progress",
    title: "Preparing context for review",
    detail: "This can take a few seconds. No fact is approved automatically.",
    steps: [
      "Checking the official source boundary",
      "Comparing supported terminology",
      "Preparing facts and open questions",
    ],
  },
  generate: {
    eyebrow: "Scenario preparation",
    title: "Building a rehearsal from the brief",
    detail: "This can take a few seconds. The result must pass every outcome check.",
    steps: [
      "Matching the objective to a reviewed structure",
      "Checking actions, evidence, and recovery",
      "Verifying all 4 outcome paths",
    ],
  },
  role: {
    eyebrow: "Conversation",
    title: "Waiting for a reply in this channel",
    detail: "The task stays paused until the reply arrives.",
    steps: [
      "Reading your question in context",
      "Checking what has already happened",
      "Preparing the reply",
    ],
  },
  debrief: {
    eyebrow: "Run review",
    title: "Reconstructing what led to this outcome",
    detail: "The recorded actions stay fixed while the review is prepared.",
    steps: [
      "Reading the recorded actions",
      "Connecting evidence to consequences",
      "Preparing the next situation",
    ],
  },
  coach: {
    eyebrow: "Evidence review",
    title: "Checking this run before answering",
    detail: "The answer will use only evidence discovered in this run.",
    steps: [
      "Finding the evidence you uncovered",
      "Checking approved guidance",
      "Preparing a traceable answer",
    ],
  },
};

function OperationProgress({
  operation,
  compact = false,
}: {
  operation: PendingOperation;
  compact?: boolean;
}) {
  const copy = operationCopy[operation];

  return (
    <section
      aria-atomic="true"
      aria-label={copy.title}
      aria-live="polite"
      className={`studio-operation ${compact ? "is-compact" : ""}`}
      role="status"
    >
      <header>
        <LoaderCircle aria-hidden="true" className="is-spinning" size={18} />
        <div>
          <span>{copy.eyebrow}</span>
          <strong>{copy.title}</strong>
          <small>{copy.detail}</small>
        </div>
      </header>
      <ol>
        {copy.steps.map((step, index) => (
          <li key={step}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <small>{step}</small>
          </li>
        ))}
      </ol>
    </section>
  );
}

function StageRail({ stage }: { stage: StudioStage }) {
  const workflow = stage === "report" ? facilitatorWorkflow : isLearnerStage(stage) ? learnerWorkflow : authoringWorkflow;
  const current = workflow.findIndex((item) => item.id === stage);
  const title = stage === "report" ? "Facilitator" : isLearnerStage(stage) ? "Rehearsal" : "Scenario Studio";
  return (
    <aside className="studio-rail" aria-label="Scenario workflow">
      <div className="studio-rail-title"><Sparkles size={15} /><span>{title}</span></div>
      <ol aria-label={`${title} stages`} tabIndex={0}>
        {workflow.map((item, index) => (
          <li
            aria-current={index === current ? "step" : undefined}
            className={index === current ? "is-current" : index < current ? "is-complete" : ""}
            key={item.id}
          >
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
  const opening = scenario.fallbackDialogue.find(
    (line) => line.eventId === scenario.learnerPresentation.openingEventId,
  ) ?? scenario.fallbackDialogue[0];
  const role = scenario.roleCards.find((item) => item.id === opening.roleId)!;
  return {
    opening,
    role,
    message: {
      id: opening.id,
      eventId: opening.eventId,
      roleId: opening.roleId,
      roleName: role.displayName,
      content: opening.content,
      provenance: "reviewed-fallback" as const,
    },
  };
}

function actionDialogue(
  scenario: ScenarioPackage,
  beforeActionIds: string[],
  afterActionIds: string[],
) {
  const lines: DialogueLine[] = [];
  for (const event of scenario.allowedEvents) {
    if (
      event.delivery !== "on-action"
      || event.allowedAfterActionIds.length === 0
      || !event.allowedAfterActionIds.every((id) => afterActionIds.includes(id))
      || event.allowedAfterActionIds.every((id) => beforeActionIds.includes(id))
    ) {
      continue;
    }
    const line = scenario.fallbackDialogue.find(
      (candidate) => candidate.eventId === event.id && candidate.roleId === event.roleId,
    );
    const role = scenario.roleCards.find((candidate) => candidate.id === event.roleId);
    if (line && role) {
      lines.push({
        id: line.id,
        eventId: event.id,
        roleId: role.id,
        roleName: role.displayName,
        content: line.content,
        provenance: "reviewed-fallback" as const,
      });
    }
  }
  return lines;
}

function presentedStateSummary(
  scenario: ScenarioPackage,
  state: CanonicalTrace["finalState"],
) {
  return scenario.learnerPresentation.statusFields
    .map((item) => `${item.label.toLowerCase()} ${formatCanonicalValue(item.field, state[item.field])}`)
    .join("; ");
}

export function ScenarioStudio({
  mode = "studio",
  adaptiveResearchAvailable = true,
  adaptiveGenerationAvailable = true,
  initialScenario = voiceYouKnowScenario,
  initialProfile = reviewedNyuInstitutionProfile,
}: {
  mode?: "studio" | "featured";
  adaptiveResearchAvailable?: boolean;
  adaptiveGenerationAvailable?: boolean;
  initialScenario?: ScenarioPackage;
  initialProfile?: InstitutionProfile;
}) {
  const featured = mode === "featured";
  const featuredDialogue = openingDialogue(initialScenario);
  const [stage, setStage] = useState<StudioStage>(featured ? "live" : "research");
  const [institutionName, setInstitutionName] = useState("New York University");
  const [officialDomain, setOfficialDomain] = useState("nyu.edu");
  const [publicationMode, setPublicationMode] = useState<InstitutionProfile["publicationMode"]>("brand-safe-fictionalized");
  const [exactAuthorizationConfirmed, setExactAuthorizationConfirmed] = useState(false);
  const [profile, setProfile] = useState<InstitutionProfile | null>(featured ? initialProfile : null);
  const [profileProvenance, setProfileProvenance] = useState<Provenance | null>(featured ? "reviewed-fixture" : null);
  const [brief, setBrief] = useState(initialBrief);
  const [scenario, setScenario] = useState<ScenarioPackage | null>(featured ? initialScenario : null);
  const [draftScenario, setDraftScenario] = useState<ScenarioPackage | null>(null);
  const [editingScenario, setEditingScenario] = useState(false);
  const [scenarioProvenance, setScenarioProvenance] = useState<Provenance | null>(featured ? "reviewed-fixture" : null);
  const [simulation, setSimulation] = useState<SimulationState | null>(featured ? createSimulationState(initialScenario) : null);
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
  const [pendingOperation, setPendingOperation] = useState<PendingOperation | null>(null);
  const clientReady = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const [mobilePanel, setMobilePanel] = useState<"task" | "conversation">("task");
  const [lastSeenMessageCount, setLastSeenMessageCount] = useState(0);
  const dialogueLogRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLElement>(null);
  const previousStageRef = useRef<StudioStage>(stage);

  const sourceById = useMemo(() => new Map(profile?.sources.map((source) => [source.id, source]) ?? []), [profile]);
  const visibleVerificationActions = useMemo(() => scenario && simulation
    ? scenario.criticalActions.filter((action) => action.kind === "verify" && (simulation.actionIds.includes(action.id) || actionIsAvailable(scenario, action.id, simulation.actionIds)))
    : [], [scenario, simulation]);
  const visibleTaskActions = useMemo(() => scenario && simulation
    ? scenario.criticalActions.filter((action) => action.phase !== "recovery" && action.kind !== "verify" && action.kind !== "inspect" && (simulation.actionIds.includes(action.id) || actionIsAvailable(scenario, action.id, simulation.actionIds)))
    : [], [scenario, simulation]);
  const visibleInspectActions = useMemo(() => scenario && simulation
    ? scenario.criticalActions.filter((action) => action.kind === "inspect" && (simulation.actionIds.includes(action.id) || actionIsAvailable(scenario, action.id, simulation.actionIds)))
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
  const scenarioValidation = useMemo(
    () => scenario ? validateScenarioPackage(scenario) : null,
    [scenario],
  );
  const scenarioReady = Boolean(scenarioValidation?.success && scenarioCoverage?.allOutcomesReachable);
  const profileApprovalValidation = useMemo(
    () => profile ? validateProfileForApproval(profile) : null,
    [profile],
  );
  const profileReadyForApproval = Boolean(profileApprovalValidation?.success);
  const profileReviewIssues = profileApprovalValidation?.success
    ? []
    : profileApprovalValidation?.issues ?? [];
  const briefReady = brief.threatTopic.trim().length >= 3
    && brief.targetLearner.trim().length >= 3
    && brief.ordinaryTask.trim().length >= 8
    && brief.environment.trim().length >= 3
    && brief.pressure.trim().length >= 3
    && brief.learningObjective.trim().length >= 8;
  const draftValidation = useMemo(
    () => draftScenario ? validateScenarioPackage(draftScenario) : null,
    [draftScenario],
  );
  const draftCoverage = useMemo(
    () => draftScenario ? evaluateScenarioCoverage(draftScenario) : null,
    [draftScenario],
  );
  const visibleRoles = useMemo(() => {
    if (!scenario) return [];
    const visibleRoleIds = new Set(messages.map((message) => message.roleId));
    return scenario.roleCards.filter((role) => visibleRoleIds.has(role.id));
  }, [messages, scenario]);
  const currentEnding = useMemo(
    () => scenario && debrief
      ? scenario.endings.find((ending) => ending.id === debrief.trace.endingId) ?? null
      : null,
    [debrief, scenario],
  );
  const discoveredEvidence = useMemo(
    () => scenario && debrief
      ? debrief.trace.evidenceIds
        .map((id) => scenario.evidence.find((evidence) => evidence.id === id))
        .filter((evidence): evidence is ScenarioPackage["evidence"][number] => Boolean(evidence))
      : [],
    [debrief, scenario],
  );
  const availableCoachPrompts = useMemo(
    () => scenario
      ? scenario.learnerPresentation.coachPrompts.filter(
        (prompt) => discoveredEvidence.some((evidence) => evidence.id === prompt.evidenceId),
      )
      : [],
    [discoveredEvidence, scenario],
  );
  const pendingInspection = useMemo(
    () => scenario && simulation
      ? scenario.criticalActions.some(
        (action) => action.kind === "inspect" && actionIsAvailable(scenario, action.id, simulation.actionIds),
      )
      : false,
    [scenario, simulation],
  );
  const openingRequest = useMemo(() => scenario ? openingDialogue(scenario) : null, [scenario]);
  const openingAudio = useMemo(
    () => scenario
      ? getReviewedOpeningAudio(scenario.id, scenario.learnerPresentation.openingEventId)
      : null,
    [scenario],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
    if (previousStageRef.current === stage) return;
    previousStageRef.current = stage;
    const frame = window.requestAnimationFrame(() => {
      const heading = workspaceRef.current?.querySelector("h1");
      if (heading instanceof HTMLElement) {
        heading.tabIndex = -1;
        heading.focus();
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [stage]);

  useEffect(() => {
    if (!dialogueLogRef.current) return;
    dialogueLogRef.current.scrollTop = dialogueLogRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!error || !errorRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      errorRef.current?.scrollIntoView?.({ block: "center" });
      errorRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [error]);

  async function research(useFixture: boolean) {
    setBusy(true); setPendingOperation("research"); setError(""); setNotice("");
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
    } finally { setBusy(false); setPendingOperation(null); }
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
    setBusy(true); setPendingOperation("generate"); setError(""); setNotice("");
    try {
      const response = await fetch("/api/scenarios/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          brief,
          useFixture,
          reviewedScenarioId: "the-voice-you-know",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(formatApiError(result, "Scenario generation failed."));
      if (result.profile) {
        setProfile(result.profile);
        setProfileProvenance("reviewed-fixture");
      }
      setScenario(result.scenario); setDraftScenario(null); setEditingScenario(false); setScenarioProvenance(result.provenance); setNotice(result.notice); setStage("preview");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Scenario generation failed.");
    } finally { setBusy(false); setPendingOperation(null); }
  }

  function launchScenario() {
    if (!scenario) return;
    if (!scenarioValidation?.success || !scenarioCoverage?.allOutcomesReachable) {
      setError("Resolve scenario validation and outcome coverage before rehearsal.");
      return;
    }
    const dialogue = openingDialogue(scenario);
    setSimulation(createSimulationState(scenario));
    setMessages([dialogue.message]);
    setMobilePanel("task"); setLastSeenMessageCount(0);
    setSelectedRoleId(dialogue.role.id); setDebrief(null); setTransferResult(null); setCoachAnswers([]); setCoachQuestion(""); setNotice(""); setStage("live");
  }

  function beginCopyEdit() {
    if (!scenario) return;
    setDraftScenario(structuredClone(scenario));
    setEditingScenario(true);
    setNotice("");
    setError("");
  }

  function applyCopyEdit() {
    if (!draftScenario || !draftValidation?.success || !draftCoverage?.allOutcomesReachable) return;
    setScenario(structuredClone(draftScenario));
    setSimulation(null);
    setMessages([]);
    setSelectedRoleId(null);
    setDebrief(null);
    setTransferResult(null);
    setCoachAnswers([]);
    setCoachQuestion("");
    setEditingScenario(false);
    setDraftScenario(null);
    setNotice("Visible labels updated and all checks passed.");
    setError("");
  }

  function performAction(actionId: string) {
    if (!scenario || !simulation || busy) return;
    try {
      const next = applyCriticalAction(scenario, simulation, actionId);
      const unlockedDialogue = actionDialogue(scenario, simulation.actionIds, next.actionIds);
      setSimulation(next);
      if (unlockedDialogue.length > 0) {
        setMessages((current) => {
          const existingIds = new Set(current.map((message) => message.id));
          return [...current, ...unlockedDialogue.filter((message) => !existingIds.has(message.id))];
        });
        setSelectedRoleId(unlockedDialogue.at(-1)?.roleId ?? selectedRoleId);
      }
      setError("");
    } catch {
      setError("That action is not available yet.");
    }
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!scenario || !simulation || !messageDraft.trim()) return;
    const learnerContent = messageDraft.trim();
    setMessages((current) => [...current, {
      id: `learner-${Date.now()}`,
      eventId: null,
      roleId: "learner",
      roleName: "You",
      content: learnerContent,
      provenance: null,
    }]);
    setMessageDraft(""); setBusy(true); setPendingOperation("role"); setError("");
    try {
      const response = await fetch("/api/simulation/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          learnerMessage: learnerContent,
          completedActionIds: simulation.actionIds,
          preferredRoleId: selectedRoleId,
          deliveredEventIds: messages
            .map((line) => line.eventId)
            .filter((eventId): eventId is string => Boolean(eventId)),
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
      setMessages((current) => [...current, {
        id: `role-${Date.now()}`,
        eventId: turn.eventId,
        roleId: turn.roleId,
        roleName: role.displayName,
        content: turn.content,
        provenance: turn.provenance,
      }]);
      setSelectedRoleId(turn.roleId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Role response failed.");
    } finally { setBusy(false); setPendingOperation(null); }
  }

  async function finishScenario() {
    if (!scenario || !simulation) return;
    setBusy(true); setPendingOperation("debrief"); setError("");
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
    } finally { setBusy(false); setPendingOperation(null); }
  }

  async function askEvidenceCoach(question: string) {
    const trimmed = question.trim();
    if (!scenario || !profile || !simulation || !debrief || trimmed.length < 3) return;
    setCoachBusy(true); setPendingOperation("coach"); setError("");
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
      setPendingOperation(null);
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
    setStage("research"); setProfile(null); setScenario(null); setDraftScenario(null); setEditingScenario(false); setSimulation(null); setMessages([]); setDebrief(null); setTransferResult(null); setCoachAnswers([]); setCoachQuestion(""); setNotice(""); setError(""); setPendingOperation(null); setExactAuthorizationConfirmed(false); setMobilePanel("task"); setLastSeenMessageCount(0);
  }

  return (
    <main className="studio-shell">
      <header className="studio-topbar">
        <Link aria-label="Case Library" href="/" className="studio-home-link"><ArrowLeft size={15} /><span>Case Library</span></Link>
        <div className="studio-brand"><span className="studio-brand-mark">1</span><strong>One Step Wrong</strong><span>/ {stage === "report" ? "Facilitator Report" : isLearnerStage(stage) ? "Rehearsal" : "Scenario Studio"}</span></div>
      </header>

      <div className="studio-layout">
        <StageRail stage={stage} />
        <section aria-busy={busy || coachBusy} className="studio-workspace" ref={workspaceRef}>
          {notice && <div className="studio-notice" role="status"><CheckCircle2 size={16} /><span>{notice}</span></div>}
          {error && <div className="studio-notice is-error" ref={errorRef} role="alert" tabIndex={-1}><CircleAlert size={16} /><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError("")}><X size={15} /></button></div>}
          {pendingOperation && pendingOperation !== "role" && pendingOperation !== "coach" && (
            <OperationProgress operation={pendingOperation} />
          )}

          {stage === "research" && (
            <div className="studio-section" data-testid="studio-research">
              <header className="studio-section-heading"><span>01 / INSTITUTION CONTEXT</span><h1>Start with the environment students already know.</h1><p>Use public guidance to match the school&apos;s terminology, tools, and reporting routes.</p></header>
              <div className="studio-form-grid">
                <label className="studio-field studio-field-wide"><span>Institution</span><input autoComplete="organization" maxLength={120} name="institution" value={institutionName} onChange={(event) => { setInstitutionName(event.target.value); setExactAuthorizationConfirmed(false); }} /></label>
                <label className="studio-field"><span>Official domain</span><input autoCapitalize="none" autoComplete="off" inputMode="url" maxLength={253} name="official-domain" spellCheck={false} value={officialDomain} onChange={(event) => { setOfficialDomain(event.target.value); setExactAuthorizationConfirmed(false); }} /></label>
                <fieldset className="studio-field studio-mode"><legend>Institution naming</legend><div><button aria-pressed={publicationMode === "brand-safe-fictionalized"} className={publicationMode === "brand-safe-fictionalized" ? "is-active" : ""} onClick={() => { setPublicationMode("brand-safe-fictionalized"); setExactAuthorizationConfirmed(false); }} type="button">Fictionalized</button><button aria-pressed={publicationMode === "authorized-exact"} className={publicationMode === "authorized-exact" ? "is-active" : ""} onClick={() => { setPublicationMode("authorized-exact"); setExactAuthorizationConfirmed(false); }} type="button">Use exact names</button></div></fieldset>
                {publicationMode === "authorized-exact" && <label className="studio-authorization studio-field-wide"><input checked={exactAuthorizationConfirmed} name="exact-name-permission" onChange={(event) => setExactAuthorizationConfirmed(event.target.checked)} type="checkbox" /><span><strong>Permission confirmed</strong>I have permission to use this institution&apos;s exact name and terminology in the rehearsal.</span></label>}
              </div>
              <div className="studio-actions">
                <button className={`studio-button ${adaptiveResearchAvailable ? "studio-button-primary" : ""}`} disabled={!adaptiveResearchAvailable || busy || institutionName.trim().length < 2 || (publicationMode === "authorized-exact" && !exactAuthorizationConfirmed)} onClick={() => research(false)} title={adaptiveResearchAvailable ? undefined : "New source research is not available in this workspace."}>{busy ? <LoaderCircle className="is-spinning" size={16} /> : <FileSearch size={16} />}Find public guidance</button>
                <button className={`studio-button ${adaptiveResearchAvailable ? "" : "studio-button-primary"}`} disabled={busy || (publicationMode === "authorized-exact" && !exactAuthorizationConfirmed)} onClick={() => research(true)}><BookOpenCheck size={16} />Use example institution</button>
              </div>
              {!adaptiveResearchAvailable && <p className="studio-action-note"><BookOpenCheck size={14} />The reviewed institution is ready to use in this workspace.</p>}
              <div className="studio-process-strip"><div><span>1</span><strong>Find</strong><small>Public official pages</small></div><ArrowRight size={16} /><div><span>2</span><strong>Check</strong><small>Sources and terminology</small></div><ArrowRight size={16} /><div><span>3</span><strong>Approve</strong><small>What the scenario may use</small></div></div>
            </div>
          )}

          {stage === "profile" && profile && (
            <div className="studio-section" data-testid="studio-profile">
              <header className="studio-section-heading studio-heading-row"><div><span>02 / CONTEXT REVIEW</span><h1>{profile.displayName}</h1><p>{profile.officialDomains.join(" · ")} · {profile.publicationMode === "brand-safe-fictionalized" ? "fictionalized names" : "exact institution names"} · {profile.facts.filter((fact) => fact.status === "verified").length} supported facts · {profile.unresolvedFields.length} open questions</p></div><ProvenanceBadge value={profileProvenance} /></header>
              <div className="studio-review-dock">
                <span><strong>{profileReadyForApproval ? `${profile.facts.length} facts ready for approval` : `${profileReviewIssues.length} review ${profileReviewIssues.length === 1 ? "check needs" : "checks need"} attention`}</strong><small>{profileReadyForApproval ? `${profile.sources.filter((source) => source.reviewStatus === "approved").length} approved sources · unknowns remain visibly unresolved` : profileReviewIssues.slice(0, 2).map((issue) => issue.message).join(" · ")}</small></span>
                <button className="studio-button studio-button-primary" onClick={approveProfile}><UserRoundCheck size={16} />Approve profile</button>
              </div>
              <div className="profile-table" aria-label="Institution facts">
                {profile.facts.map((fact, factIndex) => (
                  <div className="profile-row" key={fact.id}>
                    <div className="profile-fact-meta"><span>{fact.category.replaceAll("-", " ")}</span><strong>{fact.label}</strong><label className="fact-review-status"><span>Review status</span><select aria-label={`Status for ${fact.label}`} className={`fact-status is-${fact.status}`} name={`fact-status-${fact.id}`} value={fact.status} onChange={(event) => updateFactStatus(factIndex, event.target.value as InstitutionProfile["facts"][number]["status"])}><option value="verified">Verified</option><option value="conflicting">Conflicting</option><option value="unknown">Unknown</option></select></label><small>{fact.confidence} confidence</small></div>
                    <div className="profile-fact-value">
                      {fact.status === "unknown" ? <p className="unknown-value">Unknown remains unknown</p> : <textarea aria-label={`${fact.label} value`} autoComplete="off" maxLength={700} name={`fact-value-${fact.id}`} placeholder="Enter a source-supported value…" value={fact.value ?? ""} onChange={(event) => setProfile((current) => current ? { ...current, approval: { status: "review-required" }, facts: current.facts.map((item, index) => index === factIndex ? { ...item, value: event.target.value } : item) } : current)} />}
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
              <div className="studio-actions"><button className="studio-button" onClick={() => research(profileProvenance === "reviewed-fixture")} disabled={busy}><RefreshCw size={16} />Reload</button><button className="studio-button studio-button-danger" onClick={() => { setProfile(null); setStage("research"); }}><X size={16} />Reject</button></div>
            </div>
          )}

          {stage === "brief" && profile && (
            <div className="studio-section" data-testid="studio-brief">
              <header className="studio-section-heading"><span>03 / SCENARIO DESIGN</span><h1>Put one ordinary task under believable pressure.</h1><p>Define who is practicing, what they need to finish, and the judgment the rehearsal should exercise.</p></header>
              <div className="studio-form-grid">
                <label className="studio-field studio-field-wide"><span>Threat topic</span><input autoComplete="off" name="threat-topic" value={brief.threatTopic} onChange={(e) => setBrief({ ...brief, threatTopic: e.target.value })} /></label>
                <label className="studio-field"><span>Target learner</span><input autoComplete="off" name="target-learner" value={brief.targetLearner} onChange={(e) => setBrief({ ...brief, targetLearner: e.target.value })} /></label>
                <label className="studio-field"><span>Duration</span><select name="duration-minutes" value={brief.durationMinutes} onChange={(e) => setBrief({ ...brief, durationMinutes: Number(e.target.value) })}><option value={5}>5 minutes</option><option value={8}>8 minutes</option><option value={12}>12 minutes</option></select></label>
                <label className="studio-field studio-field-wide"><span>Ordinary task</span><textarea autoComplete="off" name="ordinary-task" value={brief.ordinaryTask} onChange={(e) => setBrief({ ...brief, ordinaryTask: e.target.value })} /></label>
                <label className="studio-field"><span>Environment</span><textarea autoComplete="off" name="environment" value={brief.environment} onChange={(e) => setBrief({ ...brief, environment: e.target.value })} /></label>
                <label className="studio-field"><span>Pressure</span><textarea autoComplete="off" name="pressure" value={brief.pressure} onChange={(e) => setBrief({ ...brief, pressure: e.target.value })} /></label>
                <label className="studio-field studio-field-wide"><span>Learning objective</span><textarea autoComplete="off" name="learning-objective" value={brief.learningObjective} onChange={(e) => setBrief({ ...brief, learningObjective: e.target.value })} /></label>
              </div>
              <div className="studio-actions">
                <button className={`studio-button ${adaptiveGenerationAvailable ? "studio-button-primary" : ""}`} disabled={!adaptiveGenerationAvailable || busy} onClick={() => generateScenario(false)} title={adaptiveGenerationAvailable ? undefined : "New scenario generation is not available in this workspace."}>{busy ? <LoaderCircle className="is-spinning" size={16} /> : <Sparkles size={16} />}Create rehearsal</button>
                <button className={`studio-button ${adaptiveGenerationAvailable ? "" : "studio-button-primary"}`} disabled={busy} onClick={() => generateScenario(true)}><BookOpenCheck size={16} />Use example rehearsal</button>
              </div>
              <p className={`studio-action-note ${briefReady ? "is-ready" : "is-blocked"}`}>{briefReady ? <CheckCircle2 size={14} /> : <CircleAlert size={14} />}{briefReady ? "Brief includes a task, audience, pressure, and observable learning objective." : "Complete each field before creating the rehearsal."}</p>
              {!adaptiveGenerationAvailable && <p className="studio-action-note"><BookOpenCheck size={14} />The reviewed rehearsal remains fully playable and editable as a teaching brief.</p>}
            </div>
          )}

          {stage === "preview" && scenario && (
            <div className="studio-section" data-testid="studio-preview">
              <header className="studio-section-heading studio-heading-row"><div><span>04 / SCENARIO PREVIEW</span><h1>{scenario.title}</h1><p>{scenario.tagline} · {scenario.durationMinutes} minutes · {scenario.learnerRole}</p></div><div className={`validation-passed ${scenarioReady ? "" : "is-blocked"}`}><ShieldCheck size={18} /><span><strong>{scenarioReady ? "READY" : "BLOCKED"}</strong><small>{scenarioReady ? "Scenario checks passed" : "Resolve validation or outcome coverage"}</small></span></div></header>
              {!editingScenario && (
                <div className="studio-review-dock">
                  <span><strong>{scenarioReady ? "Ready to rehearse" : "Review blocked"}</strong><small>{scenarioCoverage?.reachableStateCount ?? 0} legal states checked · {scenarioCoverage?.endingCoverage.filter((result) => result.reachable).length ?? 0} / 4 outcomes reachable</small></span>
                  <button className="studio-button studio-button-primary" disabled={!scenarioReady} onClick={launchScenario}><Play size={16} />Start rehearsal</button>
                </div>
              )}
              {editingScenario && draftScenario && draftValidation ? (
                <ScenarioCopyEditor
                  coverage={draftCoverage}
                  onApply={applyCopyEdit}
                  onCancel={() => { setEditingScenario(false); setDraftScenario(null); }}
                  onChange={setDraftScenario}
                  validation={draftValidation}
                  value={draftScenario}
                />
              ) : (
                <>
              <div className="scenario-summary-band"><div><span>Ordinary task</span><p>{scenario.intro.ordinaryTask}</p></div><div><span>Pressure</span><p>{scenario.intro.pressure}</p></div></div>
              <section className="source-lineage" aria-label="Source-to-scenario trace">
                <header><FileSearch size={16} /><div><strong>Source-to-scenario trace</strong><small>Approved guidance remains traceable after publication terms change.</small></div></header>
                <div>
                  <article><span>SOURCE PROFILE</span><strong>{profile?.displayName}</strong><small>{profile?.sources.filter((source) => source.reviewStatus === "approved").length ?? 0} approved sources</small></article>
                  <ArrowRight size={16} />
                  <article><span>APPROVED FACTS</span><strong>{reportFacts.length} used here</strong><small>{reportFacts.map((fact) => fact.label).join(" · ")}</small></article>
                  <ArrowRight size={16} />
                  <article><span>PUBLISHED SETTING</span><strong>{scenario.publishedSetting}</strong><small>{scenario.publicationMode === "brand-safe-fictionalized" ? "Fictionalized names" : "Authorized exact names"}</small></article>
                </div>
              </section>
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
              {!scenarioValidation?.success && (
                <div className="studio-notice is-error" role="alert">
                  <CircleAlert size={16} />
                  <span>{scenarioValidation?.issues.slice(0, 4).map((issue) => `${issue.path}: ${issue.message}`).join("\n")}</span>
                </div>
              )}
              <div className="studio-actions"><button className="studio-button" onClick={beginCopyEdit}><FilePenLine size={16} />Edit visible labels</button><button className="studio-button" onClick={() => setStage("brief")}><ArrowLeft size={16} />Edit brief</button></div>
                </>
              )}
            </div>
          )}

          {stage === "live" && scenario && simulation && (
            <div className="studio-section studio-live" data-testid="studio-live">
              <header className="studio-section-heading studio-heading-row">
                <div>
                  <span>01 / PRACTICE</span>
                  <h1>{scenario.title}</h1>
                  <p className="rehearsal-context"><strong>{scenario.publishedSetting}</strong> · {scenario.learnerRole}<small>{scenario.intro.ordinaryTask}</small></p>
                </div>
                <div className="rehearsal-pressure"><span>CURRENT PRESSURE</span><strong>{scenario.intro.pressure}</strong></div>
              </header>
              <div className="rehearsal-mobile-switcher" role="group" aria-label="Rehearsal workspace">
                <button
                  aria-pressed={mobilePanel === "task"}
                  className={mobilePanel === "task" ? "is-active" : ""}
                  onClick={() => setMobilePanel("task")}
                  type="button"
                >
                  <ClipboardList size={15} />Task
                </button>
                <button
                  aria-pressed={mobilePanel === "conversation"}
                  className={mobilePanel === "conversation" ? "is-active" : ""}
                  onClick={() => {
                    setMobilePanel("conversation");
                    setLastSeenMessageCount(messages.length);
                  }}
                  type="button"
                >
                  <MessageSquareText size={15} />Conversation
                  {mobilePanel === "task" && messages.length > lastSeenMessageCount && (
                    <span aria-label={`${messages.length - lastSeenMessageCount} unread messages`}>
                      {Math.min(messages.length - lastSeenMessageCount, 9)}
                    </span>
                  )}
                </button>
              </div>
              <div className={`rehearsal-grid is-mobile-${mobilePanel}`}>
                <TaskWorkspace
                  busy={busy || !clientReady}
                  inspectActions={visibleInspectActions}
                  onAction={performAction}
                  onFinish={finishScenario}
                  openingRequest={{
                    roleName: openingRequest?.role.displayName ?? "",
                    channel: openingRequest?.role.allowedChannels[0] ?? "",
                    content: openingRequest?.opening.content ?? "",
                    audioSrc: openingAudio?.src,
                  }}
                  pendingInspection={pendingInspection}
                  recoveryActions={visibleResponseActions}
                  scenario={scenario}
                  simulation={simulation}
                  taskActions={visibleTaskActions}
                  verificationActions={visibleVerificationActions}
                />
                <section className="dialogue-workspace">
                  <header><MessageSquareText size={16} /><strong>Conversation</strong></header>
                  <div className="dialogue-log" aria-live="polite" ref={dialogueLogRef}>{messages.map((line) => { const role = scenario.roleCards.find((candidate) => candidate.id === line.roleId); const hasOpeningAudio = openingAudio?.eventId === line.eventId; return <article className={line.roleId === "learner" ? "is-learner" : ""} key={line.id}><div><strong>{line.roleName}</strong><small>{line.roleId === "learner" ? "learner" : role?.allowedChannels[0]}</small></div><div>{hasOpeningAudio && <div className="dialogue-audio"><ReviewedAudioPlayer label={`Play voice note from ${line.roleName}`} src={openingAudio.src} /></div>}<p>{line.content}</p></div></article>; })}</div>
                  {pendingOperation === "role" && <OperationProgress compact operation="role" />}
                  <section className="evidence-board" aria-label="Evidence board">
                    <header><FileSearch size={14} /><strong>Evidence</strong><span>{simulation.evidenceIds.length}</span></header>
                    {simulation.evidenceIds.length === 0
                      ? <p>No evidence collected yet.</p>
                      : <div>{simulation.evidenceIds.map((evidenceId) => { const evidence = scenario.evidence.find((item) => item.id === evidenceId); return evidence ? <article key={evidence.id}><strong>{evidence.label}</strong><p>{evidence.description}</p></article> : null; })}</div>}
                  </section>
                  <div className="role-picker" aria-label="Open conversation channels">{visibleRoles.map((role) => <button aria-pressed={selectedRoleId === role.id} className={selectedRoleId === role.id ? "is-active" : ""} disabled={busy} key={role.id} onClick={() => setSelectedRoleId(role.id)} title={role.allowedChannels[0]} type="button"><span className="role-dot" /><span><strong>{role.displayName}</strong><small>{role.allowedChannels[0]}</small></span></button>)}</div>
                  <form className="dialogue-compose" onSubmit={sendMessage}><textarea aria-label="Message a role" autoComplete="off" disabled={busy} maxLength={500} name="role-message" placeholder="Ask a natural question…" value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} /><button aria-label={busy ? "Sending message" : "Send message"} disabled={busy || !messageDraft.trim()} type="submit">{busy ? <LoaderCircle className="is-spinning" size={17} /> : <Send size={17} />}</button></form>
                </section>
              </div>
            </div>
          )}

          {stage === "debrief" && scenario && simulation && debrief && (
            <div className="studio-section studio-debrief" data-testid="studio-debrief">
              <header className="studio-section-heading"><span>02 / REVIEW</span><h1>{debrief.coaching.headline}</h1><p>{debrief.coaching.summary}</p></header>
              <div className={`ending-banner is-${debrief.trace.endingId}`}><span>OUTCOME</span><strong>{debrief.trace.endingId.toUpperCase()}</strong><p>{currentEnding?.summary}</p></div>
              <section className="causal-chain" aria-label="Causal walkthrough">
                <header><GitBranch size={16} /><div><strong>What led here</strong><small>The explanation uses this run&apos;s pressure, evidence, actions, and final state.</small></div></header>
                <div>
                  <article><span>01 · PRESSURE</span><p>{scenario.intro.pressure}</p></article>
                  <article><span>02 · EVIDENCE</span><p>{discoveredEvidence.length ? discoveredEvidence.map((evidence) => evidence.label).join(" · ") : "No verification evidence was collected before the result."}</p></article>
                  <article><span>03 · CONSEQUENCE</span><p>{currentEnding?.causeChain.join(" ")}</p></article>
                  <article><span>04 · FINAL STATE</span><p>{presentedStateSummary(scenario, debrief.trace.finalState)}.</p></article>
                </div>
              </section>
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
              <div className="studio-actions"><button className="studio-button studio-button-primary" onClick={() => { setTransferResult(null); setStage("transfer"); }}><GitCompareArrows size={16} />Test in a new situation</button><button className="studio-button" onClick={launchScenario}><RotateCcw size={16} />Replay scenario</button>{!featured && <button className="studio-button" onClick={restart}><RefreshCw size={16} />New institution</button>}<Link className="studio-button" href="/"><ArrowLeft size={16} />Case library</Link></div>
            </div>
          )}

          {stage === "transfer" && scenario && debrief && (
            <div className="studio-section studio-transfer" data-testid="studio-transfer">
              <header className="studio-section-heading"><span>03 / APPLY</span><h1>{scenario.transferProbe.title}</h1><p>A different task puts the same judgment under pressure.</p></header>
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
                      <article><span>REHEARSAL</span><strong>{debrief.trace.endingId}</strong><p>{currentEnding?.title}</p></article>
                      <article><span>NEW SITUATION</span><strong>{transferOutcomeLabels[transferResult.outcome]}</strong><p>{transferResult.actionLabel}</p></article>
                      <article><span>PATTERN</span><strong>Immediate application</strong><p>{debrief.coaching.nextTime}</p></article>
                    </div>
                    <footer>The new-context action was recorded after feedback but before the explicit transfer rule and coach prompts appeared.</footer>
                  </section>
                  <section className="evidence-coach" aria-label="Ask about the evidence">
                    <header><FileQuestion size={17} /><div><strong>Ask about the evidence</strong><small>Now compare what the channels in this run did and did not establish.</small></div></header>
                    {availableCoachPrompts.length > 0 && <div className="coach-prompts">{availableCoachPrompts.map(({ question }) => <button disabled={coachBusy} key={question} onClick={() => askEvidenceCoach(question)} type="button">{question}</button>)}</div>}
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
                      <input aria-label="Question about the evidence" autoComplete="off" maxLength={500} name="evidence-question" placeholder="Ask why a check was or was not enough…" value={coachQuestion} onChange={(event) => setCoachQuestion(event.target.value)} />
                      <button disabled={coachBusy || coachQuestion.trim().length < 3} type="submit">{coachBusy ? <LoaderCircle className="is-spinning" size={16} /> : <ArrowRight size={16} />}Ask</button>
                    </form>
                    {pendingOperation === "coach" && <OperationProgress compact operation="coach" />}
                  </section>
                </>
              )}
              <div className="studio-actions">{transferResult && <button className="studio-button studio-button-primary" onClick={() => setStage("report")}><ClipboardList size={16} />Open facilitator report</button>}<button className="studio-button" onClick={launchScenario}><RotateCcw size={16} />Replay rehearsal</button>{!featured && <button className="studio-button" onClick={restart}><RefreshCw size={16} />New institution</button>}<Link className="studio-button" href="/"><ArrowLeft size={16} />Case library</Link></div>
            </div>
          )}

          {stage === "report" && scenario && profile && simulation && debrief && transferResult && (
            <div className="studio-section facilitator-report" data-testid="studio-report">
              <header className="studio-section-heading studio-heading-row">
                <div><span>FACILITATOR REPORT</span><h1>{scenario.title}</h1><p>Source profile: {profile.displayName} · Published setting: {scenario.publishedSetting}<small>The new-context action followed the rehearsal feedback and preceded the explicit transfer rule and coach prompts.</small></p></div>
                <div className="report-privacy"><LockKeyhole size={16} /><span><strong>No learner identity stored</strong><small>This report exists only in the current browser session.</small></span></div>
              </header>
              <section className="report-outcomes">
                <article><span>REHEARSAL</span><strong>{debrief.trace.endingId}</strong><p>{scenario.endings.find((ending) => ending.id === debrief.trace.endingId)?.title}</p></article>
                <article><span>NEW SITUATION</span><strong>{transferOutcomeLabels[transferResult.outcome]}</strong><p>{transferResult.actionLabel} · selected before the explicit rule</p></article>
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
                  <header><strong>Final operational state</strong></header>
                  <ul>
                    {scenario.learnerPresentation.statusFields.map((item) => (
                      <li key={item.field}>
                        <strong>{item.label}</strong>
                        <p>{formatCanonicalValue(item.field, debrief.trace.finalState[item.field])}</p>
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <header><strong>Discussion prompts</strong></header>
                  <ol className="discussion-prompts">
                    <li>What made the convenient action feel reasonable in this run?</li>
                    {availableCoachPrompts.map(({ question }) => <li key={question}>{question}</li>)}
                    {debrief.trace.recoveryRequired && <li>Which affected layer needed the first response, and why?</li>}
                  </ol>
                </section>
              </div>
              <section className="facilitation-sequence" aria-label="5-minute discussion path">
                <header><Users size={16} /><div><strong>5-minute discussion path</strong><small>Move from this run to a reusable judgment pattern.</small></div></header>
                <div>
                  <article><span>01 · ASK</span><strong>Reconstruct the pressure</strong><p>What made the convenient action feel reasonable when {scenario.intro.pressure.trim().replace(/[.!?]+$/, "").toLowerCase()}?</p></article>
                  <article><span>02 · COMPARE</span><strong>Use the evidence</strong><p>{discoveredEvidence.length ? `What did “${discoveredEvidence[0].label}” establish that the original request did not?` : "What evidence would have changed the authority of the request?"}</p></article>
                  <article><span>03 · APPLY</span><strong>Name the next use</strong><p>{debrief.coaching.nextTime}</p></article>
                </div>
                <footer>
                  <span>OBSERVATION CUE</span>
                  <div>
                    <p>Listen for whether the learner names the judgment pattern, connects it to the action, and states what remains uncertain. Record only an aggregate category; do not retain their wording.</p>
                    <ul aria-label="Explanation categories">
                      <li><strong>Clear</strong><small>Names the pattern, action, and remaining uncertainty.</small></li>
                      <li><strong>Partial</strong><small>Recognizes the risk but misses a link or tradeoff.</small></li>
                      <li><strong>Unclear</strong><small>Names an action without explaining the judgment.</small></li>
                    </ul>
                  </div>
                </footer>
              </section>
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
