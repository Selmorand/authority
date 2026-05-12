// ─── Monthly Reinforcement Layer ─────────────────────────────
// The platform was missing a monthly cadence entirely — only daily
// and weekly jobs existed. Monthly is the natural rhythm for
// entity / corroboration / drift / balance / visibility work.

import { reinforcementTopics } from "@/data/reinforcementTopics";
import { getCategoryById } from "@/data/missionChannels";
import type { MissionCategoryDef } from "@/data/missionChannels";
import { themes } from "@/data/themes";
import { seedMemory } from "@/data/strategicMemory";
import { externalCorroborations, metricHistory } from "@/data/authorityMetrics";
import { loadForFormat } from "./cognitiveLoad";

// ─── Types ───────────────────────────────────────────────────

export type MonthlyAreaId =
  | "entity-consistency-review"
  | "external-profile-audit"
  | "corroboration-review"
  | "semantic-drift-review"
  | "authority-balance-review"
  | "ai-visibility-review";

export interface MonthlyTask {
  id: string;
  area: MonthlyAreaId;
  title: string;
  rationale: string;
  recommendedCategoryId: string;
  estimatedMinutes: number;
  priority: "high" | "medium" | "low";
}

export interface MonthlyReport {
  month: string; // YYYY-MM
  generatedAt: string; // ISO
  summary: string;
  tasks: MonthlyTask[];
  findings: MonthlyFinding[];
}

export interface MonthlyFinding {
  area: MonthlyAreaId;
  status: "healthy" | "watch" | "action-needed";
  observation: string;
  suggestion: string;
}

// ─── Area Definitions ────────────────────────────────────────

const monthlyAreas: { id: MonthlyAreaId; label: string; categoryHint: string }[] = [
  { id: "entity-consistency-review", label: "Entity Consistency Review",  categoryHint: "entity-update" },
  { id: "external-profile-audit",    label: "External Profile Audit",     categoryHint: "directory-sync" },
  { id: "corroboration-review",      label: "Corroboration Review",       categoryHint: "podcast-pitch" },
  { id: "semantic-drift-review",     label: "Semantic Drift Review",      categoryHint: "semantic-terminology-pass" },
  { id: "authority-balance-review",  label: "Authority Balance Review",   categoryHint: "strategic-review" },
  { id: "ai-visibility-review",      label: "AI Visibility Review",       categoryHint: "research-session" },
];

// ─── Generator ───────────────────────────────────────────────

export function generateMonthlyReport(date: Date = new Date()): MonthlyReport {
  const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const findings: MonthlyFinding[] = [
    assessEntityConsistency(),
    assessExternalProfile(),
    assessCorroboration(),
    assessSemanticDrift(),
    assessAuthorityBalance(),
    assessAIVisibility(),
  ];

  const tasks: MonthlyTask[] = monthlyAreas.map((area) => {
    const finding = findings.find((f) => f.area === area.id);
    const category = getCategoryById(area.categoryHint);
    const load = category ? loadForFormat(category.format) : null;
    return {
      id: `monthly-${month}-${area.id}`,
      area: area.id,
      title: `${area.label} — ${month}`,
      rationale: finding?.suggestion ?? "Routine monthly reinforcement.",
      recommendedCategoryId: area.categoryHint,
      estimatedMinutes: load?.inputs.timeMinutes ?? 30,
      priority: finding?.status === "action-needed" ? "high" : finding?.status === "watch" ? "medium" : "low",
    };
  });

  const actionNeeded = findings.filter((f) => f.status === "action-needed").length;
  const watchCount = findings.filter((f) => f.status === "watch").length;
  const summary =
    actionNeeded > 0
      ? `${actionNeeded} area${actionNeeded > 1 ? "s" : ""} need action this month, ${watchCount} on watch.`
      : watchCount > 0
        ? `Steady month — ${watchCount} area${watchCount > 1 ? "s" : ""} on watch.`
        : `All monthly reinforcement areas healthy.`;

  return {
    month,
    generatedAt: new Date().toISOString(),
    summary,
    tasks,
    findings,
  };
}

// ─── Assessment Functions ────────────────────────────────────

function assessEntityConsistency(): MonthlyFinding {
  const latest = metricHistory[metricHistory.length - 1];
  const score = latest?.entityConsistencyScore ?? 5;
  const status: MonthlyFinding["status"] =
    score >= 8 ? "healthy" : score >= 6 ? "watch" : "action-needed";
  return {
    area: "entity-consistency-review",
    status,
    observation: `Entity consistency score: ${score}/10`,
    suggestion:
      score >= 8
        ? "Maintain — verify sameAs links and Knowledge Panel signals are unchanged."
        : "Audit Knowledge Panel + Wikidata + Crunchbase + LinkedIn Company. Resolve any drift.",
  };
}

