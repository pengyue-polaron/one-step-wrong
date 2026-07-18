import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function expectNoSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const violations = results.violations.filter(
    (violation) => violation.impact === "critical" || violation.impact === "serious",
  );
  expect(
    violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      targets: violation.nodes.flatMap((node) => node.target),
    })),
  ).toEqual([]);
}

test("core entry points have no serious automated accessibility violations", async ({ page }) => {
  await page.goto("/");
  await expectNoSeriousViolations(page);

  await page.goto("/rehearsal");
  await expect(page.getByTestId("studio-live")).toBeVisible();
  await expectNoSeriousViolations(page);

  await page.goto("/rehearsal/sharing-scope");
  await expect(page.getByRole("heading", { name: "Sharing Scope" })).toBeVisible();
  await expectNoSeriousViolations(page);

  await page.goto("/rehearsal/recovery-window");
  await expect(page.getByRole("heading", { name: "Recovery Window" })).toBeVisible();
  await expectNoSeriousViolations(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("button", { name: "Task", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expectNoSeriousViolations(page);
  await page.getByRole("button", { name: /Conversation/ }).click();
  await expectNoSeriousViolations(page);
  await page.setViewportSize({ width: 1280, height: 720 });

  await page.goto("/studio");
  await expect(page.getByTestId("studio-research")).toBeVisible();
  await expectNoSeriousViolations(page);
});

test("authoring, review, transfer, and report states pass the accessibility gate", async ({ page }) => {
  await page.goto("/studio");
  await page.getByRole("button", { name: "Use example institution" }).click();
  await expect(page.getByTestId("studio-profile")).toBeVisible();
  await expectNoSeriousViolations(page);

  await page.getByRole("button", { name: "Approve profile" }).click();
  await expect(page.getByTestId("studio-brief")).toBeVisible();
  await expectNoSeriousViolations(page);

  await page.getByRole("button", { name: "Use example rehearsal" }).click();
  await expect(page.getByTestId("studio-preview")).toBeVisible();
  await expectNoSeriousViolations(page);
  await page.getByRole("button", { name: "Edit visible labels" }).click();
  await expect(page.getByRole("region", { name: "Scenario label editor" })).toBeVisible();
  await expectNoSeriousViolations(page);
  await page.getByRole("button", { name: "Cancel" }).click();

  await page.getByRole("button", { name: "Start rehearsal" }).click();
  await page.getByRole("button", { name: /Call the saved directory number/ }).click();
  await page.getByRole("button", { name: /Pause reimbursement/ }).click();
  await page.getByRole("button", { name: "Finish and review" }).click();
  await expect(page.getByTestId("studio-debrief")).toBeVisible();
  await expectNoSeriousViolations(page);

  await page.getByRole("button", { name: "Test in a new situation" }).click();
  await expect(page.getByTestId("studio-transfer")).toBeVisible();
  await expectNoSeriousViolations(page);
  await page.getByRole("button", { name: /Open Campus Drive from your saved bookmark/ }).click();
  await expectNoSeriousViolations(page);

  await page.getByRole("button", { name: "Open facilitator report" }).click();
  await expect(page.getByTestId("studio-report")).toBeVisible();
  await expectNoSeriousViolations(page);
});

test("deep-case introduction and install dialog pass the accessibility gate", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("case-final-submission").click();
  await expect(page.getByRole("dialog", { name: "Final Submission" })).toBeVisible();
  await expectNoSeriousViolations(page);

  await page.getByRole("button", { name: "Check submission status" }).click();
  await page.getByRole("button", { name: "Retry upload" }).click();
  await page.getByTestId("network-campus-free-5g").click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Download and install" }).click();
  await expect(page.getByTestId("install-dialog")).toBeVisible();
  await expectNoSeriousViolations(page);
});

test("skip navigation and stage changes place focus predictably", async ({ page }) => {
  await page.goto("/studio");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  await page.getByRole("button", { name: "Use example institution" }).click();
  await expect(page.getByRole("heading", { name: "New York University" })).toBeFocused();
});

test("reduced-motion preference removes meaningful animation duration", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/rehearsal");
  const duration = await page.locator(".studio-shell").evaluate((element) =>
    getComputedStyle(element).animationDuration,
  );
  const durationMs = duration.endsWith("ms")
    ? Number.parseFloat(duration)
    : Number.parseFloat(duration) * 1_000;
  expect(durationMs).toBeLessThanOrEqual(0.001);
});
