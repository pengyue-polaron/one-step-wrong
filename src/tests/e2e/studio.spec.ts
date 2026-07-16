import { expect, test, type Page } from "@playwright/test";

async function openValidatedScenario(page: Page, captureProfile = false) {
  await page.goto("/studio");
  await page.getByRole("button", { name: "Use example institution" }).click();
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
  await page.getByRole("button", { name: "Use example rehearsal" }).click();
  await expect(page.getByTestId("studio-preview")).toBeVisible();
  await expect(page.getByText("Scenario checks passed")).toBeVisible();
  await expect(page.getByText(/New York University · fictionalized names/)).toBeVisible();
}

test("studio completes the reviewed research-to-debrief path", async ({ page }) => {
  await openValidatedScenario(page, true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "artifacts/screenshots/studio-preview.png", fullPage: true });
  await page.getByRole("button", { name: "Start rehearsal" }).click();
  await expect(page.getByTestId("studio-live")).toBeVisible();
  await expect(page.getByTestId("studio-live")).not.toContainText(/GPT|Build Week|fixture|fallback|schema|deterministic|canonical/i);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "artifacts/screenshots/studio-live.png", fullPage: true });

  await page.getByRole("button", { name: /Dr. Maya Chen/ }).click();
  await page.getByLabel("Message a role").fill("Can I confirm this through the number I already have?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".dialogue-log article")).toHaveCount(3);

  await page.getByRole("button", { name: /Call the number attached to the message/ }).click();
  await expect(page.getByRole("region", { name: "Evidence board" })).toContainText("Callback came from the request");
  await expect(page.getByText("callback claim only")).toBeVisible();
  await page.getByRole("button", { name: /Ask in the organization group chat/ }).click();
  await expect(page.getByRole("region", { name: "Evidence board" })).toContainText("The team recognizes the context, not the sender");
  await page.getByRole("button", { name: /Call the saved directory number/ }).click();
  await expect(page.getByRole("region", { name: "Evidence board" })).toContainText("Independent adviser confirmation");
  await expect(page.getByText("request disproved")).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "artifacts/screenshots/studio-evidence.png" });
  await page.getByRole("button", { name: /Pause reimbursement/ }).click();
  await page.getByRole("button", { name: "Finish and review" }).click();
  await expect(page.getByTestId("studio-debrief")).toBeVisible();
  await expect(page.getByTestId("studio-debrief")).not.toContainText(/GPT|Build Week|fixture|fallback|schema|deterministic|canonical/i);
  await expect(page.getByText("SAFE", { exact: true })).toBeVisible();
  await expect(page.getByText("Call the saved directory number")).toBeVisible();
  await expect(page.getByRole("region", { name: "How the result was determined" })).toContainText("The conversation could change");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "artifacts/screenshots/studio-debrief.png", fullPage: true });

  await page.getByRole("button", { name: "Try a new situation" }).click();
  await expect(page.getByTestId("studio-transfer")).toBeVisible();
  await expect(page.getByTestId("studio-transfer")).not.toContainText(/GPT|Build Week|fixture|fallback|schema|deterministic|canonical/i);
  await expect(page.getByText("The Name You Recognize")).toBeVisible();
  await page.getByRole("button", { name: /Open Campus Drive from your saved bookmark/ }).click();
  await expect(page.getByText("Rule transferred")).toBeVisible();
  await expect(page.getByRole("region", { name: "Learning evidence" })).toContainText("This result follows the action selected");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "artifacts/screenshots/studio-transfer.png", fullPage: true });

  await page.getByRole("button", { name: "Replay rehearsal" }).click();
  await expect(page.getByTestId("studio-live")).toBeVisible();
  await expect(page.getByText("0 completed")).toBeVisible();
  await expect(page.locator(".dialogue-log article")).toHaveCount(1);
  await expect(page.getByRole("button", { name: /Call the saved directory number/ })).toBeEnabled();
});

test("studio contains an expanded incident through explicit recovery actions", async ({ page }) => {
  await openValidatedScenario(page);
  await page.getByRole("button", { name: "Start rehearsal" }).click();
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
  await page.getByRole("button", { name: "Finish and review" }).click();
  await expect(page.getByText("CONTAINED", { exact: true })).toBeVisible();
  await expect(page.getByText("All required recovery actions were completed.")).toBeVisible();
});

test("studio remains usable without horizontal overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/studio");
  await expect(page.getByTestId("studio-research")).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.getByRole("button", { name: "Use exact names" }).click();
  await expect(page.getByRole("button", { name: "Find public guidance" })).toBeDisabled();
  await page.getByRole("checkbox", { name: /Permission confirmed/ }).check();
  await expect(page.getByRole("button", { name: "Find public guidance" })).toBeEnabled();
  await page.getByRole("button", { name: "Fictionalized" }).click();
  await page.getByRole("button", { name: "Use example institution" }).click();
  await expect(page.getByTestId("studio-profile")).toBeVisible();
  await expect(page.getByRole("region", { name: "Source review" })).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.screenshot({ path: "artifacts/screenshots/mobile-studio.png", fullPage: true });
});

test("transfer evidence remains usable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openValidatedScenario(page);
  await page.getByRole("button", { name: "Start rehearsal" }).click();
  await page.getByRole("button", { name: /Call the number attached to the message/ }).click();
  await expect(page.getByRole("region", { name: "Evidence board" })).toContainText("Callback came from the request");
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.getByRole("region", { name: "Evidence board" }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: "artifacts/screenshots/mobile-studio-evidence.png" });
  await page.getByRole("button", { name: /Call the saved directory number/ }).click();
  await page.getByRole("button", { name: /Pause reimbursement/ }).click();
  await page.getByRole("button", { name: "Finish and review" }).click();
  await page.getByRole("button", { name: "Try a new situation" }).click();
  await expect(page.getByTestId("studio-transfer")).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.getByRole("button", { name: /Ask for confirmation in the same group chat/ }).click();
  await expect(page.getByText("Verification stayed inside the request")).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.locator(".transfer-result").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "artifacts/screenshots/mobile-studio-transfer.png" });
});
