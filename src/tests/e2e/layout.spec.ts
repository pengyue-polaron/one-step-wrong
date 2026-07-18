import { expect, test } from "@playwright/test";

const viewports = [
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

for (const viewport of viewports) {
  test(`desktop layout remains stable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.getByTestId("case-final-submission").click();
    await page.getByRole("button", { name: "Check submission status" }).click();
    await page.getByRole("button", { name: "Retry upload" }).click();
    await expect(page.getByRole("heading", { name: "Available networks" })).toBeVisible();
    await page.waitForTimeout(220);

    const geometry = await page.evaluate(() => {
      const task = document.querySelector<HTMLElement>(".task-panel")?.getBoundingClientRect();
      const windowFrame = document.querySelector<HTMLElement>(".window-frame")?.getBoundingClientRect();
      const networkPanel = document.querySelector<HTMLElement>(".network-panel")?.getBoundingClientRect();
      const overflowingButtons = [...document.querySelectorAll<HTMLElement>("button")]
        .filter((button) => button.offsetParent !== null && button.scrollWidth > button.clientWidth + 1)
        .map((button) => button.getAttribute("aria-label") ?? button.textContent?.trim());
      return {
        bodyWidth: document.body.scrollWidth,
        viewportWidth: window.innerWidth,
        taskRight: task ? task.right : 0,
        windowLeft: windowFrame ? windowFrame.left : 0,
        windowRight: windowFrame ? windowFrame.right : 0,
        panelLeft: networkPanel ? networkPanel.left : 0,
        windowBottom: windowFrame ? windowFrame.bottom : 0,
        viewportHeight: window.innerHeight,
        overflowingButtons,
      };
    });

    expect(geometry.bodyWidth).toBe(geometry.viewportWidth);
    expect(geometry.taskRight).toBeLessThan(geometry.windowLeft);
    expect(geometry.windowRight).toBeLessThan(geometry.panelLeft);
    expect(geometry.windowBottom).toBeLessThan(geometry.viewportHeight - 54);
    expect(geometry.overflowingButtons).toEqual([]);
    await page.screenshot({ path: `artifacts/screenshots/viewport-${viewport.width}x${viewport.height}.png` });
  });
}

test("case library and decision chapters stay usable on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Choose a rehearsal" })).toBeVisible();
  await expect(page.getByTestId("case-unexpected-push")).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.screenshot({ path: "artifacts/screenshots/mobile-case-library.png", fullPage: true });

  await page.getByTestId("case-final-submission").click();
  await expect(page.getByRole("heading", { name: "This case needs a wider screen" })).toBeVisible();
  await page.screenshot({ path: "artifacts/screenshots/mobile-desktop-required.png" });
  await page.getByRole("button", { name: "Return to case library" }).click();
  await expect(page.getByRole("heading", { name: "Choose a rehearsal" })).toBeVisible();

  await page.getByTestId("rehearsal-sharing-scope").click();
  await expect(page.getByRole("heading", { name: "Sharing Scope" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Campus Drive task workspace" })).toBeVisible();
  await expect(page.getByTestId("task-request-summary")).toContainText("Maya Ortiz");
  await expect(page.getByTestId("task-request-summary")).toContainText("my invitation still has not appeared");
  await expect(page.getByRole("button", { name: /Add three named teammates as commenters/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Task", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("1 unread messages")).toBeVisible();
  await page.getByRole("button", { name: "Task", exact: true }).click();
  await expect(page.getByLabel("1 unread messages")).toBeVisible();
  await expect(page.locator(".dialogue-workspace")).toBeHidden();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.screenshot({ path: "artifacts/screenshots/mobile-sharing-scope.png", fullPage: true });

  await page.getByRole("button", { name: /Conversation/ }).click();
  await expect(page.getByRole("button", { name: /Conversation/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".dialogue-workspace")).toBeVisible();
  await expect(page.getByRole("region", { name: "Campus Drive task workspace" })).toBeHidden();
  await expect(page.locator(".dialogue-log")).toContainText("The quote check closes at 20:30");
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.screenshot({ path: "artifacts/screenshots/mobile-sharing-conversation.png", fullPage: true });

  await page.getByRole("link", { name: "Case Library" }).click();
  await page.getByTestId("rehearsal-recovery-window").click();
  await expect(page.getByRole("heading", { name: "Recovery Window" })).toBeVisible();
  await expect(page.getByTestId("task-request-summary")).toContainText("Sam Lee");
  await expect(page.getByRole("button", { name: /Open the account center from your saved bookmark/ })).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.screenshot({ path: "artifacts/screenshots/mobile-recovery-window.png", fullPage: true });

  await page.getByRole("link", { name: "Case Library" }).click();
  await page.getByTestId("case-unexpected-push").click();
  await page.getByRole("button", { name: "Review login request" }).click();
  await expect(page.getByLabel("NYU Duo login verification")).toBeVisible();
  await expect(page.getByTestId("choice-verify-browser")).toBeVisible();
  await expect(page.getByTestId("choice-approve-request")).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.screenshot({ path: "artifacts/screenshots/mobile-duo-request.png", fullPage: true });
});

test("desktop modal isolation clears when the viewport becomes phone-sized", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");
  await page.getByTestId("case-final-submission").click();
  await expect(page.getByRole("dialog", { name: "Final Submission" })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  const returnButton = page.getByRole("button", { name: "Return to case library" });
  await expect(returnButton).toBeVisible();
  await expect(returnButton).toBeEnabled();
  await expect(returnButton).not.toHaveAttribute("inert", "");
  await returnButton.click();
  await expect(page.getByRole("heading", { name: "Choose a rehearsal" })).toBeVisible();
});
