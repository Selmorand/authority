import prisma from "@/lib/prisma";

// ─── POST /api/admin/reset ───────────────────────────────────
// One-shot "reset to day one" for task records. Wipes:
//   - Mission         (the task records themselves)
//   - MissionProgress (per-mission status)
//   - MissionDraft    (cached AI deliverables / video URLs)
//
// Preserves: StrategicMemory, ExecutiveBriefing, all metric
// snapshots, AIVisibilityCheck, ResearchSignal, ExternalCorroboration.
//
// Guarded by ADMIN_RESET_TOKEN. Caller must send the token in the
// `x-admin-token` header (kept out of URLs / access logs).
//
// Remove this route after the reset has been executed.

export async function POST(request: Request) {
  const expected = process.env.ADMIN_RESET_TOKEN;
  if (!expected || expected.length < 16) {
    return Response.json(
      {
        success: false,
        error:
          "ADMIN_RESET_TOKEN is not set on the server (or is too short). Set it in Railway env, redeploy, then retry.",
      },
      { status: 503 }
    );
  }

  const provided = request.headers.get("x-admin-token");
  if (provided !== expected) {
    return Response.json(
      { success: false, error: "Invalid or missing x-admin-token header." },
      { status: 401 }
    );
  }

  try {
    const [progress, drafts, missions] = await prisma.$transaction([
      prisma.missionProgress.deleteMany({}),
      prisma.missionDraft.deleteMany({}),
      prisma.mission.deleteMany({}),
    ]);

    return Response.json({
      success: true,
      deleted: {
        Mission: missions.count,
        MissionProgress: progress.count,
        MissionDraft: drafts.count,
      },
      note: "Reset complete. Delete this route in a follow-up commit.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
