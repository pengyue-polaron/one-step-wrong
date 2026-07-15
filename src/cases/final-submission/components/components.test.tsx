import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DebriefScreen } from "@/cases/final-submission/components/debrief/DebriefScreen";
import { CertificateDialog } from "@/cases/final-submission/components/network/CertificateDialog";
import { NetworkPanel } from "@/cases/final-submission/components/network/NetworkPanel";
import { NotificationToast } from "@/cases/final-submission/components/notifications/NotificationToast";
import { ITReportWindow } from "@/cases/final-submission/components/windows/ITReportWindow";
import { CourseSystemWindow } from "@/cases/final-submission/components/windows/CourseSystemWindow";
import { SecurityCenterWindow } from "@/cases/final-submission/components/windows/SecurityCenterWindow";
import { GameProvider } from "@/cases/final-submission/state/GameContext";
import { createIncidentReplayState, createInitialState, gameReducer } from "@/cases/final-submission/state/gameMachine";

describe("interactive components", () => {
  it("shows all primary networks without safety labels", () => {
    render(<GameProvider><NetworkPanel /></GameProvider>);
    expect(screen.getByText("nyu")).toBeInTheDocument();
    expect(screen.getByText("nyuguest")).toBeInTheDocument();
    expect(screen.getByText("NYU_Free_5G")).toBeInTheDocument();
    expect(screen.queryByText("危险网络")).not.toBeInTheDocument();
    expect(screen.queryByText("推荐")).not.toBeInTheDocument();
  });

  it("exposes objective publisher information in the install confirmation", () => {
    const initialState = { ...createInitialState(), installDialogOpen: true };
    render(<GameProvider initialState={initialState}><CertificateDialog /></GameProvider>);
    expect(screen.getByTestId("install-dialog")).toHaveTextContent("发布者");
    expect(screen.getByTestId("install-dialog")).toHaveTextContent("无法验证");
    expect(screen.getByText("继续安装")).toBeEnabled();
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
    const submit = screen.getByRole("button", { name: "提交至 Brightspace" });
    expect(submit).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: /本人完成的作业/ }));
    expect(submit).toBeEnabled();
  });

  it("offers review, self-confirmation and deferral on the first login alert", () => {
    render(<GameProvider initialState={createIncidentReplayState()}><NotificationToast /></GameProvider>);
    expect(screen.getByTestId("login-alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "查看详情" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "是我本人" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "稍后处理" })).toBeEnabled();
  });

  it("revokes the unknown session as a real individual action", async () => {
    const user = userEvent.setup();
    render(<GameProvider initialState={createIncidentReplayState()}><SecurityCenterWindow /></GameProvider>);
    await user.click(screen.getByRole("button", { name: "退出此设备" }));
    expect(screen.getByTestId("unknown-session")).toHaveTextContent("会话已退出");
  });

  it("submits a prefilled IT report without collecting credentials", async () => {
    const user = userEvent.setup();
    const state = { ...createIncidentReplayState(), phase: "response" as const };
    render(<GameProvider initialState={state}><ITReportWindow /></GameProvider>);
    await user.click(screen.getByRole("button", { name: "提交工单" }));
    expect(screen.getByTestId("ticket-success")).toHaveTextContent("工单已创建");
  });

  it("renders a dynamic debrief timeline", () => {
    let state = createIncidentReplayState();
    state = gameReducer(state, { type: "FINISH_RESPONSE" });
    render(<GameProvider initialState={state}><DebriefScreen /></GameProvider>);
    expect(screen.getByTestId("event-timeline")).toHaveTextContent("作业提交成功");
    expect(screen.getByTestId("event-timeline")).toHaveTextContent("账号在新设备上登录");
    expect(screen.getByRole("button", { name: /重新体验完整案例/ })).toBeEnabled();
  });
});
