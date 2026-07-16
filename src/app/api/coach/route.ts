import { NextResponse } from "next/server";
import {
  answerEvidenceQuestion,
  evidenceCoachRequestSchema,
} from "@/ai/debrief/evidenceCoach";
import { readBoundedJson } from "@/app/api/request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readBoundedJson(request, 196_608);
  if (!body.success) return NextResponse.json({ error: body.error }, { status: body.status });
  const parsed = evidenceCoachRequestSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "The evidence question is invalid." }, { status: 400 });
  }
  try {
    return NextResponse.json(await answerEvidenceQuestion(parsed.data));
  } catch {
    return NextResponse.json({ error: "The evidence question could not be answered from this run." }, { status: 400 });
  }
}
