"use client";

import { Check, FileKey2, Router, Signal, Trash2, Unplug, Wifi } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/state/GameContext";
import { WindowFrame } from "@/components/windows/WindowFrame";

export function NetworkSettingsWindow() {
  const { state, dispatch } = useGame();
  const unsafe = state.selectedNetwork === "campus-free-5g";
  const currentName = state.selectedNetwork === "mobile-hotspot" ? "Maya 的 iPhone" : state.selectedNetwork === "campus-secure" ? "nyu" : state.selectedNetwork === "campus-guest" ? "nyuguest" : unsafe ? "NYU_Free_5G" : "未连接";
  return (
    <WindowFrame id="network" title="网络设置" icon={<Router size={15} />} tone="system">
      <div className="network-settings">
        <header><div className="settings-hero-icon"><Wifi size={24} /></div><div><span className="step-label">当前连接</span><h2>{state.networkDisconnected ? "未连接" : currentName}</h2><p>{state.networkDisconnected ? "选择可用网络以重新连接。" : state.connectionReady ? "已连接，可以访问互联网。" : "网络连接不稳定。"}</p></div></header>
        <section>
          <h3>此网络</h3>
          <article className="network-setting-row">
            <span><Signal size={18} /></span><div><strong>{currentName}</strong><p>{unsafe ? "开放网络 · 自动连接" : "已保存的网络"}</p></div>
            <div className="row-actions">
              <PixelButton disabled={state.networkDisconnected} icon={state.networkDisconnected ? <Check size={13} /> : <Unplug size={13} />} onClick={() => dispatch({ type: "RESPONSE_ACTION", action: "disconnect-network" })}>{state.networkDisconnected ? "已断开" : "断开"}</PixelButton>
              {unsafe ? <PixelButton disabled={state.unsafeNetworkForgotten} icon={<Trash2 size={13} />} onClick={() => dispatch({ type: "RESPONSE_ACTION", action: "forget-network" })}>{state.unsafeNetworkForgotten ? "已忘记" : "忘记网络"}</PixelButton> : null}
            </div>
          </article>
        </section>
        {state.profileInstalled || state.profileRemoved ? (
          <section data-testid="installed-profile">
            <h3>已安装的网络配置</h3>
            <article className={`network-setting-row profile-row ${state.profileRemoved ? "is-removed" : ""}`}>
              <span><FileKey2 size={18} /></span>
              <div><strong>NYU Network Access</strong><p>{state.profileRemoved ? "已删除" : "发布者：无法验证 · 安装于 23:49"}</p></div>
              <PixelButton disabled={state.profileRemoved} icon={state.profileRemoved ? <Check size={13} /> : <Trash2 size={13} />} onClick={() => dispatch({ type: "RESPONSE_ACTION", action: "remove-profile" })}>{state.profileRemoved ? "配置已删除" : "删除配置"}</PixelButton>
            </article>
          </section>
        ) : (
          <section><h3>已安装的网络配置</h3><div className="empty-settings"><FileKey2 size={22} /><p>没有额外网络配置。</p></div></section>
        )}
        {unsafe && state.phase === "response" ? <div className="settings-note">仅断开网络不会移除已经安装的配置。你可以分别检查这两个项目。</div> : null}
      </div>
    </WindowFrame>
  );
}
