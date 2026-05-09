import { runMultiModelAnalysis } from "@/lib/multiModelAnalysis";
import { researchSignals } from "@/data/researchSignals";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const context =
      body.context ||
      researchSignals
        .slice(0, 8)
        .map(
          (s) =>
            `- ${s.title} (urgency: ${s.urgency}, themes: ${s.relatedThemes.join(", ")})\n  ${s.insightSummary.slice(0, 120)}`
        )
        .join("\n");

    const result = await runMultiModelAnalysis(context);
    return Response.json({ success: true, analysis: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { success: false, analysis: null, error: message },
      { status: 500 }
    );
  }
}
