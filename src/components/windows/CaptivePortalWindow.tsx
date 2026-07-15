"use client";

import { CheckCircle2, FileKey2, Globe2, LockKeyhole, MessageSquare, Smartphone, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { copy } from "@/scenarios/final-submission/copy";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/state/GameContext";
import { WindowFrame } from "@/components/windows/WindowFrame";

function OfficialAuth({ guest = false }: { guest?: boolean }) {
  const { dispatch } = useGame();
  const [terms, setTerms] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (!connecting) return;
    const timer = window.setTimeout(() => dispatch({ type: "AUTHENTICATE_NETWORK" }), 900);
    return () => window.clearTimeout(timer);
  }, [connecting, dispatch]);

  return (
    <div className="auth-page">
      <div className="auth-brand"><span>NYU</span><div><strong>New York University</strong><small>{guest ? "Guest Wireless" : "NetID Login"}</small></div></div>
      <div className="auth-copy">
        <span className="step-label">网络验证</span>
        <h2>{guest ? "连接 nyuguest" : "验证 NYU NetID"}</h2>
        <p>{guest ? "使用一次性验证码连接 Bobst Library 访客网络。" : "使用 NYU NetID 确认这台设备。"}</p>
      </div>
      <div className="simulated-form" aria-label="身份验证表单">
        {guest ? (
          <>
            <label><span>手机号码</span><div><Smartphone size={15} /><input value="212 •••• 2048" readOnly aria-label="手机号码" /></div></label>
            <label><span>验证码</span><div><MessageSquare size={15} /><input value="284 106" readOnly aria-label="验证码" /></div></label>
            <label className="terms-check"><input type="checkbox" checked={terms} onChange={() => setTerms((value) => !value)} /><span />我接受访客网络使用条款</label>
          </>
        ) : (
          <>
            <label><span>NYU NetID</span><div><UserRound size={15} /><input value="ls2841@nyu.edu" readOnly aria-label="NYU NetID" /></div></label>
            <label><span>验证方式</span><div><LockKeyhole size={15} /><input value="设备确认 ·••••" readOnly aria-label="验证方式" /></div></label>
          </>
        )}
        <PixelButton variant="primary" disabled={guest && !terms || connecting} onClick={() => setConnecting(true)}>
          {connecting ? "正在验证…" : guest ? "连接访客网络" : "验证并连接"}
        </PixelButton>
      </div>
    </div>
  );
}

function HotspotSetup() {
  const { state, dispatch } = useGame();
  return (
    <div className="hotspot-page">
      <div className="phone-pixel" aria-hidden="true"><span>23:48</span><Smartphone size={30} /><i /></div>
      <div>
        <span className="step-label">附近设备</span>
        <h2>Maya 的 iPhone</h2>
        <p>本月剩余流量 1.2 GB。上传这份文件预计消耗约 10 MB。</p>
        <dl><div><dt>个人热点</dt><dd>{state.hotspotEnabled ? "已开启" : "关闭"}</dd></div><div><dt>连接准备</dt><dd>约 6 秒</dd></div></dl>
        <PixelButton variant="primary" icon={<Smartphone size={15} />} onClick={() => dispatch({ type: "ENABLE_HOTSPOT" })}>开启并连接</PixelButton>
      </div>
    </div>
  );
}

function FakePortal({ ready }: { ready: boolean }) {
  const { state, dispatch } = useGame();
  if (!ready) {
    return (
      <div className="portal-connecting" role="status">
        <span><Globe2 size={27} /></span>
        <h2>已连接，无互联网</h2>
        <p>正在打开网络登录页面…</p>
        <i aria-hidden="true" />
      </div>
    );
  }
  if (state.portalStep === "identity") {
    return (
      <div className="portal-page">
        <div className="portal-brand"><span>NYU</span><div><strong>New York University</strong><small>Campus Access</small></div></div>
        <div className="portal-steps"><span className="is-current">1 身份验证</span><i /><span>2 网络配置</span></div>
        <div className="portal-copy"><h2>{copy.portal.title}</h2><p>{copy.portal.body}</p></div>
        <div className="simulated-form">
          <label><span>NYU NetID / 邮箱</span><div><UserRound size={15} /><input value="ls2841@nyu.edu" readOnly aria-label="NYU NetID" /></div></label>
          <label><span>密码</span><div><LockKeyhole size={15} /><input value="••••••••••••" readOnly aria-label="密码" /></div></label>
          <PixelButton variant="primary" onClick={() => dispatch({ type: "PORTAL_IDENTITY" })}>继续</PixelButton>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-page">
      <div className="portal-brand"><span>NYU</span><div><strong>New York University</strong><small>Campus Access</small></div></div>
      <div className="portal-steps"><span>1 身份验证</span><i className="is-done" /><span className="is-current">2 网络配置</span></div>
      <div className="profile-download">
        <span className="profile-file"><FileKey2 size={27} /></span>
        <div><span className="step-label">网络配置未完成</span><h2>安装校园网络配置</h2><p>安装后设备将自动连接可用校园网络，并提升上传稳定性。</p></div>
      </div>
      <ul className="benefit-list"><li><CheckCircle2 size={14} /> 更稳定的访问</li><li><CheckCircle2 size={14} /> 自动连接校园网络</li><li><CheckCircle2 size={14} /> 更快的上传速度</li></ul>
      {state.profileDetailsViewed ? (
        <dl className="profile-details" data-testid="profile-details">
          <div><dt>发布者</dt><dd>无法验证</dd></div>
          <div><dt>配置来源</dt><dd>nyu-access.test</dd></div>
          <div><dt>将更改</dt><dd>网络代理、证书设置</dd></div>
        </dl>
      ) : null}
      <div className="portal-actions">
        <PixelButton variant="primary" onClick={() => dispatch({ type: "REQUEST_INSTALL" })}>下载并安装</PixelButton>
        <PixelButton onClick={() => dispatch({ type: "DEFER_PROFILE" })}>稍后</PixelButton>
        <PixelButton variant="quiet" onClick={() => dispatch({ type: "VIEW_PROFILE_DETAILS" })}>查看说明</PixelButton>
      </div>
      <small className="portal-footnote">配置仅需一次，预计 15 秒完成。</small>
    </div>
  );
}

export function CaptivePortalWindow() {
  const { state } = useGame();
  const [portalReady, setPortalReady] = useState(false);
  const official = state.selectedNetwork === "campus-secure";
  const guest = state.selectedNetwork === "campus-guest";
  const hotspot = state.selectedNetwork === "mobile-hotspot";
  const address = official ? copy.portal.officialAddress : guest ? copy.portal.guestAddress : hotspot ? "nearby://maya-iphone" : copy.portal.address;
  const title = official ? "NYU NetID Login" : guest ? "NYU Guest Wireless" : hotspot ? "附近设备" : "网络接入";
  useEffect(() => {
    if (official || guest || hotspot) return;
    const timer = window.setTimeout(() => setPortalReady(true), 850);
    return () => window.clearTimeout(timer);
  }, [official, guest, hotspot]);
  return (
    <WindowFrame id="portal" title={title} icon={<Globe2 size={15} />} address={address}>
      {official ? <OfficialAuth /> : guest ? <OfficialAuth guest /> : hotspot ? <HotspotSetup /> : <FakePortal ready={portalReady} />}
    </WindowFrame>
  );
}
