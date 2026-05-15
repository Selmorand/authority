// ─── Cognitive Load Scoring ──────────────────────────────────
// Classifies authority-building tasks by execution burden so the
// planner can keep weekly load sustainable. The platform's new
// operational philosophy: ONE heavy core authority asset per week,
// surrounded by light/medium reinforcement.

export type LoadTier = "heavy" | "medium" | "light";

export type TaskKind =
  | "core-authority"   // the one heavy weekly asset
  | "reinforcement"    // light/medium amplification + participation
  | "research"         // intake / signal review
  | "maintenance"      // entity / schema / internal-site upkeep
  | "strategic-review"; // weekly/monthly review work

export interface LoadInputs {
  writingEffort: number;     // 1-10
  preparationEffort: number; // 1-10 (research before writing)
  researchEffort: number;    // 1-10 (in-the-task research)
  productionEffort: number;  // 1-10 (recording, editing, screenshots, schema work)
  timeMinutes: number;       // realistic estimate
}

export interface LoadScore {
  tier: LoadTier;
  total: number;       // 1-50 composite
  burden: number;      // 1-10 normalised
  inputs: LoadInputs;
  rationale: string;
}

// ─── Tier Thresholds ─────────────────────────────────────────
// Normalised 1–10 burden:
//   1–3  → light
//   4–6  → medium
//   7–10 → heavy

const HEAVY_FLOOR = 7;
const MEDIUM_FLOOR = 4;

export function scoreLoad(inputs: LoadInputs): LoadScore {
  const time = inputs.timeMinutes;
  const timeFactor =
    time >= 120 ? 10 : time >= 75 ? 8 : time >= 45 ? 6 : time >= 25 ? 4 : 2;

  const total =
    inputs.writingEffort +
    inputs.preparationEffort +
    inputs.researchEffort +
    inputs.productionEffort +
    timeFactor;

  // Normalise to 1–10
  const burden = Math.max(1, Math.min(10, Math.round(total / 5)));

  const tier: LoadTier =
    burden >= HEAVY_FLOOR ? "heavy" : burden >= MEDIUM_FLOOR ? "medium" : "light";

  const heaviest = pickHeaviestDimension(inputs, timeFactor);
  const rationale =
    tier === "heavy"
      ? `Heavy task — dominant burden is ${heaviest}. Treat as the weekly core authority asset, not a daily reinforcement.`
      : tier === "medium"
        ? `Medium task — manageable burden led by ${heaviest}. Schedule one per day at most.`
        : `Light task — quick reinforcement. Several per day are sustainable.`;

  return { tier, total, burden, inputs, rationale };
}

function pickHeaviestDimension(inputs: LoadInputs, timeFactor: number): string {
  const entries: { label: string; value: number }[] = [
    { label: "writing", value: inputs.writingEffort },
    { label: "preparation", value: inputs.preparationEffort },
    { label: "research", value: inputs.researchEffort },
    { label: "production", value: inputs.productionEffort },
    { label: "time investment", value: timeFactor },
  ];
  return entries.sort((a, b) => b.value - a.value)[0].label;
}

// ─── Format → Load Heuristic ─────────────────────────────────
// Lets the planner score topics by format without per-topic data.

export type TaskFormat =
  | "article"            // long-form blog
  | "case-study"         // narrative + data
  | "guide"              // structured framework
  | "video-long"         // YouTube 5–15 min
  | "audit"              // technical breakdown
  | "research-report"    // original data
  // ── reinforcement ──
  | "linkedin-post"
  | "linkedin-commentary"
  | "linkedin-carousel"
  | "reddit-answer"
  | "community-contribution"
  | "forum-response"
  | "video-clip"         // short-form / shorts
  | "video-commentary"   // talking-head 1–3 min
  | "video-caption-clip" // auto-rendered caption-overlay clip via JSON2Video
  | "founder-snippet"
  | "internal-link-pass"
  | "schema-refinement"
  | "entity-update"
  | "directory-sync"
  | "author-bio-sync"
  | "semantic-pass"
  | "research-session"
  | "strategic-review";

