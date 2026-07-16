import { ArrowRight, Check, ShieldAlert } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import { ChapterTopbar } from "@/engine/decision/components/ChapterChrome";
import type { DecisionCaseDefinition } from "@/engine/decision/types";

export function ResponseScreen({ definition, completed, onAction, onFinish, onExit }: {
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
        <header><span><ShieldAlert size={25} /></span><div><small>INCIDENT RESPONSE</small><h1>{definition.responseTitle}</h1><p>{definition.responseBody}</p></div><strong>{requiredDone} / {required.length} critical</strong></header>
        <section className="response-action-list">
          {definition.responseSteps.map((step, index) => {
            const done = completed.includes(step.id);
            return (
              <article key={step.id} className={done ? "is-done" : ""}>
                <span>{done ? <Check size={17} /> : String(index + 1).padStart(2, "0")}</span>
                <div><strong>{step.title}</strong><p>{step.description}</p><small>{step.required ? "Critical response" : "Additional response"}</small></div>
                <PixelButton data-testid={`response-${step.id}`} disabled={done} icon={done ? <Check size={14} /> : <ArrowRight size={14} />} onClick={() => onAction(step.id)}>{done ? "Complete" : "Do this"}</PixelButton>
              </article>
            );
          })}
        </section>
        <footer><p>You can stop at any time; the review will show which affected layers remain unresolved.</p><PixelButton variant="primary" onClick={onFinish}>Finish response and review</PixelButton></footer>
      </div>
    </main>
  );
}
