import { getMissions, createMission, updateMissionStatus } from "@/lib/db";
import { validate, MissionSchema, MissionStatusUpdateSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? undefined;

  try {
    const missions = await getMissions(date);
    return Response.json({ success: true, missions, source: "database" });
  } catch {
    return Response.json({ success: true, missions: [], source: "database" });
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
