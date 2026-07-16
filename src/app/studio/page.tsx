import type { Metadata } from "next";
import { ScenarioStudio } from "@/app/studio/ScenarioStudio";

export const metadata: Metadata = {
  title: "Scenario Studio | One Step Wrong",
  description: "Research, review, compile, and rehearse a bounded digital-judgment scenario.",
};

export default function StudioPage() {
  return <ScenarioStudio />;
}
