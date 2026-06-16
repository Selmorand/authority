import {
  getMissions,
  createMission,
  updateMissionStatus,
  updateMissionDraft,
} from "@/lib/db";
import { regenerateDraft } from "@/lib/missionGenerator";
import { validate, MissionSchema, MissionStatusUpdateSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? undefined;

  try {
    const missions = await getMissions(date);
    return Response.json({ success: true, missions, source: "database" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database read failed";
    return Response.json(
      { success: false, missions: [], error: message, source: "database" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "update-status") {
      const v = validate(MissionStatusUpdateSchema, body);
      if (!v.success) {
        return Response.json({ success: false, error: v.error }, { status: 400 });
      }
      const updated = await updateMissionStatus(v.data.id, v.data.status);
      return Response.json({ success: true, mission: updated });
    }

    if (body.action === "update-draft") {
      if (!body.id || typeof body.id !== "string") {
        return Response.json(
          { success: false, error: "id is required" },
          { status: 400 }
        );
      }
      const updated = await updateMissionDraft(body.id, {
        draftContent: body.draftContent,
        draftFormat: body.draftFormat,
        publishStatus: body.publishStatus,
        publishedUrl: body.publishedUrl,
      });
      return Response.json({ success: true, mission: updated });
    }

    if (body.action === "regenerate-draft") {
      if (!body.id || typeof body.id !== "string") {
        return Response.json(
          { success: false, error: "id is required" },
          { status: 400 }
        );
      }
      const result = await regenerateDraft(body.id);
      if (!result.success) {
        return Response.json(
          { success: false, error: result.error },
          { status: 500 }
        );
      }
      return Response.json({ success: true, draftContent: result.draftContent });
    }

    const v = validate(MissionSchema, body);
    if (!v.success) {
      return Response.json({ success: false, error: v.error }, { status: 400 });
    }

    const mission = await createMission(v.data);
    return Response.json({ success: true, mission });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

// Regenerate draft can take 30+ seconds for long-form articles.
export const maxDuration = 300;
