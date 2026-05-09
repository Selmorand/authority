import { generateMissions } from "@/lib/aiMissionGenerator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await generateMissions({
      focusThemes: body.focusThemes,
      previousTopics: body.previousTopics,
      dayOfWeek: body.dayOfWeek,
      count: body.count,
    });
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { success: false, data: [], filtered: 0, error: message },
      { status: 500 }
    );
  }
}
