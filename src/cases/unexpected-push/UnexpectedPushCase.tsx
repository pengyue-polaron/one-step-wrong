"use client";

import { Clock3, MonitorCheck, ShieldCheck, Smartphone, Users } from "lucide-react";
import type { CaseRunnerProps } from "@/cases/types";
import { unexpectedPushDefinition } from "@/cases/unexpected-push/definition";
import { PixelButton } from "@/components/ui/PixelButton";
import { DecisionCaseRunner } from "@/engine/decision/DecisionCaseRunner";
import { OptionButton } from "@/engine/decision/components/ChapterChrome";
import type { DecisionSceneProps } from "@/engine/decision/types";

function UnexpectedPushIntroScene() {
  return (
    <>
      <span className="scene-phone"><Smartphone size={58} /><i /><i /><i /></span>
      <span className="scene-push scene-push--one">LOGIN REQUEST</span>
      <span className="scene-push scene-push--two">LOGIN REQUEST</span>
      <span className="scene-browser"><MonitorCheck size={42} /></span>
    </>
  );
}

function UnexpectedPushScene({ definition, onSelect }: DecisionSceneProps) {
  const verifyOption = definition.decision.options.find((option) => option.id === "verify-browser");
  const phoneOptions = definition.decision.options.filter((option) => option.id !== "verify-browser");
  return (
    <section className="duo-workspace" aria-label="NYU Duo login verification">
      <div className="zoom-window tool-window">
        <header className="tool-titlebar"><div><span className="zoom-mark">Z</span><strong>NYU Zoom</strong></div><span>nyu.zoom.us</span></header>
        <main>
          <span className="step-label">UPCOMING MEETING</span>
          <h2>Advising · Fall Registration</h2>
          <p>Host: Professor Elena Ruiz</p>
          <div className="meeting-details"><div><Clock3 size={15} /><span>18:00–18:25</span></div><div><Users size={15} /><span>Waiting for you</span></div></div>
          <PixelButton disabled>Sign in with NYU</PixelButton>
          <small>You have not entered your NetID on this page.</small>
          {verifyOption ? <div className="browser-verify-action"><span>Verify the current page first</span><OptionButton option={verifyOption} onSelect={onSelect} /></div> : null}
        </main>
      </div>
      <div className="duo-phone">
        <div className="phone-status"><span>17:58</span><span>5G&nbsp;&nbsp;82%</span></div>
        <header><span className="duo-mark"><ShieldCheck size={20} /></span><div><strong>Duo Mobile</strong><small>Login request</small></div></header>
        <main>
          <span className="duo-request-count">Request 3 · Just now</span>
          <h2>NYU Login</h2>
          <dl><div><dt>Account</dt><dd>ls2841</dd></div><div><dt>Device</dt><dd>Chrome</dd></div><div><dt>Location</dt><dd>Jersey City, NJ</dd></div></dl>
          <div className="duo-options">{phoneOptions.map((option) => <OptionButton key={option.id} option={option} onSelect={onSelect} />)}</div>
        </main>
        <footer aria-hidden="true"><span /> Swipe bar</footer>
      </div>
    </section>
  );
}

export function UnexpectedPushCase(props: CaseRunnerProps) {
  return <DecisionCaseRunner definition={unexpectedPushDefinition} IntroScene={UnexpectedPushIntroScene} DecisionScene={UnexpectedPushScene} {...props} />;
}
