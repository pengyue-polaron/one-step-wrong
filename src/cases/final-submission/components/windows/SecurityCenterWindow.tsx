"use client";

import { Check, KeyRound, Laptop, MapPin, ShieldCheck, ShieldPlus, Smartphone, XCircle } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/cases/final-submission/state/GameContext";
import { WindowFrame } from "@/cases/final-submission/components/windows/WindowFrame";

export function SecurityCenterWindow() {
  const { state, dispatch } = useGame();
  const hasIncident = state.suspiciousLoginTriggered || state.phase === "response";
  return (
    <WindowFrame id="security" title="NYU NetID Security" icon={<ShieldCheck size={15} />} address="https://start.nyu.edu/security">
      <div className="settings-page">
        <aside className="settings-nav"><strong>Account settings</strong><span className="is-active">Signed-in devices</span><span>Password</span><span>Multi-factor authentication</span><span>Recent activity</span></aside>
        <main className="settings-main">
          <header><div><span className="step-label">NYU NetID</span><h2>Signed-in devices</h2><p>Review devices and sessions that are still active.</p></div><span className="account-chip">ls2841@nyu.edu</span></header>
          <section className="device-list">
            <article className="device-card">
              <span className="device-icon"><Laptop size={20} /></span>
              <div><strong>Current device</strong><p>NYU Study Desk · Current session</p><small><MapPin size={12} /> Bobst Library</small></div>
              <span className="current-label">This device</span>
            </article>
            {hasIncident ? (
              <article className={`device-card device-card--unknown ${state.sessionsRevoked ? "is-revoked" : ""}`} data-testid="unknown-session">
                <span className="device-icon"><Laptop size={20} /></span>
                <div><strong>Windows Browser</strong><p>{state.sessionsRevoked ? "Session ended" : "Unknown device · Active session"}</p><small><MapPin size={12} /> Location unknown · 23:53</small></div>
                <PixelButton
                  disabled={state.sessionsRevoked}
                  icon={state.sessionsRevoked ? <Check size={14} /> : <XCircle size={14} />}
                  onClick={() => dispatch({ type: "RESPONSE_ACTION", action: "revoke-session" })}
                >{state.sessionsRevoked ? "Ended" : "End this session"}</PixelButton>
              </article>
            ) : (
              <div className="empty-settings"><ShieldCheck size={23} /><p>No other active sessions.</p></div>
            )}
          </section>
          <div className="security-actions">
            <article><span><KeyRound size={18} /></span><div><strong>Account password</strong><p>{state.passwordChanged ? "Password changed during this response" : "Last changed 82 days ago"}</p></div><PixelButton disabled={state.passwordChanged} onClick={() => dispatch({ type: "RESPONSE_ACTION", action: "change-password" })}>{state.passwordChanged ? "Changed" : "Create and use a new password"}</PixelButton></article>
            <article><span><ShieldPlus size={18} /></span><div><strong>Multi-factor authentication</strong><p>{state.mfaEnabled ? "Authenticator enabled" : "Not currently enabled"}</p></div><PixelButton disabled={state.mfaEnabled} onClick={() => dispatch({ type: "RESPONSE_ACTION", action: "enable-mfa" })}>{state.mfaEnabled ? "Enabled" : "Enable verification"}</PixelButton></article>
          </div>
          <div className="activity-row"><Smartphone size={15} /><div><strong>Recent activity</strong><p>{hasIncident ? "23:53 Windows Browser completed sign-in" : "22:18 Current device completed sign-in"}</p></div></div>
        </main>
      </div>
    </WindowFrame>
  );
}
