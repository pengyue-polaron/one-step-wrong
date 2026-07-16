import { describe, expect, it } from "vitest";
import { assertScenarioCoverage, evaluateScenarioCoverage } from "@/engine/simulation/coverage";
import { voiceYouKnowScenario } from "@/fixtures/voiceYouKnow";
import { sharingScopeScenario } from "@/fixtures/sharingScope";

describe("scenario outcome coverage", () => {
  it("finds a legal representative path for every flagship ending", () => {
    const coverage = evaluateScenarioCoverage(voiceYouKnowScenario);
    expect(coverage.allOutcomesReachable).toBe(true);
    expect(coverage.uncoveredEndingIds).toEqual([]);
    expect(coverage.endingCoverage.map((result) => result.endingId)).toEqual([
      "safe",
      "caution",
      "contained",
      "expanded",
    ]);
    expect(coverage.endingCoverage.find((result) => result.endingId === "safe")?.actionIds).toEqual([
      "verify-adviser",
    ]);
    expect(coverage.endingCoverage.find((result) => result.endingId === "expanded")?.actionIds).toEqual([
      "approve-change",
    ]);
  });

  it("rejects a declared ending with no legal action path", () => {
    const unreachable = structuredClone(voiceYouKnowScenario);
    const safe = unreachable.endings.find((ending) => ending.id === "safe")!;
    safe.forbiddenActionIds.push("verify-adviser");
    expect(() => assertScenarioCoverage(unreachable)).toThrow("unreachable outcomes: safe");
  });

  it("finds all four outcomes for Sharing Scope with exclusive decisions", () => {
    const coverage = evaluateScenarioCoverage(sharingScopeScenario);
    expect(coverage.reachableStateCount).toBe(29);
    expect(coverage.allOutcomesReachable).toBe(true);
    expect(coverage.endingCoverage.find((result) => result.endingId === "safe")?.actionIds).toEqual([
      "share-named-commenters",
    ]);
    expect(coverage.endingCoverage.find((result) => result.endingId === "expanded")?.actionIds).toEqual([
      "share-public-edit-link",
    ]);
  });
});
