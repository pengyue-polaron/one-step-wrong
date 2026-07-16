"use client";

import { Check, FileKey2, Router, Signal, Trash2, Unplug, Wifi } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/cases/final-submission/state/GameContext";
import { WindowFrame } from "@/cases/final-submission/components/windows/WindowFrame";

export function NetworkSettingsWindow() {
  const { state, dispatch } = useGame();
  const unsafe = state.selectedNetwork === "campus-free-5g";
  const currentName = state.selectedNetwork === "mobile-hotspot" ? "Maya's iPhone" : state.selectedNetwork === "campus-secure" ? "nyu" : state.selectedNetwork === "campus-guest" ? "nyuguest" : unsafe ? "NYU_Free_5G" : "Not connected";
  return (
    <WindowFrame id="network" title="Network settings" icon={<Router size={15} />} tone="system">
      <div className="network-settings">
        <header><div className="settings-hero-icon"><Wifi size={24} /></div><div><span className="step-label">CURRENT CONNECTION</span><h2>{state.networkDisconnected ? "Not connected" : currentName}</h2><p>{state.networkDisconnected ? "Choose an available network to reconnect." : state.connectionReady ? "Connected with internet access." : "The network connection is unstable."}</p></div></header>
        <section>
          <h3>This network</h3>
          <article className="network-setting-row">
            <span><Signal size={18} /></span><div><strong>{currentName}</strong><p>{unsafe ? "Open network · Auto-join" : "Saved network"}</p></div>
            <div className="row-actions">
              <PixelButton disabled={state.networkDisconnected} icon={state.networkDisconnected ? <Check size={13} /> : <Unplug size={13} />} onClick={() => dispatch({ type: "RESPONSE_ACTION", action: "disconnect-network" })}>{state.networkDisconnected ? "Disconnected" : "Disconnect"}</PixelButton>
              {unsafe ? <PixelButton disabled={state.unsafeNetworkForgotten} icon={<Trash2 size={13} />} onClick={() => dispatch({ type: "RESPONSE_ACTION", action: "forget-network" })}>{state.unsafeNetworkForgotten ? "Forgotten" : "Forget network"}</PixelButton> : null}
            </div>
          </article>
        </section>
        {state.profileInstalled || state.profileRemoved ? (
          <section data-testid="installed-profile">
            <h3>Installed network profiles</h3>
            <article className={`network-setting-row profile-row ${state.profileRemoved ? "is-removed" : ""}`}>
              <span><FileKey2 size={18} /></span>
              <div><strong>NYU Network Access</strong><p>{state.profileRemoved ? "Removed" : "Publisher: Unverified · Installed at 23:49"}</p></div>
              <PixelButton disabled={state.profileRemoved} icon={state.profileRemoved ? <Check size={13} /> : <Trash2 size={13} />} onClick={() => dispatch({ type: "RESPONSE_ACTION", action: "remove-profile" })}>{state.profileRemoved ? "Profile removed" : "Remove profile"}</PixelButton>
            </article>
          </section>
        ) : (
          <section><h3>Installed network profiles</h3><div className="empty-settings"><FileKey2 size={22} /><p>No additional network profiles.</p></div></section>
        )}
        {unsafe && state.phase === "response" ? <div className="settings-note">Disconnecting does not remove an installed profile. Review both items separately.</div> : null}
      </div>
    </WindowFrame>
  );
}
