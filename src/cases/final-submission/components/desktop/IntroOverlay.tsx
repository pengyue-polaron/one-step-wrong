"use client";

import { ArrowRight, FileText } from "lucide-react";
import { useSyncExternalStore } from "react";
import { copy } from "@/cases/final-submission/copy";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/cases/final-submission/state/GameContext";

export function IntroOverlay() {
  const { state, dispatch } = useGame();
  const ready = useSyncExternalStore(() => () => undefined, () => true, () => false);
  if (state.started) return null;
  return (
    <div className="intro-scrim">
      <section className="intro-panel" aria-labelledby="intro-title">
        <div className="intro-scene" aria-hidden="true">
          <span className="window-stars">· &nbsp; · &nbsp;&nbsp; ·</span>
          <span className="clock-tower" />
          <span className="desk-lamp" />
          <span className="paper-stack" />
        </div>
        <div className="intro-copy">
          <span className="intro-kicker">{copy.intro.kicker}</span>
          <h1 id="intro-title">{copy.intro.title}</h1>
          <p>{copy.intro.body}</p>
          <div className="intro-task"><FileText size={17} /><span>{copy.intro.prompt}</span></div>
          <PixelButton variant="primary" disabled={!ready} icon={<ArrowRight size={16} />} onClick={() => dispatch({ type: "START_GAME" })}>
            {ready ? "Check submission status" : "Preparing..."}
          </PixelButton>
        </div>
      </section>
    </div>
  );
}
