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

  return Response.json({ success: true, record });
}
