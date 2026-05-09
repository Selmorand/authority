import { analyzeMemory } from "./analyzeStrategicMemory";
import { calculateExecutionStats, analyzeCadence, detectStrategicDrift } from "./executionTracker";
import { generateHealthReport } from "./authorityHealth";
import { getScoredSignals } from "./opportunityEngine";
import { generateVisibilityReport } from "./aiVisibilityMonitor";
import { getStrongestClusters, getWeakConnections, getOverlapOpportunities } from "@/data/authorityGraph";
import { themes } from "@/data/themes";

// ─── Types ───────────────────────────────────────────────────

export type GuidanceType =
  | "recommendation"
  | "warning"
  | "opportunity"
  | "reinforcement"
  | "focus-shift";

export type GuidancePriority = "critical" | "high" | "medium" | "advisory";

export interface CopilotGuidance {
  id: string;
  type: GuidanceType;
  priority: GuidancePriority;
  title: string;
  rationale: string;
  suggestedAction: string;
  theme?: string;
  confidence: number; // 1-10
  source: string; // which analysis generated this
}

export interface MomentumAnalysis {
  direction: "accelerating" | "steady" | "decelerating" | "stalled";
  growingClusters: string[];
  weakeningAreas: string[];
  executionTrend: string;
  semanticTrend: string;
}

export interface FocusAdjustment {
  theme: string;
  currentWeight: "over" | "balanced" | "under";
  suggestedShift: "increase" | "maintain" | "decrease";
  reason: string;
}

export interface CopilotReport {
  generatedAt: string;
  overallAssessment: string;
  guidanceItems: CopilotGuidance[];
  momentumAnalysis: MomentumAnalysis;
  focusAdjustments: FocusAdjustment[];
  topPriority: string;
  strategicOutlook: string;
}

// ─── Main Co-Pilot Engine ────────────────────────────────────

