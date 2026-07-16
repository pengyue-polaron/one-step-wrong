import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/coach/route";
import { reviewedNyuInstitutionProfile } from "@/fixtures/institutionProfile";
import { voiceYouKnowScenario } from "@/fixtures/voiceYouKnow";

describe("POST /api/coach", () => {
  it("returns a reviewed answer when no provider is configured", async () => {
    const response = await POST(new Request("http://localhost/api/coach", {
      method: "POST",
      body: JSON.stringify({
        scenario: voiceYouKnowScenario,
        profile: reviewedNyuInstitutionProfile,
        actionIds: ["call-request-number"],
        question: "What did the callback establish?",
      }),
    }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.provenance).toBe("reviewed-coach");
    expect(body.evidenceIds).toEqual(["callback-controlled"]);
  });

  it("rejects a repeated or unavailable action history", async () => {
    const response = await POST(new Request("http://localhost/api/coach", {
      method: "POST",
      body: JSON.stringify({
        scenario: voiceYouKnowScenario,
        profile: reviewedNyuInstitutionProfile,
        actionIds: ["revoke-access"],
        question: "Why did this happen?",
      }),
    }));
    expect(response.status).toBe(400);
  });
});
