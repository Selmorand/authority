import { generateMissionsWithDrafts } from "@/lib/missionGenerator";

// POST /api/missions/generate
// Body: { date: "YYYY-MM-DD", count?: number, recentTitles?: string[], forcePillar?: string }
//
// Generates count tasks for the given date using Claude. Each task arrives
// with draftContent already populated — ready to review/regenerate/approve.
// Persists directly to the Mission table.

export async function POST(request: Request) {
  let body: {
    date?: string;
    count?: number;
    recentTitles?: string[];
    forcePillar?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return Response.json(
      { success: false, error: "date is required in YYYY-MM-DD format" },
      { status: 400 }
    );
  }

  const result = await generateMissionsWithDrafts({
    date: body.date,
    count: body.count,
    recentTitles: body.recentTitles,
    forcePillar: body.forcePillar,
  });

  if (!result.success) {
    return Response.json(result, { status: 500 });
  }
  return Response.json(result);
}

// Long-running: 5 tasks with full drafts can take 30-90s on Claude.
export const maxDuration = 300;
export const dynamic = "force-dynamic";
