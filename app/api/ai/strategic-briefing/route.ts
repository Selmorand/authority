import { generateStrategicBriefing } from "@/lib/aiResearchSummarizer";
import { researchSignals } from "@/data/researchSignals";
import type { LiveSignal } from "@/lib/fetchResearchSignals";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const liveSignals: LiveSignal[] = body.liveSignals || [];
    const result = await generateStrategicBriefing(
      liveSignals,
      researchSignals
    );
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { success: false, briefing: null, error: message },
      { status: 500 }
    );
  }
}
