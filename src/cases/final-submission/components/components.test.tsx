import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DebriefScreen } from "@/cases/final-submission/components/debrief/DebriefScreen";
import { IntroOverlay } from "@/cases/final-submission/components/desktop/IntroOverlay";
import { SystemBar } from "@/cases/final-submission/components/desktop/SystemBar";
import { CertificateDialog } from "@/cases/final-submission/components/network/CertificateDialog";
import { NetworkPanel } from "@/cases/final-submission/components/network/NetworkPanel";
import { NotificationToast } from "@/cases/final-submission/components/notifications/NotificationToast";
import { ITReportWindow } from "@/cases/final-submission/components/windows/ITReportWindow";
import { CourseSystemWindow } from "@/cases/final-submission/components/windows/CourseSystemWindow";
import { SecurityCenterWindow } from "@/cases/final-submission/components/windows/SecurityCenterWindow";
import { GameProvider, useGame } from "@/cases/final-submission/state/GameContext";
import { createIncidentReplayState, createInitialState, gameReducer } from "@/cases/final-submission/state/gameMachine";

function CertificateDialogHarness() {
  const { dispatch } = useGame();
  return (
    <>
      <button onClick={() => dispatch({ type: "REQUEST_INSTALL" })}>Open certificate dialog</button>
      <button>Background action</button>
      <CertificateDialog />
    </>
  );
}

