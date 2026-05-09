import { seedMemory } from "@/data/strategicMemory";
import { themes } from "@/data/themes";
import type { MemoryItem } from "@/data/strategicMemory";

// ─── Types ───────────────────────────────────────────────────

export interface ThemePerformance {
  themeId: string;
  themeName: string;
  totalEntries: number;
  avgAuthorityImpact: number;
  avgSemanticValue: number;
  trend: "growing" | "stable" | "declining";
  topInsight: string;
}

export interface ContentPattern {
  pattern: string;
  evidence: string;
  frequency: number;
  avgImpact: number;
  recommendation: string;
}

export interface StrategicLesson {
  lesson: string;
  theme: string;
  impact: number;
  date: string;
}

export interface MemoryAnalysis {
  themePerformance: ThemePerformance[];
  contentPatterns: ContentPattern[];
  strategicLessons: StrategicLesson[];
  overusedThemes: string[];
  underusedThemes: string[];
  highImpactCategories: { category: string; avgImpact: number }[];
  semanticStrengths: string[];
  growthIndicators: { label: string; value: string; trend: string }[];
  adaptiveSuggestions: string[];
}

// ─── Analysis Engine ─────────────────────────────────────────

export function analyzeMemory(
  memory: MemoryItem[] = seedMemory
): MemoryAnalysis {
  const themePerformance = analyzeThemePerformance(memory);
  const contentPatterns = detectContentPatterns(memory);
  const strategicLessons = extractLessons(memory);
  const { overused, underused } = detectThemeBalance(memory);
  const highImpactCategories = analyzeCategories(memory);
  const semanticStrengths = identifySemanticStrengths(memory);
  const growthIndicators = calculateGrowthIndicators(memory);
  const adaptiveSuggestions = generateAdaptiveSuggestions(
    themePerformance,
    contentPatterns,
    overused,
    underused
  );

  return {
    themePerformance,
    contentPatterns,
    strategicLessons,
    overusedThemes: overused,
    underusedThemes: underused,
    highImpactCategories,
    semanticStrengths,
    growthIndicators,
    adaptiveSuggestions,
  };
}

// ─── Theme Performance ───────────────────────────────────────

function analyzeThemePerformance(
  memory: MemoryItem[]
): ThemePerformance[] {
  const grouped: Record<string, MemoryItem[]> = {};
  for (const item of memory) {
    if (!grouped[item.theme]) grouped[item.theme] = [];
    grouped[item.theme].push(item);
  }

  return Object.entries(grouped)
    .map(([themeId, items]) => {
      const themeName =
        themes.find((t) => t.id === themeId)?.name ?? themeId;
      const avgAuth =
        items.reduce((s, i) => s + i.authorityImpact, 0) / items.length;
      const avgSem =
        items.reduce((s, i) => s + i.semanticValue, 0) / items.length;

      // Simple trend: compare first half vs second half
      const mid = Math.floor(items.length / 2);
      const firstHalf = items.slice(0, mid || 1);
      const secondHalf = items.slice(mid || 1);
      const firstAvg =
        firstHalf.reduce((s, i) => s + i.authorityImpact, 0) /
        firstHalf.length;
      const secondAvg =
        secondHalf.reduce((s, i) => s + i.authorityImpact, 0) /
        secondHalf.length;
      const trend: "growing" | "stable" | "declining" =
        secondAvg > firstAvg + 0.5
          ? "growing"
          : secondAvg < firstAvg - 0.5
            ? "declining"
            : "stable";

      const topItem = items.sort(
        (a, b) => b.authorityImpact - a.authorityImpact
      )[0];

      return {
        themeId,
        themeName,
        totalEntries: items.length,
        avgAuthorityImpact: Math.round(avgAuth * 10) / 10,
        avgSemanticValue: Math.round(avgSem * 10) / 10,
        trend,
        topInsight: topItem.insight,
      };
    })
    .sort((a, b) => b.avgAuthorityImpact - a.avgAuthorityImpact);
}

// ─── Content Patterns ────────────────────────────────────────

