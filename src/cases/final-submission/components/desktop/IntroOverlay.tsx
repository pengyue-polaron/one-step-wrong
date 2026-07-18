"use client";

import { ArrowRight, FileText } from "lucide-react";
import { useRef, useSyncExternalStore } from "react";
import { copy } from "@/cases/final-submission/copy";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/cases/final-submission/state/GameContext";
import { useModalFocus } from "@/cases/final-submission/components/useModalFocus";

export function IntroOverlay() {
  const { state, dispatch } = useGame();
  const ready = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const scrimRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  useModalFocus({
    active: !state.started && ready,
    modalRef: panelRef,
    isolationRef: scrimRef,
    initialFocusSelector: "[data-intro-start]",
    activeMediaQuery: "(min-width: 1100px)",
  });
  if (state.started) return null;
  return (
    <div className="intro-scrim" ref={scrimRef} role="presentation">
      <section
        aria-describedby="intro-description"
        aria-labelledby="intro-title"
        aria-modal="true"
        className="intro-panel"
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="intro-scene" aria-hidden="true">
          <span className="window-stars">· &nbsp; · &nbsp;&nbsp; ·</span>
          <span className="clock-tower" />
          <span className="desk-lamp" />
          <span className="paper-stack" />
        </div>
        <div className="intro-copy">
          <span className="intro-kicker">{copy.intro.kicker}</span>
          <h1 id="intro-title">{copy.intro.title}</h1>
          <p id="intro-description">{copy.intro.body}</p>
          <div className="intro-task"><FileText size={17} /><span>{copy.intro.prompt}</span></div>
          <PixelButton data-intro-start variant="primary" disabled={!ready} icon={<ArrowRight size={16} />} onClick={() => dispatch({ type: "START_GAME" })}>
            {ready ? "Check submission status" : "Preparing…"}
          </PixelButton>
        </div>
      </section>
    </div>
  );
}
