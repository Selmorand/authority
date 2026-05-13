import prisma from "@/lib/prisma";
import { executeMission } from "@/lib/missionExecutor";
import type { ExecuteInput } from "@/lib/missionExecutor";

// GET /api/missions/draft?date=YYYY-MM-DD
// Returns { success, drafts: { [draftKey]: { content, model, updatedAt } } }
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
    const drafts: Record<string, { content: string; model: string; updatedAt: string }> = {};
    for (const r of records) {
      drafts[r.id] = {
        content: r.content,
        model: r.model,
        updatedAt: r.updatedAt.toISOString(),
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

  try {
    await prisma.missionDraft.upsert({
      where: { id: body.draftKey },
      create: {
        id: body.draftKey,
        date: body.date,
        content: result.content,
        model: result.model ?? "unknown",
      },
      update: {
        content: result.content,
        model: result.model ?? "unknown",
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
  });
}

// DELETE /api/missions/draft?draftKey=...
// Clears a cached draft (used by "regenerate from scratch" if we ever
// expose it, and to free space).
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
