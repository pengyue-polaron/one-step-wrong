"use client";

import { FileKey2 } from "lucide-react";
import { useCallback, useRef } from "react";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/cases/final-submission/state/GameContext";
import { useModalFocus } from "@/cases/final-submission/components/useModalFocus";

export function CertificateDialog() {
  const { state, dispatch } = useGame();
  const scrimRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const cancelInstall = useCallback(() => dispatch({ type: "CANCEL_INSTALL" }), [dispatch]);
  useModalFocus({
    active: state.installDialogOpen,
    modalRef: dialogRef,
    isolationRef: scrimRef,
    initialFocusSelector: "[data-certificate-cancel]",
    activeMediaQuery: "(min-width: 1100px)",
    onEscape: cancelInstall,
  });
  if (!state.installDialogOpen) return null;
  return (
    <div className="modal-scrim" ref={scrimRef} role="presentation">
      <section
        aria-describedby="install-description"
        aria-labelledby="install-title"
        aria-modal="true"
        className="system-dialog"
        data-testid="install-dialog"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="dialog-icon"><FileKey2 size={25} /></div>
        <div className="dialog-copy">
          <span className="dialog-kicker">SYSTEM SETTINGS</span>
          <h2 id="install-title">Install network profile?</h2>
          <p id="install-description">&ldquo;NYU Network Access&rdquo; will change this device&apos;s network settings.</p>
          <dl className="profile-meta">
            <div><dt>Publisher</dt><dd>Unverified</dd></div>
            <div><dt>Source</dt><dd>nyu-access.test</dd></div>
            <div><dt>Includes</dt><dd>Network proxy, trusted certificate</dd></div>
          </dl>
          <div className="dialog-actions">
            <PixelButton data-certificate-cancel onClick={cancelInstall}>Cancel</PixelButton>
            <PixelButton variant="primary" onClick={() => dispatch({ type: "CONFIRM_INSTALL" })}>Continue installation</PixelButton>
          </div>
        </div>
      </section>
    </div>
  );
}
