import type { Metadata } from "next";
import { ScenarioStudio } from "@/app/studio/ScenarioStudio";

export const metadata: Metadata = {
  title: "The Voice You Know | One Step Wrong",
  description: "Practice verifying a familiar high-impact request through independent evidence.",
};

export default function FeaturedRehearsalPage() {
  return <ScenarioStudio mode="featured" />;
}
