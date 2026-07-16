import { expect, test, type Page } from "@playwright/test";

async function openValidatedScenario(page: Page, captureProfile = false) {
  await page.goto("/studio");
  await page.getByRole("button", { name: "Load reviewed example" }).click();
  await expect(page.getByTestId("studio-profile")).toBeVisible();
  await expect(page.getByText("Unknown remains unknown")).toBeVisible();
  await expect(page.getByRole("region", { name: "Source review" })).toBeVisible();
  await expect(page.getByText("6 / 6 approved")).toBeVisible();
  if (captureProfile) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: "artifacts/screenshots/studio-profile.png", fullPage: true });
  }
  await page.getByRole("button", { name: "Approve profile" }).click();
  await expect(page.getByTestId("studio-brief")).toBeVisible();
  await page.getByRole("button", { name: "Compile flagship example" }).click();
  await expect(page.getByTestId("studio-preview")).toBeVisible();
  await expect(page.getByText("Runtime schema passed")).toBeVisible();
  await expect(page.getByText(/New York University · brand safe fictionalized/)).toBeVisible();
}

test("studio completes the reviewed research-to-debrief path", async ({ page }) => {
  await openValidatedScenario(page, true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "artifacts/screenshots/studio-preview.png", fullPage: true });
  await page.getByRole("button", { name: "Launch rehearsal" }).click();
  await expect(page.getByTestId("studio-live")).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "artifacts/screenshots/studio-live.png", fullPage: true });

  await page.getByRole("button", { name: /Dr. Maya Chen/ }).click();
  await page.getByLabel("Message a role").fill("Can I confirm this through the number I already have?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Reviewed dialogue").last()).toBeVisible();

  await page.getByRole("button", { name: /Call adviser on known number/ }).click();
  await page.getByRole("button", { name: /Pause reimbursement/ }).click();
  await page.getByRole("button", { name: "Resolve and debrief" }).click();
  await expect(page.getByTestId("studio-debrief")).toBeVisible();
  await expect(page.getByText("SAFE", { exact: true })).toBeVisible();
  await expect(page.getByText("Call adviser on known number")).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "artifacts/screenshots/studio-debrief.png", fullPage: true });

  await page.getByRole("button", { name: "Replay scenario" }).click();
  await expect(page.getByTestId("studio-live")).toBeVisible();
  await expect(page.getByText("0 actions recorded")).toBeVisible();
  await expect(page.locator(".dialogue-log article")).toHaveCount(1);
  await expect(page.getByRole("button", { name: /Call adviser on known number/ })).toBeEnabled();
});

test("studio contains an expanded incident through explicit recovery actions", async ({ page }) => {
  await openValidatedScenario(page);
  await page.getByRole("button", { name: "Launch rehearsal" }).click();
  await expect(page.getByTestId("studio-live")).not.toContainText("adversarial");
  await expect(page.getByRole("button", { name: /Revoke shared access/ })).toHaveCount(0);
  await page.getByRole("button", { name: /Approve new payment details/ }).click();
  await expect(page.getByRole("button", { name: /Preserve message evidence/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Revoke shared access/ })).toHaveCount(0);
  await page.getByRole("button", { name: /Share finance folder/ }).click();
  await expect(page.getByRole("button", { name: /Revoke shared access/ })).toBeVisible();
  for (const action of [/Preserve message evidence/, /Revoke shared access/, /Notify affected people/, /Report to Safety Desk/]) {
    await page.getByRole("button", { name: action }).click();
  }
  await page.getByRole("button", { name: "Resolve and debrief" }).click();
  await expect(page.getByText("CONTAINED", { exact: true })).toBeVisible();
  await expect(page.getByText("All required recovery actions were completed.")).toBeVisible();
});

test("studio remains usable without horizontal overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/studio");
  await expect(page.getByTestId("studio-research")).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.getByRole("button", { name: "Load reviewed example" }).click();
  await expect(page.getByTestId("studio-profile")).toBeVisible();
  await expect(page.getByRole("region", { name: "Source review" })).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.screenshot({ path: "artifacts/screenshots/mobile-studio.png", fullPage: true });
});
