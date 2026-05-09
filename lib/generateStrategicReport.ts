import { generateExecutiveBriefing } from "./generateExecutiveBriefing";
import { generateHealthReport } from "./authorityHealth";
import { generateVisibilityReport } from "./aiVisibilityMonitor";
import { generateCopilotReport } from "./authorityCopilot";
import { calculateDensityMetrics } from "./authorityAmplifier";
import { generateTrendReport } from "./semanticTrendClustering";
import { getLatestSnapshot } from "@/data/authorityMetrics";

// ─── Types ───────────────────────────────────────────────────

export type ReportType =
  | "executive-briefing"
  | "authority-momentum"
  | "ai-visibility"
  | "semantic-positioning"
  | "strategic-risk"
  | "client-audit";

export interface ReportSection {
  title: string;
  content: string;
  type: "text" | "metrics" | "list" | "warning" | "opportunity";
}

export interface StrategicReport {
  id: string;
  type: ReportType;
  title: string;
  subtitle: string;
  generatedAt: string;
  sections: ReportSection[];
}

export interface ReportHistoryItem {
  id: string;
  type: ReportType;
  title: string;
  generatedAt: string;
}

// ─── Report Storage ──────────────────────────────────────────

const reportHistory: ReportHistoryItem[] = [];

export function getReportHistory(): ReportHistoryItem[] {
  return reportHistory;
}

// ─── Report Generators ───────────────────────────────────────

export function generateReport(type: ReportType): StrategicReport {
  const id = `rpt-${Date.now()}`;
  const generatedAt = new Date().toISOString();
  let report: StrategicReport;

  switch (type) {
    case "executive-briefing":
      report = buildExecutiveBriefingReport(id, generatedAt);
      break;
    case "authority-momentum":
      report = buildMomentumReport(id, generatedAt);
      break;
    case "ai-visibility":
      report = buildAIVisibilityReport(id, generatedAt);
      break;
    case "semantic-positioning":
      report = buildSemanticReport(id, generatedAt);
      break;
    case "strategic-risk":
      report = buildRiskReport(id, generatedAt);
      break;
    case "client-audit":
      report = buildClientAuditReport(id, generatedAt);
      break;
    default:
      report = buildExecutiveBriefingReport(id, generatedAt);
  }

  reportHistory.unshift({
    id: report.id,
    type: report.type,
    title: report.title,
    generatedAt: report.generatedAt,
  });

  return report;
}

// ─── Executive Briefing ──────────────────────────────────────

function buildExecutiveBriefingReport(id: string, generatedAt: string): StrategicReport {
  const briefing = generateExecutiveBriefing();
  const dateLabel = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return {
    id, type: "executive-briefing",
    title: "Executive Authority Briefing",
    subtitle: `Interon Authority OS — ${dateLabel}`,
    generatedAt,
    sections: [
      { title: "Strategic Overview", type: "text", content: briefing.whatMattersmost },
      { title: "Authority Health", type: "metrics", content: `Overall Score: ${briefing.authorityHealthScore}/10 | AI Visibility: ${briefing.aiVisibilityRate}% | Execution: ${briefing.executionConsistencyScore}/10 | Semantic Coverage: ${briefing.semanticCoverage}/8 themes | Momentum: ${briefing.momentumDirection}` },
      { title: "Highest-Leverage Opportunity", type: "opportunity", content: briefing.highestLeverageOpportunity },
      { title: "Biggest Strategic Risk", type: "warning", content: briefing.biggestStrategicRisk },
      { title: "Themes Strengthening", type: "list", content: briefing.themesStrengthening.length > 0 ? briefing.themesStrengthening.join("\n") : "All themes stable" },
      { title: "Areas Losing Momentum", type: "list", content: briefing.areasLosingMomentum.length > 0 ? briefing.areasLosingMomentum.join("\n") : "No themes losing momentum" },
      { title: "Recommended Focus", type: "text", content: briefing.recommendedFocus },
      { title: "Strategic Risks", type: "list", content: briefing.strategicRisks.slice(0, 5).map((r) => `[${r.severity}] ${r.risk} — ${r.mitigation}`).join("\n") },
      { title: "Opportunities", type: "list", content: briefing.opportunities.slice(0, 5).map((o) => `[${o.leverage}] ${o.opportunity} — ${o.suggestedAction}`).join("\n") },
      { title: "Recommended Actions", type: "list", content: briefing.weeklyRecommendations.map((r) => `[${r.type}] ${r.recommendation}`).join("\n") },
    ],
  };
}

