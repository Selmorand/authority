import { themes } from "@/data/themes";
import { aiVisibilityChecks, metricHistory, externalCorroborations } from "@/data/authorityMetrics";
import { seedMemory } from "@/data/strategicMemory";
import { ecosystemDevelopments, geoTerminology } from "@/data/searchEcosystem";
import type { Theme } from "@/data/themes";

// ─── Types ───────────────────────────────────────────────────

export interface VisibilitySignal {
  theme: string;
  signal: string;
  strength: "strong" | "moderate" | "weak" | "absent";
  trend: "improving" | "stable" | "declining";
  evidence: string;
}

export interface EntityAnalysis {
  area: string;
  score: number; // 1-10
  status: "consistent" | "partial" | "fragmented" | "absent";
  gaps: string[];
  reinforcements: string[];
}

export interface SemanticConsistencyReport {
  overallScore: number; // 1-10
  issues: SemanticIssue[];
  strengths: string[];
}

export interface SemanticIssue {
  type: "messaging-dilution" | "inconsistent-positioning" | "conflicting-terminology" | "weak-reinforcement" | "fragmented-entity";
  area: string;
  severity: "high" | "medium" | "low";
  description: string;
  correction: string;
}

export interface VisibilityRecommendation {
  type: "semantic" | "authority" | "discoverability" | "consistency" | "entity";
  title: string;
  rationale: string;
  priority: number; // 1-10
  theme: string;
}

export interface AIVisibilityReport {
  visibilitySignals: VisibilitySignal[];
  entityAnalysis: EntityAnalysis[];
  semanticConsistency: SemanticConsistencyReport;
  recommendations: VisibilityRecommendation[];
  discoverabilityScore: number; // 1-10
  entityConfidenceScore: number; // 1-10
}

// ─── Main Monitor ────────────────────────────────────────────

export function generateVisibilityReport(): AIVisibilityReport {
  const signals = analyzeVisibilitySignals();
  const entity = analyzeEntityReinforcement();
  const consistency = analyzeSemanticConsistency();
  const recommendations = generateRecommendations(signals, entity, consistency);

  const discoverabilityScore = Math.round(
    signals.reduce((s, v) => {
      const score = v.strength === "strong" ? 9 : v.strength === "moderate" ? 6 : v.strength === "weak" ? 3 : 1;
      return s + score;
    }, 0) / Math.max(signals.length, 1)
  );

  const entityConfidenceScore = Math.round(
    entity.reduce((s, e) => s + e.score, 0) / Math.max(entity.length, 1)
  );

  return {
    visibilitySignals: signals,
    entityAnalysis: entity,
    semanticConsistency: consistency,
    recommendations,
    discoverabilityScore,
    entityConfidenceScore,
  };
}

// ─── Visibility Signals ──────────────────────────────────────

function analyzeVisibilitySignals(): VisibilitySignal[] {
  return themes.map((theme) => {
    const checks = aiVisibilityChecks.filter((c) => c.theme === theme.id);
    const cited = checks.filter((c) => c.cited);
    const citationRate = checks.length > 0 ? cited.length / checks.length : 0;

    const memoryItems = seedMemory.filter((m) => m.theme === theme.id);
    const avgImpact = memoryItems.length > 0
      ? memoryItems.reduce((s, m) => s + m.authorityImpact, 0) / memoryItems.length
      : 0;

    const corroborations = externalCorroborations.filter(
      (c) => c.relatedTheme === theme.id
    );

    const strength: VisibilitySignal["strength"] =
      citationRate >= 0.6 && avgImpact >= 7 ? "strong"
      : citationRate >= 0.3 || avgImpact >= 6 ? "moderate"
      : memoryItems.length > 0 || corroborations.length > 0 ? "weak"
      : "absent";

    const latest = metricHistory[metricHistory.length - 1];
    const previous = metricHistory[metricHistory.length - 2];
    const trend: VisibilitySignal["trend"] =
      latest.aiCitationOpportunities > previous.aiCitationOpportunities
        ? "improving"
        : latest.aiCitationOpportunities < previous.aiCitationOpportunities
          ? "declining"
          : "stable";

    const evidenceParts: string[] = [];
    if (checks.length > 0) evidenceParts.push(`${cited.length}/${checks.length} AI citations`);
    if (corroborations.length > 0) evidenceParts.push(`${corroborations.length} corroborations`);
    if (memoryItems.length > 0) evidenceParts.push(`${memoryItems.length} memory entries (avg impact ${avgImpact.toFixed(1)})`);

    return {
      theme: theme.name,
      signal: `${theme.name} visibility: ${strength}`,
      strength,
      trend,
      evidence: evidenceParts.join(" | ") || "No visibility data available",
    };
  });
}

// ─── Entity Reinforcement ────────────────────────────────────

