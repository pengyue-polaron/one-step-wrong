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
  await expect(page.getByRole("region", { name: "Source-to-scenario trace" })).toContainText("New York University");
  await expect(page.getByRole("region", { name: "Source-to-scenario trace" })).toContainText("Northbridge University");
  await expect(page.getByRole("region", { name: "Outcome coverage" })).toContainText("4 / 4 reachable");
}

test("featured rehearsal opens directly from the case library", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("featured-rehearsal").click();
  await expect(page).toHaveURL(/\/rehearsal$/);
  await expect(page.getByTestId("studio-live")).toBeVisible();
  await expect(page.getByRole("heading", { name: "The Voice You Know" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Call the saved directory number/ })).toBeEnabled();
  await expect(page.locator('audio[aria-label="Play voice note from Dr. Maya Chen"]:visible')).toHaveAttribute(
    "src",
    "/audio/the-voice-you-know-opening.ogg",
  );
  await expect(page.getByRole("button", { name: /Dr\. Maya Chen Voice message/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Dr\. Maya Chen Saved directory call/ })).toHaveCount(0);
  await expect(page.getByText("Northbridge University")).toBeVisible();
  await expect(page.getByTestId("studio-live")).not.toContainText(/GPT|Build Week|fixture|fallback|schema|deterministic|canonical/i);
});

test("studio completes the reviewed research-to-debrief path", async ({ page }) => {
  await openValidatedScenario(page, true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "artifacts/screenshots/studio-preview.png", fullPage: true });
  await page.getByRole("button", { name: "Start rehearsal" }).click();
  await expect(page.getByTestId("studio-live")).toBeVisible();
  await expect(page.getByTestId("studio-live")).not.toContainText(/GPT|Build Week|fixture|fallback|schema|deterministic|canonical/i);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "artifacts/screenshots/studio-live.png", fullPage: true });

  await page.getByRole("button", { name: /Dr\. Maya Chen Voice message/ }).click();
  await page.getByLabel("Message a role").fill("Can I confirm this through the number I already have?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".dialogue-log article")).toHaveCount(3);

  await page.getByRole("button", { name: /Call the saved directory number/ }).click();
  await expect(page.locator(".dialogue-log")).toContainText("I did not request any account change");
  await expect(page.getByRole("button", { name: /Dr\. Maya Chen Saved directory call/ })).toBeVisible();
  await expect(page.getByRole("region", { name: "Evidence board" })).toContainText("Independent adviser confirmation");
  await expect(page.getByText("contradicted")).toBeVisible();
  await page.getByRole("button", { name: /Dr\. Maya Chen Saved directory call/ }).click();
  await page.getByLabel("Message a role").fill("What should I do next?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".dialogue-log")).toContainText("Keep the reimbursement pending");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "artifacts/screenshots/studio-evidence.png" });
  await page.getByRole("button", { name: /Pause reimbursement/ }).click();
  await page.getByRole("button", { name: "Finish and review" }).click();
  await expect(page.getByTestId("studio-debrief")).toBeVisible();
  await expect(page.getByTestId("studio-debrief")).not.toContainText(/GPT|Build Week|fixture|fallback|schema|deterministic|canonical/i);
  await expect(page.getByText("SAFE", { exact: true })).toBeVisible();
  await expect(page.getByText("Call the saved directory number")).toBeVisible();
  await expect(page.getByRole("region", { name: "Causal walkthrough" })).toContainText("Independent adviser confirmation");
  await expect(page.getByRole("region", { name: "How the result was determined" })).toContainText("The conversation could change");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "artifacts/screenshots/studio-debrief.png", fullPage: true });

  await expect(page.getByText("A familiar voice is a clue, not proof of identity.")).toHaveCount(0);
  await page.getByRole("button", { name: "Test in a new situation" }).click();
  await expect(page.getByTestId("studio-transfer")).toBeVisible();
  await expect(page.getByTestId("studio-transfer")).not.toContainText(/GPT|Build Week|fixture|fallback|schema|deterministic|canonical/i);
  await expect(page.getByText("The Name You Recognize")).toBeVisible();
  await page.getByRole("button", { name: /Open Campus Drive from your saved bookmark/ }).click();
  await expect(page.getByText("Known-channel pattern applied")).toBeVisible();
  await expect(page.getByRole("region", { name: "Learning evidence" })).toContainText("after feedback");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "artifacts/screenshots/studio-transfer.png", fullPage: true });
  await page.getByRole("button", { name: "What made the saved directory call independent evidence?" }).click();
  await expect(page.locator(".coach-answers article")).toContainText("Independent adviser confirmation");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "artifacts/screenshots/studio-coach.png", fullPage: true });

  await page.getByRole("button", { name: "Open facilitator report" }).click();
  await expect(page.getByTestId("studio-report")).toBeVisible();
  await expect(page.getByText("No learner identity stored")).toBeVisible();
  await expect(page.getByRole("heading", { name: "The Voice You Know" })).toBeVisible();
  await expect(page.getByText(/Source profile: New York University · Published setting: Northbridge University/)).toBeVisible();
  await expect(page.getByText(/selected before the explicit rule/)).toBeVisible();
  await expect(page.getByText("Approved institution guidance")).toBeVisible();
  await expect(page.getByRole("button", { name: "Print report" })).toBeEnabled();
  await page.screenshot({ path: "artifacts/screenshots/facilitator-report.png", fullPage: true });

  await page.getByRole("button", { name: "Replay rehearsal" }).click();
  await expect(page.getByTestId("studio-live")).toBeVisible();
  await expect(page.getByText("0 task actions recorded")).toBeVisible();
  await expect(page.locator(".dialogue-log article")).toHaveCount(1);
  await expect(page.getByRole("button", { name: /Call the saved directory number/ })).toBeEnabled();
});

