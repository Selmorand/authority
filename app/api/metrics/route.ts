import {
  getAuthoritySnapshots,
  createAuthoritySnapshot,
  getCorroborations,
  getVisibilityChecks,
} from "@/lib/db";
import {
  metricHistory,
  externalCorroborations,
  aiVisibilityChecks,
} from "@/data/authorityMetrics";

export async function GET() {
  try {
    const [snapshots, corroborations, visibilityChecks] = await Promise.all([
      getAuthoritySnapshots(),
      getCorroborations(),
      getVisibilityChecks(),
    ]);

    // Fall back to seed data if empty
    return Response.json({
      success: true,
      snapshots: snapshots.length > 0 ? snapshots : metricHistory,
      corroborations: corroborations.length > 0 ? corroborations : externalCorroborations,
      visibilityChecks: visibilityChecks.length > 0 ? visibilityChecks : aiVisibilityChecks,
      source: snapshots.length > 0 ? "database" : "seed",
    });
  } catch {
    return Response.json({
      success: true,
      snapshots: metricHistory,
      corroborations: externalCorroborations,
      visibilityChecks: aiVisibilityChecks,
      source: "seed",
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const snapshot = await createAuthoritySnapshot(body);
    return Response.json({ success: true, snapshot });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