function analyzeEntityReinforcement(): EntityAnalysis[] {
  const areas: EntityAnalysis[] = [];
  const latest = metricHistory[metricHistory.length - 1];

  // Theme consistency
  const coveredThemes = themes.filter((t) =>
    seedMemory.some((m) => m.theme === t.id)
  );
  areas.push({
    area: "Authority Theme Consistency",
    score: Math.min(10, Math.round((coveredThemes.length / themes.length) * 10)),
    status: coveredThemes.length >= 7 ? "consistent" : coveredThemes.length >= 5 ? "partial" : "fragmented",
    gaps: themes
      .filter((t) => !seedMemory.some((m) => m.theme === t.id))
      .map((t) => `No activity recorded for "${t.name}"`),
    reinforcements: coveredThemes
      .slice(0, 3)
      .map((t) => `"${t.name}" actively reinforced`),
  });

  // Semantic positioning repetition
  const themeFrequency: Record<string, number> = {};
  for (const m of seedMemory) {
    themeFrequency[m.theme] = (themeFrequency[m.theme] || 0) + 1;
  }
  const avgFreq = Object.values(themeFrequency).reduce((s, v) => s + v, 0) / Object.keys(themeFrequency).length;
  areas.push({
    area: "Semantic Positioning Repetition",
    score: Math.min(10, Math.round(avgFreq * 2)),
    status: avgFreq >= 3 ? "consistent" : avgFreq >= 2 ? "partial" : "fragmented",
    gaps: Object.entries(themeFrequency)
      .filter(([, v]) => v < avgFreq * 0.5)
      .map(([k]) => `"${themes.find((t) => t.id === k)?.name ?? k}" underrepresented`),
    reinforcements: Object.entries(themeFrequency)
      .filter(([, v]) => v >= avgFreq)
      .slice(0, 3)
      .map(([k]) => `"${themes.find((t) => t.id === k)?.name ?? k}" well-reinforced`),
  });

  // External corroboration
  const corrTypes = new Set(externalCorroborations.map((c) => c.type));
  areas.push({
    area: "External Corroboration",
    score: Math.min(10, externalCorroborations.length + corrTypes.size),
    status: externalCorroborations.length >= 6 ? "consistent" : externalCorroborations.length >= 3 ? "partial" : "fragmented",
    gaps: corrTypes.size < 5 ? [`Only ${corrTypes.size} corroboration types — expand to podcasts, directories, partnerships`] : [],
    reinforcements: externalCorroborations
      .sort((a, b) => b.authorityImpact - a.authorityImpact)
      .slice(0, 2)
      .map((c) => `${c.source}: ${c.title}`),
  });

  // Founder authority
  const founderItems = seedMemory.filter(
    (m) => m.theme === "entity-trust" || m.insight.toLowerCase().includes("founder")
  );
  areas.push({
    area: "Founder Authority",
    score: latest.founderVisibilityScore,
    status: latest.founderVisibilityScore >= 7 ? "consistent" : latest.founderVisibilityScore >= 5 ? "partial" : "fragmented",
    gaps: latest.founderVisibilityScore < 7
      ? ["Increase founder insight content", "Strengthen personal Knowledge Panel signals"]
      : [],
    reinforcements: founderItems.slice(0, 2).map((m) => m.insight),
  });

  // Topic reinforcement
  const successfulTopics = seedMemory.filter(
    (m) => m.type === "successful-topic" || m.authorityImpact >= 8
  );
  areas.push({
    area: "Topic Reinforcement Depth",
    score: Math.min(10, successfulTopics.length + 3),
    status: successfulTopics.length >= 5 ? "consistent" : successfulTopics.length >= 3 ? "partial" : "fragmented",
    gaps: successfulTopics.length < 5
      ? ["More high-impact topics needed across core themes"]
      : [],
    reinforcements: successfulTopics.slice(0, 2).map((m) => m.insight),
  });

  return areas;
}

// ─── Semantic Consistency ────────────────────────────────────

