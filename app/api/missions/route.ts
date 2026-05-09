import { getMissions, createMission, updateMissionStatus } from "@/lib/db";
import { missions as seedMissions } from "@/data/missions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? undefined;

  try {
    const missions = await getMissions(date);
    if (missions.length === 0 && !date) {
      return Response.json({ success: true, missions: seedMissions, source: "seed" });
    }
    return Response.json({ success: true, missions, source: "database" });
  } catch {
    return Response.json({ success: true, missions: seedMissions, source: "seed" });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "update-status") {
      const updated = await updateMissionStatus(body.id, body.status);
      return Response.json({ success: true, mission: updated });
    }

    const mission = await createMission({
      date: body.date,
      title: body.title,
      category: body.category,
      authorityFocus: body.authorityFocus,
      platform: body.platform,
      estimatedTime: body.estimatedTime,
      objective: body.objective,
      topic: body.topic,
      description: body.description,
      status: body.status,
      priority: body.priority,
      themeId: body.themeId,
      contentAngle: body.contentAngle,
    });

    return Response.json({ success: true, mission });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
