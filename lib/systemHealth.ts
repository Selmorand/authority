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
      message: "Cannot connect to SQLite database",
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

import { promises as fs } from "fs";
import path from "path";

export async function createBackup(): Promise<{ success: boolean; path?: string; error?: string }> {
  const dbPath = path.join(process.cwd(), "prisma", "authority-os.db");
  const backupDir = path.join(process.cwd(), "backups");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDir, `authority-os-${timestamp}.db`);

  try {
    await fs.mkdir(backupDir, { recursive: true });
    await fs.copyFile(dbPath, backupPath);
    return { success: true, path: backupPath };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Backup failed" };
  }
}
