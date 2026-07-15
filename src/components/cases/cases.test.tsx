import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CaseLibrary } from "@/components/cases/CaseLibrary";
import { DecisionCaseRunner } from "@/components/cases/DecisionCaseRunner";
import { decisionCases } from "@/scenarios/caseCatalog";

describe("case library and decision chapters", () => {
  it("presents three playable cases and session progress", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<CaseLibrary completed={{ "final-submission": "verified" }} onStart={onStart} />);
    expect(screen.getByRole("heading", { name: "选择一个案例" })).toBeInTheDocument();
    expect(screen.getByText("1 / 3 已完成")).toBeInTheDocument();
    expect(screen.getAllByText("已完成")).toHaveLength(1);
    await user.click(screen.getByTestId("case-shared-draft"));
    expect(onStart).toHaveBeenCalledWith("shared-draft");
  });

  it("contains the exposed Drive route only after all critical actions", async () => {
    const user = userEvent.setup();
    render(<DecisionCaseRunner definition={decisionCases["shared-draft"]} onExit={vi.fn()} onComplete={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "打开共享设置" }));
    await user.click(screen.getByTestId("choice-public-link"));
    expect(screen.getByRole("heading", { name: "出现不在小组名单里的访问者" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "处理共享异常" }));
    for (const id of ["restrict-link", "remove-outsider", "restore-version", "notify-team"]) {
      await user.click(screen.getByTestId(`response-${id}`));
    }
    await user.click(screen.getByRole("button", { name: "完成处理并复盘" }));
    expect(screen.getByRole("heading", { name: "访问已收回" })).toBeInTheDocument();
  });

  it("teaches Duo binding without revealing a score before the choice", async () => {
    const user = userEvent.setup();
    render(<DecisionCaseRunner definition={decisionCases["unexpected-push"]} onExit={vi.fn()} onComplete={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "查看登录请求" }));
    expect(screen.queryByText("正确")).not.toBeInTheDocument();
    expect(screen.queryByText("危险")).not.toBeInTheDocument();
    await user.click(screen.getByTestId("choice-verify-browser"));
    await user.click(screen.getByRole("button", { name: "查看本次复盘" }));
    expect(screen.getByRole("heading", { name: "先绑定自己的动作" })).toBeInTheDocument();
    expect(screen.getByText("MFA 请求必须对应你刚刚执行的登录，而不是只看品牌和账号。")).toBeInTheDocument();
  });

  it("shows that approving Duo without clearing the session leaves access open", async () => {
    const user = userEvent.setup();
    render(<DecisionCaseRunner definition={decisionCases["unexpected-push"]} onExit={vi.fn()} onComplete={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "查看登录请求" }));
    await user.click(screen.getByTestId("choice-approve-request"));
    expect(screen.getByRole("heading", { name: "批准的登录没有进入你的 Zoom" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "处理账号异常" }));
    await user.click(screen.getByRole("button", { name: "完成处理并复盘" }));
    expect(screen.getByRole("heading", { name: "账号仍有入口" })).toBeInTheDocument();
  });
});
