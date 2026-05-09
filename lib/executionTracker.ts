import { seedMemory } from "@/data/strategicMemory";
import { themes } from "@/data/themes";
import type { MemoryItem } from "@/data/strategicMemory";

// ─── Types ───────────────────────────────────────────────────

export interface ExecutionStats {
  totalCompleted: number;
  currentStreak: number; // consecutive days with at least 1 completion
  longestStreak: number;
  avgDailyCompletions: number;
  weeklyRate: number; // missions per week
  consistencyScore: number; // 1-10
}

export interface CadenceMetric {
  theme: string;
  lastActivity: string;
  daysSinceActivity: number;
  frequency: "high" | "moderate" | "low" | "inactive";
  recommendedAction: string;
}

export interface ExecutionGap {
  type: "theme-gap" | "category-gap" | "consistency-gap" | "cadence-gap";
  area: string;
  severity: "high" | "medium" | "low";
  description: string;
  suggestion: string;
}

export interface DriftIndicator {
  area: string;
  type: "over-focus" | "under-focus" | "declining-consistency" | "semantic-imbalance" | "insufficient-founder-visibility";
  severity: "high" | "medium" | "low";
  evidence: string;
  correction: string;
}

// ─── Execution Stats ─────────────────────────────────────────

export function calculateExecutionStats(
  memory: MemoryItem[] = seedMemory
): ExecutionStats {
  const completed = memory.filter((m) => m.type === "completed-mission");
  const dates = [...new Set(completed.map((m) => m.date))].sort();

  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < dates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diffDays = Math.round(
        (curr.getTime() - prev.getTime()) / 86400000
      );
      // Allow weekends (up to 3 days gap for Fri->Mon)
      if (diffDays <= 3) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }
  currentStreak = tempStreak;

  // Weekly rate
  const totalWeeks = dates.length > 1
    ? Math.max(
        1,
        Math.ceil(
          (new Date(dates[dates.length - 1]).getTime() -
            new Date(dates[0]).getTime()) /
            (7 * 86400000)
        )
      )
    : 1;
  const weeklyRate = Math.round((completed.length / totalWeeks) * 10) / 10;

  // Average daily
  const activeDays = dates.length || 1;
  const avgDaily = Math.round((completed.length / activeDays) * 10) / 10;

  // Consistency score
  const consistencyScore = Math.min(
    10,
    Math.round(
      (currentStreak >= 5 ? 3 : currentStreak >= 3 ? 2 : 1) +
        (weeklyRate >= 4 ? 3 : weeklyRate >= 2 ? 2 : 1) +
        (avgDaily >= 1.5 ? 2 : avgDaily >= 1 ? 1.5 : 1) +
        (completed.length >= 10 ? 2 : completed.length >= 5 ? 1 : 0)
    )
  );

  return {
    totalCompleted: completed.length,
    currentStreak,
    longestStreak,
    avgDailyCompletions: avgDaily,
    weeklyRate,
    consistencyScore,
  };
}

// ─── Cadence Analysis ────────────────────────────────────────

export function analyzeCadence(
  memory: MemoryItem[] = seedMemory
): CadenceMetric[] {
  const now = new Date();
  const metrics: CadenceMetric[] = [];

  for (const theme of themes) {
    const themeItems = memory.filter((m) => m.theme === theme.id);
    const sorted = themeItems.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const lastDate = sorted[0]?.date;
    const daysSince = lastDate
      ? Math.floor(
          (now.getTime() - new Date(lastDate).getTime()) / 86400000
        )
      : 999;

    const frequency: CadenceMetric["frequency"] =
      daysSince <= 3
        ? "high"
        : daysSince <= 7
          ? "moderate"
          : daysSince <= 14
            ? "low"
            : "inactive";

    const recommendedAction =
      frequency === "inactive"
        ? `Schedule a ${theme.name} mission immediately — authority momentum is at risk`
        : frequency === "low"
          ? `Plan ${theme.name} content this week to maintain cadence`
          : frequency === "moderate"
            ? `${theme.name} cadence is acceptable — maintain current pace`
            : `${theme.name} activity is strong — ensure quality over quantity`;

    metrics.push({
      theme: theme.name,
      lastActivity: lastDate || "Never",
      daysSinceActivity: daysSince,
      frequency,
      recommendedAction,
    });
  }

  return metrics.sort((a, b) => b.daysSinceActivity - a.daysSinceActivity);
}

// ─── Execution Gaps ──────────────────────────────────────────

