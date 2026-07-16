import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/scenarios/generate/route";
import type { InstitutionProfile } from "@/ai/schemas/institution";
import { reviewedNyuInstitutionProfile } from "@/fixtures/institutionProfile";

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
    const profile: InstitutionProfile = structuredClone(reviewedNyuInstitutionProfile);
    profile.approval.status = "review-required";
    const response = await POST(
      new Request("http://localhost/api/scenarios/generate", {
        method: "POST",
        body: JSON.stringify({ profile, brief }),
      }),
    );
    expect(response.status).toBe(409);
  });

  it("returns the explicitly requested validated scenario fixture without a key", async () => {
    const response = await POST(
      new Request("http://localhost/api/scenarios/generate", {
        method: "POST",
        body: JSON.stringify({ profile: reviewedNyuInstitutionProfile, brief, useFixture: true }),
      }),
    );
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.scenario.id).toBe("the-voice-you-know");
    expect(result.scenario.roleCards).toHaveLength(3);
    expect(result.profile.id).toBe(result.scenario.sourceProfileId);
    expect(result.profile.publicationMode).toBe(result.scenario.publicationMode);
  });

  it("selects a reviewed rehearsal by explicit ID", async () => {
    const response = await POST(
      new Request("http://localhost/api/scenarios/generate", {
        method: "POST",
        body: JSON.stringify({
          profile: reviewedNyuInstitutionProfile,
          brief,
          useFixture: true,
          reviewedScenarioId: "sharing-scope",
        }),
      }),
    );
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.scenario.id).toBe("sharing-scope");
    expect(result.scenario.exclusiveActionGroups[0].id).toBe("sharing-method");
    expect(result.notice).toContain("Sharing Scope");
  });

  it("does not replace a live generation request with the fixture when no key is present", async () => {
    const previous = process.env.OPENAI_API_KEY;
    try {
      for (const apiKey of [undefined, "   "]) {
        if (apiKey === undefined) delete process.env.OPENAI_API_KEY;
        else process.env.OPENAI_API_KEY = apiKey;
        const response = await POST(
          new Request("http://localhost/api/scenarios/generate", {
            method: "POST",
            body: JSON.stringify({
              profile: reviewedNyuInstitutionProfile,
              brief,
              useFixture: false,
            }),
          }),
        );
        const result = await response.json();
        expect(response.status).toBe(503);
        expect(result.error).toContain("Use the reviewed example rehearsal");
        expect(result).not.toHaveProperty("scenario");
      }
    } finally {
      if (previous === undefined) delete process.env.OPENAI_API_KEY;
      else process.env.OPENAI_API_KEY = previous;
    }
  });

  it("returns the reviewed profile with the fixture instead of misattributing it to another profile", async () => {
    const profile: InstitutionProfile = structuredClone(reviewedNyuInstitutionProfile);
    profile.id = "another-approved-profile";
    profile.displayName = "Another Approved Institution";
    const response = await POST(
      new Request("http://localhost/api/scenarios/generate", {
        method: "POST",
        body: JSON.stringify({ profile, brief, useFixture: true }),
      }),
    );
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.profile.id).toBe("new-york-university");
    expect(result.scenario.sourceProfileId).toBe(result.profile.id);
    expect(result.notice).toContain("The Voice You Know");
  });
});
