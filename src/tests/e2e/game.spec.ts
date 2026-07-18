import { expect, test, type Page } from "@playwright/test";

async function begin(page: Page, captureIntro = false) {
  await page.goto("/");
  if (captureIntro) await page.screenshot({ path: "artifacts/screenshots/case-library.png" });
  await page.getByTestId("case-final-submission").click();
  if (captureIntro) await page.screenshot({ path: "artifacts/screenshots/intro.png" });
  await page.getByRole("button", { name: "Check submission status" }).click();
  await page.getByRole("button", { name: "Reduce motion" }).click();
  await page.getByRole("button", { name: "Retry upload" }).click();
  await expect(page.getByRole("heading", { name: "Available networks" })).toBeVisible();
  await expect(page.getByText(/only a simulation|will not affect your computer|no data is collected/i)).toHaveCount(0);
}

test("case library exposes three reviewed rehearsals and two archive chapters", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Choose a rehearsal" })).toBeVisible();
  await expect(page.getByTestId("featured-rehearsal")).toBeVisible();
  await expect(page.getByTestId("rehearsal-sharing-scope")).toBeVisible();
  await expect(page.getByTestId("rehearsal-recovery-window")).toBeVisible();
  await expect(page.getByTestId("case-final-submission")).toBeVisible();
  await expect(page.getByTestId("case-shared-draft")).toHaveCount(0);
  await expect(page.getByTestId("case-unexpected-push")).toBeVisible();
});