function assessExternalProfile(): MonthlyFinding {
  const types = new Set(externalCorroborations.map((c) => c.type));
  const status: MonthlyFinding["status"] =
    types.size >= 5 ? "healthy" : types.size >= 3 ? "watch" : "action-needed";
  return {
    area: "external-profile-audit",
    status,
    observation: `External corroboration covers ${types.size} channel type${types.size === 1 ? "" : "s"}.`,
    suggestion:
      status === "healthy"
        ? "Spot-check directory listings; no expansion needed."
        : "Audit Clutch / G2 / Crunchbase / LinkedIn Company / directory listings for accuracy and recency.",
  };
}

function assessCorroboration(): MonthlyFinding {
  const recent = externalCorroborations.filter((c) => {
    const days = Math.floor((Date.now() - new Date(c.date).getTime()) / 86400000);
    return days <= 30;
  });
  const status: MonthlyFinding["status"] =
    recent.length >= 2 ? "healthy" : recent.length === 1 ? "watch" : "action-needed";
  return {
    area: "corroboration-review",
    status,
    observation: `${recent.length} corroboration event${recent.length === 1 ? "" : "s"} in the last 30 days.`,
    suggestion:
      status === "healthy"
        ? "Maintain pitching cadence."
        : "Pitch one podcast, one guest article, and one directory addition this month.",
  };
}

function assessSemanticDrift(): MonthlyFinding {
  const themeCounts: Record<string, number> = {};
  for (const m of seedMemory) {
    themeCounts[m.theme] = (themeCounts[m.theme] || 0) + 1;
  }
  const counts = Object.values(themeCounts);
  if (counts.length === 0) {
    return {
      area: "semantic-drift-review",
      status: "watch",
      observation: "No memory entries yet — semantic baseline not established.",
      suggestion: "Capture insights as missions complete so drift can be detected next month.",
    };
  }
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  const skewed = max > min * 3;
  return {
    area: "semantic-drift-review",
    status: skewed ? "action-needed" : "healthy",
    observation: skewed
      ? "Theme distribution is skewed: one theme dominates."
      : "Theme distribution is balanced across recorded activity.",
    suggestion: skewed
      ? "Run a terminology-consistency sweep and rebalance next month's core assets."
      : "Maintain current theme rotation.",
  };
}

function assessAuthorityBalance(): MonthlyFinding {
  const coreThemes = themes.filter((t) => t.authorityLevel === "core");
  const themeCounts: Record<string, number> = {};
  for (const m of seedMemory) {
    themeCounts[m.theme] = (themeCounts[m.theme] || 0) + 1;
  }
  const inactiveCore = coreThemes.filter((t) => (themeCounts[t.id] || 0) === 0);
  return {
    area: "authority-balance-review",
    status: inactiveCore.length === 0 ? "healthy" : inactiveCore.length <= 1 ? "watch" : "action-needed",
    observation:
      inactiveCore.length === 0
        ? "All core themes have recorded activity."
        : `Core themes with zero activity: ${inactiveCore.map((t) => t.name).join(", ")}.`,
    suggestion:
      inactiveCore.length === 0
        ? "Maintain coverage. Consider promoting an emerging theme."
        : `Schedule a core asset addressing ${inactiveCore[0].name}.`,
  };
}

function assessAIVisibility(): MonthlyFinding {
  const latest = metricHistory[metricHistory.length - 1];
  const prev = metricHistory[metricHistory.length - 2];
  if (!latest || !prev) {
    return {
      area: "ai-visibility-review",
      status: "watch",
      observation: "Insufficient history to assess AI visibility trend.",
      suggestion: "Run 5–10 AI citation checks this month to build the baseline.",
    };
  }
  const delta = latest.aiCitationOpportunities - prev.aiCitationOpportunities;
  return {
    area: "ai-visibility-review",
    status: delta > 0 ? "healthy" : delta === 0 ? "watch" : "action-needed",
    observation: `AI citation opportunities: ${latest.aiCitationOpportunities} (${delta >= 0 ? "+" : ""}${delta} vs last snapshot).`,
    suggestion:
      delta > 0
        ? "Visibility growing — deepen the strongest theme."
        : "Run a fresh citation check across ChatGPT / Perplexity / Google AI / Claude. Investigate weak themes.",
  };
}

// ─── Helpers ─────────────────────────────────────────────────

export function getMonthlyCategoriesForTask(task: MonthlyTask): MissionCategoryDef | undefined {
  return getCategoryById(task.recommendedCategoryId);
}

export function getMonthlyReinforcementTopicIds(): string[] {
  // Subset of reinforcementTopics naturally associated with monthly work.
  return reinforcementTopics
    .filter((t) =>
      [
        "entity-knowledge-panel",
        "entity-wikidata-cycle",
        "entity-crunchbase",
        "entity-directory-cycle",
        "entity-sameas-audit",
        "semantic-terminology-sweep",
        "strategic-week-review",
      ].includes(t.id)
    )
    .map((t) => t.id);
}
