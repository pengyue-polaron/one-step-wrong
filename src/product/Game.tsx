"use client";

import { useState } from "react";
import { CaseLibrary } from "@/product/CaseLibrary";
import { caseRegistry } from "@/product/caseRegistry";
import type { CaseEnding, ProductCaseId } from "@/cases/types";

export function Game() {
  const [activeCase, setActiveCase] = useState<ProductCaseId | null>(null);
  const [completed, setCompleted] = useState<Partial<Record<ProductCaseId, CaseEnding | string>>>({});

  const finishCase = (id: ProductCaseId, ending: CaseEnding | string) => {
    setCompleted((current) => ({ ...current, [id]: ending }));
    setActiveCase(null);
  };

  if (!activeCase) return <CaseLibrary completed={completed} onStart={setActiveCase} />;

  const ActiveCase = caseRegistry[activeCase].Runner;
  return <ActiveCase onExit={() => setActiveCase(null)} onComplete={(ending) => finishCase(activeCase, ending)} />;
}
