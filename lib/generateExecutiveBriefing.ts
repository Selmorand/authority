import { generateHealthReport, getGrowthTimeline } from "./authorityHealth";
import { analyzeMemory } from "./analyzeStrategicMemory";
import { calculateExecutionStats, detectStrategicDrift, analyzeCadence } from "./executionTracker";
import { getScoredSignals, generateRecommendations, getWeeklySummary } from "./opportunityEngine";
import { themes } from "@/data/themes";
import { metricHistory, getLatestSnapshot, getPreviousSnapshot } from "@/data/authorityMetrics";
import type { HealthIndicator, ThemeVisibility } from "./authorityHealth";
import type { DriftIndicator } from "./executionTracker";

// ─── Types ───────────────────────────────────────────────────

export interface StrategicRisk {
  risk: string;
  severity: "critical" | "high" | "medium" | "low";
  evidence: string;
  mitigation: string;
  category: "semantic-drift" | "messaging-dilution" | "theme-inconsistency" | "founder-visibility" | "execution-decline" | "saturation" | "corroboration-gap";
}

export interface StrategicOpportunity {
  opportunity: string;
  leverage: "high" | "medium" | "low";
  theme: string;
  rationale: string;
  suggestedAction: string;
  timeframe: "immediate" | "this-week" | "this-month";
}

export interface WeeklyRecommendation {
  area: string;
  recommendation: string;
  priority: number; // 1-10
  type: "focus" | "execution" | "content" | "semantic" | "expansion";
}

export interface NarrativePosition {
  theme: string;
  strength: "dominant" | "strong" | "developing" | "weak" | "absent";
  trend: "growing" | "stable" | "declining";
  categoryOwnership: number; // 0-100%
}

export interface ExecutiveBriefing {
  generatedAt: string;
  // Top-line summary
  whatMattersmost: string;
  highestLeverageOpportunity: string;
  biggestStrategicRisk: string;
  recommendedFocus: string;
  // Scores
  authorityHealthScore: number;
  executionConsistencyScore: number;
  aiVisibilityRate: number;
  semanticCoverage: number; // of 8 themes
  momentumDirection: "accelerating" | "steady" | "decelerating";
  // Detail sections
  themesStrengthening: string[];
  areasLosingMomentum: string[];
  strategicRisks: StrategicRisk[];
  opportunities: StrategicOpportunity[];
  weeklyRecommendations: WeeklyRecommendation[];
  narrativePositions: NarrativePosition[];
  // Export-ready data
  briefingSections: { title: string; content: string }[];
}

// ─── Main Generator ──────────────────────────────────────────

export function generateExecutiveBriefingFromMemory(
  memoryItems: import("@/data/strategicMemory").MemoryItem[]
): ExecutiveBriefing {
  const health = generateHealthReport();
  const memory = analyzeMemory(memoryItems);
  const execStats = calculateExecutionStats(memoryItems);
  const drift = detectStrategicDrift(memoryItems);
  const cadence = analyzeCadence(memoryItems);
  const signals = getScoredSignals();
  const recommendations = generateRecommendations();
  const latest = getLatestSnapshot();
  const previous = getPreviousSnapshot();

  return buildBriefing(health, memory, execStats, drift, cadence, signals, recommendations, latest, previous);
}

export function generateExecutiveBriefing(): ExecutiveBriefing {
  const health = generateHealthReport();
  const memory = analyzeMemory();
  const execStats = calculateExecutionStats();
  const drift = detectStrategicDrift();
  const cadence = analyzeCadence();
  const signals = getScoredSignals();
  const recommendations = generateRecommendations();
  const latest = getLatestSnapshot();
  const previous = getPreviousSnapshot();

  return buildBriefing(health, memory, execStats, drift, cadence, signals, recommendations, latest, previous);
}

