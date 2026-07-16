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
          <dl><div><dt>Task</dt><dd>Complete</dd></div><div><dt>Choice</dt><dd>{choice.title}</dd></div></dl>
        </section>
        <div className="case-debrief-grid">
          <section className="case-review-section">
            <header><span>01</span><div><h2>What happened</h2><p>Built from the actions you took</p></div></header>
            <ol className="event-timeline">{events.map((event) => <li key={event.id} className={`timeline-${event.tone}`}><time>{event.time}</time><i /><div><strong>{event.title}</strong>{event.detail ? <p>{event.detail}</p> : null}</div></li>)}</ol>
          </section>
          <section className="case-review-section">
            <header><span>02</span><div><h2>Evidence along the way</h2><p>These details were visible before the choice</p></div></header>
            <ul className="clue-list">{definition.clues.map((clue) => <li key={clue}><Lightbulb size={15} /><span>{clue}</span></li>)}</ul>
            {incident ? <div className="completed-response"><h3>Response actions completed</h3>{completedActions.length ? <ul>{definition.responseSteps.filter((step) => completedActions.includes(step.id)).map((step) => <li key={step.id}><Check size={13} />{step.title}</li>)}</ul> : <p>No containment action was completed.</p>}</div> : null}
          </section>
        </div>
        <section className="case-learning">
          <header><span>03</span><div><h2>Carry the judgment forward</h2><p>Rebuild the cause chain, then extract a reusable action</p></div></header>
          <div className="case-cause-chain">{chain.map((text, index) => <div key={text}><span>{String(index + 1).padStart(2, "0")}</span><strong>{text}</strong>{index < chain.length - 1 ? <ArrowRight size={15} /> : null}</div>)}</div>
          <div className="case-transfer-rules">{definition.transferRules.map((rule, index) => <article key={rule.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{rule.title}</h3><p>{rule.body}</p></article>)}</div>
        </section>
        {showPath ? <section className="correct-path"><header><Lightbulb size={18} /><div><h2>A more reliable path</h2><p>Keep permission and verification scope aligned with the current task.</p></div></header><ol>{definition.correctPath.map((step) => <li key={step}>{step}</li>)}</ol></section> : null}
        <footer className="debrief-actions">
          <PixelButton icon={<LayoutGrid size={15} />} onClick={onExit}>Return to case library</PixelButton>
          <PixelButton icon={<Lightbulb size={15} />} onClick={onTogglePath}>{showPath ? "Hide reliable path" : "Show reliable path"}</PixelButton>
          <PixelButton variant="primary" icon={<RotateCcw size={15} />} onClick={onReplay}>Replay this chapter</PixelButton>
        </footer>
      </div>
    </main>
  );
}
