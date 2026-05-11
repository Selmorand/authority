import prisma from "@/lib/prisma";
import type { MemoryItem } from "@/data/strategicMemory";
import { generateExecutiveBriefingFromMemory } from "@/lib/generateExecutiveBriefing";

export async function GET() {
  try {
    const dbMemory = await prisma.strategicMemory.findMany({
      orderBy: { date: "desc" },
    });

    const allMemory: MemoryItem[] = dbMemory.map((m) => ({
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

    const briefing = generateExecutiveBriefingFromMemory(allMemory);

    return Response.json({ success: true, briefing });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
