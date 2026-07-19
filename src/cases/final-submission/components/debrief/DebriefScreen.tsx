"use client";

import { ArrowRight, Check, CheckCircle2, LayoutGrid, Lightbulb, RefreshCcw, RotateCcw, ShieldCheck, TriangleAlert, Wifi } from "lucide-react";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/cases/final-submission/state/GameContext";
import { selectClues, selectEffectiveActions, selectEnding, selectScore } from "@/cases/final-submission/state/selectors";

function ScoreMeter({ label, value }: { label: string; value: number }) {
  return (
    <div className="score-meter">
      <div><span>{label}</span><strong>{value}</strong></div>
      <div className="score-track"><span style={{ width: `${value}%` }} /></div>
    </div>
  );
}

export function DebriefScreen({ onExit }: { onExit?: () => void }) {
  const { state, scenario, dispatch } = useGame();
  const ending = selectEnding(state, scenario);
  const score = selectScore(state);
  const clues = selectClues(state, scenario);
  const actions = selectEffectiveActions(state, scenario);
  const safe = state.endingId === "verified-path";
  const contained = state.endingId === "contained";
  const causeChain = safe
    ? [
        ["Local cue", "Checked the official names posted in Bobst Library"],
        ["Source check", "The sign-in page root domain was nyu.edu"],
        ["Permission boundary", "No unrelated proxy or certificate was installed"],
        ["Result", "Only the Brightspace submission was completed"],
      ]
    : [
        ["Pressure", "The deadline and strong signal compressed decision time"],
        ["Evidence", "The sign-in page root domain was not nyu.edu"],
        ["Permission", "The profile requested proxy and certificate changes"],
        ["Consequence", "Account sessions and sent messages became abnormal"],
      ];

  return (
    <main className={`debrief-screen debrief-screen--${state.endingId}`}>
      <header className="debrief-topbar">
        <BrandLockup />
        <div><span>CASE 01</span><strong>Final Submission</strong></div>
      </header>

      <div className="debrief-body">
        <section className="ending-hero">
          <div className="ending-icon">{safe ? <ShieldCheck size={30} /> : contained ? <CheckCircle2 size={30} /> : <TriangleAlert size={30} />}</div>
          <div>
            <span className="ending-eyebrow">{ending.eyebrow} · INCIDENT REVIEW</span>
            <h1>{ending.title}</h1>
            <p>{ending.summary}</p>
            <small>{ending.detail}</small>
          </div>
          <div className="ending-fact">
            <span>TASK RESULT</span>
            <strong><Check size={15} /> Assignment submitted</strong>
            <p>{safe ? "No account or device anomalies" : "The submission is valid, but the connection triggered later events"}</p>
          </div>
        </section>

        <div className="debrief-grid">
          <section className="debrief-section score-section">
            <header><span>01</span><div><h2>Your judgment</h2><p>Shown only after the outcome</p></div></header>
            <div className="score-list">
              <ScoreMeter label="Evidence recognition" value={score.recognition} />
              <ScoreMeter label="Permission awareness" value={score.awareness} />
              <ScoreMeter label="Response coverage" value={score.response} />
            </div>
          </section>

          <section className="debrief-section timeline-section" data-testid="event-timeline">
            <header><span>02</span><div><h2>What happened</h2><p>Built from the actions you took</p></div></header>
            <ol className="event-timeline">
              {state.eventLog.map((event) => (
                <li key={event.id} className={`timeline-${event.tone}`}>
                  <time>{event.time}</time><i /><div><strong>{event.title}</strong>{event.detail ? <p>{event.detail}</p> : null}</div>
                </li>
              ))}
            </ol>
          </section>

          <section className="debrief-section evidence-section">
            <header><span>03</span><div><h2>{safe ? "Judgment that worked" : "Evidence along the way"}</h2><p>The clues were available, but required an active check</p></div></header>
            <ul className="clue-list">
              {clues.map((clue) => <li key={clue}><Lightbulb size={15} /><span>{clue}</span></li>)}
            </ul>
            {!safe ? (
              <div className="effective-actions"><h3>Effective containment actions</h3>{actions.length ? <ul>{actions.map((action) => <li key={action}><Check size={13} />{action}</li>)}</ul> : <p>No critical containment action was completed.</p>}</div>
            ) : null}
          </section>

          <section className="debrief-section replay-section">
            <header><span>04</span><div><h2>Where the outcome could change</h2><p>Replay from a critical moment</p></div></header>
            <div className="decision-path">
              <button onClick={() => dispatch({ type: "REPLAY_NETWORK" })}><span><Wifi size={16} /></span><div><strong>Choose a network</strong><small>Reconsider speed and verification cost</small></div><ArrowRight size={15} /></button>
              <i />
              <button onClick={() => dispatch({ type: "REPLAY_NETWORK" })}><span><ShieldCheck size={16} /></span><div><strong>Install the profile</strong><small>Review the publisher or cancel installation</small></div><ArrowRight size={15} /></button>
              {!safe ? <><i /><button onClick={() => dispatch({ type: "REPLAY_INCIDENT" })}><span><TriangleAlert size={16} /></span><div><strong>Receive the login alert</strong><small>Contain the incident from its first signal</small></div><ArrowRight size={15} /></button></> : null}
            </div>
          </section>
        </div>

        <section className="learning-transfer" aria-labelledby="learning-transfer-title">
          <header><span>05</span><div><h2 id="learning-transfer-title">Carry the judgment forward</h2><p>Rebuild the cause chain, then extract reusable checks</p></div></header>
          <div className="cause-chain">
            {causeChain.map(([label, text], index) => (
              <div className="cause-step" key={label}>
                <span>{label}</span><strong>{text}</strong>{index < causeChain.length - 1 ? <ArrowRight size={14} /> : null}
              </div>
            ))}
          </div>
          <div className="transfer-rules">
            <article><span>01</span><h3>Check the full network name</h3><p>Do not rely on a school-like name or strong signal. Compare the SSID character by character.</p></article>
            <article><span>02</span><h3>Read the root domain</h3><p>Before entering an account, confirm the page is controlled by nyu.edu, not merely a URL containing NYU.</p></article>
            <article><span>03</span><h3>Question extra permissions</h3><p>If basic internet access requires a proxy, certificate, or device profile, stop and use a trusted connection.</p></article>
            <article><span>04</span><h3>Contain each affected layer</h3><p>Handle the account session, device profile, impersonated message, and IT report separately.</p></article>
          </div>
        </section>

        {state.correctPathVisible ? (
          <section className="correct-path" aria-label="A more reliable path">
            <header><Lightbulb size={18} /><div><h2>A more reliable path</h2><p>The goal is not memorizing one name; it is verifying source and permissions.</p></div></header>
            <ol>{scenario.debrief.correctPath.map((step) => <li key={step}>{step}</li>)}</ol>
          </section>
        ) : null}

        <footer className="debrief-actions">
          {onExit ? <PixelButton icon={<LayoutGrid size={15} />} onClick={onExit}>Return to case library</PixelButton> : null}
          <PixelButton icon={<Lightbulb size={15} />} onClick={() => dispatch({ type: "SHOW_CORRECT_PATH" })}>{state.correctPathVisible ? "Hide reliable path" : "Show reliable path"}</PixelButton>
          <PixelButton icon={<RotateCcw size={15} />} onClick={() => dispatch({ type: safe ? "REPLAY_NETWORK" : "REPLAY_INCIDENT" })}>Retry critical moment</PixelButton>
          <PixelButton variant="primary" icon={<RefreshCcw size={15} />} onClick={() => dispatch({ type: "RESET_FULL" })}>Replay the full case</PixelButton>
        </footer>
      </div>
    </main>
  );
}
