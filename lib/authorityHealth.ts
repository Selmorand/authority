import {
  metricHistory,
  externalCorroborations,
  aiVisibilityChecks,
  getLatestSnapshot,
  getPreviousSnapshot,
} from "@/data/authorityMetrics";
import { themes } from "@/data/themes";
import type { AuthoritySnapshot } from "@/data/authorityMetrics";

// ─── Types ───────────────────────────────────────────────────

export interface HealthIndicator {
  area: string;
  status: "strong" | "moderate" | "weak" | "warning";
  score: number; // 1-10
  trend: "up" | "stable" | "down";
  description: string;
}

export interface MomentumMetric {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  direction: "up" | "stable" | "down";
}

export interface ThemeVisibility {
  theme: string;
  citationRate: number; // 0-100%
  avgPosition: number | null;
  platforms: string[];
  strength: "dominant" | "growing" | "emerging" | "invisible";
}

export interface AuthorityHealthReport {
  overallScore: number; // 1-10
  healthIndicators: HealthIndicator[];
  momentum: MomentumMetric[];
  themeVisibility: ThemeVisibility[];
  corroborationScore: number;
  aiVisibilityRate: number; // 0-100%
}

// ─── Health Analysis ─────────────────────────────────────────

export function generateHealthReport(): AuthorityHealthReport {
  const latest = getLatestSnapshot();
  const previous = getPreviousSnapshot();

  const healthIndicators = calculateHealthIndicators(latest, previous);
  const momentum = calculateMomentum(latest, previous);
  const themeVisibility = analyzeThemeVisibility();
  const corroborationScore = scoreCorroboration();
  const aiVisibilityRate = calculateAIVisibilityRate();

  const overallScore = Math.round(
    healthIndicators.reduce((s, h) => s + h.score, 0) /
      healthIndicators.length
  );

  return {
    overallScore,
    healthIndicators,
    momentum,
    themeVisibility,
    corroborationScore,
    aiVisibilityRate,
  };
}

// ─── Health Indicators ───────────────────────────────────────

function calculateHealthIndicators(
  latest: AuthoritySnapshot,
  previous: AuthoritySnapshot
): HealthIndicator[] {
  return [
    {
      area: "Branded Search Growth",
      score: latest.brandedSearchVolume > 200 ? 8 : latest.brandedSearchVolume > 150 ? 6 : 4,
      status: latest.brandedSearchVolume > 200 ? "strong" : latest.brandedSearchVolume > 150 ? "moderate" : "weak",
      trend: latest.brandedSearchVolume > previous.brandedSearchVolume ? "up" : "stable",
      description: `${latest.brandedSearchVolume} branded searches/month — ${calcChange(previous.brandedSearchVolume, latest.brandedSearchVolume)}% growth`,
    },
    {
      area: "Content Authority",
      score: latest.publishedArticles >= 15 ? 8 : latest.publishedArticles >= 10 ? 6 : 4,
      status: latest.publishedArticles >= 15 ? "strong" : "moderate",
      trend: latest.publishedArticles > previous.publishedArticles ? "up" : "stable",
      description: `${latest.publishedArticles} published articles, ${latest.caseStudiesCompleted} case studies`,
    },
    {
      area: "AI Visibility",
      score: latest.aiCitationOpportunities >= 8 ? 8 : latest.aiCitationOpportunities >= 5 ? 6 : 3,
      status: latest.aiCitationOpportunities >= 8 ? "strong" : latest.aiCitationOpportunities >= 5 ? "moderate" : "weak",
      trend: latest.aiCitationOpportunities > previous.aiCitationOpportunities ? "up" : "stable",
      description: `${latest.aiCitationOpportunities} AI citation opportunities detected`,
    },
    {
      area: "Semantic Coverage",
      score: latest.semanticThemesCovered >= 7 ? 9 : latest.semanticThemesCovered >= 5 ? 6 : 4,
      status: latest.semanticThemesCovered >= 7 ? "strong" : "moderate",
      trend: latest.semanticThemesCovered > previous.semanticThemesCovered ? "up" : "stable",
      description: `${latest.semanticThemesCovered} of ${themes.length} authority themes actively reinforced`,
    },
    {
      area: "Entity Consistency",
      score: latest.entityConsistencyScore,
      status: latest.entityConsistencyScore >= 7 ? "strong" : latest.entityConsistencyScore >= 5 ? "moderate" : "weak",
      trend: latest.entityConsistencyScore > previous.entityConsistencyScore ? "up" : "stable",
      description: `Entity signals are ${latest.entityConsistencyScore >= 7 ? "well-aligned" : "partially aligned"} across platforms`,
    },
    {
      area: "Founder Visibility",
      score: latest.founderVisibilityScore,
      status: latest.founderVisibilityScore >= 7 ? "strong" : latest.founderVisibilityScore >= 5 ? "moderate" : "weak",
      trend: latest.founderVisibilityScore > previous.founderVisibilityScore ? "up" : "stable",
      description: `Founder entity authority score: ${latest.founderVisibilityScore}/10`,
    },
    {
      area: "External Corroboration",
      score: latest.externalMentions >= 10 ? 8 : latest.externalMentions >= 5 ? 6 : 3,
      status: latest.externalMentions >= 10 ? "strong" : latest.externalMentions >= 5 ? "moderate" : "weak",
      trend: latest.externalMentions > previous.externalMentions ? "up" : "stable",
      description: `${latest.externalMentions} external mentions, ${latest.backlinks} backlinks`,
    },
    {
      area: "LinkedIn Authority",
      score: latest.linkedinFollowers >= 2500 ? 7 : latest.linkedinFollowers >= 1500 ? 5 : 3,
      status: latest.linkedinFollowers >= 2500 ? "strong" : "moderate",
      trend: latest.linkedinFollowers > previous.linkedinFollowers ? "up" : "stable",
      description: `${latest.linkedinFollowers.toLocaleString()} followers, ${latest.linkedinPostImpressions.toLocaleString()} monthly impressions`,
    },
  ];
}

