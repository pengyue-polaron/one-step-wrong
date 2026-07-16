"use client";

import { CheckCircle2, FileKey2, Globe2, LockKeyhole, MessageSquare, Smartphone, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { copy } from "@/cases/final-submission/copy";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/cases/final-submission/state/GameContext";
import { WindowFrame } from "@/cases/final-submission/components/windows/WindowFrame";

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
        <span className="step-label">NETWORK VERIFICATION</span>
        <h2>{guest ? "Connect to nyuguest" : "Verify NYU NetID"}</h2>
        <p>{guest ? "Use a one-time code to join the Bobst Library guest network." : "Use your NYU NetID to verify this device."}</p>
      </div>
      <div className="simulated-form" aria-label="Identity verification form">
        {guest ? (
          <>
            <label><span>Mobile number</span><div><Smartphone size={15} /><input value="212 •••• 2048" readOnly aria-label="Mobile number" /></div></label>
            <label><span>Verification code</span><div><MessageSquare size={15} /><input value="284 106" readOnly aria-label="Verification code" /></div></label>
            <label className="terms-check"><input type="checkbox" checked={terms} onChange={() => setTerms((value) => !value)} /><span />I accept the guest network terms</label>
          </>
        ) : (
          <>
            <label><span>NYU NetID</span><div><UserRound size={15} /><input value="ls2841@nyu.edu" readOnly aria-label="NYU NetID" /></div></label>
            <label><span>Verification method</span><div><LockKeyhole size={15} /><input value="Device confirmation ·••••" readOnly aria-label="Verification method" /></div></label>
          </>
        )}
        <PixelButton variant="primary" disabled={guest && !terms || connecting} onClick={() => setConnecting(true)}>
          {connecting ? "Verifying..." : guest ? "Connect to guest network" : "Verify and connect"}
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
        <span className="step-label">NEARBY DEVICE</span>
        <h2>Maya&apos;s iPhone</h2>
        <p>1.2 GB remains this month. This upload should use about 10 MB.</p>
        <dl><div><dt>Personal hotspot</dt><dd>{state.hotspotEnabled ? "On" : "Off"}</dd></div><div><dt>Connection time</dt><dd>About 6 sec</dd></div></dl>
        <PixelButton variant="primary" icon={<Smartphone size={15} />} onClick={() => dispatch({ type: "ENABLE_HOTSPOT" })}>Enable and connect</PixelButton>
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
        <h2>Connected, no internet</h2>
        <p>Opening the network sign-in page...</p>
        <i aria-hidden="true" />
      </div>
    );
  }
  if (state.portalStep === "identity") {
    return (
      <div className="portal-page">
        <div className="portal-brand"><span>NYU</span><div><strong>New York University</strong><small>Campus Access</small></div></div>
        <div className="portal-steps"><span className="is-current">1 Identity</span><i /><span>2 Network profile</span></div>
        <div className="portal-copy"><h2>{copy.portal.title}</h2><p>{copy.portal.body}</p></div>
        <div className="simulated-form">
          <label><span>NYU NetID / Email</span><div><UserRound size={15} /><input value="ls2841@nyu.edu" readOnly aria-label="NYU NetID" /></div></label>
          <label><span>Password</span><div><LockKeyhole size={15} /><input value="••••••••••••" readOnly aria-label="Password" /></div></label>
          <PixelButton variant="primary" onClick={() => dispatch({ type: "PORTAL_IDENTITY" })}>Continue</PixelButton>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-page">
      <div className="portal-brand"><span>NYU</span><div><strong>New York University</strong><small>Campus Access</small></div></div>
      <div className="portal-steps"><span>1 Identity</span><i className="is-done" /><span className="is-current">2 Network profile</span></div>
      <div className="profile-download">
        <span className="profile-file"><FileKey2 size={27} /></span>
        <div><span className="step-label">SETUP INCOMPLETE</span><h2>Install the campus network profile</h2><p>Your device will automatically join available campus networks and improve upload stability.</p></div>
      </div>
      <ul className="benefit-list"><li><CheckCircle2 size={14} /> More stable access</li><li><CheckCircle2 size={14} /> Automatic campus connection</li><li><CheckCircle2 size={14} /> Faster uploads</li></ul>
      {state.profileDetailsViewed ? (
        <dl className="profile-details" data-testid="profile-details">
          <div><dt>Publisher</dt><dd>Unverified</dd></div>
          <div><dt>Profile source</dt><dd>nyu-access.test</dd></div>
          <div><dt>Will change</dt><dd>Network proxy and certificate settings</dd></div>
        </dl>
      ) : null}
      <div className="portal-actions">
        <PixelButton variant="primary" onClick={() => dispatch({ type: "REQUEST_INSTALL" })}>Download and install</PixelButton>
        <PixelButton onClick={() => dispatch({ type: "DEFER_PROFILE" })}>Later</PixelButton>
        <PixelButton variant="quiet" onClick={() => dispatch({ type: "VIEW_PROFILE_DETAILS" })}>View details</PixelButton>
      </div>
      <small className="portal-footnote">One-time setup, estimated 15 seconds.</small>
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
  const title = official ? "NYU NetID Login" : guest ? "NYU Guest Wireless" : hotspot ? "Nearby device" : "Network access";
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
