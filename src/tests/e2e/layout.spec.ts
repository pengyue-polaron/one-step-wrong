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
    await page.getByRole("button", { name: "查看提交状态" }).click();
    await page.getByRole("button", { name: "重新上传" }).click();
    await expect(page.getByRole("heading", { name: "可用网络" })).toBeVisible();
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
  await expect(page.getByRole("heading", { name: "选择一个案例" })).toBeVisible();
  await expect(page.getByTestId("case-unexpected-push")).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.screenshot({ path: "artifacts/screenshots/mobile-case-library.png", fullPage: true });

  await page.getByTestId("case-final-submission").click();
  await expect(page.getByRole("heading", { name: "这个案例需要更宽的画面" })).toBeVisible();
  await page.screenshot({ path: "artifacts/screenshots/mobile-desktop-required.png" });
  await page.getByRole("button", { name: "返回案例库" }).click();
  await expect(page.getByRole("heading", { name: "选择一个案例" })).toBeVisible();

  await page.getByTestId("case-shared-draft").click();
  await page.getByRole("button", { name: "打开共享设置" }).click();
  await expect(page.getByLabel("NYU Drive 共享设置")).toBeVisible();
  await expect(page.getByTestId("choice-public-link")).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.screenshot({ path: "artifacts/screenshots/mobile-drive-sharing.png", fullPage: true });

  await page.getByRole("button", { name: "返回案例库" }).click();
  await page.getByTestId("case-unexpected-push").click();
  await page.getByRole("button", { name: "查看登录请求" }).click();
  await expect(page.getByLabel("NYU Duo 登录确认")).toBeVisible();
  await expect(page.getByTestId("choice-verify-browser")).toBeVisible();
  await expect(page.getByTestId("choice-approve-request")).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.screenshot({ path: "artifacts/screenshots/mobile-duo-request.png", fullPage: true });
});