// ─── Momentum ────────────────────────────────────────────────

function calculateMomentum(
  latest: AuthoritySnapshot,
  previous: AuthoritySnapshot
): MomentumMetric[] {
  const metrics: [string, number, number][] = [
    ["Branded Searches", latest.brandedSearchVolume, previous.brandedSearchVolume],
    ["LinkedIn Followers", latest.linkedinFollowers, previous.linkedinFollowers],
    ["Post Impressions", latest.linkedinPostImpressions, previous.linkedinPostImpressions],
    ["Published Articles", latest.publishedArticles, previous.publishedArticles],
    ["External Mentions", latest.externalMentions, previous.externalMentions],
    ["Backlinks", latest.backlinks, previous.backlinks],
    ["AI Citations", latest.aiCitationOpportunities, previous.aiCitationOpportunities],
    ["Theme Coverage", latest.semanticThemesCovered, previous.semanticThemesCovered],
  ];

  return metrics.map(([metric, current, prev]) => {
    const change = current - prev;
    const changePercent = prev > 0 ? Math.round((change / prev) * 100) : 0;
    return {
      metric,
      current,
      previous: prev,
      change,
      changePercent,
      direction: change > 0 ? "up" : change < 0 ? "down" : "stable",
    };
  });
}

// ─── Theme Visibility ────────────────────────────────────────

function analyzeThemeVisibility(): ThemeVisibility[] {
  return themes.map((theme) => {
    const checks = aiVisibilityChecks.filter((c) => c.theme === theme.id);
    const cited = checks.filter((c) => c.cited);
    const citationRate = checks.length > 0 ? Math.round((cited.length / checks.length) * 100) : 0;
    const positions = cited.filter((c) => c.position).map((c) => c.position!);
    const avgPosition = positions.length > 0
      ? Math.round((positions.reduce((s, p) => s + p, 0) / positions.length) * 10) / 10
      : null;
    const platforms = [...new Set(cited.map((c) => c.platform))];

    const strength: ThemeVisibility["strength"] =
      citationRate >= 75
        ? "dominant"
        : citationRate >= 50
          ? "growing"
          : citationRate > 0
            ? "emerging"
            : "invisible";

    return {
      theme: theme.name,
      citationRate,
      avgPosition,
      platforms,
      strength,
    };
  });
}

// ─── Corroboration ───────────────────────────────────────────

function scoreCorroboration(): number {
  const totalImpact = externalCorroborations.reduce(
    (s, c) => s + c.authorityImpact,
    0
  );
  const avgImpact = totalImpact / externalCorroborations.length;
  const typeCount = new Set(externalCorroborations.map((c) => c.type)).size;
  return Math.min(10, Math.round(avgImpact * 0.6 + typeCount * 0.8));
}

// ─── AI Visibility Rate ──────────────────────────────────────

function calculateAIVisibilityRate(): number {
  const cited = aiVisibilityChecks.filter((c) => c.cited).length;
  return Math.round((cited / aiVisibilityChecks.length) * 100);
}

// ─── Helpers ─────────────────────────────────────────────────

function calcChange(prev: number, current: number): number {
  return prev > 0 ? Math.round(((current - prev) / prev) * 100) : 0;
}

// ─── Growth Timeline ─────────────────────────────────────────

export function getGrowthTimeline(): {
  dates: string[];
  metrics: Record<string, number[]>;
} {
  const dates = metricHistory.map((s) => s.date);
  return {
    dates,
    metrics: {
      "Branded Search": metricHistory.map((s) => s.brandedSearchVolume),
      "LinkedIn Followers": metricHistory.map((s) => s.linkedinFollowers),
      "External Mentions": metricHistory.map((s) => s.externalMentions),
      "AI Citations": metricHistory.map((s) => s.aiCitationOpportunities),
      "Entity Score": metricHistory.map((s) => s.entityConsistencyScore),
      "Themes Covered": metricHistory.map((s) => s.semanticThemesCovered),
    },
  };
}
