import { AlertTriangle, ArrowRight, Check, CheckCircle2, LayoutGrid, Lightbulb, RotateCcw, ShieldCheck } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import type { CaseEnding } from "@/cases/types";
import { ChapterTopbar } from "@/engine/decision/components/ChapterChrome";
import type { DecisionCaseDefinition, DecisionEvent, DecisionOption } from "@/engine/decision/types";

export function CaseDebrief({ definition, choice, endingId, events, completedActions, showPath, onTogglePath, onReplay, onExit }: {
  definition: DecisionCaseDefinition;
  choice: DecisionOption;
  endingId: CaseEnding;
  events: DecisionEvent[];
  completedActions: string[];
  showPath: boolean;
  onTogglePath: () => void;
  onReplay: () => void;
  onExit: () => void;
}) {
  const ending = definition.endings[endingId];
  const incident = choice.route === "incident";
  const chain = definition.causeChain[choice.route];
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
