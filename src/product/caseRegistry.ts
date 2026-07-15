import { FinalSubmissionCase } from "@/cases/final-submission/FinalSubmissionCase";
import { finalSubmissionSummary } from "@/cases/final-submission/summary";
import { SharedDraftCase } from "@/cases/shared-draft/SharedDraftCase";
import { sharedDraftSummary } from "@/cases/shared-draft/definition";
import type { CaseModule, ProductCaseId } from "@/cases/types";
import { UnexpectedPushCase } from "@/cases/unexpected-push/UnexpectedPushCase";
import { unexpectedPushSummary } from "@/cases/unexpected-push/definition";

export const caseModules = [
  { summary: finalSubmissionSummary, Runner: FinalSubmissionCase },
  { summary: sharedDraftSummary, Runner: SharedDraftCase },
  { summary: unexpectedPushSummary, Runner: UnexpectedPushCase },
] satisfies CaseModule[];

export const caseCatalog = caseModules.map((item) => item.summary);
export const caseRegistry = Object.fromEntries(
  caseModules.map((item) => [item.summary.id, item]),
) as Record<ProductCaseId, CaseModule>;