test("Sharing Scope contains a public-link incident through every affected layer", async ({ page }) => {
  await page.goto("/rehearsal/sharing-scope");
  await expect(page.getByRole("heading", { name: "Sharing Scope" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Campus Drive task workspace" })).toContainText("Three teammates checking quotations");
  await page.getByRole("button", { name: /Create an editor link anyone can use/ }).click();
  await expect(page.getByRole("button", { name: /Add three named teammates as commenters/ })).toHaveCount(0);
  await page.getByRole("button", { name: /Review sharing activity/ }).click();
  await expect(page.getByRole("region", { name: "Evidence board" })).toContainText("Files downloaded outside the team");
  await page.screenshot({ path: "artifacts/screenshots/sharing-scope-incident.png", fullPage: true });
  for (const action of [
    /Restrict the public link/,
    /Restore the participant sheet/,
    /Preserve the activity record/,
    /Notify the project team and participants/,
    /Report to the Digital Safety Desk/,
  ]) {
    await page.getByRole("button", { name: action }).click();
  }
  await page.getByRole("button", { name: "Finish and review" }).click();
  await expect(page.getByText("CONTAINED", { exact: true })).toBeVisible();
  await expect(page.getByText("All required recovery actions were completed.")).toBeVisible();
  await page.screenshot({ path: "artifacts/screenshots/sharing-scope-debrief.png", fullPage: true });
});

test("Duo chapter binds approval to a player-initiated login", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("case-unexpected-push").click();
  await page.getByRole("button", { name: "Review login request" }).click();
  await expect(page.getByLabel("NYU Duo login verification")).toBeVisible();
  await page.screenshot({ path: "artifacts/screenshots/duo-request.png" });
  await page.getByTestId("choice-verify-browser").click();
  await page.getByRole("button", { name: "Review what happened" }).click();
  await expect(page.getByRole("heading", { name: "Tie approval to your own action" })).toBeVisible();
  await expect(page.getByText("Ask whether you initiated it")).toBeVisible();
});

async function connectDangerousNetwork(page: Page) {
  await page.getByTestId("network-campus-free-5g").click();
  await expect(page.getByText("NYU High-Speed Network Access")).toBeVisible();
  await expect(page.getByText(/only a simulation|will not affect your computer|no data is collected/i)).toHaveCount(0);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Download and install" }).click();
  await expect(page.getByTestId("install-dialog")).toBeVisible();
  await expect(page.getByText(/only a simulation|will not affect your computer|no data is collected/i)).toHaveCount(0);
  await page.getByRole("button", { name: "Continue installation" }).click();
  await expect(page.getByTestId("submission-card")).toBeVisible();
}

async function submitAssignment(page: Page) {
  await page.getByRole("button", { name: "Add file" }).click();
  await expect(page.getByRole("button", { name: "Submit to Brightspace" })).toBeVisible({ timeout: 8_000 });
  await page.getByRole("checkbox", { name: /my own work/ }).check();
  await page.getByRole("button", { name: "Submit to Brightspace" }).click();
  await expect(page.getByTestId("submission-success")).toBeVisible();
}

async function revealIncident(page: Page, loginChoice: "Review details" | "Handle later" = "Review details") {
  await page.getByRole("button", { name: "Save submission receipt" }).click();
  await page.getByRole("button", { name: "Reply to Lin Xiao" }).click();
  await page.getByRole("button", { name: "Reply" }).click();
  await expect(page.getByTestId("login-alert")).toBeVisible();
  await page.getByRole("button", { name: loginChoice }).click();
  await page.getByRole("button", { name: "Open course system" }).click();
  await expect(page.getByTestId("session-expired")).toBeVisible();
  await page.waitForTimeout(250);
  await page.getByRole("button", { name: "View message" }).click();
  await page.waitForTimeout(250);
  await page.getByRole("button", { name: "Review sent messages" }).click();
  await expect(page.getByText("Stop the incident from spreading")).toBeVisible();
}

test("safe guest route reaches the verified ending", async ({ page }) => {
  await begin(page, true);
  await page.waitForTimeout(220);
  await page.screenshot({ path: "artifacts/screenshots/network-selection.png" });
  await page.getByTestId("network-campus-guest").click();
  await page.getByRole("checkbox", { name: /guest network terms/ }).check();
  await page.getByRole("button", { name: "Connect to guest network" }).click();
  await expect(page.getByTestId("submission-card")).toBeVisible({ timeout: 5_000 });
  await submitAssignment(page);
  await page.getByRole("button", { name: "Finish this submission" }).click();
  await expect(page.getByRole("heading", { name: "One more check" })).toBeVisible();
  await expect(page.getByText("No account or device anomalies", { exact: true })).toBeVisible();
});

test("dangerous route can be contained through individual response actions", async ({ page }) => {
  await begin(page);
  await connectDangerousNetwork(page);
  await submitAssignment(page);
  await revealIncident(page);
  await page.waitForTimeout(220);
  await page.screenshot({ path: "artifacts/screenshots/delayed-consequence.png" });

  await page.getByRole("button", { name: "Delete unexpected message" }).click();
  await page.getByRole("button", { name: /Explain the suspicious network/ }).click();
  await page.getByRole("button", { name: "Account security" }).click();
  await page.getByRole("button", { name: "End this session" }).click();
  await page.getByRole("button", { name: "Network settings" }).click();
  await page.getByRole("button", { name: "Remove profile" }).click();
  await page.getByRole("button", { name: "IT support" }).click();
  await page.getByRole("button", { name: "Submit ticket" }).click();
  await page.getByRole("button", { name: "Finish response and review" }).click();

  await expect(page.getByRole("heading", { name: "Contained in time" })).toBeVisible();
  await expect(page.getByText("The unknown session is ended and the impact is contained.")).toBeVisible();
  await page.waitForTimeout(220);
  await page.screenshot({ path: "artifacts/screenshots/debrief-contained.png", fullPage: true });

  await page.getByRole("button", { name: /Retry critical moment/ }).click();
  await expect(page.getByTestId("login-alert")).toBeVisible();
});

test("ignored incident reaches the expanded ending and full restart clears state", async ({ page }) => {
  await begin(page);
  await connectDangerousNetwork(page);
  await submitAssignment(page);
  await revealIncident(page, "Handle later");
  await page.getByRole("button", { name: "Finish response and review" }).click();
  await expect(page.getByRole("heading", { name: "Impact expands" })).toBeVisible();
  await expect(page.getByText("The impersonated message keeps spreading and the account needs further recovery.")).toBeVisible();
  await page.getByRole("button", { name: /Replay the full case/ }).click();
  await expect(page.getByRole("heading", { name: "Final Submission" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Check submission status" })).toBeVisible();
});
