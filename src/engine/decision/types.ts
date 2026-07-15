import type { ComponentType } from "react";
import type { CaseEnding, CaseSummary } from "@/cases/types";

export type DecisionCaseId = Exclude<CaseSummary["id"], "final-submission">;
export type CaseRoute = "verified" | "caution" | "incident";

export type DecisionOption = {
  id: string;
  title: string;
  meta: string;
  description: string;
  route: CaseRoute;
  event: string;
};

export type ResponseStep = {
  id: string;
  title: string;
  description: string;
  event: string;
  required: boolean;
};

export type DecisionCaseDefinition = CaseSummary & {
  id: DecisionCaseId;
  intro: {
    time: string;
    title: string;
    body: string;
    task: string;
    startLabel: string;
  };
  decision: {
    eyebrow: string;
    title: string;
    body: string;
    deadline: string;
    options: DecisionOption[];
  };
  incident: {
    delay: string;
    title: string;
    body: string;
    evidence: Array<{ label: string; value: string }>;
  };
  responseTitle: string;
  responseBody: string;
  responseSteps: ResponseStep[];
  endings: Record<CaseEnding, { eyebrow: string; title: string; summary: string; detail: string }>;
  clues: string[];
  causeChain: Record<CaseRoute, string[]>;
  transferRules: Array<{ title: string; body: string }>;
  correctPath: string[];
};

export type DecisionSceneProps = {
  definition: DecisionCaseDefinition;
  onSelect: (option: DecisionOption) => void;
};

export type DecisionCaseExperience = {
  definition: DecisionCaseDefinition;
  IntroScene: ComponentType;
  DecisionScene: ComponentType<DecisionSceneProps>;
};

export type DecisionStage = "intro" | "decision" | "outcome" | "response" | "debrief";
export type DecisionEvent = {
  id: string;
  time: string;
  title: string;
  detail?: string;
  tone: "info" | "notice" | "incident" | "success";
};
