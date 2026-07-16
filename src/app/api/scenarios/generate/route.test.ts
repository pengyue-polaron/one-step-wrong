import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/scenarios/generate/route";
import type { InstitutionProfile } from "@/ai/schemas/institution";
import { northbridgeInstitutionProfile } from "@/fixtures/institutionProfile";

const brief = {
  threatTopic: "Voice impersonation",
  targetLearner: "Student organization treasurers",
  ordinaryTask: "Finalize a guest-speaker reimbursement before an event.",
  environment: "Student organization finance workspace",
  pressure: "The event begins in twenty minutes",
  learningObjective: "Verify high-impact requests through an independently known channel.",
  durationMinutes: 8,
  tone: "realistic",
};

describe("POST /api/scenarios/generate", () => {
  it("requires an approved profile", async () => {
    const profile: InstitutionProfile = structuredClone(northbridgeInstitutionProfile);
    profile.approval.status = "review-required";
    const response = await POST(
      new Request("http://localhost/api/scenarios/generate", {
        method: "POST",
        body: JSON.stringify({ profile, brief }),
      }),
    );
    expect(response.status).toBe(409);
  });

  it("returns the validated scenario fixture without a key", async () => {
    const response = await POST(
      new Request("http://localhost/api/scenarios/generate", {
        method: "POST",
        body: JSON.stringify({ profile: northbridgeInstitutionProfile, brief, useFixture: true }),
      }),
    );
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.scenario.id).toBe("the-voice-you-know");
    expect(result.scenario.roleCards).toHaveLength(3);
  });
});
