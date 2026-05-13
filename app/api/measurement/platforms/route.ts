import prisma from "@/lib/prisma";

// Canonical platform ids used everywhere in the app.
export const PLATFORMS = [
  "linkedin",
  "x",
  "facebook",
  "instagram",
  "tiktok",
  "youtube",
  "reddit",
  "discord",
  "blog",
] as const;

interface IncomingSnapshot {
  date: string;
  platform: string;
  followers?: number | null;
  impressions?: number | null;
  engagement?: number | null;
  postsCount?: number | null;
  notes?: string | null;
}

// GET /api/measurement/platforms?weeks=12
// Returns all PlatformSnapshot rows from the last N weeks, newest first.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const weeks = Math.min(Math.max(parseInt(searchParams.get("weeks") ?? "12", 10) || 12, 1), 52);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - weeks * 7);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  try {
    const rows = await prisma.platformSnapshot.findMany({
      where: { date: { gte: cutoffStr } },
      orderBy: { date: "desc" },
    });
    return Response.json({ success: true, snapshots: rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ success: false, error: message, snapshots: [] }, { status: 500 });
  }
}

// POST /api/measurement/platforms
// Body: { snapshots: IncomingSnapshot[] }
// Upserts all rows in one transaction.
export async function POST(request: Request) {
  let body: { snapshots?: IncomingSnapshot[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const incoming = Array.isArray(body.snapshots) ? body.snapshots : [];
  const validPlatforms = new Set<string>(PLATFORMS);
  const sanitized = incoming
    .filter((s) => s.date && validPlatforms.has(s.platform))
    .map((s) => ({
      date: s.date,
      platform: s.platform,
      followers: nullableInt(s.followers),
      impressions: nullableInt(s.impressions),
      engagement: nullableInt(s.engagement),
      postsCount: nullableInt(s.postsCount),
      notes: s.notes ?? null,
    }));

  if (sanitized.length === 0) {
    return Response.json({ success: false, error: "No valid snapshots" }, { status: 400 });
  }

  try {
    await prisma.$transaction(
      sanitized.map((s) =>
        prisma.platformSnapshot.upsert({
          where: { date_platform: { date: s.date, platform: s.platform } },
          create: s,
          update: {
            followers: s.followers,
            impressions: s.impressions,
            engagement: s.engagement,
            postsCount: s.postsCount,
            notes: s.notes,
          },
        })
      )
    );
    return Response.json({ success: true, written: sanitized.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

function nullableInt(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return Number.isFinite(n) ? n : null;
}
