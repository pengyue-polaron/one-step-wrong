"use client";

import { Check, CheckCircle2, ClipboardList, TicketCheck } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/cases/final-submission/state/GameContext";
import { WindowFrame } from "@/cases/final-submission/components/windows/WindowFrame";

export function ITReportWindow() {
  const { state, dispatch } = useGame();
  const inIncident = state.suspiciousLoginTriggered || state.phase === "response";
  return (
    <WindowFrame id="it-report" title="NYU IT Service Desk" icon={<TicketCheck size={15} />} address="https://www.nyu.edu/it/report">
      <div className="support-page">
        <header><span className="support-mark">IT</span><div><span className="step-label">CAMPUS TECHNOLOGY SUPPORT</span><h2>Report a technology issue</h2><p>Report an account, device, or network issue. Urgent incidents are prioritized.</p></div></header>
        {state.itReported ? (
          <div className="ticket-success" data-testid="ticket-success"><CheckCircle2 size={31} /><h3>Ticket created</h3><p>NYU IT will help review the account and device.</p><dl><div><dt>Ticket</dt><dd>NYU-IT-2027</dd></div><div><dt>Status</dt><dd>Received</dd></div></dl></div>
        ) : inIncident ? (
          <form className="report-form" onSubmit={(event) => { event.preventDefault(); dispatch({ type: "RESPONSE_ACTION", action: "report-it" }); }}>
            <div className="form-grid">
              <label><span>Issue type</span><select defaultValue="suspicious-network"><option value="suspicious-network">Suspicious network</option><option>Account activity</option><option>Device profile</option><option>Other</option></select></label>
              <label><span>Time</span><input value="Today, 23:47 - 23:56" readOnly /></label>
              <label><span>Network name</span><input value="NYU_Free_5G" readOnly /></label>
              <label><span>Current status</span><select defaultValue="ongoing"><option value="ongoing">Incident found, response in progress</option><option>Incident stopped</option></select></label>
            </div>
            <fieldset className="report-checks"><legend>What happened</legend>
              <label><input type="checkbox" defaultChecked /><span><Check size={12} /></span>Entered an NYU NetID on the network page</label>
              <label><input type="checkbox" defaultChecked /><span><Check size={12} /></span>Installed a network profile</label>
              <label><input type="checkbox" defaultChecked /><span><Check size={12} /></span>Found an unknown-device login</label>
              <label><input type="checkbox" defaultChecked /><span><Check size={12} /></span>Account sent a message I did not write</label>
            </fieldset>
            <label className="report-description"><span>Short description</span><textarea value="I joined an open network named NYU_Free_5G and installed the network profile it requested. An unknown-device login and unexpected message followed." readOnly /></label>
            <div className="measures"><ClipboardList size={15} /><div><strong>Actions taken</strong><p>{[state.sessionsRevoked && "Ended session", state.profileRemoved && "Removed profile", state.classmatesWarned && "Warned classmate"].filter(Boolean).join(", ") || "None selected yet"}</p></div></div>
            <PixelButton variant="primary" type="submit">Submit ticket</PixelButton>
          </form>
        ) : (
          <div className="support-empty"><TicketCheck size={27} /><h3>Need technology support?</h3><p>Select an issue category to organize the necessary details.</p><PixelButton disabled>Create report</PixelButton></div>
        )}
      </div>
    </WindowFrame>
  );
}
