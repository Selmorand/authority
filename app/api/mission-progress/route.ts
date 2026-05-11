import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return Response.json({ success: false, error: "date is required" }, { status: 400 });
  }

  const records = await prisma.missionProgress.findMany({ where: { date } });
  const statusMap: Record<string, string> = {};
  for (const r of records) {
    statusMap[r.id] = r.status;
  }

  return Response.json({ success: true, statusMap });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { id, date, status } = body;

  if (!id || !date || !status) {
    return Response.json({ success: false, error: "id, date, and status are required" }, { status: 400 });
  }

  if (!["pending", "in-progress", "completed"].includes(status)) {
    return Response.json({ success: false, error: "Invalid status" }, { status: 400 });
  }

  const record = await prisma.missionProgress.upsert({
    where: { id },
    create: { id, date, status },
    update: { status },
  });

  // When a mission is completed, auto-create a StrategicMemory entry
  if (status === "completed" && body.mission) {
    const m = body.mission;
    const memoryId = `mem-${id}`;
    // Only create if not already exists
    const existing = await prisma.strategicMemory.findUnique({
      where: { id: memoryId },
    });
    if (!existing) {
      await prisma.strategicMemory.create({
        data: {
          id: memoryId,
          date,
          type: "completed-mission",
          theme: m.themeId ?? "general",
          insight: `Completed: ${m.title}`,
          authorityImpact: m.authorityImpact ?? 6,
          semanticValue: m.semanticValue ?? 6,
          outcomeSummary: m.objective ?? "",
          strategicNotes: m.contentAngle
            ? `${m.category} on ${m.platform} — ${m.contentAngle}`
            : `${m.category} on ${m.platform}`,
          category: m.category ?? null,
          platform: m.platform ?? null,
        },
      });
    }
  }

  return Response.json({ success: true, record });
}
