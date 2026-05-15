import prisma from "@/lib/prisma";
import { executeMission } from "@/lib/missionExecutor";
import type { ExecuteInput, AlternateTarget } from "@/lib/missionExecutor";

// GET /api/missions/draft?date=YYYY-MM-DD
// Returns { success, drafts: { [draftKey]: DraftRecord } }
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date) {
    return Response.json(
      { success: false, error: "date is required" },
      { status: 400 }
    );
  }

  try {
    const records = await prisma.missionDraft.findMany({ where: { date } });
    const drafts: Record<
      string,
      {
        content: string;
        model: string;
        updatedAt: string;
        targetUrl: string | null;
        alternates: AlternateTarget[];
        videoUrl: string | null;
        videoProject: string | null;
      }
    > = {};
    for (const r of records) {
      let alternates: AlternateTarget[] = [];
      if (r.alternatesJson) {
        try {
          const parsed = JSON.parse(r.alternatesJson) as unknown;
          if (Array.isArray(parsed)) {
            alternates = parsed
              .filter(
                (a): a is AlternateTarget =>
                  typeof a === "object" &&
                  a !== null &&
                  typeof (a as AlternateTarget).url === "string"
              )
              .map((a) => ({ url: a.url, why: a.why ?? "" }));
          }
        } catch {
          alternates = [];
        }
      }
      drafts[r.id] = {
        content: r.content,
        model: r.model,
        updatedAt: r.updatedAt.toISOString(),
        targetUrl: r.targetUrl,
        alternates,
        videoUrl: r.videoUrl,
        videoProject: r.videoProject,
      };
    }
    return Response.json({ success: true, drafts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/missions/draft
// Body: ExecuteInput
// Generates a new draft, persists it, and returns it.
export async function POST(request: Request) {
  let body: ExecuteInput;
  try {
    body = (await request.json()) as ExecuteInput;
  } catch {
    return Response.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body.draftKey || !body.date || !body.mission) {
    return Response.json(
      { success: false, error: "draftKey, date, and mission are required" },
      { status: 400 }
    );
  }

  const result = await executeMission(body);
  if (!result.success || !result.content) {
    return Response.json(
      { success: false, error: result.error ?? "Generation failed" },
      { status: 500 }
    );
  }

  const alternatesJson =
    result.alternates && result.alternates.length > 0
      ? JSON.stringify(result.alternates)
      : null;

  try {
    await prisma.missionDraft.upsert({
      where: { id: body.draftKey },
      create: {
        id: body.draftKey,
        date: body.date,
        content: result.content,
        model: result.model ?? "unknown",
        targetUrl: result.targetUrl ?? null,
        alternatesJson,
        searchQuery: result.searchQuery ?? null,
        videoUrl: result.videoUrl ?? null,
        videoProject: result.videoProject ?? null,
      },
      update: {
        content: result.content,
        model: result.model ?? "unknown",
        targetUrl: result.targetUrl ?? null,
        alternatesJson,
        searchQuery: result.searchQuery ?? null,
        videoUrl: result.videoUrl ?? null,
        videoProject: result.videoProject ?? null,
      },
    });
  } catch {
    // Persistence failure shouldn't block returning the draft to the user;
    // they can copy it now even if caching fails.
  }

  return Response.json({
    success: true,
    draftKey: body.draftKey,
    content: result.content,
    model: result.model,
    targetUrl: result.targetUrl ?? null,
    alternates: result.alternates ?? [],
    searchError: result.searchError ?? null,
    videoUrl: result.videoUrl ?? null,
    videoProject: result.videoProject ?? null,
    videoError: result.videoError ?? null,
  });
}

export const maxDuration = 300;

// DELETE /api/missions/draft?draftKey=...
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const draftKey = searchParams.get("draftKey");
  if (!draftKey) {
    return Response.json(
      { success: false, error: "draftKey is required" },
      { status: 400 }
    );
  }
  try {
    await prisma.missionDraft.delete({ where: { id: draftKey } });
    return Response.json({ success: true });
  } catch {
    return Response.json({ success: true }); // idempotent
  }
}