// ─── Authority Momentum ──────────────────────────────────────

function buildMomentumReport(id: string, generatedAt: string): StrategicReport {
  const health = generateHealthReport();
  const copilot = generateCopilotReport();
  const snapshot = getLatestSnapshot();

  return {
    id, type: "authority-momentum",
    title: "Authority Momentum Report",
    subtitle: "Weekly authority growth and trajectory analysis",
    generatedAt,
    sections: [
      { title: "Momentum Direction", type: "text", content: `Current momentum: ${copilot.momentumAnalysis.direction}. ${copilot.strategicOutlook}` },
      { title: "Key Metrics", type: "metrics", content: `Branded Search: ${snapshot.brandedSearchVolume} | LinkedIn: ${snapshot.linkedinFollowers} followers | Articles: ${snapshot.publishedArticles} | Mentions: ${snapshot.externalMentions} | Backlinks: ${snapshot.backlinks} | AI Citations: ${snapshot.aiCitationOpportunities}` },
      { title: "Execution Trend", type: "text", content: copilot.momentumAnalysis.executionTrend },
      { title: "Semantic Trend", type: "text", content: copilot.momentumAnalysis.semanticTrend },
      { title: "Growing Clusters", type: "list", content: copilot.momentumAnalysis.growingClusters.length > 0 ? copilot.momentumAnalysis.growingClusters.join("\n") : "No clusters currently accelerating" },
      { title: "Weakening Areas", type: "list", content: copilot.momentumAnalysis.weakeningAreas.length > 0 ? copilot.momentumAnalysis.weakeningAreas.join("\n") : "No areas weakening" },
      { title: "Health Indicators", type: "list", content: health.healthIndicators.map((h) => `${h.area}: ${h.score}/10 (${h.status}, ${h.trend})`).join("\n") },
    ],
  };
}

// ─── AI Visibility ───────────────────────────────────────────

function buildAIVisibilityReport(id: string, generatedAt: string): StrategicReport {
  const vis = generateVisibilityReport();
  const health = generateHealthReport();

  return {
    id, type: "ai-visibility",
    title: "AI Visibility Intelligence Report",
    subtitle: "Discoverability, entity confidence, and citation analysis",
    generatedAt,
    sections: [
      { title: "Visibility Summary", type: "metrics", content: `Discoverability: ${vis.discoverabilityScore}/10 | Entity Confidence: ${vis.entityConfidenceScore}/10 | Semantic Health: ${vis.semanticConsistency.overallScore}/10 | AI Citation Rate: ${health.aiVisibilityRate}%` },
      { title: "Visibility Signals", type: "list", content: vis.visibilitySignals.map((s) => `${s.theme}: ${s.strength} (${s.trend}) — ${s.evidence}`).join("\n") },
      { title: "Entity Analysis", type: "list", content: vis.entityAnalysis.map((e) => `${e.area}: ${e.score}/10 (${e.status})${e.gaps.length > 0 ? ` — Gap: ${e.gaps[0]}` : ""}`).join("\n") },
      { title: "Semantic Strengths", type: "list", content: vis.semanticConsistency.strengths.join("\n") },
      { title: "Semantic Issues", type: "list", content: vis.semanticConsistency.issues.map((i) => `[${i.severity}] ${i.area}: ${i.description}`).join("\n") || "No issues detected" },
      { title: "Recommendations", type: "list", content: vis.recommendations.slice(0, 6).map((r) => `[${r.type}] ${r.title} — ${r.rationale}`).join("\n") },
    ],
  };
}

// ─── Semantic Positioning ────────────────────────────────────

function buildSemanticReport(id: string, generatedAt: string): StrategicReport {
  const trends = generateTrendReport();
  const density = calculateDensityMetrics();

  return {
    id, type: "semantic-positioning",
    title: "Semantic Positioning Report",
    subtitle: "Trend clustering, narrative momentum, and authority density",
    generatedAt,
    sections: [
      { title: "Key Insights", type: "list", content: trends.insights.join("\n") },
      { title: "Authority Density", type: "metrics", content: `Semantic Reinforcement: ${density.semanticReinforcement}/10 | Amplification Depth: ${density.amplificationDepth}/10 | Messaging Cohesion: ${density.messagingCohesion}/10` },
      { title: "Semantic Clusters", type: "list", content: trends.clusters.map((c) => `${c.label}: ${c.momentum} (frequency ${c.frequency}) — ${c.terms.slice(0, 4).join(", ")}`).join("\n") },
      { title: "Narrative Momentum", type: "list", content: trends.narratives.map((n) => `[${n.opportunityType}] ${n.narrative} — strength ${n.strength}/10`).join("\n") },
      { title: "Whitespace Opportunities", type: "list", content: trends.whitespace.map((w) => `[${w.competitiveGap} gap] ${w.area}: ${w.suggestedAction}`).join("\n") },
      { title: "Saturation Indicators", type: "list", content: trends.saturation.map((s) => `${s.term}: ${s.saturationLevel} — ${s.differentiation}`).join("\n") },
    ],
  };
}

