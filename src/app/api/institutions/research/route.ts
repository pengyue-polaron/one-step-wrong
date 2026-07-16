import { NextResponse } from "next/server";
import { reviewedNyuInstitutionProfile } from "@/fixtures/institutionProfile";
import { institutionResearchRequestSchema, researchInstitution } from "@/ai/research/institution";
import { readBoundedJson } from "@/app/api/request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readBoundedJson(request, 8_192);
  if (!body.success) return NextResponse.json({ error: body.error }, { status: body.status });

  const parsed = institutionResearchRequestSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Check the institution name and official domains.",
        issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      },
      { status: 400 },
    );
  }

  if (parsed.data.useFixture || !process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      profile: reviewedNyuInstitutionProfile,
      provenance: "reviewed-fixture",
      notice: "The reviewed example institution is ready.",
    });
  }

  try {
    const profile = await researchInstitution(parsed.data);
    return NextResponse.json({
      profile,
      provenance: "live-research",
      notice: "Public guidance is ready for review. No fact is approved yet.",
    });
  } catch {
    return NextResponse.json({
      profile: reviewedNyuInstitutionProfile,
      provenance: "reviewed-fixture",
      notice: "Source research could not be completed, so the reviewed example institution was loaded.",
    });
  }
}
