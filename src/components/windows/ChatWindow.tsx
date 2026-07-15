"use client";

import { Check, MessageSquareText, Send, Trash2 } from "lucide-react";
import { copy } from "@/scenarios/final-submission/copy";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/state/GameContext";
import { WindowFrame } from "@/components/windows/WindowFrame";

export function ChatWindow() {
  const { state, dispatch } = useGame();
  const inResponse = state.phase === "response";
  return (
    <WindowFrame id="chat" title="消息" icon={<MessageSquareText size={15} />} tone="system">
      <div className="chat-layout">
        <aside className="chat-list">
          <div className="chat-search">搜索</div>
          <button className="chat-contact is-active"><span className="avatar">林</span><div><strong>林晓</strong><small>{state.maliciousMessageSent ? copy.messages.suspiciousQuestion : copy.messages.initial}</small></div></button>
          <button className="chat-contact"><span className="avatar avatar--muted">课</span><div><strong>课程小组</strong><small>周五见</small></div></button>
        </aside>
        <main className="conversation">
          <header><span className="avatar">林</span><div><strong>林晓</strong><small>在线</small></div></header>
          <div className="messages" aria-live="polite">
            <div className="message message--incoming"><p>{copy.messages.initial}</p><small>23:46</small></div>
            {state.assignmentSubmitted ? <div className="message message--incoming"><p>{copy.messages.followup}</p><small>23:53</small></div> : null}
            {state.maliciousMessageSent ? (
              <>
                <div className={`message message--outgoing message--forged ${state.maliciousMessageDeleted ? "is-deleted" : ""}`} data-testid="forged-message">
                  <p>{state.maliciousMessageDeleted ? "你删除了一条消息" : copy.messages.forged}</p><small>23:55 · 已发送</small>
                </div>
                <div className="message message--incoming"><p>{copy.messages.suspiciousQuestion}</p><small>23:55</small></div>
                <div className="message message--incoming"><p>{copy.messages.suspiciousFollowup}</p><small>23:56</small></div>
              </>
            ) : null}
            {state.warningQuality > 0 ? (
              <div className="message message--outgoing"><p>{state.warningQuality === 2 ? "我刚才连接了一个可能有问题的网络。请不要打开由我发送的网络入口，也不要安装配置文件。我已联系 IT。" : "刚才那个链接不要点，我账号可能出了问题。"}</p><small>23:57 · 已发送</small></div>
            ) : null}
          </div>
          {inResponse && state.maliciousMessageSent ? (
            <div className="chat-response-tools">
              <div>
                <PixelButton disabled={state.maliciousMessageDeleted} icon={state.maliciousMessageDeleted ? <Check size={14} /> : <Trash2 size={14} />} onClick={() => dispatch({ type: "RESPONSE_ACTION", action: "delete-message" })}>
                  {state.maliciousMessageDeleted ? "异常消息已删除" : "删除异常消息"}
                </PixelButton>
              </div>
              <fieldset><legend>发送提醒</legend>
                <button className={state.warningQuality === 1 ? "is-selected" : ""} onClick={() => dispatch({ type: "RESPONSE_ACTION", action: "warn-brief" })}>刚才那个链接不要点，我账号可能出了问题。</button>
                <button className={state.warningQuality === 2 ? "is-selected" : ""} onClick={() => dispatch({ type: "RESPONSE_ACTION", action: "warn-clear" })}>说明可疑网络、链接和配置文件，并告知已联系 IT。</button>
                <button onClick={() => dispatch({ type: "RESPONSE_ACTION", action: "warn-none" })}>没事，先别管。</button>
              </fieldset>
            </div>
          ) : (
            <div className="chat-composer"><span>输入消息…</span><PixelButton icon={<Send size={14} />} disabled={state.calmActions.includes("reply")} onClick={() => dispatch({ type: "CALM_ACTION", action: "reply" })}>{state.calmActions.includes("reply") ? "已回复" : "回复"}</PixelButton></div>
          )}
        </main>
      </div>
    </WindowFrame>
  );
}
