import prisma from "@/lib/prisma";

interface IncomingAuthoritySnapshot {
  date: string;
  brandedSearchVolume?: number;
  externalMentions?: number;
  backlinks?: number;
  aiCitationOpportunities?: number;
  semanticThemesCovered?: number;
  founderVisibilityScore?: number;
  entityConsistencyScore?: number;
  // legacy fields — accepted but optional
  linkedinFollowers?: number;
  linkedinPostImpressions?: number;
  publishedArticles?: number;
  caseStudiesCompleted?: number;
}

// GET /api/measurement/authority?weeks=12
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const weeks = Math.min(Math.max(parseInt(searchParams.get("weeks") ?? "12", 10) || 12, 1), 52);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - weeks * 7);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  try {
    const rows = await prisma.authoritySnapshot.findMany({
      where: { date: { gte: cutoffStr } },
      orderBy: { date: "desc" },
    });
    return Response.json({ success: true, snapshots: rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ success: false, error: message, snapshots: [] }, { status: 500 });
  }
}

// POST /api/measurement/authority
// Body: IncomingAuthoritySnapshot — upserts on date.
export async function POST(request: Request) {
  let body: IncomingAuthoritySnapshot;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.date) {
    return Response.json({ success: false, error: "date is required" }, { status: 400 });
  }

  const data = {
    brandedSearchVolume: intOrZero(body.brandedSearchVolume),
    linkedinFollowers: intOrZero(body.linkedinFollowers),
    linkedinPostImpressions: intOrZero(body.linkedinPostImpressions),
    publishedArticles: intOrZero(body.publishedArticles),
    caseStudiesCompleted: intOrZero(body.caseStudiesCompleted),
    externalMentions: intOrZero(body.externalMentions),
    backlinks: intOrZero(body.backlinks),
    aiCitationOpportunities: intOrZero(body.aiCitationOpportunities),
    semanticThemesCovered: intOrZero(body.semanticThemesCovered),
    founderVisibilityScore: intOrZero(body.founderVisibilityScore),
    entityConsistencyScore: intOrZero(body.entityConsistencyScore),
  };

  try {
    const row = await prisma.authoritySnapshot.upsert({
      where: { date: body.date },
      create: { date: body.date, ...data },
      update: data,
    });
    return Response.json({ success: true, snapshot: row });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

function intOrZero(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return Number.isFinite(n) ? n : 0;
}
