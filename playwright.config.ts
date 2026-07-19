import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT || 3100);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./src/tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
    viewport: { width: 1366, height: 768 },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: process.env.CI ? `npm run start -- -p ${port}` : `npm run dev -- -p ${port}`,
    env: {
      CODEX_LOCAL_PROVIDER: process.env.PLAYWRIGHT_CODEX_PROVIDER || "0",
      NEXT_DIST_DIR: process.env.CI ? ".next" : ".next-playwright",
      OPENAI_API_KEY: process.env.PLAYWRIGHT_OPENAI_API_KEY || "",
    },
    url: baseURL,
    reuseExistingServer: false,
  },
});
