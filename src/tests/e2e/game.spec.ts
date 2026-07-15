import { expect, test, type Page } from "@playwright/test";

async function begin(page: Page, captureIntro = false) {
  await page.goto("/");
  if (captureIntro) await page.screenshot({ path: "artifacts/screenshots/case-library.png" });
  await page.getByTestId("case-final-submission").click();
  if (captureIntro) await page.screenshot({ path: "artifacts/screenshots/intro.png" });
  await page.getByRole("button", { name: "查看提交状态" }).click();
  await page.getByRole("button", { name: "重新上传" }).click();
  await expect(page.getByRole("heading", { name: "可用网络" })).toBeVisible();
  await expect(page.getByText(/游戏内模拟|不会修改设备设置|不采集或发送|不会保存或发送/)).toHaveCount(0);
}

test("case library exposes three complete chapters", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "选择一个案例" })).toBeVisible();
  await expect(page.getByTestId("case-final-submission")).toBeVisible();
  await expect(page.getByTestId("case-shared-draft")).toBeVisible();
  await expect(page.getByTestId("case-unexpected-push")).toBeVisible();
});

test("Drive public link route can be contained through scoped actions", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("case-shared-draft").click();
  await page.getByRole("button", { name: "打开共享设置" }).click();
  await expect(page.getByLabel("NYU Drive 共享设置")).toBeVisible();
  await page.screenshot({ path: "artifacts/screenshots/drive-sharing.png" });
  await page.getByTestId("choice-public-link").click();
  await expect(page.getByRole("heading", { name: "出现不在小组名单里的访问者" })).toBeVisible();
  await page.getByRole("button", { name: "处理共享异常" }).click();
  for (const id of ["restrict-link", "remove-outsider", "restore-version", "notify-team"]) await page.getByTestId(`response-${id}`).click();
  await page.getByRole("button", { name: "完成处理并复盘" }).click();
  await expect(page.getByRole("heading", { name: "访问已收回" })).toBeVisible();
  await page.screenshot({ path: "artifacts/screenshots/drive-debrief.png", fullPage: true });
  await page.locator(".debrief-actions").getByRole("button", { name: "返回案例库" }).click();
  await expect(page.getByText("1 / 3 已完成")).toBeVisible();
});

test("Duo chapter binds approval to a player-initiated login", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("case-unexpected-push").click();
  await page.getByRole("button", { name: "查看登录请求" }).click();
  await expect(page.getByLabel("NYU Duo 登录确认")).toBeVisible();
  await page.screenshot({ path: "artifacts/screenshots/duo-request.png" });
  await page.getByTestId("choice-verify-browser").click();
  await page.getByRole("button", { name: "查看本次复盘" }).click();
  await expect(page.getByRole("heading", { name: "先绑定自己的动作" })).toBeVisible();
  await expect(page.getByText("先问是否由我发起")).toBeVisible();
});

async function connectDangerousNetwork(page: Page) {
  await page.getByTestId("network-campus-free-5g").click();
  await expect(page.getByText("NYU 高速网络接入")).toBeVisible();
  await expect(page.getByText(/游戏内模拟|不会修改设备设置|不采集或发送|不会保存或发送/)).toHaveCount(0);
  await page.getByRole("button", { name: "继续" }).click();
  await page.getByRole("button", { name: "下载并安装" }).click();
  await expect(page.getByTestId("install-dialog")).toBeVisible();
  await expect(page.getByText(/游戏内模拟|不会修改设备设置|不采集或发送|不会保存或发送/)).toHaveCount(0);
  await page.getByRole("button", { name: "继续安装" }).click();
  await expect(page.getByTestId("submission-card")).toBeVisible();
}

async function submitAssignment(page: Page) {
  await page.getByRole("button", { name: "添加文件" }).click();
  await expect(page.getByRole("button", { name: "提交至 Brightspace" })).toBeVisible({ timeout: 8_000 });
  await page.getByRole("checkbox", { name: /本人完成的作业/ }).check();
  await page.getByRole("button", { name: "提交至 Brightspace" }).click();
  await expect(page.getByTestId("submission-success")).toBeVisible();
}

