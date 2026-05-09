import { researchSignals } from "@/data/researchSignals";
import { themes } from "@/data/themes";
import { topicIdeas } from "@/data/topicIdeas";
import type { ResearchSignal } from "@/data/researchSignals";

// ─── Types ───────────────────────────────────────────────────

export interface OpportunityScore {
  authorityPotential: number; // 1-10
  semanticRelevance: number; // 1-10
  marketTiming: number; // 1-10
  technicalAlignment: number; // 1-10
  competitiveOpportunity: number; // 1-10
  overall: number; // weighted composite
}

export interface ScoredSignal {
  signal: ResearchSignal;
  score: OpportunityScore;
}

export interface Recommendation {
  type: "article" | "linkedin" | "research" | "case-study" | "founder-authority";
  title: string;
  basedOn: string; // signal id
  rationale: string;
  authorityImpact: number; // 1-10
}

// ─── Scoring Engine ──────────────────────────────────────────

export function scoreSignal(signal: ResearchSignal): OpportunityScore {
  const urgencyMultiplier =
    signal.urgency === "high" ? 1.3 : signal.urgency === "medium" ? 1.0 : 0.7;

  // Authority potential: how much this could build Interon's authority
  const authorityPotential = Math.min(
    10,
    Math.round(signal.authorityOpportunity * urgencyMultiplier)
  );

  // Semantic relevance: how many core themes this touches
  const coreThemeCount = signal.relatedThemes.filter((id) => {
    const theme = themes.find((t) => t.id === id);
    return theme?.authorityLevel === "core";
  }).length;
  const semanticRelevance = Math.min(
    10,
    Math.round((signal.relatedThemes.length * 2 + coreThemeCount * 2) * 1.1)
  );

  // Market timing: urgency + recency
  const daysSinceDetected = Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(signal.dateDetected).getTime()) / 86400000
    )
  );
  const recencyBonus = daysSinceDetected <= 7 ? 2 : daysSinceDetected <= 14 ? 1 : 0;
  const marketTiming = Math.min(
    10,
    Math.round(
      (signal.urgency === "high" ? 8 : signal.urgency === "medium" ? 5 : 3) +
        recencyBonus
    )
  );

  // Technical alignment: does this match Interon's expertise?
  const technicalThemes = [
    "technical-seo",
    "structured-data",
    "machine-readable",
    "umbraco-ai",
  ];
  const technicalOverlap = signal.relatedThemes.filter((id) =>
    technicalThemes.includes(id)
  ).length;
  const technicalAlignment = Math.min(
    10,
    Math.round(4 + technicalOverlap * 2 + signal.relevance * 0.3)
  );

  // Competitive opportunity: authority gaps and competitor patterns score highest
  const competitiveBonus =
    signal.alertType === "authority-gap-warning"
      ? 3
      : signal.alertType === "competitor-movement"
        ? 2
        : signal.alertType === "topic-saturation-risk"
          ? -1
          : 0;
  const competitiveOpportunity = Math.min(
    10,
    Math.max(1, Math.round(signal.authorityOpportunity * 0.8 + competitiveBonus))
  );

  const overall = Math.round(
    authorityPotential * 0.25 +
      semanticRelevance * 0.2 +
      marketTiming * 0.2 +
      technicalAlignment * 0.15 +
      competitiveOpportunity * 0.2
  );

  return {
    authorityPotential,
    semanticRelevance,
    marketTiming,
    technicalAlignment,
    competitiveOpportunity,
    overall,
  };
}

export function getScoredSignals(): ScoredSignal[] {
  return researchSignals
    .map((signal) => ({ signal, score: scoreSignal(signal) }))
    .sort((a, b) => b.score.overall - a.score.overall);
}

// ─── Recommendation Engine ───────────────────────────────────