function detectContentPatterns(memory: MemoryItem[]): ContentPattern[] {
  const patterns: ContentPattern[] = [];

  // Pattern: checklist/framework content
  const frameworkItems = memory.filter(
    (m) =>
      m.insight.toLowerCase().includes("checklist") ||
      m.insight.toLowerCase().includes("framework") ||
      m.strategicNotes.toLowerCase().includes("framework")
  );
  if (frameworkItems.length >= 2) {
    patterns.push({
      pattern: "Framework and checklist content drives lasting authority",
      evidence: `${frameworkItems.length} entries show framework-style content outperforming general content`,
      frequency: frameworkItems.length,
      avgImpact:
        Math.round(
          (frameworkItems.reduce((s, i) => s + i.authorityImpact, 0) /
            frameworkItems.length) *
            10
        ) / 10,
      recommendation:
        "Prioritise creating referenceable frameworks and structured checklists over narrative articles",
    });
  }

  // Pattern: series format
  const seriesItems = memory.filter(
    (m) =>
      m.insight.toLowerCase().includes("series") ||
      m.strategicNotes.toLowerCase().includes("series")
  );
  if (seriesItems.length >= 1) {
    patterns.push({
      pattern: "Thematic content series compounds authority faster than one-off posts",
      evidence: `Series-format content shows consistent engagement growth across posts`,
      frequency: seriesItems.length,
      avgImpact:
        Math.round(
          (seriesItems.reduce((s, i) => s + i.authorityImpact, 0) /
            seriesItems.length) *
            10
        ) / 10,
      recommendation:
        "Plan 3-5 post thematic series for LinkedIn and blog. Each post should build on the previous.",
    });
  }

  // Pattern: cross-theme content
  const crossTheme = memory.filter(
    (m) =>
      m.strategicNotes.toLowerCase().includes("cross-theme") ||
      m.strategicNotes.toLowerCase().includes("compound") ||
      m.strategicNotes.toLowerCase().includes("bridges")
  );
  if (crossTheme.length >= 1) {
    patterns.push({
      pattern: "Content bridging multiple authority themes outperforms single-theme content",
      evidence: `${crossTheme.length} entries confirm cross-theme content creates compounding authority`,
      frequency: crossTheme.length,
      avgImpact:
        Math.round(
          (crossTheme.reduce((s, i) => s + i.authorityImpact, 0) /
            crossTheme.length) *
            10
        ) / 10,
      recommendation:
        "Design content that explicitly connects 2-3 core themes (e.g., AI readiness + entity trust + structured data)",
    });
  }

  // Pattern: first-mover advantage
  const firstMover = memory.filter(
    (m) =>
      m.insight.toLowerCase().includes("first") ||
      m.strategicNotes.toLowerCase().includes("first-mover") ||
      m.strategicNotes.toLowerCase().includes("speed")
  );
  if (firstMover.length >= 1) {
    patterns.push({
      pattern: "First-mover publication on emerging topics creates lasting citation advantage",
      evidence: `Early publication on GEO and AI readiness topics continues to generate citations`,
      frequency: firstMover.length,
      avgImpact:
        Math.round(
          (firstMover.reduce((s, i) => s + i.authorityImpact, 0) /
            firstMover.length) *
            10
        ) / 10,
      recommendation:
        "Treat speed of publication as a strategic priority for emerging topics. Publish a strong first version quickly.",
    });
  }

  // Pattern: founder voice
  const founderVoice = memory.filter(
    (m) =>
      m.insight.toLowerCase().includes("founder") ||
      m.insight.toLowerCase().includes("personal") ||
      m.strategicNotes.toLowerCase().includes("founder")
  );
  if (founderVoice.length >= 1) {
    patterns.push({
      pattern: "Founder/personal voice builds trust faster on authority topics",
      evidence: `Personal perspective posts consistently outperform institutional voice on entity trust topics`,
      frequency: founderVoice.length,
      avgImpact:
        Math.round(
          (founderVoice.reduce((s, i) => s + i.authorityImpact, 0) /
            founderVoice.length) *
            10
        ) / 10,
      recommendation:
        "Use founder voice for entity trust and strategic insight content. Reserve institutional voice for technical guides.",
    });
  }

  return patterns.sort((a, b) => b.avgImpact - a.avgImpact);
}

// ─── Theme Balance ───────────────────────────────────────────

function detectThemeBalance(memory: MemoryItem[]) {
  const themeCounts: Record<string, number> = {};
  for (const item of memory) {
    themeCounts[item.theme] = (themeCounts[item.theme] || 0) + 1;
  }

  const allThemeIds = themes.map((t) => t.id);
  const avg =
    Object.values(themeCounts).reduce((s, c) => s + c, 0) /
    allThemeIds.length;

  const overused = Object.entries(themeCounts)
    .filter(([, count]) => count > avg * 1.5)
    .map(([id]) => themes.find((t) => t.id === id)?.name ?? id);

  const underused = allThemeIds
    .filter((id) => (themeCounts[id] || 0) < avg * 0.5)
    .map((id) => themes.find((t) => t.id === id)?.name ?? id);

  return { overused, underused };
}

