import { NextResponse } from "next/server";
import { createDebrief, debriefRequestSchema } from "@/ai/debrief/createDebrief";
import { readBoundedJson } from "@/app/api/request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readBoundedJson(request, 131_072);
  if (!body.success) return NextResponse.json({ error: body.error }, { status: body.status });
  const parsed = debriefRequestSchema.safeParse(body.data);
  if (!parsed.success) return NextResponse.json({ error: "The recorded action history is invalid." }, { status: 400 });
  try {
    return NextResponse.json(await createDebrief(parsed.data));
  } catch {
    return NextResponse.json({ error: "The result could not be prepared from this action history." }, { status: 400 });
  }
}
