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
