"use client";

import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  FolderKey,
  History,
  LayoutGrid,
  Lightbulb,
  LockKeyhole,
  MapPin,
  MonitorCheck,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { PixelButton } from "@/components/ui/PixelButton";
import type {
  CaseEnding,
  DecisionCaseDefinition,
  DecisionOption,
} from "@/scenarios/caseCatalog";

type ChapterStage = "intro" | "decision" | "outcome" | "response" | "debrief";
type ChapterEvent = { id: string; time: string; title: string; detail?: string; tone: "info" | "notice" | "incident" | "success" };

function formatTime(base: string, offset: number) {
  const [hours, minutes] = base.split(":").map(Number);
  const total = (hours ?? 0) * 60 + (minutes ?? 0) + offset;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function ChapterTopbar({ definition, onExit }: { definition: DecisionCaseDefinition; onExit: () => void }) {
  return (
    <header className="chapter-topbar">
      <div className="system-brand"><span className="brand-mark">N</span><span>一步之差</span></div>
      <div className="chapter-topbar-case"><span>CASE {definition.number}</span><strong>{definition.title}</strong></div>
      <IconButton label="返回案例库" icon={<LayoutGrid size={16} />} onClick={onExit} />
    </header>
  );
}

function ChapterIntro({ definition, onStart, onExit }: { definition: DecisionCaseDefinition; onStart: () => void; onExit: () => void }) {
  const drive = definition.id === "shared-draft";
  return (
    <main className={`chapter-shell chapter-shell--${definition.tone}`}>
      <ChapterTopbar definition={definition} onExit={onExit} />
      <section className="chapter-intro">
        <div className="chapter-intro-scene" aria-hidden="true">
          {drive ? (
            <>
              <span className="scene-folder"><FolderKey size={46} /></span>
              <span className="scene-document scene-document--one" />
              <span className="scene-document scene-document--two" />
              <span className="scene-cursor"><UserRound size={20} /></span>
            </>
          ) : (
            <>
              <span className="scene-phone"><Smartphone size={58} /><i /><i /><i /></span>
              <span className="scene-push scene-push--one">LOGIN REQUEST</span>
              <span className="scene-push scene-push--two">LOGIN REQUEST</span>
              <span className="scene-browser"><MonitorCheck size={42} /></span>
            </>
          )}
        </div>
        <div className="chapter-intro-copy">
          <span className="intro-kicker">NYU · {definition.location.toUpperCase()} · {definition.intro.time}</span>
          <h1>{definition.intro.title}</h1>
          <p>{definition.intro.body}</p>
          <div className="chapter-task-line"><Clock3 size={17} /><span>{definition.intro.task}</span></div>
          <PixelButton variant="primary" icon={<ArrowRight size={16} />} onClick={onStart}>{definition.intro.startLabel}</PixelButton>
        </div>
      </section>
    </main>
  );
}

function MissionRail({ definition }: { definition: DecisionCaseDefinition }) {
  return (
    <aside className="chapter-mission">
      <span>{definition.decision.eyebrow}</span>
      <h1>{definition.decision.title}</h1>
      <p>{definition.decision.body}</p>
      <div><Clock3 size={15} /><span>剩余时间</span><strong>{definition.decision.deadline}</strong></div>
      <footer><MapPin size={13} /><span>{definition.location}</span></footer>
    </aside>
  );
}

function OptionButton({ option, onSelect }: { option: DecisionOption; onSelect: (option: DecisionOption) => void }) {
  return (
    <button className="decision-option" data-testid={`choice-${option.id}`} onClick={() => onSelect(option)}>
      <span className="decision-radio" />
      <span><strong>{option.title}</strong><small>{option.meta}</small><p>{option.description}</p></span>
      <ArrowRight size={16} />
    </button>
  );
}

function DriveDecision({ definition, onSelect }: { definition: DecisionCaseDefinition; onSelect: (option: DecisionOption) => void }) {
  return (
    <section className="tool-window drive-window" aria-label="NYU Drive 共享设置">
      <header className="tool-titlebar"><div><span className="drive-mark"><FolderKey size={17} /></span><strong>NYU Drive</strong></div><span>drive.google.com · NYU Workspace</span></header>
      <div className="drive-toolbar"><FileText size={16} /><div><strong>Interview Research · Week 8</strong><small>Shared folder · Last edited 2 min ago</small></div><span><Users size={14} /> 3 people</span></div>
      <div className="drive-layout">
        <main className="document-preview">
          <span>MEDIA, CULTURE, AND SOCIETY</span>
          <h2>Interview Research</h2>
          <p>Participant consent forms, interview transcripts, selected quotations, and edit notes.</p>
          <div className="document-lines"><i /><i /><i /><i /><i /></div>
          <footer><LockKeyhole size={13} /> Contains participant contact details</footer>
        </main>
        <aside className="share-dialog">
          <header><div><h2>Share “Interview Research”</h2><p>Choose who can open and edit this folder.</p></div><X size={16} /></header>
          <div className="share-request"><span className="avatar">M</span><div><strong>Maya Chen</strong><p>“NYU 登录有问题，先发到 maya.chen.nyu@gmail.com”</p></div></div>
          <div className="option-list">{definition.decision.options.map((option) => <OptionButton key={option.id} option={option} onSelect={onSelect} />)}</div>
        </aside>
      </div>
    </section>
  );
}

function DuoDecision({ definition, onSelect }: { definition: DecisionCaseDefinition; onSelect: (option: DecisionOption) => void }) {
  const verifyOption = definition.decision.options.find((option) => option.id === "verify-browser");
  const phoneOptions = definition.decision.options.filter((option) => option.id !== "verify-browser");
  return (
    <section className="duo-workspace" aria-label="NYU Duo 登录确认">
      <div className="zoom-window tool-window">
        <header className="tool-titlebar"><div><span className="zoom-mark">Z</span><strong>NYU Zoom</strong></div><span>nyu.zoom.us</span></header>
        <main>
          <span className="step-label">UPCOMING MEETING</span>
          <h2>Advising · Fall Registration</h2>
          <p>Host: Professor Elena Ruiz</p>
          <div className="meeting-details"><div><Clock3 size={15} /><span>18:00–18:25</span></div><div><Users size={15} /><span>Waiting for you</span></div></div>
          <PixelButton disabled>Sign in with NYU</PixelButton>
          <small>你还没有在这个页面输入 NetID。</small>
          {verifyOption ? <div className="browser-verify-action"><span>先核对当前页面</span><OptionButton option={verifyOption} onSelect={onSelect} /></div> : null}
        </main>
      </div>
      <div className="duo-phone">
        <div className="phone-status"><span>17:58</span><span>5G&nbsp;&nbsp;82%</span></div>
        <header><span className="duo-mark"><ShieldCheck size={20} /></span><div><strong>Duo Mobile</strong><small>Login request</small></div></header>
        <main>
          <span className="duo-request-count">第 3 次请求 · 刚刚</span>
          <h2>NYU Login</h2>
          <dl><div><dt>Account</dt><dd>ls2841</dd></div><div><dt>Device</dt><dd>Chrome</dd></div><div><dt>Location</dt><dd>Jersey City, NJ</dd></div></dl>
          <div className="duo-options">{phoneOptions.map((option) => <OptionButton key={option.id} option={option} onSelect={onSelect} />)}</div>
        </main>
        <footer><span /> Swipe bar</footer>
      </div>
    </section>
  );
}

function DecisionWorkspace({ definition, onSelect, onExit }: { definition: DecisionCaseDefinition; onSelect: (option: DecisionOption) => void; onExit: () => void }) {
  return (
    <main className={`chapter-shell chapter-shell--${definition.tone}`}>
      <ChapterTopbar definition={definition} onExit={onExit} />
      <div className="decision-workspace">
        <MissionRail definition={definition} />
        <div className="decision-stage">
          {definition.id === "shared-draft" ? <DriveDecision definition={definition} onSelect={onSelect} /> : <DuoDecision definition={definition} onSelect={onSelect} />}
        </div>
      </div>
    </main>
  );
}

function OutcomeScreen({ definition, choice, onContinue, onExit }: { definition: DecisionCaseDefinition; choice: DecisionOption; onContinue: () => void; onExit: () => void }) {
  const incident = choice.route === "incident";
  const caution = choice.route === "caution";
  const drive = definition.id === "shared-draft";
  const title = incident ? definition.incident.title : drive ? "共享设置已更新" : caution ? "请求已拒绝" : "登录来源已核对";
  const body = incident
    ? definition.incident.body
    : drive
      ? choice.route === "verified" ? "三位组员已收到邀请，资料夹仍保持 Restricted。" : "NYU 社区链接已经生效，组员可以继续编辑。"
      : choice.route === "verified" ? "当前手机请求与你的浏览器动作不匹配。你重新从 Zoom 发起了登录。" : "Duo 已记录这不是你发起的登录，当前请求未被批准。";
  return (
    <main className={`chapter-shell chapter-shell--${definition.tone}`}>
      <ChapterTopbar definition={definition} onExit={onExit} />
      <section className={`chapter-outcome ${incident ? "chapter-outcome--incident" : caution ? "chapter-outcome--caution" : ""}`}>
        <div className="outcome-status"><span>{incident ? <AlertTriangle size={30} /> : <CheckCircle2 size={30} />}</span><div><small>{incident ? definition.incident.delay : "任务状态"}</small><h1>{title}</h1><p>{body}</p></div></div>
        <div className="outcome-evidence">
          <header><History size={16} /><strong>{incident ? "活动记录" : "本次操作"}</strong></header>
          {incident ? (
            <dl>{definition.incident.evidence.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
          ) : (
            <dl><div><dt>选择</dt><dd>{choice.title}</dd></div><div><dt>范围</dt><dd>{choice.meta}</dd></div><div><dt>结果</dt><dd>{drive ? "协作可以继续" : "未授权登录未完成"}</dd></div></dl>
          )}
        </div>
        <PixelButton variant="primary" icon={incident ? <ShieldAlert size={16} /> : <ArrowRight size={16} />} onClick={onContinue}>
          {incident ? (drive ? "处理共享异常" : "处理账号异常") : "查看本次复盘"}
        </PixelButton>
      </section>
    </main>
  );
}

function ResponseScreen({
  definition,
  completed,
  onAction,
  onFinish,
  onExit,
}: {
  definition: DecisionCaseDefinition;
  completed: string[];
  onAction: (id: string) => void;
  onFinish: () => void;
  onExit: () => void;
}) {
  const required = definition.responseSteps.filter((step) => step.required);
  const requiredDone = required.filter((step) => completed.includes(step.id)).length;
  return (
    <main className={`chapter-shell chapter-shell--${definition.tone}`}>
      <ChapterTopbar definition={definition} onExit={onExit} />
      <div className="response-layout">
        <header><span><ShieldAlert size={25} /></span><div><small>INCIDENT RESPONSE</small><h1>{definition.responseTitle}</h1><p>{definition.responseBody}</p></div><strong>{requiredDone} / {required.length} 关键项</strong></header>
        <section className="response-action-list">
          {definition.responseSteps.map((step, index) => {
            const done = completed.includes(step.id);
            return (
              <article key={step.id} className={done ? "is-done" : ""}>
                <span>{done ? <Check size={17} /> : String(index + 1).padStart(2, "0")}</span>
                <div><strong>{step.title}</strong><p>{step.description}</p>{step.required ? <small>关键处理</small> : <small>补充处理</small>}</div>
                <PixelButton data-testid={`response-${step.id}`} disabled={done} icon={done ? <Check size={14} /> : <ArrowRight size={14} />} onClick={() => onAction(step.id)}>{done ? "已完成" : "执行"}</PixelButton>
              </article>
            );
          })}
        </section>
        <footer><p>你可以随时结束处理；复盘会呈现仍未覆盖的影响范围。</p><PixelButton variant="primary" onClick={onFinish}>完成处理并复盘</PixelButton></footer>
      </div>
    </main>
  );
}

function CaseDebrief({
  definition,
  choice,
  endingId,
  events,
  completedActions,
  showPath,
  onTogglePath,
  onReplay,
  onExit,
}: {
  definition: DecisionCaseDefinition;
  choice: DecisionOption;
  endingId: CaseEnding;
  events: ChapterEvent[];
  completedActions: string[];
  showPath: boolean;
  onTogglePath: () => void;
  onReplay: () => void;
  onExit: () => void;
}) {
  const ending = definition.endings[endingId];
  const incident = choice.route === "incident";
  const chain = definition.causeChain[incident ? "incident" : choice.route];
  return (
    <main className={`case-debrief case-debrief--${endingId}`}>
      <ChapterTopbar definition={definition} onExit={onExit} />
      <div className="case-debrief-body">
        <section className="case-ending-hero">
          <span>{endingId === "expanded" ? <AlertTriangle size={30} /> : endingId === "contained" ? <ShieldCheck size={30} /> : <CheckCircle2 size={30} />}</span>
          <div><small>{ending.eyebrow} · CASE {definition.number}</small><h1>{ending.title}</h1><p>{ending.summary}</p><em>{ending.detail}</em></div>
          <dl><div><dt>任务</dt><dd>已完成</dd></div><div><dt>选择</dt><dd>{choice.title}</dd></div></dl>
        </section>

        <div className="case-debrief-grid">
          <section className="case-review-section">
            <header><span>01</span><div><h2>发生了什么</h2><p>根据本次操作生成</p></div></header>
            <ol className="event-timeline">{events.map((event) => <li key={event.id} className={`timeline-${event.tone}`}><time>{event.time}</time><i /><div><strong>{event.title}</strong>{event.detail ? <p>{event.detail}</p> : null}</div></li>)}</ol>
          </section>
          <section className="case-review-section">
            <header><span>02</span><div><h2>沿途证据</h2><p>这些信息在选择前已经出现</p></div></header>
            <ul className="clue-list">{definition.clues.map((clue) => <li key={clue}><Lightbulb size={15} /><span>{clue}</span></li>)}</ul>
            {incident ? <div className="completed-response"><h3>本次完成的处理</h3>{completedActions.length ? <ul>{definition.responseSteps.filter((step) => completedActions.includes(step.id)).map((step) => <li key={step.id}><Check size={13} />{step.title}</li>)}</ul> : <p>没有完成止损操作。</p>}</div> : null}
          </section>
        </div>

        <section className="case-learning">
          <header><span>03</span><div><h2>把判断带到下一次</h2><p>先还原因果，再提炼可迁移的动作</p></div></header>
          <div className="case-cause-chain">{chain.map((text, index) => <div key={text}><span>{String(index + 1).padStart(2, "0")}</span><strong>{text}</strong>{index < chain.length - 1 ? <ArrowRight size={15} /> : null}</div>)}</div>
          <div className="case-transfer-rules">{definition.transferRules.map((rule, index) => <article key={rule.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{rule.title}</h3><p>{rule.body}</p></article>)}</div>
        </section>

        {showPath ? <section className="correct-path"><header><Lightbulb size={18} /><div><h2>更可靠的做法</h2><p>把权限和验证范围收敛到当前任务。</p></div></header><ol>{definition.correctPath.map((step) => <li key={step}>{step}</li>)}</ol></section> : null}

        <footer className="debrief-actions">
          <PixelButton icon={<LayoutGrid size={15} />} onClick={onExit}>返回案例库</PixelButton>
          <PixelButton icon={<Lightbulb size={15} />} onClick={onTogglePath}>{showPath ? "收起正确做法" : "查看正确做法"}</PixelButton>
          <PixelButton variant="primary" icon={<RotateCcw size={15} />} onClick={onReplay}>重新体验本章</PixelButton>
        </footer>
      </div>
    </main>
  );
}

export function DecisionCaseRunner({
  definition,
  onExit,
  onComplete,
}: {
  definition: DecisionCaseDefinition;
  onExit: () => void;
  onComplete: (ending: CaseEnding) => void;
}) {
  const [stage, setStage] = useState<ChapterStage>("intro");
  const [choice, setChoice] = useState<DecisionOption | null>(null);
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const [showPath, setShowPath] = useState(false);
  const [events, setEvents] = useState<ChapterEvent[]>([
    { id: "task-opened", time: definition.intro.time, title: definition.intro.task, tone: "info" },
  ]);

  const choose = (option: DecisionOption) => {
    const nextEvents: ChapterEvent[] = [
      ...events,
      { id: `choice-${option.id}`, time: formatTime(definition.intro.time, 1), title: option.event, detail: option.meta, tone: option.route === "incident" ? "notice" : "success" },
    ];
    if (option.route === "incident") nextEvents.push({ id: "incident", time: formatTime(definition.intro.time, 7), title: definition.incident.title, detail: definition.incident.evidence[0]?.value, tone: "incident" });
    setChoice(option);
    setEvents(nextEvents);
    setStage("outcome");
  };

  const performAction = (id: string) => {
    if (completedActions.includes(id)) return;
    const step = definition.responseSteps.find((item) => item.id === id);
    if (!step) return;
    const next = [...completedActions, id];
    setCompletedActions(next);
    setEvents((current) => [...current, { id: `response-${id}`, time: formatTime(definition.intro.time, 8 + next.length), title: step.event, tone: "success" }]);
  };

  const requiredComplete = definition.responseSteps.filter((step) => step.required).every((step) => completedActions.includes(step.id));
  const endingId: CaseEnding = !choice ? "expanded" : choice.route === "verified" ? "verified" : choice.route === "caution" ? "caution" : requiredComplete ? "contained" : "expanded";

  const reset = () => {
    setStage("intro");
    setChoice(null);
    setCompletedActions([]);
    setShowPath(false);
    setEvents([{ id: "task-opened", time: definition.intro.time, title: definition.intro.task, tone: "info" }]);
  };

  if (stage === "intro") return <ChapterIntro definition={definition} onStart={() => setStage("decision")} onExit={onExit} />;
  if (stage === "decision") return <DecisionWorkspace definition={definition} onSelect={choose} onExit={onExit} />;
  if (stage === "outcome" && choice) return <OutcomeScreen definition={definition} choice={choice} onContinue={() => setStage(choice.route === "incident" ? "response" : "debrief")} onExit={onExit} />;
  if (stage === "response") return <ResponseScreen definition={definition} completed={completedActions} onAction={performAction} onFinish={() => setStage("debrief")} onExit={onExit} />;
  if (!choice) return null;
  return <CaseDebrief definition={definition} choice={choice} endingId={endingId} events={events} completedActions={completedActions} showPath={showPath} onTogglePath={() => setShowPath((value) => !value)} onReplay={reset} onExit={() => onComplete(endingId)} />;
}