// ─── Strategic Risk ──────────────────────────────────────────

function buildRiskReport(id: string, generatedAt: string): StrategicReport {
  const briefing = generateExecutiveBriefing();
  const copilot = generateCopilotReport();

  const warnings = copilot.guidanceItems.filter((g) => g.type === "warning");

  return {
    id, type: "strategic-risk",
    title: "Strategic Risk Summary",
    subtitle: "Authority risks, drift detection, and mitigation priorities",
    generatedAt,
    sections: [
      { title: "Risk Overview", type: "text", content: `${briefing.strategicRisks.length} strategic risks identified. ${warnings.length} co-pilot warnings active.` },
      { title: "Strategic Risks", type: "list", content: briefing.strategicRisks.map((r) => `[${r.severity}] ${r.risk}\n  Category: ${r.category}\n  Mitigation: ${r.mitigation}`).join("\n\n") },
      { title: "Co-Pilot Warnings", type: "list", content: warnings.map((w) => `[${w.priority}] ${w.title}\n  ${w.rationale}\n  Action: ${w.suggestedAction}`).join("\n\n") },
      { title: "Focus Adjustments Needed", type: "list", content: copilot.focusAdjustments.filter((f) => f.suggestedShift !== "maintain").map((f) => `${f.theme}: ${f.suggestedShift} — ${f.reason}`).join("\n") || "No adjustments needed" },
    ],
  };
}

// ─── Client Audit ────────────────────────────────────────────

function buildClientAuditReport(id: string, generatedAt: string): StrategicReport {
  const vis = generateVisibilityReport();
  const health = generateHealthReport();
  const trends = generateTrendReport();

  return {
    id, type: "client-audit",
    title: "AI Visibility & Authority Audit",
    subtitle: "Strategic assessment of AI discoverability and semantic authority",
    generatedAt,
    sections: [
      { title: "Executive Summary", type: "text", content: `This audit assesses AI visibility, semantic authority, and entity confidence across ${health.healthIndicators.length} dimensions. Overall authority health: ${health.overallScore}/10. AI citation rate: ${health.aiVisibilityRate}%.` },
      { title: "AI Visibility Assessment", type: "list", content: vis.visibilitySignals.map((s) => `${s.theme}: ${s.strength} visibility (${s.trend})\n  ${s.evidence}`).join("\n\n") },
      { title: "Entity Confidence", type: "list", content: vis.entityAnalysis.map((e) => `${e.area}: ${e.score}/10 — ${e.status}\n  ${e.gaps.length > 0 ? `Gaps: ${e.gaps.join("; ")}` : "No gaps detected"}\n  ${e.reinforcements.length > 0 ? `Strengths: ${e.reinforcements.join("; ")}` : ""}`).join("\n\n") },
      { title: "Semantic Consistency", type: "text", content: `Semantic health score: ${vis.semanticConsistency.overallScore}/10.\n\nStrengths: ${vis.semanticConsistency.strengths.join(". ")}.\n\n${vis.semanticConsistency.issues.length > 0 ? `Issues: ${vis.semanticConsistency.issues.map((i) => `${i.area} (${i.severity}): ${i.description}`).join(". ")}` : "No semantic issues detected."}` },
      { title: "Discoverability Opportunities", type: "list", content: vis.recommendations.slice(0, 6).map((r) => `[${r.priority}/10] ${r.title}\n  ${r.rationale}`).join("\n\n") },
      { title: "Competitive Whitespace", type: "list", content: trends.whitespace.slice(0, 4).map((w) => `${w.area} (${w.competitiveGap} gap)\n  ${w.description}\n  Recommended: ${w.suggestedAction}`).join("\n\n") },
      { title: "Recommended Actions", type: "list", content: vis.recommendations.slice(0, 5).map((r, i) => `${i + 1}. ${r.title}: ${r.rationale}`).join("\n") },
    ],
  };
}