export function loadForFormat(format: TaskFormat): LoadScore {
  switch (format) {
    case "article":
      return scoreLoad({ writingEffort: 9, preparationEffort: 7, researchEffort: 7, productionEffort: 3, timeMinutes: 120 });
    case "case-study":
      return scoreLoad({ writingEffort: 9, preparationEffort: 8, researchEffort: 6, productionEffort: 5, timeMinutes: 120 });
    case "guide":
      return scoreLoad({ writingEffort: 8, preparationEffort: 8, researchEffort: 6, productionEffort: 4, timeMinutes: 120 });
    case "video-long":
      return scoreLoad({ writingEffort: 7, preparationEffort: 7, researchEffort: 5, productionEffort: 9, timeMinutes: 120 });
    case "audit":
      return scoreLoad({ writingEffort: 7, preparationEffort: 7, researchEffort: 8, productionEffort: 5, timeMinutes: 90 });
    case "research-report":
      return scoreLoad({ writingEffort: 7, preparationEffort: 6, researchEffort: 10, productionEffort: 4, timeMinutes: 120 });

    // ── reinforcement (medium) ──
    case "linkedin-carousel":
      return scoreLoad({ writingEffort: 5, preparationEffort: 4, researchEffort: 3, productionEffort: 5, timeMinutes: 45 });
    case "video-commentary":
      return scoreLoad({ writingEffort: 4, preparationEffort: 3, researchEffort: 2, productionEffort: 6, timeMinutes: 45 });
    case "video-clip":
      return scoreLoad({ writingEffort: 2, preparationEffort: 2, researchEffort: 1, productionEffort: 5, timeMinutes: 30 });
    case "video-caption-clip":
      // User effort is just "review and publish" — JSON2Video does the production.
      return scoreLoad({ writingEffort: 1, preparationEffort: 1, researchEffort: 1, productionEffort: 1, timeMinutes: 10 });

    // ── reinforcement (light) ──
    case "linkedin-post":
      return scoreLoad({ writingEffort: 4, preparationEffort: 2, researchEffort: 2, productionEffort: 1, timeMinutes: 25 });
    case "linkedin-commentary":
      return scoreLoad({ writingEffort: 2, preparationEffort: 1, researchEffort: 1, productionEffort: 1, timeMinutes: 15 });
    case "reddit-answer":
      return scoreLoad({ writingEffort: 3, preparationEffort: 2, researchEffort: 2, productionEffort: 1, timeMinutes: 20 });
    case "community-contribution":
      return scoreLoad({ writingEffort: 3, preparationEffort: 2, researchEffort: 2, productionEffort: 1, timeMinutes: 20 });
    case "forum-response":
      return scoreLoad({ writingEffort: 3, preparationEffort: 2, researchEffort: 2, productionEffort: 1, timeMinutes: 20 });
    case "founder-snippet":
      return scoreLoad({ writingEffort: 3, preparationEffort: 1, researchEffort: 1, productionEffort: 1, timeMinutes: 15 });

    // ── maintenance (light) ──
    case "internal-link-pass":
      return scoreLoad({ writingEffort: 1, preparationEffort: 2, researchEffort: 1, productionEffort: 3, timeMinutes: 25 });
    case "schema-refinement":
      return scoreLoad({ writingEffort: 1, preparationEffort: 2, researchEffort: 2, productionEffort: 4, timeMinutes: 30 });
    case "entity-update":
      return scoreLoad({ writingEffort: 2, preparationEffort: 2, researchEffort: 1, productionEffort: 2, timeMinutes: 20 });
    case "directory-sync":
      return scoreLoad({ writingEffort: 1, preparationEffort: 2, researchEffort: 1, productionEffort: 2, timeMinutes: 20 });
    case "author-bio-sync":
      return scoreLoad({ writingEffort: 2, preparationEffort: 1, researchEffort: 1, productionEffort: 2, timeMinutes: 15 });
    case "semantic-pass":
      return scoreLoad({ writingEffort: 1, preparationEffort: 2, researchEffort: 2, productionEffort: 1, timeMinutes: 20 });

    // ── research / strategic ──
    case "research-session":
      return scoreLoad({ writingEffort: 1, preparationEffort: 1, researchEffort: 6, productionEffort: 1, timeMinutes: 30 });
    case "strategic-review":
      return scoreLoad({ writingEffort: 2, preparationEffort: 3, researchEffort: 2, productionEffort: 1, timeMinutes: 30 });
  }
}

// ─── Task Kind Mapping ───────────────────────────────────────

export function kindForFormat(format: TaskFormat): TaskKind {
  switch (format) {
    case "article":
    case "case-study":
    case "guide":
    case "video-long":
    case "audit":
    case "research-report":
      return "core-authority";
    case "linkedin-post":
    case "linkedin-commentary":
    case "linkedin-carousel":
    case "reddit-answer":
    case "community-contribution":
    case "forum-response":
    case "video-clip":
    case "video-commentary":
    case "video-caption-clip":
    case "founder-snippet":
      return "reinforcement";
    case "internal-link-pass":
    case "schema-refinement":
    case "entity-update":
    case "directory-sync":
    case "author-bio-sync":
    case "semantic-pass":
      return "maintenance";
    case "research-session":
      return "research";
    case "strategic-review":
      return "strategic-review";
  }
}

// ─── Weekly Load Budget ──────────────────────────────────────
// The platform's contract with the user.

export interface WeeklyLoadBudget {
  heavyMax: number;        // 1 — the core authority asset
  mediumMax: number;       // 2 — supporting heavier reinforcement
  lightMax: number;        // 8 — light reinforcement across the week
  researchMax: number;     // 1 — single dedicated research session
  reviewMax: number;       // 1 — Friday strategic review
}

export const DEFAULT_WEEKLY_BUDGET: WeeklyLoadBudget = {
  heavyMax: 1,
  mediumMax: 2,
  lightMax: 8,
  researchMax: 1,
  reviewMax: 1,
};

export function exceedsBudget(
  counts: { heavy: number; medium: number; light: number; research: number; review: number },
  budget: WeeklyLoadBudget = DEFAULT_WEEKLY_BUDGET
): { exceeded: boolean; over: string[] } {
  const over: string[] = [];
  if (counts.heavy > budget.heavyMax) over.push(`heavy (${counts.heavy}/${budget.heavyMax})`);
  if (counts.medium > budget.mediumMax) over.push(`medium (${counts.medium}/${budget.mediumMax})`);
  if (counts.light > budget.lightMax) over.push(`light (${counts.light}/${budget.lightMax})`);
  if (counts.research > budget.researchMax) over.push(`research (${counts.research}/${budget.researchMax})`);
  if (counts.review > budget.reviewMax) over.push(`review (${counts.review}/${budget.reviewMax})`);
  return { exceeded: over.length > 0, over };
}
