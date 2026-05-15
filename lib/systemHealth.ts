import prisma from "./prisma";
import { seedMemory } from "@/data/strategicMemory";
import { missions as seedMissions } from "@/data/missions";

// ─── Types ───────────────────────────────────────────────────

export type HealthStatus = "healthy" | "degraded" | "error";

export interface SystemComponent {
  name: string;
  status: HealthStatus;
  message: string;
  lastChecked: string;
}

export interface SystemHealthReport {
  overallStatus: HealthStatus;
  components: SystemComponent[];
  warnings: string[];
  uptime: string;
}

// ─── Health Checks ───────────────────────────────────────────

export async function checkSystemHealth(): Promise<SystemHealthReport> {
  const components: SystemComponent[] = [];
  const warnings: string[] = [];
  const now = new Date().toISOString();

  // Database connectivity
  try {
    const missionCount = await prisma.mission.count();
    components.push({
      name: "Database",
      status: missionCount > 0 ? "healthy" : "degraded",
      message: missionCount > 0 ? `Connected — ${missionCount} missions stored` : "Connected but empty — run seed",
      lastChecked: now,
    });
    if (missionCount === 0) warnings.push("Database is empty — run npm run db:seed");
  } catch {
    components.push({
      name: "Database",
      status: "error",
      message: "Cannot connect to database",
      lastChecked: now,
    });
    warnings.push("Database unavailable — using seed data fallback");
  }

  // Strategic Memory
  try {
    const memoryCount = await prisma.strategicMemory.count();
    const stale = memoryCount === 0;
    components.push({
      name: "Strategic Memory",
      status: stale ? "degraded" : "healthy",
      message: stale ? "No memory entries — using seed data" : `${memoryCount} memory entries`,
      lastChecked: now,
    });
    if (stale) warnings.push("Strategic memory empty — historical learning unavailable");
  } catch {
    components.push({
      name: "Strategic Memory",
      status: "degraded",
      message: `Using seed data (${seedMemory.length} entries)`,
      lastChecked: now,
    });
  }

  // Research Intelligence
  try {
    const signalCount = await prisma.researchSignal.count();
    components.push({
      name: "Research Intelligence",
      status: signalCount > 0 ? "healthy" : "degraded",
      message: signalCount > 0 ? `${signalCount} signals tracked` : "No signals — using seed data",
      lastChecked: now,
    });
  } catch {
    components.push({
      name: "Research Intelligence",
      status: "degraded",
      message: "Using seed data fallback",
      lastChecked: now,
    });
  }

  // Authority Metrics
  try {
    const snapCount = await prisma.authoritySnapshot.count();
    components.push({
      name: "Authority Metrics",
      status: snapCount > 0 ? "healthy" : "degraded",
      message: snapCount > 0 ? `${snapCount} snapshots recorded` : "No snapshots — using seed data",
      lastChecked: now,
    });
  } catch {
    components.push({
      name: "Authority Metrics",
      status: "degraded",
      message: "Using seed data fallback",
      lastChecked: now,
    });
  }

  // Mission Engine
  components.push({
    name: "Mission Engine",
    status: "healthy",
    message: "Deterministic generator operational",
    lastChecked: now,
  });

  // AI Services
  const hasOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your-openai-api-key-here";
  components.push({
    name: "AI Services",
    status: hasOpenAI ? "healthy" : "degraded",
    message: hasOpenAI ? "OpenAI API configured" : "No API key — AI features use local fallbacks",
    lastChecked: now,
  });

  // Mission Executor (Claude — generates deliverables for one-click execution)
  const hasAnthropic = process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "your-anthropic-api-key-here";
  components.push({
    name: "Mission Executor (Claude)",
    status: hasAnthropic ? "healthy" : "error",
    message: hasAnthropic ? "Anthropic API configured" : "ANTHROPIC_API_KEY not set — one-click execution disabled",
    lastChecked: now,
  });
  if (!hasAnthropic) warnings.push("ANTHROPIC_API_KEY missing — Execute-with-AI button will fail");

  // Target Search (Tavily — finds real Reddit/forum/SO threads for community tasks)
  const hasTavily = !!process.env.TAVILY_API_KEY;
  components.push({
    name: "Target Search (Tavily)",
    status: hasTavily ? "healthy" : "degraded",
    message: hasTavily ? "Tavily API configured" : "TAVILY_API_KEY not set — community tasks won't return target URLs",
    lastChecked: now,
  });
  if (!hasTavily) warnings.push("TAVILY_API_KEY missing — Execute will generate drafts without target URLs");

  // Video Renderer (JSON2Video — auto-renders caption clips from core assets)
  const hasJson2Video = !!process.env.JSON2VIDEO_API_KEY;
  components.push({
    name: "Video Renderer (JSON2Video)",
    status: hasJson2Video ? "healthy" : "degraded",
    message: hasJson2Video ? "JSON2Video API configured" : "JSON2VIDEO_API_KEY not set — auto-rendered caption clips disabled",
    lastChecked: now,
  });
  if (!hasJson2Video) warnings.push("JSON2VIDEO_API_KEY missing — video auto-render unavailable");

  // Overall status
  const hasError = components.some((c) => c.status === "error");
  const hasDegraded = components.some((c) => c.status === "degraded");
  const overallStatus: HealthStatus = hasError ? "error" : hasDegraded ? "degraded" : "healthy";

  return {
    overallStatus,
    components,
    warnings,
    uptime: process.uptime ? `${Math.round(process.uptime())}s` : "unknown",
  };
}

// ─── Backup Utility ──────────────────────────────────────────

export async function createBackup(): Promise<{ success: boolean; error?: string }> {
  // With PostgreSQL, backups are managed by the database provider (Railway).
  // File-based backup is no longer applicable.
  return { success: false, error: "Database backups are managed by Railway PostgreSQL. Use Railway's backup features." };
}
