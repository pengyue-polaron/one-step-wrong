"use client";

import { FileKey2 } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/cases/final-submission/state/GameContext";

export function CertificateDialog() {
  const { state, dispatch } = useGame();
  if (!state.installDialogOpen) return null;
  return (
    <div className="modal-scrim" role="presentation">
      <section className="system-dialog" role="dialog" aria-modal="true" aria-labelledby="install-title" data-testid="install-dialog">
        <div className="dialog-icon"><FileKey2 size={25} /></div>
        <div className="dialog-copy">
          <span className="dialog-kicker">SYSTEM SETTINGS</span>
          <h2 id="install-title">Install network profile?</h2>
          <p>&ldquo;NYU Network Access&rdquo; will change this device&apos;s network settings.</p>
          <dl className="profile-meta">
            <div><dt>Publisher</dt><dd>Unverified</dd></div>
            <div><dt>Source</dt><dd>nyu-access.test</dd></div>
            <div><dt>Includes</dt><dd>Network proxy, trusted certificate</dd></div>
          </dl>
          <div className="dialog-actions">
            <PixelButton onClick={() => dispatch({ type: "CANCEL_INSTALL" })}>Cancel</PixelButton>
            <PixelButton variant="primary" onClick={() => dispatch({ type: "CONFIRM_INSTALL" })}>Continue installation</PixelButton>
          </div>
        </div>
      </section>
    </div>
  );
}
