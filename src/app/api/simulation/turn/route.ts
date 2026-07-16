import { NextResponse } from "next/server";
import { createSimulationTurn, simulationTurnRequestSchema } from "@/ai/simulation/turn";
import { readBoundedJson } from "@/app/api/request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readBoundedJson(request, 163_840);
  if (!body.success) return NextResponse.json({ error: body.error }, { status: body.status });
  const parsed = simulationTurnRequestSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "The message or simulation state is invalid." }, { status: 400 });
  }
  const turn = await createSimulationTurn(parsed.data);
  return NextResponse.json({ turn });
}