export function generateRecommendations(): Recommendation[] {
  const scored = getScoredSignals();
  const recommendations: Recommendation[] = [];

  for (const { signal, score } of scored.slice(0, 6)) {
    // Article opportunity — for high-authority, technically aligned signals
    if (score.authorityPotential >= 7 && score.technicalAlignment >= 6) {
      recommendations.push({
        type: "article",
        title: signal.suggestedActions[0] || `Deep dive: ${signal.title}`,
        basedOn: signal.id,
        rationale: `High authority potential (${score.authorityPotential}/10) with strong technical alignment. Publishing first builds lasting category authority.`,
        authorityImpact: score.authorityPotential,
      });
    }

    // LinkedIn opportunity — for timely, high-relevance signals
    if (score.marketTiming >= 7) {
      recommendations.push({
        type: "linkedin",
        title:
          signal.suggestedActions.find((a) =>
            a.toLowerCase().includes("linkedin")
          ) || `LinkedIn take: ${signal.title}`,
        basedOn: signal.id,
        rationale: `Strong market timing (${score.marketTiming}/10). Posting now captures the conversation while it's active.`,
        authorityImpact: Math.min(10, score.overall),
      });
    }

    // Research opportunity — for emerging trends
    if (signal.alertType === "emerging-trend") {
      recommendations.push({
        type: "research",
        title: `Research deep-dive: ${signal.title}`,
        basedOn: signal.id,
        rationale: `Emerging trend with ${score.semanticRelevance}/10 semantic relevance. Early research builds evidence base for future authority content.`,
        authorityImpact: Math.round(score.authorityPotential * 0.8),
      });
    }

    // Case study opportunity — for signals with competitive gaps
    if (
      score.competitiveOpportunity >= 7 &&
      signal.alertType === "authority-gap-warning"
    ) {
      recommendations.push({
        type: "case-study",
        title:
          signal.suggestedActions.find((a) =>
            a.toLowerCase().includes("case study")
          ) || `Case study opportunity: ${signal.title}`,
        basedOn: signal.id,
        rationale: `Authority gap with ${score.competitiveOpportunity}/10 competitive opportunity. A case study here would be difficult for competitors to replicate.`,
        authorityImpact: score.authorityPotential,
      });
    }

    // Founder authority — for signals touching entity trust or requiring personal voice
    if (signal.relatedThemes.includes("entity-trust")) {
      recommendations.push({
        type: "founder-authority",
        title:
          signal.suggestedActions.find((a) =>
            a.toLowerCase().includes("founder")
          ) || `Founder perspective: ${signal.title}`,
        basedOn: signal.id,
        rationale: `Connects to entity trust theme. Personal perspective builds founder entity authority and reinforces brand credibility.`,
        authorityImpact: Math.min(10, score.authorityPotential + 1),
      });
    }
  }

  // Deduplicate by title similarity and sort by impact
  const seen = new Set<string>();
  return recommendations
    .filter((r) => {
      const key = r.title.toLowerCase().slice(0, 40);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.authorityImpact - a.authorityImpact)
    .slice(0, 10);
}

// ─── Summary Helpers ─────────────────────────────────────────

export function getWeeklySummary() {
  const scored = getScoredSignals();
  const highUrgency = scored.filter((s) => s.signal.urgency === "high");
  const topThemes = getTopThemesBySignalCount();
  const recommendations = generateRecommendations();

  return {
    totalSignals: scored.length,
    highPriorityCount: highUrgency.length,
    topThemes,
    gainingMomentum: scored
      .filter((s) => s.score.marketTiming >= 7)
      .map((s) => s.signal.title)
      .slice(0, 4),
    authorityOpportunities: scored
      .filter((s) => s.score.authorityPotential >= 8)
      .map((s) => s.signal.title)
      .slice(0, 4),
    competitorGaps: scored
      .filter(
        (s) =>
          s.signal.alertType === "authority-gap-warning" ||
          s.signal.alertType === "competitor-movement"
      )
      .map((s) => s.signal.title)
      .slice(0, 4),
    topRecommendations: recommendations.slice(0, 5),
  };
}

function getTopThemesBySignalCount(): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const signal of researchSignals) {
    for (const themeId of signal.relatedThemes) {
      const theme = themes.find((t) => t.id === themeId);
      if (theme) {
        counts[theme.name] = (counts[theme.name] || 0) + 1;
      }
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}
