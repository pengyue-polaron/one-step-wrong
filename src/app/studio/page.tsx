import type { Metadata } from "next";
import { ScenarioStudio } from "@/app/studio/ScenarioStudio";
import { hasOpenAIApiKey } from "@/ai/openai/server";
import { hasAdaptiveProvider } from "@/ai/providers/server";

export const metadata: Metadata = {
  title: "Scenario Studio | One Step Wrong",
  description: "Create and try a source-grounded digital-judgment rehearsal.",
};

export const dynamic = "force-dynamic";

export default function StudioPage() {
  return (
    <ScenarioStudio
      adaptiveGenerationAvailable={hasAdaptiveProvider()}
      adaptiveResearchAvailable={hasOpenAIApiKey()}
    />
  );
}