function buildBriefing(
  health: ReturnType<typeof generateHealthReport>,
  memory: ReturnType<typeof analyzeMemory>,
  execStats: ReturnType<typeof calculateExecutionStats>,
  drift: ReturnType<typeof detectStrategicDrift>,
  cadence: ReturnType<typeof analyzeCadence>,
  signals: ReturnType<typeof getScoredSignals>,
  recommendations: ReturnType<typeof generateRecommendations>,
  latest: ReturnType<typeof getLatestSnapshot>,
  previous: ReturnType<typeof getPreviousSnapshot>,
): ExecutiveBriefing {
  const risks = synthesizeRisks(health.healthIndicators, drift, cadence);
  const opportunities = synthesizeOpportunities(health.themeVisibility, signals, memory);
  const weeklyRecs = generateWeeklyRecommendations(health, memory, risks, opportunities);
  const narratives = mapNarrativePositions(health.themeVisibility, memory);

  // Determine momentum
  const growthMetrics = [
    latest.brandedSearchVolume / previous.brandedSearchVolume,
    latest.linkedinFollowers / previous.linkedinFollowers,
    latest.aiCitationOpportunities / (previous.aiCitationOpportunities || 1),
    latest.externalMentions / (previous.externalMentions || 1),
  ];
  const avgGrowth = growthMetrics.reduce((s, v) => s + v, 0) / growthMetrics.length;
  const momentumDirection: ExecutiveBriefing["momentumDirection"] =
    avgGrowth > 1.08 ? "accelerating" : avgGrowth > 1.02 ? "steady" : "decelerating";

  // Strengthening themes
  const themesStrengthening = memory.themePerformance
    .filter((t) => t.trend === "growing")
    .map((t) => t.themeName);
  if (themesStrengthening.length === 0) {
    const topThemes = memory.themePerformance.slice(0, 2).map((t) => t.themeName);
    themesStrengthening.push(...topThemes);
  }

  // Losing momentum
  const areasLosingMomentum = cadence
    .filter((c) => c.frequency === "inactive" || c.frequency === "low")
    .map((c) => c.theme);

  // Top-line synthesis
  const topRisk = risks[0];
  const topOpp = opportunities[0];
  const topRec = weeklyRecs[0];

  const whatMattersmost = momentumDirection === "accelerating"
    ? `Authority momentum is accelerating — ${latest.aiCitationOpportunities} AI citation opportunities detected this week. Maintain execution cadence to compound gains.`
    : momentumDirection === "steady"
      ? `Authority growth is steady at ${health.overallScore}/10 health score. Focus on ${areasLosingMomentum[0] || "semantic coverage"} to unlock the next growth phase.`
      : `Authority momentum is slowing — execution consistency at ${execStats.consistencyScore}/10. Prioritise daily mission completion to restore cadence.`;

  // Generate export-ready sections
  const briefingSections = generateBriefingSections(
    whatMattersmost, topRisk, topOpp, themesStrengthening, areasLosingMomentum,
    health, execStats, weeklyRecs
  );

  return {
    generatedAt: new Date().toISOString(),
    whatMattersmost,
    highestLeverageOpportunity: topOpp?.opportunity ?? "Maintain current authority-building cadence",
    biggestStrategicRisk: topRisk?.risk ?? "No critical risks detected",
    recommendedFocus: topRec?.recommendation ?? "Continue balanced theme coverage",
    authorityHealthScore: health.overallScore,
    executionConsistencyScore: execStats.consistencyScore,
    aiVisibilityRate: health.aiVisibilityRate,
    semanticCoverage: latest.semanticThemesCovered,
    momentumDirection,
    themesStrengthening,
    areasLosingMomentum,
    strategicRisks: risks,
    opportunities,
    weeklyRecommendations: weeklyRecs,
    narrativePositions: narratives,
    briefingSections,
  };
}

// ─── Risk Synthesis ──────────────────────────────────────────