function analyzeSemanticConsistency(): SemanticConsistencyReport {
  const issues: SemanticIssue[] = [];
  const strengths: string[] = [];

  // Check theme balance
  const themeCounts: Record<string, number> = {};
  for (const m of seedMemory) {
    themeCounts[m.theme] = (themeCounts[m.theme] || 0) + 1;
  }
  const counts = Object.values(themeCounts);
  const maxCount = Math.max(...counts);
  const minCount = Math.min(...counts);

  if (maxCount > minCount * 3) {
    const overFocused = Object.entries(themeCounts)
      .filter(([, v]) => v === maxCount)
      .map(([k]) => themes.find((t) => t.id === k)?.name ?? k);
    issues.push({
      type: "messaging-dilution",
      area: overFocused.join(", "),
      severity: "medium",
      description: `Over-concentration on ${overFocused.join(", ")} at the expense of other themes`,
      correction: "Redistribute content effort to maintain balanced semantic coverage",
    });
  } else {
    strengths.push("Theme coverage is well-balanced across authority areas");
  }

  // Check for inactive core themes
  const coreThemes = themes.filter((t) => t.authorityLevel === "core");
  const inactiveCore = coreThemes.filter((t) => !themeCounts[t.id]);
  if (inactiveCore.length > 0) {
    issues.push({
      type: "weak-reinforcement",
      area: inactiveCore.map((t) => t.name).join(", "),
      severity: "high",
      description: `Core themes with zero activity: ${inactiveCore.map((t) => t.name).join(", ")}`,
      correction: "Immediately schedule missions for inactive core themes",
    });
  }

  // Entity fragmentation check
  const latest = metricHistory[metricHistory.length - 1];
  if (latest.entityConsistencyScore < 6) {
    issues.push({
      type: "fragmented-entity",
      area: "Entity Structure",
      severity: "high",
      description: `Entity consistency score ${latest.entityConsistencyScore}/10 — signals are not aligned across platforms`,
      correction: "Audit and align entity information across all platforms (LinkedIn, website, Wikidata, directories)",
    });
  } else {
    strengths.push(`Entity consistency at ${latest.entityConsistencyScore}/10 — signals are well-aligned`);
  }

  // Founder visibility
  if (latest.founderVisibilityScore < 6) {
    issues.push({
      type: "inconsistent-positioning",
      area: "Founder Visibility",
      severity: "medium",
      description: `Founder visibility ${latest.founderVisibilityScore}/10 — personal entity authority is underdeveloped`,
      correction: "Increase founder insight content and personal entity reinforcement activities",
    });
  } else {
    strengths.push(`Founder visibility at ${latest.founderVisibilityScore}/10`);
  }

  // Check corroboration diversity
  const corrThemes = new Set(externalCorroborations.map((c) => c.relatedTheme));
  if (corrThemes.size < 4) {
    issues.push({
      type: "weak-reinforcement",
      area: "Corroboration Diversity",
      severity: "medium",
      description: `External corroboration only covers ${corrThemes.size} themes — authority signals are narrow`,
      correction: "Pursue guest articles, podcast appearances, and citations across more authority themes",
    });
  }

  const overallScore = Math.max(1, Math.min(10,
    10 - issues.filter((i) => i.severity === "high").length * 2
       - issues.filter((i) => i.severity === "medium").length
  ));

  return { overallScore, issues, strengths };
}

// ─── Recommendations ─────────────────────────────────────────

function generateRecommendations(
  signals: VisibilitySignal[],
  entity: EntityAnalysis[],
  consistency: SemanticConsistencyReport
): VisibilityRecommendation[] {
  const recs: VisibilityRecommendation[] = [];

  // From weak visibility signals
  for (const s of signals.filter((s) => s.strength === "absent" || s.strength === "weak")) {
    const theme = themes.find((t) => t.name === s.theme);
    recs.push({
      type: "discoverability",
      title: `Improve ${s.theme} AI discoverability`,
      rationale: `Currently ${s.strength} visibility. Publishing authoritative, structured content will establish citation presence.`,
      priority: s.strength === "absent" ? 9 : 7,
      theme: theme?.id ?? "ai-readiness",
    });
  }

  // From entity gaps
  for (const e of entity) {
    if (e.gaps.length > 0 && e.score < 7) {
      recs.push({
        type: "entity",
        title: `Strengthen ${e.area}`,
        rationale: e.gaps[0],
        priority: e.score < 5 ? 8 : 6,
        theme: "entity-trust",
      });
    }
  }

  // From semantic issues
  for (const issue of consistency.issues.filter((i) => i.severity === "high")) {
    recs.push({
      type: "consistency",
      title: `Fix: ${issue.area}`,
      rationale: issue.correction,
      priority: 9,
      theme: "ai-readiness",
    });
  }

  // Semantic reinforcement for strong signals
  for (const s of signals.filter((s) => s.strength === "strong")) {
    recs.push({
      type: "semantic",
      title: `Deepen ${s.theme} authority`,
      rationale: `Already strong — publish advanced content and pursue external corroboration to maintain dominance.`,
      priority: 5,
      theme: themes.find((t) => t.name === s.theme)?.id ?? "ai-readiness",
    });
  }

  // GEO-specific
  const geoRising = geoTerminology.filter((g) => g.frequency === "rising");
  if (geoRising.length > 0) {
    recs.push({
      type: "authority",
      title: "Capitalise on rising GEO terminology",
      rationale: `Terms like "${geoRising.map((g) => g.term).join('", "')}" are gaining adoption. Publishing definitive content using these terms reinforces category ownership.`,
      priority: 8,
      theme: "geo",
    });
  }

  return recs.sort((a, b) => b.priority - a.priority).slice(0, 10);
}
