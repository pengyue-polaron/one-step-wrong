import { ArrowRight, Clock3, LayoutGrid, MapPin } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { PixelButton } from "@/components/ui/PixelButton";
import type { DecisionCaseDefinition, DecisionOption } from "@/engine/decision/types";

export function ChapterTopbar({ definition, onExit }: { definition: DecisionCaseDefinition; onExit: () => void }) {
  return (
    <header className="chapter-topbar">
      <div className="system-brand"><span className="brand-mark">N</span><span>一步之差</span></div>
      <div className="chapter-topbar-case"><span>CASE {definition.number}</span><strong>{definition.title}</strong></div>
      <IconButton label="返回案例库" icon={<LayoutGrid size={16} />} onClick={onExit} />
    </header>
  );
}

export function ChapterIntro({
  definition,
  IntroScene,
  onStart,
  onExit,
}: {
  definition: DecisionCaseDefinition;
  IntroScene: ComponentType;
  onStart: () => void;
  onExit: () => void;
}) {
  return (
    <main className={`chapter-shell chapter-shell--${definition.tone}`}>
      <ChapterTopbar definition={definition} onExit={onExit} />
      <section className="chapter-intro">
        <div className="chapter-intro-scene" aria-hidden="true"><IntroScene /></div>
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

export function DecisionWorkspace({
  definition,
  children,
  onExit,
}: {
  definition: DecisionCaseDefinition;
  children: ReactNode;
  onExit: () => void;
}) {
  return (
    <main className={`chapter-shell chapter-shell--${definition.tone}`}>
      <ChapterTopbar definition={definition} onExit={onExit} />
      <div className="decision-workspace">
        <MissionRail definition={definition} />
        <div className="decision-stage">{children}</div>
      </div>
    </main>
  );
}

export function OptionButton({ option, onSelect }: { option: DecisionOption; onSelect: (option: DecisionOption) => void }) {
  return (
    <button className="decision-option" data-testid={`choice-${option.id}`} onClick={() => onSelect(option)}>
      <span className="decision-radio" />
      <span><strong>{option.title}</strong><small>{option.meta}</small><p>{option.description}</p></span>
      <ArrowRight size={16} />
    </button>
  );
}