function synthesizeRisks(
  health: HealthIndicator[],
  drift: DriftIndicator[],
  cadence: ReturnType<typeof analyzeCadence>
): StrategicRisk[] {
  const risks: StrategicRisk[] = [];

  // From health indicators
  for (const h of health) {
    if (h.status === "weak" || h.status === "warning") {
      risks.push({
        risk: `${h.area} is ${h.status}: ${h.description}`,
        severity: h.status === "warning" ? "critical" : "high",
        evidence: h.description,
        mitigation: `Prioritise improving ${h.area} through targeted missions this week`,
        category: h.area.includes("Entity") ? "messaging-dilution"
          : h.area.includes("Founder") ? "founder-visibility"
          : h.area.includes("Semantic") ? "semantic-drift"
          : "execution-decline",
      });
    }
  }

  // From drift detection
  for (const d of drift) {
    const categoryMap: Record<string, StrategicRisk["category"]> = {
      "over-focus": "saturation",
      "under-focus": "theme-inconsistency",
      "declining-consistency": "execution-decline",
      "semantic-imbalance": "semantic-drift",
      "insufficient-founder-visibility": "founder-visibility",
    };
    risks.push({
      risk: `${d.area}: ${d.type.replace(/-/g, " ")}`,
      severity: d.severity === "high" ? "high" : "medium",
      evidence: d.evidence,
      mitigation: d.correction,
      category: categoryMap[d.type] ?? "semantic-drift",
    });
  }

  // Corroboration gap check
  const inactiveCadence = cadence.filter((c) => c.frequency === "inactive");
  if (inactiveCadence.length >= 3) {
    risks.push({
      risk: `${inactiveCadence.length} authority themes have no recent activity`,
      severity: "high",
      evidence: `Themes inactive: ${inactiveCadence.map((c) => c.theme).join(", ")}`,
      mitigation: "Schedule immediate missions for inactive themes to prevent authority decay",
      category: "corroboration-gap",
    });
  }

  return risks
    .sort((a, b) => {
      const sev = { critical: 4, high: 3, medium: 2, low: 1 };
      return sev[b.severity] - sev[a.severity];
    })
    .slice(0, 8);
}

// ─── Opportunity Synthesis ───────────────────────────────────

function synthesizeOpportunities(
  visibility: ThemeVisibility[],
  signals: ReturnType<typeof getScoredSignals>,
  memory: ReturnType<typeof analyzeMemory>
): StrategicOpportunity[] {
  const opps: StrategicOpportunity[] = [];

  // Invisible themes = opportunity
  for (const v of visibility) {
    if (v.strength === "invisible") {
      opps.push({
        opportunity: `${v.theme} has zero AI visibility — first-mover content opportunity`,
        leverage: "high",
        theme: v.theme,
        rationale: "No AI citations detected for this theme. Publishing authoritative content now creates lasting citation advantage.",
        suggestedAction: `Write a comprehensive ${v.theme} article optimised for AI citation this week`,
        timeframe: "this-week",
      });
    }
  }

  // Emerging themes with high signal scores
  for (const { signal, score } of signals.slice(0, 5)) {
    if (score.authorityPotential >= 8) {
      opps.push({
        opportunity: signal.title,
        leverage: "high",
        theme: signal.relatedThemes[0] || "ai-readiness",
        rationale: `Authority potential ${score.authorityPotential}/10 with ${score.marketTiming}/10 timing`,
        suggestedAction: signal.suggestedActions[0] || `Create authority content responding to this signal`,
        timeframe: signal.urgency === "high" ? "immediate" : "this-week",
      });
    }
  }

  // Underused themes from memory
  for (const theme of memory.underusedThemes) {
    opps.push({
      opportunity: `"${theme}" is underutilised — expand authority coverage`,
      leverage: "medium",
      theme,
      rationale: "Memory analysis shows this theme receives below-average attention. Increasing coverage diversifies authority signals.",
      suggestedAction: `Plan 2-3 ${theme} missions for the coming week`,
      timeframe: "this-week",
    });
  }

  // Content pattern opportunities
  for (const pattern of memory.contentPatterns.slice(0, 2)) {
    if (pattern.avgImpact >= 7) {
      opps.push({
        opportunity: pattern.pattern,
        leverage: "high",
        theme: "cross-theme",
        rationale: `Average impact ${pattern.avgImpact}/10 — proven pattern from execution history`,
        suggestedAction: pattern.recommendation,
        timeframe: "this-week",
      });
    }
  }

  return opps
    .sort((a, b) => {
      const lev = { high: 3, medium: 2, low: 1 };
      return lev[b.leverage] - lev[a.leverage];
    })
    .slice(0, 8);
}

// ─── Weekly Recommendations ──────────────────────────────────