test("studio contains an expanded incident through explicit recovery actions", async ({ page }) => {
  await openValidatedScenario(page);
  await page.getByRole("button", { name: "Start rehearsal" }).click();
  await expect(page.getByTestId("studio-live")).not.toContainText("adversarial");
  await expect(page.getByRole("button", { name: /Revoke shared access/ })).toHaveCount(0);
  await page.getByRole("button", { name: /Approve new payment details/ }).click();
  await expect(page.locator(".dialogue-log")).toContainText("The account change is showing on my side");
  await expect(page.getByRole("button", { name: "Finish and review" })).toBeDisabled();
  await expect(page.getByRole("button", { name: /Preserve message evidence/ })).toHaveCount(0);
  await page.getByRole("button", { name: /Review reimbursement status/ }).click();
  await expect(page.locator(".dialogue-log")).toContainText("do not recognize the new payment details");
  await expect(page.getByRole("button", { name: /Request a payment hold/ })).toBeVisible();
  await page.getByRole("button", { name: /Jordan Lee Organization group chat/ }).click();
  await page.getByLabel("Message a role").fill("What can we still do?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".dialogue-log")).toContainText("Finance can still place a hold");
  await page.getByRole("button", { name: /Call the number attached to the message/ }).click();
  await page.getByRole("button", { name: /Share reimbursement folder/ }).click();
  await expect(page.getByRole("button", { name: /Revoke shared access/ })).toHaveCount(0);
  await page.getByRole("button", { name: /Review shared folder access/ }).click();
  await expect(page.getByRole("button", { name: /Revoke shared access/ })).toBeVisible();
  for (const action of [/Request a payment hold/, /Preserve message evidence/, /Revoke shared access/, /Notify affected people/, /Report to Safety Desk/]) {
    await page.getByRole("button", { name: action }).click();
  }
  await page.getByRole("button", { name: "Finish and review" }).click();
  await expect(page.getByText("CONTAINED", { exact: true })).toBeVisible();
  await expect(page.getByText("All required recovery actions were completed.")).toBeVisible();
});

test("Recovery Window separates publishing access from account recovery", async ({ page }) => {
  await page.goto("/rehearsal/recovery-window");
  await expect(page.getByRole("heading", { name: "Recovery Window" })).toBeVisible();
  await expect(page.getByText("Student radio digital producer")).toBeVisible();
  await page.getByRole("button", { name: /Open the account center from your saved bookmark/ }).click();
  await expect(page.getByRole("region", { name: "Evidence board" })).toContainText("No recovery handoff was initiated");
  await page.getByRole("button", { name: /Invite Sam's own account as an editor/ }).click();
  await page.getByRole("button", { name: "Finish and review" }).click();
  await expect(page.getByText("SAFE", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Task access stayed separate" })).toBeVisible();
});

test("Recovery Window exposes and contains recovery authority", async ({ page }) => {
  await page.goto("/rehearsal/recovery-window");
  await page.getByRole("button", { name: /Ask Sam in the project chat/ }).click();
  await page.getByRole("button", { name: /Approve the handoff device/ }).click();
  await expect(page.getByRole("button", { name: "Finish and review" })).toBeDisabled();
  await page.getByRole("button", { name: /Review recovery devices and active sessions/ }).click();
  await expect(page.getByRole("region", { name: "Evidence board" })).toContainText("A new recovery device is active");
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  await page.screenshot({ path: "artifacts/screenshots/recovery-window-incident.png", fullPage: true });
  for (const action of [
    /Revoke the handoff device and its session/,
    /Preserve the recovery and sign-in record/,
    /Notify the media team/,
    /Report the account incident/,
  ]) {
    await page.getByRole("button", { name: action }).click();
  }
  await page.getByRole("button", { name: "Finish and review" }).click();
  await expect(page.getByText("CONTAINED", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recovery authority removed" })).toBeVisible();
});

test("studio remains usable without horizontal overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/studio");
  await expect(page.getByTestId("studio-research")).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.getByRole("button", { name: "Use exact names" }).click();
  await expect(page.getByRole("button", { name: "Find public guidance" })).toBeDisabled();
  await page.getByRole("checkbox", { name: /Permission confirmed/ }).check();
  await expect(page.getByRole("button", { name: "Find public guidance" })).toBeDisabled();
  await page.getByRole("button", { name: "Fictionalized" }).click();
  await page.getByRole("button", { name: "Use example institution" }).click();
  await expect(page.getByTestId("studio-profile")).toBeVisible();
  await expect(page.getByRole("region", { name: "Source review" })).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.screenshot({ path: "artifacts/screenshots/mobile-studio.png", fullPage: true });
  await page.getByRole("button", { name: "Approve profile" }).click();
  await page.getByRole("button", { name: "Use example rehearsal" }).click();
  await expect(page.getByRole("region", { name: "Outcome coverage" })).toContainText("4 / 4 reachable");
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.getByRole("region", { name: "Outcome coverage" }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: "artifacts/screenshots/mobile-studio-coverage.png" });
});

test("transfer evidence remains usable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openValidatedScenario(page);
  await page.getByRole("button", { name: "Start rehearsal" }).click();
  await page.getByRole("button", { name: /Call the saved directory number/ }).click();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.getByRole("button", { name: /Conversation/ }).click();
  await expect(page.getByRole("region", { name: "Evidence board" })).toContainText("Independent adviser confirmation");
  await page.getByRole("region", { name: "Evidence board" }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: "artifacts/screenshots/mobile-studio-evidence.png" });
  await page.getByRole("button", { name: "Task", exact: true }).click();
  await page.getByRole("button", { name: /Pause reimbursement/ }).click();
  await page.getByRole("button", { name: "Finish and review" }).click();
  await page.getByRole("button", { name: "Test in a new situation" }).click();
  await expect(page.getByTestId("studio-transfer")).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.getByRole("button", { name: /Ask for confirmation in the same group chat/ }).click();
  await expect(page.getByText("Verification stayed inside the request")).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.locator(".transfer-result").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "artifacts/screenshots/mobile-studio-transfer.png" });
  await page.getByRole("button", { name: "Open facilitator report" }).click();
  await expect(page.getByTestId("studio-report")).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.screenshot({ path: "artifacts/screenshots/mobile-facilitator-report.png", fullPage: true });
});
