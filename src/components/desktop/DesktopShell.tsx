"use client";

import { AppDock } from "@/components/desktop/AppDock";
import { DevPanel } from "@/components/desktop/DevPanel";
import { IntroOverlay } from "@/components/desktop/IntroOverlay";
import { SystemBar } from "@/components/desktop/SystemBar";
import { TaskPanel } from "@/components/desktop/TaskPanel";
import { CertificateDialog } from "@/components/network/CertificateDialog";
import { NetworkPanel } from "@/components/network/NetworkPanel";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { NotificationToast } from "@/components/notifications/NotificationToast";
import { CalendarWindow } from "@/components/windows/CalendarWindow";
import { CaptivePortalWindow } from "@/components/windows/CaptivePortalWindow";
import { ChatWindow } from "@/components/windows/ChatWindow";
import { CourseSystemWindow } from "@/components/windows/CourseSystemWindow";
import { ITReportWindow } from "@/components/windows/ITReportWindow";
import { NetworkSettingsWindow } from "@/components/windows/NetworkSettingsWindow";
import { SecurityCenterWindow } from "@/components/windows/SecurityCenterWindow";
import { useGame } from "@/state/GameContext";

const windows = {
  course: <CourseSystemWindow />,
  portal: <CaptivePortalWindow />,
  chat: <ChatWindow />,
  security: <SecurityCenterWindow />,
  network: <NetworkSettingsWindow />,
  "it-report": <ITReportWindow />,
  calendar: <CalendarWindow />,
};

export function DesktopShell({ onExit }: { onExit?: () => void }) {
  const { state } = useGame();
  const activeWindow = state.openWindows.includes(state.activeWindow) ? windows[state.activeWindow] : null;
  const hasSidePanel = state.networkPanelOpen || state.notificationCenterOpen;
  return (
    <main className={`desktop-shell ${state.reducedMotion ? "reduce-motion" : ""} ${hasSidePanel ? "has-side-panel" : ""}`}>
      <div className="desktop-wallpaper" aria-hidden="true" />
      <SystemBar onExit={onExit} />
      {state.started ? <TaskPanel /> : null}
      <div className="window-stage">{activeWindow}</div>
      {state.networkPanelOpen ? <NetworkPanel /> : null}
      {state.notificationCenterOpen ? <NotificationCenter /> : null}
      <NotificationToast />
      {state.started ? <AppDock /> : null}
      <CertificateDialog />
      <DevPanel />
      <IntroOverlay />
      <div className="small-screen-note">建议在宽度 1100 px 以上的桌面浏览器中体验。</div>
    </main>
  );
}