// ─── Category Analysis ───────────────────────────────────────

function analyzeCategories(memory: MemoryItem[]) {
  const catItems: Record<string, MemoryItem[]> = {};
  for (const item of memory) {
    if (!item.category) continue;
    if (!catItems[item.category]) catItems[item.category] = [];
    catItems[item.category].push(item);
  }

  return Object.entries(catItems)
    .map(([category, items]) => ({
      category,
      avgImpact:
        Math.round(
          (items.reduce((s, i) => s + i.authorityImpact, 0) / items.length) *
            10
        ) / 10,
    }))
    .sort((a, b) => b.avgImpact - a.avgImpact);
}

// ─── Semantic Strengths ──────────────────────────────────────

function identifySemanticStrengths(memory: MemoryItem[]): string[] {
  const highValue = memory
    .filter((m) => m.semanticValue >= 8)
    .map((m) => themes.find((t) => t.id === m.theme)?.name)
    .filter((n): n is string => n !== undefined);

  return [...new Set(highValue)];
}

// ─── Growth Indicators ───────────────────────────────────────

function calculateGrowthIndicators(memory: MemoryItem[]) {
  const sorted = [...memory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const mid = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, mid || 1);
  const secondHalf = sorted.slice(mid || 1);

  const avgImpactFirst =
    firstHalf.reduce((s, i) => s + i.authorityImpact, 0) / firstHalf.length;
  const avgImpactSecond =
    secondHalf.reduce((s, i) => s + i.authorityImpact, 0) /
    secondHalf.length;

  const avgSemFirst =
    firstHalf.reduce((s, i) => s + i.semanticValue, 0) / firstHalf.length;
  const avgSemSecond =
    secondHalf.reduce((s, i) => s + i.semanticValue, 0) / secondHalf.length;

  const completedMissions = memory.filter(
    (m) => m.type === "completed-mission"
  ).length;
  const insights = memory.filter(
    (m) =>
      m.type === "authority-insight" || m.type === "strategic-lesson"
  ).length;

  return [
    {
      label: "Authority Impact Trend",
      value: `${Math.round(avgImpactSecond * 10) / 10}/10`,
      trend: avgImpactSecond > avgImpactFirst ? "up" : "stable",
    },
    {
      label: "Semantic Value Trend",
      value: `${Math.round(avgSemSecond * 10) / 10}/10`,
      trend: avgSemSecond > avgSemFirst ? "up" : "stable",
    },
    {
      label: "Missions Completed",
      value: String(completedMissions),
      trend: "up",
    },
    {
      label: "Strategic Insights",
      value: String(insights),
      trend: insights > 3 ? "up" : "stable",
    },
  ];
}

// ─── Lessons ─────────────────────────────────────────────────

function extractLessons(memory: MemoryItem[]): StrategicLesson[] {
  return memory
    .filter(
      (m) => m.type === "strategic-lesson" || m.type === "authority-insight"
    )
    .map((m) => ({
      lesson: m.insight,
      theme: themes.find((t) => t.id === m.theme)?.name ?? m.theme,
      impact: m.authorityImpact,
      date: m.date,
    }))
    .sort((a, b) => b.impact - a.impact);
}

// ─── Adaptive Suggestions ────────────────────────────────────

function generateAdaptiveSuggestions(
  perf: ThemePerformance[],
  patterns: ContentPattern[],
  overused: string[],
  underused: string[]
): string[] {
  const suggestions: string[] = [];

  // Suggest increasing underused themes
  for (const theme of underused.slice(0, 2)) {
    suggestions.push(
      `Increase coverage of "${theme}" — currently underrepresented in authority-building activity`
    );
  }

  // Suggest reducing overused themes
  for (const theme of overused.slice(0, 1)) {
    suggestions.push(
      `Consider diversifying away from "${theme}" — high frequency may lead to diminishing returns`
    );
  }

  // Suggest top-performing patterns
  const topPattern = patterns[0];
  if (topPattern) {
    suggestions.push(topPattern.recommendation);
  }

  // Suggest growing themes
  const growing = perf.filter((p) => p.trend === "growing");
  if (growing.length > 0) {
    suggestions.push(
      `Double down on "${growing[0].themeName}" — authority impact is trending upward (${growing[0].avgAuthorityImpact}/10)`
    );
  }

  // Cross-theme suggestion
  if (perf.length >= 2) {
    suggestions.push(
      `Create content bridging "${perf[0].themeName}" and "${perf[1].themeName}" for maximum compound authority`
    );
  }

  return suggestions.slice(0, 5);
}
