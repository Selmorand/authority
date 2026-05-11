import prisma from "@/lib/prisma";
import { seedMemory } from "@/data/strategicMemory";
import type { MemoryItem } from "@/data/strategicMemory";
import {
  calculateExecutionStats,
  analyzeCadence,
  detectExecutionGaps,
  detectStrategicDrift,
} from "@/lib/executionTracker";

export async function GET() {
  try {
    // Merge seed memory with real DB memory
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

    // Combine: real DB entries take priority, seed fills in history
    const allMemory = [...realMemory, ...seedMemory];

    // Also get today's completion count from MissionProgress
    const today = new Date().toISOString().split("T")[0];
    const todayProgress = await prisma.missionProgress.findMany({
      where: { date: today },
    });
    const todayCompleted = todayProgress.filter(
      (p) => p.status === "completed"
    ).length;
    const todayTotal = todayProgress.length;

    const stats = calculateExecutionStats(allMemory);
    const cadence = analyzeCadence(allMemory);
    const gaps = detectExecutionGaps(allMemory);
    const drift = detectStrategicDrift(allMemory);

    return Response.json({
      success: true,
      stats,
      cadence,
      gaps,
      drift,
      todayCompleted,
      todayTotal,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
