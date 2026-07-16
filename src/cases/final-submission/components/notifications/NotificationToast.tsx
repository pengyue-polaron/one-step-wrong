"use client";

import { AlertCircle, BookOpen, MessageSquareText, ShieldAlert, X } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/cases/final-submission/state/GameContext";

export function NotificationToast() {
  const { state, dispatch } = useGame();
  if (state.phase !== "incident") return null;

  if (state.incidentStep === 1) {
    return (
      <aside className="notification-toast notification-toast--incident" role="alert" data-testid="login-alert">
        <header><ShieldAlert size={17} /><strong>Account security alert</strong><AlertCircle size={15} /></header>
        <p>Your campus account signed in on a new device.</p>
        <dl><div><dt>Location</dt><dd>Unknown</dd></div><div><dt>Device</dt><dd>Windows Browser</dd></div></dl>
        <div className="toast-actions">
          <PixelButton variant="primary" onClick={() => dispatch({ type: "HANDLE_LOGIN_ALERT", choice: "review" })}>Review details</PixelButton>
          <PixelButton variant="quiet" onClick={() => dispatch({ type: "HANDLE_LOGIN_ALERT", choice: "mine" })}>This was me</PixelButton>
          <PixelButton variant="quiet" onClick={() => dispatch({ type: "HANDLE_LOGIN_ALERT", choice: "later" })}>Handle later</PixelButton>
        </div>
      </aside>
    );
  }

  if (state.incidentStep === 2) {
    return (
      <aside className="notification-toast notification-toast--notice" role="alert">
        <header><BookOpen size={17} /><strong>Course system</strong><X size={14} /></header>
        <p>Your current session expired. Verify your identity again.</p>
        <PixelButton variant="primary" onClick={() => dispatch({ type: "ADVANCE_INCIDENT" })}>Open course system</PixelButton>
      </aside>
    );
  }

  if (state.incidentStep === 3) {
    return (
      <aside className="notification-toast notification-toast--notice" role="alert">
        <header><MessageSquareText size={17} /><strong>Lin Xiao</strong><span>Just now</span></header>
        <p>What was that link you just sent me?</p>
        <PixelButton variant="primary" onClick={() => dispatch({ type: "ADVANCE_INCIDENT" })}>View message</PixelButton>
      </aside>
    );
  }

  if (state.incidentStep === 4) {
    return (
      <aside className="notification-toast notification-toast--incident" role="alert">
        <header><MessageSquareText size={17} /><strong>Lin Xiao</strong><span>Just now</span></header>
        <p>It wants me to install something too. What is this?</p>
        <PixelButton variant="primary" onClick={() => dispatch({ type: "ADVANCE_INCIDENT" })}>Review sent messages</PixelButton>
      </aside>
    );
  }

  return null;
}
