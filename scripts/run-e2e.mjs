import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const nextEnvUrl = new URL("../next-env.d.ts", import.meta.url);
const playwrightCli = fileURLToPath(new URL("../node_modules/@playwright/test/cli.js", import.meta.url));
const originalNextEnv = await readFile(nextEnvUrl, "utf8");

let exitCode = 1;
try {
  exitCode = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [playwrightCli, "test", ...process.argv.slice(2)], {
      env: process.env,
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code) => resolve(code ?? 1));
  });
} finally {
  await writeFile(nextEnvUrl, originalNextEnv, "utf8");
}

process.exitCode = exitCode;
