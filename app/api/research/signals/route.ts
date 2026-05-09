import { fetchLiveSignals } from "@/lib/fetchResearchSignals";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await fetchLiveSignals();
    return Response.json({ success: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { success: false, signals: [], sourcesFetched: 0, sourcesFailed: 0, totalFiltered: 0, error: message },
      { status: 500 }
    );
  }
}
