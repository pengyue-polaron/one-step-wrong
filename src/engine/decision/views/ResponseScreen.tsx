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
        <header><span><ShieldAlert size={25} /></span><div><small>INCIDENT RESPONSE</small><h1>{definition.responseTitle}</h1><p>{definition.responseBody}</p></div><strong>{requiredDone} / {required.length} 关键项</strong></header>
        <section className="response-action-list">
          {definition.responseSteps.map((step, index) => {
            const done = completed.includes(step.id);
            return (
              <article key={step.id} className={done ? "is-done" : ""}>
                <span>{done ? <Check size={17} /> : String(index + 1).padStart(2, "0")}</span>
                <div><strong>{step.title}</strong><p>{step.description}</p><small>{step.required ? "关键处理" : "补充处理"}</small></div>
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
