import { NextResponse } from "next/server";
import { scenarioGenerationRequestSchema, generateScenario } from "@/ai/scenarios/generate";
import { adaptReviewedScenarioWithCodex } from "@/ai/scenarios/adaptLocal";
import { getAdaptiveProviderKind, hasAdaptiveProvider } from "@/ai/providers/server";
import { getReviewedScenario } from "@/fixtures/reviewedScenarioRegistry";
import { readBoundedJson } from "@/app/api/request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readBoundedJson(request, 131_072);
  if (!body.success) return NextResponse.json({ error: body.error }, { status: body.status });

  const parsed = scenarioGenerationRequestSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "The approved profile or teaching brief is incomplete.",
        issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      },
      { status: 400 },
    );
  }
  if (parsed.data.profile.approval.status !== "approved") {
    return NextResponse.json({ error: "Approve the Institution Profile before generating a scenario." }, { status: 409 });
  }

  if (parsed.data.useFixture) {
    const bundle = getReviewedScenario(parsed.data.reviewedScenarioId);
    return NextResponse.json({
      scenario: bundle.scenario,
      profile: bundle.profile,
      provenance: "reviewed-fixture",
      notice: `${bundle.scenario.title} is ready for review.`,
    });
  }
  if (!hasAdaptiveProvider()) {
    return NextResponse.json(
      { error: "New scenario generation is not available in this workspace. Use the reviewed example rehearsal." },
      { status: 503 },
    );
  }

  try {
    const adaptiveRuntime = getAdaptiveProviderKind();
    const localAdaptation = adaptiveRuntime === "local-codex"
      ? await adaptReviewedScenarioWithCodex(parsed.data)
      : null;
    const scenario = localAdaptation?.scenario ?? await generateScenario(parsed.data);
    return NextResponse.json({
      scenario,
      provenance: localAdaptation ? "local-adaptation" : "live-generation",
      adaptiveRuntime,
      notice: localAdaptation
        ? "A reviewed judgment pattern was matched to the brief, adapted, and revalidated."
        : "The new rehearsal passed all scenario checks.",
    });
  } catch (error) {
    console.error(
      "Scenario generation failed:",
      error instanceof Error ? error.message : "Unknown adaptive provider error.",
    );
    return NextResponse.json(
      { error: "The new rehearsal could not be completed. Keep the current brief or use the reviewed example." },
      { status: 502 },
    );
  }
}
