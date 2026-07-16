import { AlertTriangle, ArrowRight, CheckCircle2, History, ShieldAlert } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import { ChapterTopbar } from "@/engine/decision/components/ChapterChrome";
import type { DecisionCaseDefinition, DecisionOption } from "@/engine/decision/types";

export function OutcomeScreen({
  definition,
  choice,
  onContinue,
  onExit,
}: {
  definition: DecisionCaseDefinition;
  choice: DecisionOption;
  onContinue: () => void;
  onExit: () => void;
}) {
  const incident = choice.route === "incident";
  const caution = choice.route === "caution";
  const drive = definition.id === "shared-draft";
  const title = incident ? definition.incident.title : drive ? "Sharing settings updated" : caution ? "Request denied" : "Login source checked";
  const body = incident
    ? definition.incident.body
    : drive
      ? choice.route === "verified" ? "Three teammates received invitations, and the folder remains Restricted." : "The NYU community link is active, so the team can continue editing."
      : choice.route === "verified" ? "The current phone request did not match your browser activity. You restarted sign-in from Zoom." : "Duo recorded that you did not initiate this login, and the request was not approved.";
  return (
    <main className={`chapter-shell chapter-shell--${definition.tone}`}>
      <ChapterTopbar definition={definition} onExit={onExit} />
      <section className={`chapter-outcome ${incident ? "chapter-outcome--incident" : caution ? "chapter-outcome--caution" : ""}`}>
        <div className="outcome-status"><span>{incident ? <AlertTriangle size={30} /> : <CheckCircle2 size={30} />}</span><div><small>{incident ? definition.incident.delay : "Task status"}</small><h1>{title}</h1><p>{body}</p></div></div>
        <div className="outcome-evidence">
          <header><History size={16} /><strong>{incident ? "Activity record" : "This action"}</strong></header>
          {incident ? (
            <dl>{definition.incident.evidence.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
          ) : (
            <dl><div><dt>Choice</dt><dd>{choice.title}</dd></div><div><dt>Scope</dt><dd>{choice.meta}</dd></div><div><dt>Result</dt><dd>{drive ? "Collaboration can continue" : "Unauthorized login blocked"}</dd></div></dl>
          )}
        </div>
        <PixelButton variant="primary" icon={incident ? <ShieldAlert size={16} /> : <ArrowRight size={16} />} onClick={onContinue}>
          {incident ? (drive ? "Respond to sharing incident" : "Respond to account incident") : "Review what happened"}
        </PixelButton>
      </section>
    </main>
  );
}
