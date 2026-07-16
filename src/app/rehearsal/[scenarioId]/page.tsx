import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScenarioStudio } from "@/app/studio/ScenarioStudio";
import {
  getReviewedScenario,
  isReviewedScenarioId,
  reviewedScenarioIds,
} from "@/fixtures/reviewedScenarioRegistry";

export function generateStaticParams() {
  return reviewedScenarioIds.map((scenarioId) => ({ scenarioId }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}): Promise<Metadata> {
  const { scenarioId } = await params;
  if (!isReviewedScenarioId(scenarioId)) return {};
  const { scenario } = getReviewedScenario(scenarioId);
  return {
    title: `${scenario.title} | One Step Wrong`,
    description: scenario.summary,
  };
}

export default async function ReviewedRehearsalPage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;
  if (!isReviewedScenarioId(scenarioId)) notFound();
  const bundle = getReviewedScenario(scenarioId);
  return (
    <ScenarioStudio
      initialProfile={bundle.profile}
      initialScenario={bundle.scenario}
      mode="featured"
    />
  );
}
