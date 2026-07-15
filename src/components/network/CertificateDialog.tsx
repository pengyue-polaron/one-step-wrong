"use client";

import { FileKey2, Info } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/state/GameContext";

export function CertificateDialog() {
  const { state, dispatch } = useGame();
  if (!state.installDialogOpen) return null;
  return (
    <div className="modal-scrim" role="presentation">
      <section className="system-dialog" role="dialog" aria-modal="true" aria-labelledby="install-title" data-testid="install-dialog">
        <div className="dialog-icon"><FileKey2 size={25} /></div>
        <div className="dialog-copy">
          <span className="dialog-kicker">系统设置</span>
          <h2 id="install-title">安装网络配置？</h2>
          <p>“Campus Network Access”将更改这台设备的网络设置。</p>
          <dl className="profile-meta">
            <div><dt>发布者</dt><dd>无法验证</dd></div>
            <div><dt>来源</dt><dd>campus-connect.local</dd></div>
            <div><dt>包含</dt><dd>网络代理、受信任证书</dd></div>
          </dl>
          <div className="neutral-callout"><Info size={14} /> 此操作仅在当前游戏中模拟，不会修改设备设置。</div>
          <div className="dialog-actions">
            <PixelButton onClick={() => dispatch({ type: "CANCEL_INSTALL" })}>取消</PixelButton>
            <PixelButton variant="primary" onClick={() => dispatch({ type: "CONFIRM_INSTALL" })}>继续安装</PixelButton>
          </div>
        </div>
      </section>
    </div>
  );
}
