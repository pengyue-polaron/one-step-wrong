import { describe, expect, it } from "vitest";
import { isLocalCodexProviderEnabled } from "@/ai/providers/server";

describe("adaptive provider selection", () => {
  it("requires explicit local opt-in", () => {
    expect(isLocalCodexProviderEnabled({}, "development")).toBe(false);
    expect(isLocalCodexProviderEnabled({ CODEX_LOCAL_PROVIDER: "0" }, "development")).toBe(false);
    expect(isLocalCodexProviderEnabled({ CODEX_LOCAL_PROVIDER: "1" }, "development")).toBe(true);
    expect(isLocalCodexProviderEnabled({ CODEX_LOCAL_PROVIDER: "true" }, "development")).toBe(true);
  });

  it("never enables the Codex login adapter in production", () => {
    expect(isLocalCodexProviderEnabled({ CODEX_LOCAL_PROVIDER: "1" }, "production")).toBe(false);
  });
});
