import prisma from "@/lib/prisma";
import { seedMemory } from "@/data/strategicMemory";
import type { MemoryItem } from "@/data/strategicMemory";
import { analyzeMemory } from "@/lib/analyzeStrategicMemory";

export async function GET() {
  try {
    const dbMemory = await prisma.strategicMemory.findMany({
      orderBy: { date: "desc" },
    });

    const realMemory: MemoryItem[] = dbMemory.map((m) => ({
      id: m.id,
      date: m.date,
      type: m.type as MemoryItem["type"],
      theme: m.theme,
      insight: m.insight,
      authorityImpact: m.authorityImpact,
      semanticValue: m.semanticValue,
      outcomeSummary: m.outcomeSummary,
      strategicNotes: m.strategicNotes,
      category: m.category ?? undefined,
      platform: m.platform ?? undefined,
    }));

    const allMemory = [...realMemory, ...seedMemory];
    const analysis = analyzeMemory(allMemory);

    return Response.json({ success: true, analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