describe("interactive components", () => {
  it("shows all primary networks without safety labels", () => {
    render(<GameProvider><NetworkPanel /></GameProvider>);
    expect(screen.getByText("nyu")).toBeInTheDocument();
    expect(screen.getByText("nyuguest")).toBeInTheDocument();
    expect(screen.getByText("NYU_Free_5G")).toBeInTheDocument();
    expect(screen.queryByText("Dangerous network")).not.toBeInTheDocument();
    expect(screen.queryByText("Recommended")).not.toBeInTheDocument();
  });

  it("exposes objective publisher information in the install confirmation", () => {
    const initialState = { ...createInitialState(), installDialogOpen: true };
    render(<GameProvider initialState={initialState}><CertificateDialog /></GameProvider>);
    expect(screen.getByTestId("install-dialog")).toHaveTextContent("Publisher");
    expect(screen.getByTestId("install-dialog")).toHaveTextContent("Unverified");
    expect(screen.getByText("Continue installation")).toBeEnabled();
  });

  it("traps focus in the introduction and restores focus to the desktop after starting", async () => {
    const user = userEvent.setup();
    render(
      <GameProvider>
        <button>Background before</button>
        <IntroOverlay />
        <button>Background after</button>
      </GameProvider>,
    );

    const start = screen.getByRole("button", { name: "Check submission status" });
    const backgroundBefore = screen.getByText("Background before");
    const backgroundAfter = screen.getByText("Background after");
    expect(screen.getByRole("dialog", { name: "Final Submission" })).toHaveAttribute("aria-modal", "true");
    expect(start).toHaveFocus();
    expect(backgroundBefore).toHaveAttribute("inert");
    expect(backgroundAfter).toHaveAttribute("aria-hidden", "true");

    await user.tab();
    expect(start).toHaveFocus();
    await user.tab({ shift: true });
    expect(start).toHaveFocus();

    await user.click(start);
    await waitFor(() => expect(backgroundBefore).toHaveFocus());
    expect(backgroundBefore).not.toHaveAttribute("inert");
    expect(backgroundAfter).not.toHaveAttribute("aria-hidden");
  });

  it("traps certificate-dialog focus, closes on Escape, and restores its opener", async () => {
    const user = userEvent.setup();
    render(<GameProvider initialState={{ ...createInitialState(), started: true }}><CertificateDialogHarness /></GameProvider>);

    const opener = screen.getByRole("button", { name: "Open certificate dialog" });
    const background = screen.getByRole("button", { name: "Background action" });
    await user.click(opener);

    const cancel = screen.getByRole("button", { name: "Cancel" });
    const continueInstallation = screen.getByRole("button", { name: "Continue installation" });
    expect(cancel).toHaveFocus();
    expect(opener).toHaveAttribute("inert");
    expect(background).toHaveAttribute("aria-hidden", "true");

    await user.tab();
    expect(continueInstallation).toHaveFocus();
    await user.tab();
    expect(cancel).toHaveFocus();
    await user.tab({ shift: true });
    expect(continueInstallation).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByTestId("install-dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    expect(opener).not.toHaveAttribute("inert");
    expect(background).not.toHaveAttribute("aria-hidden");
  });

  it("exposes pressed and expanded state for system-bar toggles", async () => {
    const user = userEvent.setup();
    render(<GameProvider initialState={{ ...createInitialState(), started: true }}><SystemBar /></GameProvider>);

    const pause = screen.getByRole("button", { name: "Pause countdown" });
    const motion = screen.getByRole("button", { name: "Reduce motion" });
    const mute = screen.getByRole("button", { name: "Mute sound" });
    const network = screen.getByRole("button", { name: "Network list" });
    const notifications = screen.getByRole("button", { name: /Notification center/ });
    expect(pause).toHaveAttribute("aria-pressed", "false");
    expect(motion).toHaveAttribute("aria-pressed", "false");
    expect(mute).toHaveAttribute("aria-pressed", "false");
    expect(network).toHaveAttribute("aria-expanded", "false");
    expect(notifications).toHaveAttribute("aria-expanded", "false");

    await user.click(pause);
    await user.click(motion);
    await user.click(mute);
    await user.click(network);
    expect(pause).toHaveAttribute("aria-pressed", "true");
    expect(motion).toHaveAttribute("aria-pressed", "true");
    expect(mute).toHaveAttribute("aria-pressed", "true");
    expect(network).toHaveAttribute("aria-expanded", "true");

    await user.click(notifications);
    expect(notifications).toHaveAttribute("aria-expanded", "true");
    expect(network).toHaveAttribute("aria-expanded", "false");
  });

  it("requires the integrity confirmation before final submission", async () => {
    const user = userEvent.setup();
    const initialState = {
      ...createInitialState(),
      started: true,
      phase: "submission" as const,
      selectedNetwork: "campus-guest" as const,
      connectionReady: true,
      assignmentUploaded: true,
      uploadProgress: 100,
    };
    render(<GameProvider initialState={initialState}><CourseSystemWindow /></GameProvider>);
    const submit = screen.getByRole("button", { name: "Submit to Brightspace" });
    expect(submit).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: /my own work/ }));
    expect(submit).toBeEnabled();
  });

  it("offers review, self-confirmation and deferral on the first login alert", () => {
    render(<GameProvider initialState={createIncidentReplayState()}><NotificationToast /></GameProvider>);
    expect(screen.getByTestId("login-alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Review details" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "This was me" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Handle later" })).toBeEnabled();
  });

  it("revokes the unknown session as a real individual action", async () => {
    const user = userEvent.setup();
    render(<GameProvider initialState={createIncidentReplayState()}><SecurityCenterWindow /></GameProvider>);
    await user.click(screen.getByRole("button", { name: "End this session" }));
    expect(screen.getByTestId("unknown-session")).toHaveTextContent("Session ended");
  });

  it("submits a prefilled IT report without collecting credentials", async () => {
    const user = userEvent.setup();
    const state = { ...createIncidentReplayState(), phase: "response" as const };
    render(<GameProvider initialState={state}><ITReportWindow /></GameProvider>);
    await user.click(screen.getByRole("button", { name: "Submit ticket" }));
    expect(screen.getByTestId("ticket-success")).toHaveTextContent("Ticket created");
  });

  it("renders a dynamic debrief timeline", () => {
    let state = createIncidentReplayState();
    state = gameReducer(state, { type: "FINISH_RESPONSE" });
    render(<GameProvider initialState={state}><DebriefScreen /></GameProvider>);
    expect(screen.getByTestId("event-timeline")).toHaveTextContent("Assignment submitted");
    expect(screen.getByTestId("event-timeline")).toHaveTextContent("Account signed in on a new device");
    expect(screen.getByRole("button", { name: /Replay the full case/ })).toBeEnabled();
  });
});
