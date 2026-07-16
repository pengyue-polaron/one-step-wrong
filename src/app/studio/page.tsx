import type { Metadata } from "next";
import { ScenarioStudio } from "@/app/studio/ScenarioStudio";

export const metadata: Metadata = {
  title: "Scenario Studio | One Step Wrong",
  description: "Create and try a source-grounded digital-judgment rehearsal.",
};

export default function StudioPage() {
  return <ScenarioStudio />;
}
