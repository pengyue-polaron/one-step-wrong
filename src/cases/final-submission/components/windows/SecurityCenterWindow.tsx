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
        <aside className="settings-nav"><strong>账号设置</strong><span className="is-active">登录设备</span><span>密码</span><span>二次验证</span><span>最近活动</span></aside>
        <main className="settings-main">
          <header><div><span className="step-label">NYU NetID</span><h2>登录设备</h2><p>查看当前仍保持登录的设备与会话。</p></div><span className="account-chip">ls2841@nyu.edu</span></header>
          <section className="device-list">
            <article className="device-card">
              <span className="device-icon"><Laptop size={20} /></span>
              <div><strong>当前设备</strong><p>NYU Study Desk · 当前会话</p><small><MapPin size={12} /> Bobst Library</small></div>
              <span className="current-label">本机</span>
            </article>
            {hasIncident ? (
              <article className={`device-card device-card--unknown ${state.sessionsRevoked ? "is-revoked" : ""}`} data-testid="unknown-session">
                <span className="device-icon"><Laptop size={20} /></span>
                <div><strong>Windows Browser</strong><p>{state.sessionsRevoked ? "会话已退出" : "未知设备 · 活动会话"}</p><small><MapPin size={12} /> 位置未知 · 23:53</small></div>
                <PixelButton
                  disabled={state.sessionsRevoked}
                  icon={state.sessionsRevoked ? <Check size={14} /> : <XCircle size={14} />}
                  onClick={() => dispatch({ type: "RESPONSE_ACTION", action: "revoke-session" })}
                >{state.sessionsRevoked ? "已退出" : "退出此设备"}</PixelButton>
              </article>
            ) : (
              <div className="empty-settings"><ShieldCheck size={23} /><p>没有其他活动会话。</p></div>
            )}
          </section>
          <div className="security-actions">
            <article><span><KeyRound size={18} /></span><div><strong>账号密码</strong><p>{state.passwordChanged ? "密码已在本次响应中修改" : "上次修改：82 天前"}</p></div><PixelButton disabled={state.passwordChanged} onClick={() => dispatch({ type: "RESPONSE_ACTION", action: "change-password" })}>{state.passwordChanged ? "已修改" : "生成并使用新密码"}</PixelButton></article>
            <article><span><ShieldPlus size={18} /></span><div><strong>二次验证</strong><p>{state.mfaEnabled ? "验证器已启用" : "当前未启用"}</p></div><PixelButton disabled={state.mfaEnabled} onClick={() => dispatch({ type: "RESPONSE_ACTION", action: "enable-mfa" })}>{state.mfaEnabled ? "已开启" : "开启验证"}</PixelButton></article>
          </div>
          <div className="activity-row"><Smartphone size={15} /><div><strong>最近活动</strong><p>{hasIncident ? "23:53 Windows Browser 完成登录" : "22:18 当前设备完成登录"}</p></div></div>
        </main>
      </div>
    </WindowFrame>
  );
}
