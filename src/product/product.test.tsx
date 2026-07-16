import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CaseLibrary } from "@/product/CaseLibrary";
import { SharedDraftCase } from "@/cases/shared-draft/SharedDraftCase";
import { UnexpectedPushCase } from "@/cases/unexpected-push/UnexpectedPushCase";

describe("case library and decision chapters", () => {
  it("presents two reviewed rehearsals, two archive cases, and session progress", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<CaseLibrary completed={{ "final-submission": "verified" }} onStart={onStart} />);
    expect(screen.getByRole("heading", { name: "Choose a rehearsal" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The Voice You Know" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sharing Scope" })).toBeInTheDocument();
    expect(screen.getByText("Archive 1 / 2 complete")).toBeInTheDocument();
    expect(screen.getAllByText("Complete")).toHaveLength(1);
    expect(screen.queryByTestId("case-shared-draft")).not.toBeInTheDocument();
    await user.click(screen.getByTestId("case-unexpected-push"));
    expect(onStart).toHaveBeenCalledWith("unexpected-push");
  });

  it("contains the exposed Drive route only after all critical actions", async () => {
    const user = userEvent.setup();
    render(<SharedDraftCase onExit={vi.fn()} onComplete={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Open sharing settings" }));
    await user.click(screen.getByTestId("choice-public-link"));
    expect(screen.getByRole("heading", { name: "A visitor outside the team appears" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Respond to sharing incident" }));
    for (const id of ["restrict-link", "remove-outsider", "restore-version", "notify-team"]) {
      await user.click(screen.getByTestId(`response-${id}`));
    }
    await user.click(screen.getByRole("button", { name: "Finish response and review" }));
    expect(screen.getByRole("heading", { name: "Access pulled back" })).toBeInTheDocument();
  });

  it("teaches Duo binding without revealing a score before the choice", async () => {
    const user = userEvent.setup();
    render(<UnexpectedPushCase onExit={vi.fn()} onComplete={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Review login request" }));
    expect(screen.queryByText("Correct")).not.toBeInTheDocument();
    expect(screen.queryByText("Dangerous")).not.toBeInTheDocument();
    await user.click(screen.getByTestId("choice-verify-browser"));
    await user.click(screen.getByRole("button", { name: "Review what happened" }));
    expect(screen.getByRole("heading", { name: "Tie approval to your own action" })).toBeInTheDocument();
    expect(screen.getByText("An MFA request must match a login you just performed, not merely the right brand and account.")).toBeInTheDocument();
  });

  it("shows that approving Duo without clearing the session leaves access open", async () => {
    const user = userEvent.setup();
    render(<UnexpectedPushCase onExit={vi.fn()} onComplete={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Review login request" }));
    await user.click(screen.getByTestId("choice-approve-request"));
    expect(screen.getByRole("heading", { name: "The approved login did not open your Zoom" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Respond to account incident" }));
    await user.click(screen.getByRole("button", { name: "Finish response and review" }));
    expect(screen.getByRole("heading", { name: "The account still has an opening" })).toBeInTheDocument();
  });
});
