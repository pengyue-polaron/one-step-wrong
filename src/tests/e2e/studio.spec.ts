import { expect, test, type Page } from "@playwright/test";

async function openValidatedScenario(page: Page) {
  await page.goto("/studio");
  await page.getByRole("button", { name: "Load reviewed example" }).click();
  await expect(page.getByTestId("studio-profile")).toBeVisible();
  await expect(page.getByText("Unknown remains unknown")).toBeVisible();
  await page.getByRole("button", { name: "Approve profile" }).click();
  await expect(page.getByTestId("studio-brief")).toBeVisible();
  await page.getByRole("button", { name: "Compile flagship example" }).click();
  await expect(page.getByTestId("studio-preview")).toBeVisible();
  await expect(page.getByText("Runtime schema passed")).toBeVisible();
}

test("studio completes the reviewed research-to-debrief path", async ({ page }) => {
  await openValidatedScenario(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "artifacts/screenshots/studio-preview.png", fullPage: true });
  await page.getByRole("button", { name: "Launch rehearsal" }).click();
  await expect(page.getByTestId("studio-live")).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "artifacts/screenshots/studio-live.png", fullPage: true });

  await page.getByRole("button", { name: /Dr. Maya Chen/ }).click();
  await page.getByLabel("Message a role").fill("Can I confirm this through the number I already have?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Reviewed fallback").last()).toBeVisible();

  await page.getByRole("button", { name: /Call adviser on known number/ }).click();
  await page.getByRole("button", { name: /Pause reimbursement/ }).click();
  await page.getByRole("button", { name: "Resolve and debrief" }).click();
  await expect(page.getByTestId("studio-debrief")).toBeVisible();
  await expect(page.getByText("SAFE", { exact: true })).toBeVisible();
  await expect(page.getByText("Call adviser on known number")).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "artifacts/screenshots/studio-debrief.png", fullPage: true });
});

test("studio remains usable without horizontal overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/studio");
  await expect(page.getByTestId("studio-research")).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.screenshot({ path: "artifacts/screenshots/mobile-studio.png", fullPage: true });
});
