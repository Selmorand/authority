import { runVisibilityCheck } from "@/lib/aiVisibilityRunner";
import type { Engine } from "@/lib/aiVisibilityRunner";

// POST /api/ai-visibility/check
// Body: { engines?: Engine[], priority?: "high" | "all", queryIds?: string[] }
// Synchronously runs the check (up to ~5 min for full sweep) and returns
// a run summary. Results are also persisted as each check completes, so
// even if the client disconnects, the data is saved.
export async function POST(request: Request) {
  let body: {
    engines?: Engine[];
    priority?: "high" | "all";
    queryIds?: string[];
  } = {};
  try {
    body = await request.json();
  } catch {
    // empty body is fine — defaults below
  }

  const engines: Engine[] =
    Array.isArray(body.engines) && body.engines.length > 0
      ? body.engines.filter((e): e is Engine => e === "openai" || e === "anthropic")
      : ["openai", "anthropic"];

  if (engines.length === 0) {
    return Response.json(
      { success: false, error: "No valid engines specified" },
      { status: 400 }
    );
  }

  try {
    const summary = await runVisibilityCheck({
      engines,
      priority: body.priority ?? "high",
      queryIds: body.queryIds,
    });
    return Response.json({ success: true, ...summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

// Long-running operation — opt out of static optimisation and route caching.
export const dynamic = "force-dynamic";
export const maxDuration = 300; // seconds — Railway respects this; Vercel caps lower
