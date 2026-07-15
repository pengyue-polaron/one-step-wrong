"use client";

import { AlertCircle, BookOpen, MessageSquareText, ShieldAlert, X } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/state/GameContext";

export function NotificationToast() {
  const { state, dispatch } = useGame();
  if (state.phase !== "incident") return null;

  if (state.incidentStep === 1) {
    return (
      <aside className="notification-toast notification-toast--incident" role="alert" data-testid="login-alert">
        <header><ShieldAlert size={17} /><strong>账号安全提醒</strong><AlertCircle size={15} /></header>
        <p>检测到你的校园账号在新设备上登录。</p>
        <dl><div><dt>位置</dt><dd>未知</dd></div><div><dt>设备</dt><dd>Windows Browser</dd></div></dl>
        <div className="toast-actions">
          <PixelButton variant="primary" onClick={() => dispatch({ type: "HANDLE_LOGIN_ALERT", choice: "review" })}>查看详情</PixelButton>
          <PixelButton variant="quiet" onClick={() => dispatch({ type: "HANDLE_LOGIN_ALERT", choice: "mine" })}>是我本人</PixelButton>
          <PixelButton variant="quiet" onClick={() => dispatch({ type: "HANDLE_LOGIN_ALERT", choice: "later" })}>稍后处理</PixelButton>
        </div>
      </aside>
    );
  }

  if (state.incidentStep === 2) {
    return (
      <aside className="notification-toast notification-toast--notice" role="alert">
        <header><BookOpen size={17} /><strong>课程系统</strong><X size={14} /></header>
        <p>当前登录状态已失效，请重新验证身份。</p>
        <PixelButton variant="primary" onClick={() => dispatch({ type: "ADVANCE_INCIDENT" })}>打开课程系统</PixelButton>
      </aside>
    );
  }

  if (state.incidentStep === 3) {
    return (
      <aside className="notification-toast notification-toast--notice" role="alert">
        <header><MessageSquareText size={17} /><strong>林晓</strong><span>刚刚</span></header>
        <p>你刚才给我发的是什么链接？</p>
        <PixelButton variant="primary" onClick={() => dispatch({ type: "ADVANCE_INCIDENT" })}>查看消息</PixelButton>
      </aside>
    );
  }

  if (state.incidentStep === 4) {
    return (
      <aside className="notification-toast notification-toast--incident" role="alert">
        <header><MessageSquareText size={17} /><strong>林晓</strong><span>刚刚</span></header>
        <p>我点进去也让我装东西，这是什么？</p>
        <PixelButton variant="primary" onClick={() => dispatch({ type: "ADVANCE_INCIDENT" })}>查看发送记录</PixelButton>
      </aside>
    );
  }

  return null;
}