async function revealIncident(page: Page, loginChoice: "查看详情" | "稍后处理" = "查看详情") {
  await page.getByRole("button", { name: "保存提交回执" }).click();
  await page.getByRole("button", { name: "回复林晓" }).click();
  await page.getByRole("button", { name: "回复" }).click();
  await expect(page.getByTestId("login-alert")).toBeVisible();
  await page.getByRole("button", { name: loginChoice }).click();
  await page.getByRole("button", { name: "打开课程系统" }).click();
  await expect(page.getByTestId("session-expired")).toBeVisible();
  await page.getByRole("button", { name: "查看消息" }).click();
  await page.getByRole("button", { name: "查看发送记录" }).click();
  await expect(page.getByText("阻止异常继续扩大")).toBeVisible();
}

test("safe guest route reaches the verified ending", async ({ page }) => {
  await begin(page, true);
  await page.waitForTimeout(220);
  await page.screenshot({ path: "artifacts/screenshots/network-selection.png" });
  await page.getByTestId("network-campus-guest").click();
  await page.getByRole("checkbox", { name: /访客网络使用条款/ }).check();
  await page.getByRole("button", { name: "连接访客网络" }).click();
  await expect(page.getByTestId("submission-card")).toBeVisible({ timeout: 5_000 });
  await submitAssignment(page);
  await page.getByRole("button", { name: "结束本次提交" }).click();
  await expect(page.getByRole("heading", { name: "多确认一步" })).toBeVisible();
  await expect(page.getByText("账号与设备未出现异常", { exact: true })).toBeVisible();
});

test("dangerous route can be contained through individual response actions", async ({ page }) => {
  await begin(page);
  await connectDangerousNetwork(page);
  await submitAssignment(page);
  await revealIncident(page);
  await page.waitForTimeout(220);
  await page.screenshot({ path: "artifacts/screenshots/delayed-consequence.png" });

  await page.getByRole("button", { name: "删除异常消息" }).click();
  await page.getByRole("button", { name: /说明可疑网络/ }).click();
  await page.getByRole("button", { name: "账号安全" }).click();
  await page.getByRole("button", { name: "退出此设备" }).click();
  await page.getByRole("button", { name: "网络设置" }).click();
  await page.getByRole("button", { name: "删除配置" }).click();
  await page.getByRole("button", { name: "IT 支持" }).click();
  await page.getByRole("button", { name: "提交工单" }).click();
  await page.getByRole("button", { name: "完成处理并复盘" }).click();

  await expect(page.getByRole("heading", { name: "及时止损" })).toBeVisible();
  await expect(page.getByText("异常会话已终止，影响范围被控制。")).toBeVisible();
  await page.waitForTimeout(220);
  await page.screenshot({ path: "artifacts/screenshots/debrief-contained.png", fullPage: true });

  await page.getByRole("button", { name: /重试关键节点/ }).click();
  await expect(page.getByTestId("login-alert")).toBeVisible();
});

test("ignored incident reaches the expanded ending and full restart clears state", async ({ page }) => {
  await begin(page);
  await connectDangerousNetwork(page);
  await submitAssignment(page);
  await revealIncident(page, "稍后处理");
  await page.getByRole("button", { name: "完成处理并复盘" }).click();
  await expect(page.getByRole("heading", { name: "影响扩大" })).toBeVisible();
  await expect(page.getByText("冒名消息继续传播，账号需要进一步重置。")).toBeVisible();
  await page.getByRole("button", { name: /重新体验完整案例/ }).click();
  await expect(page.getByRole("heading", { name: "最后一次提交" })).toBeVisible();
  await expect(page.getByRole("button", { name: "查看提交状态" })).toBeVisible();
});
