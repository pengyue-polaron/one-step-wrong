import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/debrief/route";
import { voiceYouKnowScenario } from "@/fixtures/voiceYouKnow";

describe("POST /api/debrief", () => {
  it("rejects a canonical trace that bypasses action prerequisites", async () => {
    const response = await POST(
      new Request("http://localhost/api/debrief", {
        method: "POST",
        body: JSON.stringify({ scenario: voiceYouKnowScenario, actionIds: ["revoke-access"] }),
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "The canonical trace could not be evaluated." });
  });
});
