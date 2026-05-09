import { expandTopic } from "@/lib/aiMissionGenerator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.topic || typeof body.topic !== "string") {
      return Response.json(
        { success: false, data: [], filtered: 0, error: "topic is required" },
        { status: 400 }
      );
    }
    const result = await expandTopic(body.topic, body.themeId);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { success: false, data: [], filtered: 0, error: message },
      { status: 500 }
    );
  }
}
