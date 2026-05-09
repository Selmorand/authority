import { generateDailyBriefing, generateWeeklyReview } from "@/lib/generateDailyBriefing";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "daily";
  const date = searchParams.get("date") ?? undefined;

  if (type === "weekly") {
    const review = generateWeeklyReview();
    return Response.json({ success: true, review });
  }

  const briefing = generateDailyBriefing(date ?? undefined);
  return Response.json({ success: true, briefing });
}
