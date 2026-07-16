import { NextResponse } from "next/server";
import { scenarioGenerationRequestSchema, generateScenario } from "@/ai/scenarios/generate";
import { voiceYouKnowScenario } from "@/fixtures/voiceYouKnow";
import { reviewedNyuInstitutionProfile } from "@/fixtures/institutionProfile";
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

  if (parsed.data.useFixture || !process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      scenario: voiceYouKnowScenario,
      profile: reviewedNyuInstitutionProfile,
      provenance: "reviewed-fixture",
      notice: parsed.data.useFixture
        ? "Loaded the reviewed NYU source profile and compiled its brand-safe flagship scenario."
        : "OpenAI is not configured, so the reviewed NYU source profile and its flagship scenario were loaded together.",
    });
  }

  try {
    const scenario = await generateScenario(parsed.data);
    return NextResponse.json({ scenario, provenance: "live-generation", notice: "GPT-5.6 produced a validated scenario package." });
  } catch {
    return NextResponse.json({
      scenario: voiceYouKnowScenario,
      profile: reviewedNyuInstitutionProfile,
      provenance: "reviewed-fixture",
      notice: "Live generation was unavailable or failed validation. The reviewed NYU source profile and its flagship scenario were loaded together.",
    });
  }
}
