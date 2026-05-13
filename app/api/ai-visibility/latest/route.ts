import prisma from "@/lib/prisma";

interface LatestPerQuery {
  queryId: string;
  query: string;
  perEngine: Record<
    string,
    {
      cited: boolean;
      position: number | null;
      matchedBy: string | null;
      citations: string[];
      responseExcerpt: string | null;
      date: string;
      runId: string;
    }
  >;
}

// GET /api/ai-visibility/latest
// Returns the most recent AIVisibilityCheck per (queryId, platform) pair,
// shaped for the dashboard grid.
export async function GET() {
  try {
    const rows = await prisma.aIVisibilityCheck.findMany({
      orderBy: [{ createdAt: "desc" }],
    });

    const latest: Record<string, LatestPerQuery> = {};
    for (const r of rows) {
      // Skip legacy seed rows that don't map to a current queryId.
      if (!r.queryId) continue;
      const key = r.queryId;
      if (!latest[key]) {
        latest[key] = {
          queryId: key,
          query: r.query,
          perEngine: {},
        };
      }
      // First row we see for (queryId, platform) is the most recent (sorted desc).
      if (!latest[key].perEngine[r.platform]) {
        let citations: string[] = [];
        if (r.citationsJson) {
          try {
            const parsed = JSON.parse(r.citationsJson);
            if (Array.isArray(parsed)) {
              citations = parsed.filter((u): u is string => typeof u === "string");
            }
          } catch {
            citations = [];
          }
        }
        latest[key].perEngine[r.platform] = {
          cited: r.cited,
          position: r.position,
          matchedBy: r.matchedBy,
          citations,
          responseExcerpt: r.responseExcerpt,
          date: r.date,
          runId: r.runId ?? "",
        };
      }
    }

    // Most recent run date overall
    const lastRunAt =
      rows.length > 0 ? rows[0].createdAt.toISOString() : null;

    return Response.json({
      success: true,
      results: Object.values(latest),
      lastRunAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { success: false, error: message, results: [] },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
