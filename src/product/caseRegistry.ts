import { FinalSubmissionCase } from "@/cases/final-submission/FinalSubmissionCase";
import { finalSubmissionSummary } from "@/cases/final-submission/summary";
import { SharedDraftCase } from "@/cases/shared-draft/SharedDraftCase";
import { sharedDraftSummary } from "@/cases/shared-draft/definition";
import type { CaseModule, ProductCaseId } from "@/cases/types";
import { UnexpectedPushCase } from "@/cases/unexpected-push/UnexpectedPushCase";
import { unexpectedPushSummary } from "@/cases/unexpected-push/definition";

const finalSubmissionModule = {
  summary: finalSubmissionSummary,
  Runner: FinalSubmissionCase,
} satisfies CaseModule;
const sharedDraftModule = {
  summary: sharedDraftSummary,
  Runner: SharedDraftCase,
} satisfies CaseModule;
const unexpectedPushModule = {
  summary: unexpectedPushSummary,
  Runner: UnexpectedPushCase,
} satisfies CaseModule;

const allCaseModules = [
  finalSubmissionModule,
  sharedDraftModule,
  unexpectedPushModule,
] satisfies CaseModule[];

export const caseModules = [
  finalSubmissionModule,
  unexpectedPushModule,
] satisfies CaseModule[];
export const caseCatalog = caseModules.map((item) => item.summary);
export const caseRegistry = Object.fromEntries(
  allCaseModules.map((item) => [item.summary.id, item]),
) as Record<ProductCaseId, CaseModule>;
