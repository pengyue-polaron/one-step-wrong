import { spawnSync } from "node:child_process";
import { chmod, mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = process.cwd();
const baseUrl = process.env.DEMO_BASE_URL ?? "http://127.0.0.1:3000";
const outputDir = path.join(root, "artifacts", "demo");
const rawDir = path.join(outputDir, "raw");
const rawVideo = path.join(outputDir, "build-week-fixture-demo.webm");
const finalVideo = path.join(outputDir, "build-week-fixture-demo.mp4");
const subtitles = path.join(root, "scripts", "demo", "build-week-fixture-demo.en.srt");

const wait = (page, milliseconds) => page.waitForTimeout(milliseconds);

async function assertServer() {
  try {
    const response = await fetch(`${baseUrl}/studio`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    throw new Error(`Start the application before recording (${baseUrl}): ${error instanceof Error ? error.message : error}`);
  }
}

async function record() {
  await assertServer();
  await mkdir(rawDir, { recursive: true });
  await rm(rawVideo, { force: true });
  await rm(finalVideo, { force: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: rawDir,
      size: { width: 1280, height: 720 },
    },
  });
  const page = await context.newPage();
  const video = page.video();

  await page.goto(baseUrl);
  await wait(page, 4_000);
  await page.goto(`${baseUrl}/studio`);
  await wait(page, 4_000);

  await page.getByRole("button", { name: "Load reviewed example" }).click();
  await page.getByTestId("studio-profile").waitFor();
  await wait(page, 5_000);
  await page.locator(".profile-sources").scrollIntoViewIfNeeded();
  await wait(page, 7_000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await wait(page, 3_000);

  await page.getByRole("button", { name: "Approve profile" }).click();
  await page.getByTestId("studio-brief").waitFor();
  await wait(page, 6_000);
  await page.getByRole("button", { name: "Compile flagship example" }).click();
  await page.getByTestId("studio-preview").waitFor();
  await wait(page, 16_000);

  await page.getByRole("button", { name: "Launch rehearsal" }).click();
  await page.getByTestId("studio-live").waitFor();
  await wait(page, 7_000);
  await page.getByRole("button", { name: /Dr. Maya Chen/ }).click();
  await page.getByLabel("Message a role").fill("Can I confirm this through the number I already have?");
  await wait(page, 1_500);
  await page.getByRole("button", { name: "Send message" }).click();
  await page.getByText("Reviewed dialogue").last().waitFor();
  await wait(page, 5_000);

  await page.getByRole("button", { name: /Call adviser on known number/ }).click();
  await wait(page, 1_500);
  await page.getByRole("button", { name: /Pause reimbursement/ }).click();
  await wait(page, 3_000);
  await page.getByRole("button", { name: "Resolve and debrief" }).click();
  await page.getByTestId("studio-debrief").waitFor();
  await wait(page, 9_000);

  await page.getByRole("button", { name: "Replay scenario" }).click();
  await page.getByTestId("studio-live").waitFor();
  await wait(page, 4_000);
  for (const action of [
    /Approve new payment details/,
    /Share finance folder/,
    /Preserve message evidence/,
    /Revoke shared access/,
    /Notify affected people/,
    /Report to Safety Desk/,
  ]) {
    await page.getByRole("button", { name: action }).click();
    await wait(page, 1_200);
  }
  await wait(page, 2_000);
  await page.getByRole("button", { name: "Resolve and debrief" }).click();
  await page.getByTestId("studio-debrief").waitFor();
  await wait(page, 11_000);

  await context.close();
  await browser.close();
  const recordedPath = await video.path();
  await rename(recordedPath, rawVideo);

  const subtitleFilter = `subtitles=${subtitles}:force_style='FontName=DejaVu Sans,FontSize=18,PrimaryColour=&H00FFFFFF,BackColour=&H90000000,BorderStyle=3,Outline=1,Shadow=0,MarginV=24,Alignment=2'`;
  const ffmpeg = spawnSync("ffmpeg", [
    "-y",
    "-i",
    rawVideo,
    "-vf",
    subtitleFilter,
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "20",
    "-pix_fmt",
    "yuv420p",
    "-an",
    "-movflags",
    "+faststart",
    finalVideo,
  ], { stdio: "inherit" });
  if (ffmpeg.status !== 0) throw new Error(`FFmpeg exited with status ${ffmpeg.status}`);

  const probe = spawnSync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration:stream=codec_name,width,height",
    "-of",
    "json",
    finalVideo,
  ], { encoding: "utf8" });
  if (probe.status !== 0) throw new Error(`FFprobe exited with status ${probe.status}`);
  const metadata = JSON.parse(probe.stdout);
  const duration = Number(metadata.format?.duration);
  const videoStream = metadata.streams?.find((stream) => stream.codec_name === "h264");
  if (!Number.isFinite(duration) || duration > 180) throw new Error(`Demo duration is invalid: ${duration}`);
  if (videoStream?.width !== 1280 || videoStream?.height !== 720) {
    throw new Error(`Demo resolution is invalid: ${videoStream?.width}x${videoStream?.height}`);
  }

  await chmod(finalVideo, 0o644);
  await rm(rawVideo, { force: true });
  await rm(rawDir, { recursive: true, force: true });
  console.log(`${finalVideo} (${duration.toFixed(2)} seconds, 1280x720)`);
}

record().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
