"use client";

import { Check, MessageSquareText, Send, Trash2 } from "lucide-react";
import { copy } from "@/cases/final-submission/copy";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/cases/final-submission/state/GameContext";
import { WindowFrame } from "@/cases/final-submission/components/windows/WindowFrame";

export function ChatWindow() {
  const { state, dispatch } = useGame();
  const inResponse = state.phase === "response";
  return (
    <WindowFrame id="chat" title="Messages" icon={<MessageSquareText size={15} />} tone="system">
      <div className="chat-layout">
        <aside className="chat-list">
          <div className="chat-search">Search</div>
          <button className="chat-contact is-active"><span className="avatar">LX</span><div><strong>Lin Xiao</strong><small>{state.maliciousMessageSent ? copy.messages.suspiciousQuestion : copy.messages.initial}</small></div></button>
          <button className="chat-contact"><span className="avatar avatar--muted">C</span><div><strong>Course group</strong><small>See you Friday</small></div></button>
        </aside>
        <main className="conversation">
          <header><span className="avatar">LX</span><div><strong>Lin Xiao</strong><small>Online</small></div></header>
          <div className="messages" aria-live="polite">
            <div className="message message--incoming"><p>{copy.messages.initial}</p><small>23:46</small></div>
            {state.assignmentSubmitted ? <div className="message message--incoming"><p>{copy.messages.followup}</p><small>23:53</small></div> : null}
            {state.maliciousMessageSent ? (
              <>
                <div className={`message message--outgoing message--forged ${state.maliciousMessageDeleted ? "is-deleted" : ""}`} data-testid="forged-message">
                  <p>{state.maliciousMessageDeleted ? "You deleted a message" : copy.messages.forged}</p><small>23:55 · Sent</small>
                </div>
                <div className="message message--incoming"><p>{copy.messages.suspiciousQuestion}</p><small>23:55</small></div>
                <div className="message message--incoming"><p>{copy.messages.suspiciousFollowup}</p><small>23:56</small></div>
              </>
            ) : null}
            {state.warningQuality > 0 ? (
              <div className="message message--outgoing"><p>{state.warningQuality === 2 ? "I joined a network that may be unsafe. Do not open the network link sent from my account or install its profile. I contacted IT." : "Do not open that link. My account may be compromised."}</p><small>23:57 · Sent</small></div>
            ) : null}
          </div>
          {inResponse && state.maliciousMessageSent ? (
            <div className="chat-response-tools">
              <div>
                <PixelButton disabled={state.maliciousMessageDeleted} icon={state.maliciousMessageDeleted ? <Check size={14} /> : <Trash2 size={14} />} onClick={() => dispatch({ type: "RESPONSE_ACTION", action: "delete-message" })}>
                  {state.maliciousMessageDeleted ? "Unexpected message deleted" : "Delete unexpected message"}
                </PixelButton>
              </div>
              <fieldset><legend>Send a warning</legend>
                <button className={state.warningQuality === 1 ? "is-selected" : ""} onClick={() => dispatch({ type: "RESPONSE_ACTION", action: "warn-brief" })}>Do not open that link. My account may be compromised.</button>
                <button className={state.warningQuality === 2 ? "is-selected" : ""} onClick={() => dispatch({ type: "RESPONSE_ACTION", action: "warn-clear" })}>Explain the suspicious network, link, and profile, and say that IT has been contacted.</button>
                <button onClick={() => dispatch({ type: "RESPONSE_ACTION", action: "warn-none" })}>It is fine. Ignore it for now.</button>
              </fieldset>
            </div>
          ) : (
            <div className="chat-composer"><span>Type a message...</span><PixelButton icon={<Send size={14} />} disabled={state.calmActions.includes("reply")} onClick={() => dispatch({ type: "CALM_ACTION", action: "reply" })}>{state.calmActions.includes("reply") ? "Replied" : "Reply"}</PixelButton></div>
          )}
        </main>
      </div>
    </WindowFrame>
  );
}
