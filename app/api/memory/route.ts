import { getMemories, createMemory } from "@/lib/db";
import { seedMemory } from "@/data/strategicMemory";

export async function GET() {
  try {
    const memory = await getMemories();
    // Fall back to seed data if database is empty
    if (memory.length === 0) {
      return Response.json({ success: true, memory: seedMemory, source: "seed" });
    }
    return Response.json({ success: true, memory, source: "database" });
  } catch {
    // Database unavailable — fall back to seed data
    return Response.json({ success: true, memory: seedMemory, source: "seed" });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const item = body.item;
    if (!item || !item.theme || !item.insight) {
      return Response.json(
        { success: false, error: "Invalid memory item — theme and insight required" },
        { status: 400 }
      );
    }

    const created = await createMemory({
      date: item.date || new Date().toISOString().split("T")[0],
      type: item.type || "strategic-lesson",
      theme: item.theme,
      insight: item.insight,
      authorityImpact: item.authorityImpact || 5,
      semanticValue: item.semanticValue || 5,
      outcomeSummary: item.outcomeSummary || "",
      strategicNotes: item.strategicNotes || "",
      category: item.category,
      platform: item.platform,
    });

    return Response.json({ success: true, id: created.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
