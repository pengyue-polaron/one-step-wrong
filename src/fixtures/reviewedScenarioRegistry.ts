import type { InstitutionProfile } from "@/ai/schemas/institution";
import type { ScenarioPackage } from "@/ai/schemas/scenario";
import { reviewedNyuInstitutionProfile } from "@/fixtures/institutionProfile";
import { recoveryWindowScenario } from "@/fixtures/recoveryWindow";
import { sharingScopeScenario } from "@/fixtures/sharingScope";
import { voiceYouKnowScenario } from "@/fixtures/voiceYouKnow";

export const reviewedScenarioIds = [
  "the-voice-you-know",
  "sharing-scope",
  "recovery-window",
] as const;

export type ReviewedScenarioId = (typeof reviewedScenarioIds)[number];

export type ReviewedScenarioBundle = {
  profile: InstitutionProfile;
  scenario: ScenarioPackage;
};

export const reviewedScenarioRegistry: Record<ReviewedScenarioId, ReviewedScenarioBundle> = {
  "the-voice-you-know": {
    profile: reviewedNyuInstitutionProfile,
    scenario: voiceYouKnowScenario,
  },
  "sharing-scope": {
    profile: reviewedNyuInstitutionProfile,
    scenario: sharingScopeScenario,
  },
  "recovery-window": {
    profile: reviewedNyuInstitutionProfile,
    scenario: recoveryWindowScenario,
  },
};

export function isReviewedScenarioId(value: string): value is ReviewedScenarioId {
  return reviewedScenarioIds.some((id) => id === value);
}

export function getReviewedScenario(id: ReviewedScenarioId) {
  return reviewedScenarioRegistry[id];
}