export function generateCopilotReport(): CopilotReport {
  const memory = analyzeMemory();
  const stats = calculateExecutionStats();
  const cadence = analyzeCadence();
  const drift = detectStrategicDrift();
  const health = generateHealthReport();
  const signals = getScoredSignals();
  const visibility = generateVisibilityReport();
  const clusterStrengths = getStrongestClusters();
  const weakLinks = getWeakConnections();
  const overlaps = getOverlapOpportunities();

  const guidanceItems: CopilotGuidance[] = [];
  let guidanceId = 0;
  const nextId = () => `cpg-${++guidanceId}`;

  // ── Execution Consistency Analysis ──
  if (stats.consistencyScore < 5) {
    guidanceItems.push({
      id: nextId(), type: "warning", priority: "critical",
      title: "Execution consistency is critically low",
      rationale: `Consistency score ${stats.consistencyScore}/10 with ${stats.currentStreak}-day streak. Authority compounds through daily execution — gaps break momentum.`,
      suggestedAction: "Complete at least 1 authority mission today. Start with the highest-priority task only.",
      confidence: 9, source: "execution-tracker",
    });
  } else if (stats.consistencyScore < 7) {
    guidanceItems.push({
      id: nextId(), type: "recommendation", priority: "high",
      title: "Increase daily execution rate",
      rationale: `Current rate: ${stats.weeklyRate} missions/week. Increasing to 5+/week would significantly accelerate authority compounding.`,
      suggestedAction: "Add one more daily mission, preferring themes with low cadence.",
      confidence: 8, source: "execution-tracker",
    });
  }

  // ── Theme Cadence Analysis ──
  const inactiveThemes = cadence.filter((c) => c.frequency === "inactive");
  const lowThemes = cadence.filter((c) => c.frequency === "low");

  for (const t of inactiveThemes) {
    const theme = themes.find((th) => th.name === t.theme);
    guidanceItems.push({
      id: nextId(), type: "warning",
      priority: theme?.authorityLevel === "core" ? "critical" : "high",
      title: `"${t.theme}" has no recent activity`,
      rationale: `${t.daysSinceActivity} days since last activity. ${theme?.authorityLevel === "core" ? "This is a core authority theme — gaps here directly weaken positioning." : "Inactive themes create semantic gaps that competitors can exploit."}`,
      suggestedAction: t.recommendedAction,
      theme: theme?.id, confidence: 9, source: "cadence-analysis",
    });
  }

  if (lowThemes.length >= 3) {
    guidanceItems.push({
      id: nextId(), type: "warning", priority: "high",
      title: `${lowThemes.length} themes have low activity cadence`,
      rationale: `Themes with low cadence: ${lowThemes.map((t) => t.theme).join(", ")}. Semantic authority requires consistent multi-theme presence.`,
      suggestedAction: "Redistribute mission focus to cover underserved themes this week.",
      confidence: 8, source: "cadence-analysis",
    });
  }

  // ── Strategic Drift ──
  for (const d of drift.filter((d) => d.severity === "high")) {
    guidanceItems.push({
      id: nextId(), type: "warning", priority: "high",
      title: `Strategic drift: ${d.area}`,
      rationale: d.evidence,
      suggestedAction: d.correction,
      confidence: 8, source: "drift-detection",
    });
  }

  // ── AI Visibility Gaps ──
  for (const s of visibility.visibilitySignals.filter((s) => s.strength === "absent")) {
    guidanceItems.push({
      id: nextId(), type: "opportunity", priority: "high",
      title: `"${s.theme}" invisible to AI systems`,
      rationale: "Zero AI citations detected for this theme. Publishing authoritative, structured content creates first-mover citation advantage.",
      suggestedAction: `Write a comprehensive ${s.theme} article optimised for AI citation.`,
      theme: themes.find((t) => t.name === s.theme)?.id, confidence: 8, source: "visibility-analysis",
    });
  }

  // ── Entity Reinforcement ──
  for (const e of visibility.entityAnalysis.filter((e) => e.score < 6)) {
    guidanceItems.push({
      id: nextId(), type: "reinforcement", priority: "medium",
      title: `Strengthen ${e.area}`,
      rationale: e.gaps[0] ?? `Score ${e.score}/10 — below threshold for strong authority positioning.`,
      suggestedAction: e.gaps[0] ?? "Schedule entity reinforcement activities.",
      confidence: 7, source: "entity-analysis",
    });
  }

  // ── Semantic Consistency Issues ──
  for (const issue of visibility.semanticConsistency.issues.filter((i) => i.severity === "high")) {
    guidanceItems.push({
      id: nextId(), type: "warning", priority: "high",
      title: `Semantic issue: ${issue.area}`,
      rationale: issue.description,
      suggestedAction: issue.correction,
      confidence: 8, source: "semantic-consistency",
    });
  }

  // ── High-Leverage Opportunities from Signals ──
  for (const { signal, score } of signals.slice(0, 3)) {
    if (score.authorityPotential >= 8) {
      guidanceItems.push({
        id: nextId(), type: "opportunity", priority: "high",
        title: signal.title,
        rationale: `Authority potential ${score.authorityPotential}/10 with market timing ${score.marketTiming}/10.`,
        suggestedAction: signal.suggestedActions[0] ?? "Create authority content on this signal.",
        confidence: score.overall, source: "signal-intelligence",
      });
    }
  }

  // ── Graph Overlap Opportunities ──
  for (const opp of overlaps.slice(0, 2)) {
    guidanceItems.push({
      id: nextId(), type: "opportunity", priority: "medium",
      title: "Cross-cluster reinforcement opportunity",
      rationale: opp,
      suggestedAction: "Create content that explicitly bridges these themes.",
      confidence: 6, source: "knowledge-graph",
    });
  }

  // ── Content Pattern Reinforcement ──
  for (const pattern of memory.contentPatterns.filter((p) => p.avgImpact >= 7).slice(0, 1)) {
    guidanceItems.push({
      id: nextId(), type: "reinforcement", priority: "medium",
      title: "Proven pattern: replicate high-impact format",
      rationale: `${pattern.pattern} — average impact ${pattern.avgImpact}/10.`,
      suggestedAction: pattern.recommendation,
      confidence: 8, source: "strategic-memory",
    });
  }

  // ── Focus Shift Suggestions ──
  const focusAdjustments = generateFocusAdjustments(cadence, memory, health);

  // ── Momentum Analysis ──
  const momentum = analyzeMomentum(stats, cadence, health, clusterStrengths);

  // ── Sort and limit guidance ──
  const priorityOrder: Record<GuidancePriority, number> = { critical: 4, high: 3, medium: 2, advisory: 1 };
  guidanceItems.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority] || b.confidence - a.confidence);
  const limited = guidanceItems.slice(0, 12);

  // ── Top priority ──
  const topItem = limited[0];
  const topPriority = topItem
    ? `${topItem.title}: ${topItem.suggestedAction}`
    : "Maintain current authority-building cadence.";

  // ── Strategic outlook ──
  const strategicOutlook = momentum.direction === "accelerating"
    ? "Authority positioning is strengthening. Maintain execution cadence and pursue high-leverage opportunities to compound gains."
    : momentum.direction === "steady"
      ? "Authority is stable but not yet compounding. Focus on addressing weak themes and improving execution consistency to unlock acceleration."
      : momentum.direction === "decelerating"
        ? "Authority momentum is slowing. Immediate focus on execution consistency and underserved themes is needed to prevent positioning erosion."
        : "Authority execution has stalled. Restart with small daily missions to rebuild momentum before pursuing larger strategic objectives.";

  // ── Overall assessment ──
  const overallAssessment = `Authority health: ${health.overallScore}/10 | AI visibility: ${health.aiVisibilityRate}% | Consistency: ${stats.consistencyScore}/10 | ${limited.filter((g) => g.priority === "critical").length} critical items`;

  return {
    generatedAt: new Date().toISOString(),
    overallAssessment,
    guidanceItems: limited,
    momentumAnalysis: momentum,
    focusAdjustments,
    topPriority,
    strategicOutlook,
  };
}