function generateWeeklyRecommendations(
  health: ReturnType<typeof generateHealthReport>,
  memory: ReturnType<typeof analyzeMemory>,
  risks: StrategicRisk[],
  opportunities: StrategicOpportunity[]
): WeeklyRecommendation[] {
  const recs: WeeklyRecommendation[] = [];

  // From adaptive suggestions
  for (const suggestion of memory.adaptiveSuggestions.slice(0, 2)) {
    recs.push({
      area: "Strategic Adaptation",
      recommendation: suggestion,
      priority: 7,
      type: "focus",
    });
  }

  // From top risk
  if (risks[0]) {
    recs.push({
      area: "Risk Mitigation",
      recommendation: risks[0].mitigation,
      priority: 9,
      type: "execution",
    });
  }

  // From top opportunity
  if (opportunities[0]) {
    recs.push({
      area: "Opportunity Capture",
      recommendation: opportunities[0].suggestedAction,
      priority: 8,
      type: "content",
    });
  }

  // Semantic coverage
  if (health.overallScore < 8) {
    const weakAreas = health.healthIndicators
      .filter((h) => h.status === "weak" || h.status === "moderate")
      .slice(0, 2)
      .map((h) => h.area);
    if (weakAreas.length > 0) {
      recs.push({
        area: "Semantic Reinforcement",
        recommendation: `Strengthen ${weakAreas.join(" and ")} through targeted authority content`,
        priority: 7,
        type: "semantic",
      });
    }
  }

  // AI visibility push
  if (health.aiVisibilityRate < 60) {
    recs.push({
      area: "AI Visibility",
      recommendation: "Increase structured data coverage and publish GEO-optimised content to improve AI citation rate",
      priority: 8,
      type: "expansion",
    });
  }

  return recs.sort((a, b) => b.priority - a.priority).slice(0, 6);
}

// ─── Narrative Mapping ───────────────────────────────────────

function mapNarrativePositions(
  visibility: ThemeVisibility[],
  memory: ReturnType<typeof analyzeMemory>
): NarrativePosition[] {
  return themes.map((theme) => {
    const vis = visibility.find((v) => v.theme === theme.name);
    const perf = memory.themePerformance.find((p) => p.themeId === theme.id);

    const strength: NarrativePosition["strength"] =
      vis?.strength === "dominant" ? "dominant"
      : vis?.strength === "growing" ? "strong"
      : (perf?.avgAuthorityImpact ?? 0) >= 7 ? "developing"
      : (perf?.totalEntries ?? 0) > 0 ? "weak"
      : "absent";

    const trend = perf?.trend ?? "stable";

    // Category ownership: combination of visibility + internal authority
    const visScore = vis?.citationRate ?? 0;
    const authScore = (perf?.avgAuthorityImpact ?? 0) * 10;
    const categoryOwnership = Math.min(100, Math.round((visScore + authScore) / 2));

    return {
      theme: theme.name,
      strength,
      trend,
      categoryOwnership,
    };
  });
}

// ─── Briefing Sections (Export-Ready) ────────────────────────

function generateBriefingSections(
  whatMatters: string,
  topRisk: StrategicRisk | undefined,
  topOpp: StrategicOpportunity | undefined,
  strengthening: string[],
  losingMomentum: string[],
  health: ReturnType<typeof generateHealthReport>,
  execStats: ReturnType<typeof calculateExecutionStats>,
  recs: WeeklyRecommendation[]
): { title: string; content: string }[] {
  return [
    {
      title: "What Matters Most This Week",
      content: whatMatters,
    },
    {
      title: "Highest-Leverage Opportunity",
      content: topOpp
        ? `${topOpp.opportunity}\n\nAction: ${topOpp.suggestedAction}\nTimeframe: ${topOpp.timeframe}`
        : "Maintain current authority-building cadence across all themes.",
    },
    {
      title: "Biggest Strategic Risk",
      content: topRisk
        ? `${topRisk.risk}\n\nEvidence: ${topRisk.evidence}\nMitigation: ${topRisk.mitigation}`
        : "No critical strategic risks detected this week.",
    },
    {
      title: "Authority Health Summary",
      content: `Overall: ${health.overallScore}/10 | AI Visibility: ${health.aiVisibilityRate}% | Execution: ${execStats.consistencyScore}/10 | Streak: ${execStats.currentStreak} days`,
    },
    {
      title: "Themes Strengthening",
      content: strengthening.length > 0 ? strengthening.join(", ") : "All themes stable — consistent execution recommended.",
    },
    {
      title: "Areas Losing Momentum",
      content: losingMomentum.length > 0 ? losingMomentum.join(", ") : "No themes losing momentum.",
    },
    {
      title: "Recommended Strategic Focus",
      content: recs.map((r) => `[${r.type}] ${r.recommendation}`).join("\n"),
    },
  ];
}