export function detectExecutionGaps(
  memory: MemoryItem[] = seedMemory
): ExecutionGap[] {
  const gaps: ExecutionGap[] = [];
  const cadence = analyzeCadence(memory);

  // Theme gaps
  for (const metric of cadence) {
    if (metric.frequency === "inactive") {
      const theme = themes.find((t) => t.name === metric.theme);
      gaps.push({
        type: "theme-gap",
        area: metric.theme,
        severity: theme?.authorityLevel === "core" ? "high" : "medium",
        description: `No activity on ${metric.theme} for ${metric.daysSinceActivity} days`,
        suggestion: metric.recommendedAction,
      });
    }
  }

  // Category gaps
  const categories = memory
    .filter((m) => m.category)
    .map((m) => m.category!);
  const categoryCounts: Record<string, number> = {};
  for (const cat of categories) {
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  const expectedCategories = [
    "LinkedIn Authority Post",
    "GEO Educational Article",
    "Case Study Development",
    "Research Collection",
    "Entity Reinforcement",
  ];
  for (const cat of expectedCategories) {
    if ((categoryCounts[cat] || 0) === 0) {
      gaps.push({
        type: "category-gap",
        area: cat,
        severity: "medium",
        description: `No "${cat}" missions completed in tracked history`,
        suggestion: `Schedule a ${cat} mission this week`,
      });
    }
  }

  // Consistency gaps
  const stats = calculateExecutionStats(memory);
  if (stats.consistencyScore < 5) {
    gaps.push({
      type: "consistency-gap",
      area: "Overall Consistency",
      severity: "high",
      description: `Consistency score is ${stats.consistencyScore}/10 — below target`,
      suggestion:
        "Focus on completing at least 1 mission per day to build momentum",
    });
  }

  return gaps.sort((a, b) => {
    const sev = { high: 3, medium: 2, low: 1 };
    return sev[b.severity] - sev[a.severity];
  });
}

// ─── Strategic Drift Detection ───────────────────────────────

export function detectStrategicDrift(
  memory: MemoryItem[] = seedMemory
): DriftIndicator[] {
  const drift: DriftIndicator[] = [];
  const cadence = analyzeCadence(memory);

  // Theme distribution analysis
  const themeCounts: Record<string, number> = {};
  for (const item of memory) {
    themeCounts[item.theme] = (themeCounts[item.theme] || 0) + 1;
  }
  const totalItems = memory.length;
  const avgPerTheme = totalItems / themes.length;

  // Over-focus detection
  for (const [themeId, count] of Object.entries(themeCounts)) {
    if (count > avgPerTheme * 2) {
      const theme = themes.find((t) => t.id === themeId);
      drift.push({
        area: theme?.name ?? themeId,
        type: "over-focus",
        severity: "medium",
        evidence: `${count} entries (${Math.round((count / totalItems) * 100)}% of all activity) — more than 2x average`,
        correction: `Redistribute effort: reduce ${theme?.name} frequency and allocate to underserved themes`,
      });
    }
  }

  // Under-focus detection (core themes only)
  for (const theme of themes.filter((t) => t.authorityLevel === "core")) {
    const count = themeCounts[theme.id] || 0;
    if (count < avgPerTheme * 0.3) {
      drift.push({
        area: theme.name,
        type: "under-focus",
        severity: "high",
        evidence: `Only ${count} entries — core theme receiving less than 30% of average attention`,
        correction: `Prioritise ${theme.name} in this week's mission plan. Schedule at least 2 dedicated missions.`,
      });
    }
  }

  // Founder visibility check
  const founderItems = memory.filter(
    (m) =>
      m.theme === "entity-trust" ||
      m.insight.toLowerCase().includes("founder") ||
      m.category === "Entity Reinforcement"
  );
  if (founderItems.length < memory.length * 0.1) {
    drift.push({
      area: "Founder Visibility",
      type: "insufficient-founder-visibility",
      severity: "medium",
      evidence: `Only ${founderItems.length} founder-related activities out of ${memory.length} total`,
      correction:
        "Schedule more founder insight posts and entity reinforcement tasks. Personal authority builds trust faster.",
    });
  }

  // Semantic balance check
  const coreThemes = themes.filter((t) => t.authorityLevel === "core");
  const coveredCoreThemes = coreThemes.filter(
    (t) => (themeCounts[t.id] || 0) > 0
  );
  if (coveredCoreThemes.length < coreThemes.length * 0.75) {
    drift.push({
      area: "Semantic Balance",
      type: "semantic-imbalance",
      severity: "high",
      evidence: `Only ${coveredCoreThemes.length} of ${coreThemes.length} core themes have activity`,
      correction:
        "Expand coverage to all core themes. Missing themes create authority gaps that competitors can exploit.",
    });
  }

  // Consistency decline
  const stats = calculateExecutionStats(memory);
  if (stats.currentStreak < 3 && stats.longestStreak >= 5) {
    drift.push({
      area: "Execution Consistency",
      type: "declining-consistency",
      severity: "medium",
      evidence: `Current streak: ${stats.currentStreak} days (longest was ${stats.longestStreak})`,
      correction:
        "Re-establish daily execution habit. Start with one small mission per day to rebuild momentum.",
    });
  }

  return drift.sort((a, b) => {
    const sev = { high: 3, medium: 2, low: 1 };
    return sev[b.severity] - sev[a.severity];
  });
}