// ─── Momentum Analysis ───────────────────────────────────────

function analyzeMomentum(
  stats: ReturnType<typeof calculateExecutionStats>,
  cadence: ReturnType<typeof analyzeCadence>,
  health: ReturnType<typeof generateHealthReport>,
  clusters: ReturnType<typeof getStrongestClusters>
): MomentumAnalysis {
  const direction: MomentumAnalysis["direction"] =
    stats.consistencyScore >= 7 && health.overallScore >= 7 ? "accelerating"
    : stats.consistencyScore >= 5 ? "steady"
    : stats.currentStreak >= 2 ? "decelerating"
    : "stalled";

  const growingClusters = clusters
    .filter((c) => c.avgStrength >= 7)
    .map((c) => c.cluster);

  const weakeningAreas = cadence
    .filter((c) => c.frequency === "inactive" || c.frequency === "low")
    .map((c) => c.theme);

  const executionTrend = stats.currentStreak >= stats.longestStreak
    ? "At peak — maintain this pace"
    : stats.currentStreak >= 3
      ? "Building steadily"
      : "Below historical best — room to improve";

  const strongSignals = health.healthIndicators.filter((h) => h.trend === "up");
  const semanticTrend = strongSignals.length >= 4
    ? "Semantic signals strengthening across multiple dimensions"
    : strongSignals.length >= 2
      ? "Selective improvement — some areas still need attention"
      : "Semantic reinforcement needs broader attention";

  return { direction, growingClusters, weakeningAreas, executionTrend, semanticTrend };
}

// ─── Focus Adjustments ───────────────────────────────────────

function generateFocusAdjustments(
  cadence: ReturnType<typeof analyzeCadence>,
  memory: ReturnType<typeof analyzeMemory>,
  health: ReturnType<typeof generateHealthReport>
): FocusAdjustment[] {
  return themes.map((theme) => {
    const cad = cadence.find((c) => c.theme === theme.name);
    const perf = memory.themePerformance.find((p) => p.themeId === theme.id);
    const vis = health.themeVisibility.find((v) => v.theme === theme.name);

    const isOverserved = cad?.frequency === "high" && (perf?.totalEntries ?? 0) > 3;
    const isUnderserved = cad?.frequency === "inactive" || cad?.frequency === "low";
    const isInvisible = vis?.strength === "invisible";

    let currentWeight: FocusAdjustment["currentWeight"] = "balanced";
    let suggestedShift: FocusAdjustment["suggestedShift"] = "maintain";
    let reason = `${theme.name} coverage is balanced.`;

    if (isUnderserved || isInvisible) {
      currentWeight = "under";
      suggestedShift = "increase";
      reason = isInvisible
        ? `Zero AI visibility — increase output to establish citation presence.`
        : `Low activity cadence (${cad?.daysSinceActivity ?? "?"} days since last activity). Increase to prevent authority decay.`;
    } else if (isOverserved && memory.overusedThemes.includes(theme.name)) {
      currentWeight = "over";
      suggestedShift = "decrease";
      reason = "Over-concentrated — redistribute effort to underserved themes for better semantic balance.";
    }

    return { theme: theme.name, currentWeight, suggestedShift, reason };
  });
}
