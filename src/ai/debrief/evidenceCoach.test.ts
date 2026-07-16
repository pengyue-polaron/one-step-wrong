import { describe, expect, it, vi } from "vitest";
import {
  answerEvidenceQuestion,
  type EvidenceCoachProvider,
} from "@/ai/debrief/evidenceCoach";
import { reviewedNyuInstitutionProfile } from "@/fixtures/institutionProfile";
import { voiceYouKnowScenario } from "@/fixtures/voiceYouKnow";
import { sharingScopeScenario } from "@/fixtures/sharingScope";

const request = {
  scenario: voiceYouKnowScenario,
  profile: reviewedNyuInstitutionProfile,
  actionIds: ["call-request-number", "pause-payment"],
  question: "Why did the callback not prove who sent the request?",
};

describe("evidence coach", () => {
  it("answers from discovered evidence without a provider", async () => {
    const result = await answerEvidenceQuestion(request, null);
    expect(result.provenance).toBe("reviewed-coach");
    expect(result.evidenceIds).toEqual(["callback-controlled"]);
    expect(result.sourceFactIds).toEqual([]);
    expect(result.answer).toContain("Callback came from the request");
  });

  it("rejects generated citations to evidence the learner did not discover", async () => {
    const provider = {
      responses: {
        parse: vi.fn().mockResolvedValue({
          output_parsed: {
            answer: "The message used inconsistent account details.",
            evidenceIds: ["message-mismatch"],
            sourceFactIds: [],
          },
        }),
      },
    } as unknown as EvidenceCoachProvider;
    const result = await answerEvidenceQuestion(
      { ...request, actionIds: ["call-request-number"] },
      provider,
    );
    expect(result.provenance).toBe("reviewed-coach");
    expect(result.evidenceIds).toEqual(["callback-controlled"]);
  });

  it("accepts a grounded adaptive answer", async () => {
    const provider = {
      responses: {
        parse: vi.fn().mockResolvedValue({
          output_parsed: {
            answer: "The callback repeated the claim but did not move verification outside the request.",
            evidenceIds: ["callback-controlled"],
            sourceFactIds: ["payment-verification-policy"],
          },
        }),
      },
    } as unknown as EvidenceCoachProvider;
    const result = await answerEvidenceQuestion(request, provider);
    expect(result.provenance).toBe("live-coach");
    expect(result.evidenceIds).toEqual(["callback-controlled"]);
  });

  it("grounds reviewed answers in a second scenario without flagship evidence IDs", async () => {
    const result = await answerEvidenceQuestion({
      scenario: sharingScopeScenario,
      profile: reviewedNyuInstitutionProfile,
      actionIds: ["share-public-edit-link", "review-sharing-activity"],
      question: "What changed when access depended on possession of a link?",
    }, null);
    expect(result.provenance).toBe("reviewed-coach");
    expect(result.evidenceIds).toEqual(["public-link-transferability"]);
    expect(result.answer).toContain("Access follows the link");
  });
});
