import { describe, expect, it, vi } from "vitest";
import { createDebrief, type DebriefProvider } from "@/ai/debrief/createDebrief";
import { voiceYouKnowScenario } from "@/fixtures/voiceYouKnow";

describe("canonical debrief", () => {
  it("grounds completion and missed recovery in the deterministic trace", async () => {
    const result = await createDebrief(
      { scenario: voiceYouKnowScenario, actionIds: ["approve-change", "preserve-evidence"] },
      null,
    );
    expect(result.trace.endingId).toBe("expanded");
    expect(result.trace.completedRecoveryActionIds).toEqual(["preserve-evidence"]);
    expect(result.trace.missedRecoveryActionIds).toEqual(["notify-team", "report-incident"]);
    expect(result.provenance).toBe("deterministic-fallback");
  });

  it("falls back when generated coaching selects an unperformed action", async () => {
    const provider = {
      responses: {
        parse: vi.fn().mockResolvedValue({
          output_parsed: {
            causeChainIndex: 0,
            performedActionId: "report-incident",
            missedRecoveryActionId: null,
            transferRuleIndex: 0,
          },
        }),
      },
    } as unknown as DebriefProvider;
    const result = await createDebrief(
      { scenario: voiceYouKnowScenario, actionIds: ["pause-payment", "verify-adviser"] },
      provider,
    );
    expect(result.provenance).toBe("deterministic-fallback");
    expect(result.coaching.headline).toBe("Verified before release");
  });

  it("builds live coaching only from model-selected canonical IDs", async () => {
    const provider = {
      responses: {
        parse: vi.fn().mockResolvedValue({
          output_parsed: {
            causeChainIndex: 0,
            performedActionId: "approve-change",
            missedRecoveryActionId: "report-incident",
            transferRuleIndex: 1,
          },
        }),
      },
    } as unknown as DebriefProvider;
    const result = await createDebrief(
      { scenario: voiceYouKnowScenario, actionIds: ["approve-change", "preserve-evidence"] },
      provider,
    );
    expect(result.provenance).toBe("live-debrief");
    expect(result.coaching.summary).toContain("Approve new payment details");
    expect(result.coaching.summary).toContain("Report to Safety Desk");
    expect(result.coaching.nextTime).toBe(voiceYouKnowScenario.transferRules[1]);
  });
});
