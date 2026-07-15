import type { ComponentType } from "react";

export type ProductCaseId = "final-submission" | "shared-draft" | "unexpected-push";
export type CaseEnding = "verified" | "caution" | "contained" | "expanded";
export type CaseTone = "violet" | "blue" | "green";

export type CaseSummary = {
  id: ProductCaseId;
  number: string;
  title: string;
  kicker: string;
  summary: string;
  location: string;
  duration: string;
  topic: string;
  app: string;
  tone: CaseTone;
};

export type CaseRunnerProps = {
  onExit: () => void;
  onComplete: (ending: CaseEnding | string) => void;
};

export type CaseModule = {
  summary: CaseSummary;
  Runner: ComponentType<CaseRunnerProps>;
};
