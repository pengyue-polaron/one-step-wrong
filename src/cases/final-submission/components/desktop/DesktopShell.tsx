"use client";

import { LayoutGrid, MonitorUp } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import { AppDock } from "@/cases/final-submission/components/desktop/AppDock";
import { DevPanel } from "@/cases/final-submission/components/desktop/DevPanel";
import { IntroOverlay } from "@/cases/final-submission/components/desktop/IntroOverlay";
import { SystemBar } from "@/cases/final-submission/components/desktop/SystemBar";
import { TaskPanel } from "@/cases/final-submission/components/desktop/TaskPanel";
import { CertificateDialog } from "@/cases/final-submission/components/network/CertificateDialog";
import { NetworkPanel } from "@/cases/final-submission/components/network/NetworkPanel";
import { NotificationCenter } from "@/cases/final-submission/components/notifications/NotificationCenter";
import { NotificationToast } from "@/cases/final-submission/components/notifications/NotificationToast";
import { CalendarWindow } from "@/cases/final-submission/components/windows/CalendarWindow";
import { CaptivePortalWindow } from "@/cases/final-submission/components/windows/CaptivePortalWindow";
import { ChatWindow } from "@/cases/final-submission/components/windows/ChatWindow";
import { CourseSystemWindow } from "@/cases/final-submission/components/windows/CourseSystemWindow";
import { ITReportWindow } from "@/cases/final-submission/components/windows/ITReportWindow";
import { NetworkSettingsWindow } from "@/cases/final-submission/components/windows/NetworkSettingsWindow";
import { SecurityCenterWindow } from "@/cases/final-submission/components/windows/SecurityCenterWindow";
import { useGame } from "@/cases/final-submission/state/GameContext";

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
      <section className="small-screen-note">
        <span><MonitorUp size={28} /></span>
        <small>DESKTOP CHAPTER</small>
        <h1>This case needs a wider screen</h1>
        <p>Continue in a desktop browser. The other rehearsals work on a phone.</p>
        {onExit ? <PixelButton icon={<LayoutGrid size={15} />} onClick={onExit}>Return to case library</PixelButton> : null}
      </section>
    </main>
  );
}
