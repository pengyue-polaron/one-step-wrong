import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

process.env.CODEX_LOCAL_PROVIDER = "0";

Object.defineProperty(window, "scrollTo", {
  configurable: true,
  value: vi.fn(),
});
