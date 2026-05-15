import { themes } from "@/data/themes";
import { topicIdeas } from "@/data/topicIdeas";
import { contentAngles } from "@/data/contentAngles";
import type { Theme } from "@/data/themes";
import type { TopicIdea } from "@/data/topicIdeas";
import { reinforcementTopics } from "@/data/reinforcementTopics";
import type { ReinforcementTopic } from "@/data/reinforcementTopics";
import { getCategoryById } from "@/data/missionChannels";
import type { MissionCategoryDef, Channel } from "@/data/missionChannels";
import {
  loadForFormat,
  kindForFormat,
  DEFAULT_WEEKLY_BUDGET,
} from "./cognitiveLoad";
import type { LoadTier, TaskKind } from "./cognitiveLoad";

// ─── Types ───────────────────────────────────────────────────

export interface PriorityScore {
  strategicPriority: number; // 1-10
  authorityImpact: number;   // 1-10
  semanticValue: number;     // 1-10
  executionDifficulty: number; // 1-10 (10 = hardest)
  reinforcementValue: number;  // 1-10 (NEW — how much this compounds prior work)
  overall: number;             // weighted composite
}

export interface PlannedMission {
  id: string;
  title: string;
  category: string;
  /** NEW — the open-registry category definition */
  categoryDef: MissionCategoryDef;
  /** NEW — cognitive load tier */
  loadTier: LoadTier;
  /** NEW — task kind for visual + budget logic */
  taskKind: TaskKind;
  /** NEW — true when this is the week's Core Authority Asset */
  isCoreAsset: boolean;
  /** NEW — execution prompt for reinforcement tasks */
  executionPrompt?: string;
  theme: Theme;
  topic: TopicIdea | null;
  reinforcementTopic: ReinforcementTopic | null;
  contentAngle: string;
  platform: string;
  channel: Channel;
  estimatedTime: string;
  objective: string;
  semanticGoal: string;
  priority: PriorityScore;
  executionOrder: number;
}

export interface DailyPlan {
  date: string;
  dayName: string;
  dayStrategy: string;
  missions: PlannedMission[];
  coreAsset: PlannedMission | null;
  focusThemes: Theme[];
  reinforcedSignals: string[];
  cognitiveLoad: {
    heavy: number;
    medium: number;
    light: number;
    totalMinutes: number;
  };
}

// ─── Day Strategies (1+many model) ───────────────────────────
// Monday is the ONLY day that can carry the heavy Core Authority
// Asset. Tue–Fri are strictly reinforcement + maintenance days.

interface DayStrategy {
  name: string;
  description: string;
  emitsCoreAsset: boolean;           // Monday only by default
  preferredChannels: Channel[];
  preferredCategoryIds: string[];    // category ids from missionChannels.ts
  includeResearch: boolean;
  includeReview: boolean;
  themeWeights: Record<string, number>;
  // Target mission count for the day (in addition to any core asset)
  reinforcementCount: number;
}

const dayStrategies: Record<number, DayStrategy> = {
  1: {
    // Monday — Core Authority Asset day + AI caption clip (teaser)
    name: "Core Authority Asset",
    description:
      "Produce the one heavy authority asset that the rest of the week reinforces. Choose the highest-leverage written format — long-form article, case study, audit, or research report. The day also auto-renders a short AI caption clip (teasing the week's theme) for Metricool to distribute across social channels.",
    emitsCoreAsset: true,
    preferredChannels: ["blog"],
    preferredCategoryIds: [
      "authority-article",
      "geo-educational-article",
      "case-study",
      "authority-audit",
      "research-report",
      "video-caption-derivative",
    ],
    includeResearch: false,
    includeReview: false,
    themeWeights: {
      // New broader themes — Monday core is most often a founder POV
      // piece, original-research write-up, or enterprise-architecture
      // explainer. AI readiness stays present but no longer dominates.
      "founder-pov": 1.5,
      "original-research": 1.4,
      "enterprise-architecture": 1.3,
      "umbraco-craft": 1.2,
      "ai-workflow": 1.2,
      // Old AI-readiness cluster — dimmed but available
      "ai-readiness": 0.8,
      geo: 0.5,
      "ai-search-visibility": 0.5,
      "entity-trust": 0.4,
      "umbraco-ai": 0.4,
      "structured-data": 0.4,
      "machine-readable": 0.4,
      "technical-seo": 0.4,
    },
    reinforcementCount: 1,
  },
  2: {
    // Tuesday — LinkedIn reinforcement of Monday's core
    name: "LinkedIn Reinforcement",
    description:
      "Reinforce yesterday's core asset on LinkedIn — insight post, carousel, and one piece of substantive commentary on a peer's post.",
    emitsCoreAsset: false,
    preferredChannels: ["linkedin"],
    preferredCategoryIds: [
      "linkedin-insight",
      "linkedin-carousel",
      "linkedin-commentary",
      "founder-snippet",
      "video-caption-derivative",
    ],
    includeResearch: false,
    includeReview: false,
    themeWeights: {
      // Tuesday LinkedIn — founder voice + AI-workflow stories travel
      // best on LinkedIn.
      "founder-pov": 1.5,
      "ai-workflow": 1.4,
      "original-research": 1.2,
      "enterprise-architecture": 1.1,
      "umbraco-craft": 1.0,
      "ai-readiness": 0.7,
      geo: 0.5,
      "ai-search-visibility": 0.6,
      "entity-trust": 0.4,
      "umbraco-ai": 0.4,
      "structured-data": 0.4,
      "machine-readable": 0.4,
      "technical-seo": 0.4,
    },
    reinforcementCount: 3,
  },
  3: {
    // Wednesday — Reddit / community contribution day
    name: "Community Contribution",
    description:
      "Authority through participation. Answer real questions in Reddit, Umbraco, Stack Overflow, or technical Slack — educational, non-promotional.",
    emitsCoreAsset: false,
    preferredChannels: ["reddit", "community"],
    preferredCategoryIds: [
      "reddit-answer",
      "community-contribution",
      "forum-response",
      "video-caption-derivative",
    ],
    includeResearch: false,
    includeReview: false,
    themeWeights: {
      // Wednesday community — Umbraco craft + founder POV both
      // travel well in Reddit, Stack Overflow, and forum surfaces.
      "umbraco-craft": 1.5,
      "founder-pov": 1.3,
      "ai-workflow": 1.2,
      "enterprise-architecture": 1.2,
      "original-research": 1.1,
      "ai-readiness": 0.7,
      geo: 0.5,
      "ai-search-visibility": 0.5,
      "entity-trust": 0.5,
      "umbraco-ai": 0.6,
      "structured-data": 0.5,
      "machine-readable": 0.4,
      "technical-seo": 0.4,
    },
    reinforcementCount: 2,
  },
  4: {
    // Thursday — the week's single video. One short, recorded from scratch.
    name: "Video Reinforcement",
    description:
      "The week's single video. One short — clip or 2-minute founder commentary. No full-scale production. This is the only video day; long-form video is intentionally not part of the schedule.",
    emitsCoreAsset: false,
    preferredChannels: ["youtube"],
    preferredCategoryIds: [
      "youtube-clip",
      "youtube-commentary",
    ],
    includeResearch: false,
    includeReview: false,
    themeWeights: {
      // Thursday video — founder POV + AI-workflow + original-research
      // make for the most magnetic single short. Avoid the dry
      // technical-SEO themes for video specifically.
      "founder-pov": 1.5,
      "ai-workflow": 1.4,
      "original-research": 1.3,
      "umbraco-craft": 1.1,
      "enterprise-architecture": 1.0,
      "ai-readiness": 0.7,
      geo: 0.5,
      "ai-search-visibility": 0.6,
      "entity-trust": 0.4,
      "umbraco-ai": 0.4,
      "structured-data": 0.3,
      "machine-readable": 0.3,
      "technical-seo": 0.3,
    },
    reinforcementCount: 1,
  },
  5: {
    // Friday — Entity / internal-site / strategic review
    name: "Entity Reinforcement & Strategic Review",
    description:
      "Close the week with entity and internal-site reinforcement, plus the weekly strategic review. No new content production.",
    emitsCoreAsset: false,
    preferredChannels: ["entity-platforms", "internal-site", "internal"],
    preferredCategoryIds: [
      "entity-update",
      "wikidata-refinement",
      "directory-sync",
      "sameas-link-audit",
      "internal-link-pass",
      "authority-page-update",
      "schema-refinement",
      "author-bio-sync",
      "semantic-terminology-pass",
      "strategic-review",
      "video-caption-derivative",
    ],
    includeResearch: true,
    includeReview: true,
    themeWeights: {
      // Friday entity / review — original-research findings + entity
      // work + enterprise architecture all close the week well.
      "original-research": 1.5,
      "enterprise-architecture": 1.3,
      "founder-pov": 1.2,
      "umbraco-craft": 1.1,
      "ai-workflow": 1.0,
      "entity-trust": 1.0,
      "ai-readiness": 0.7,
      geo: 0.5,
      "ai-search-visibility": 0.6,
      "structured-data": 0.5,
      "machine-readable": 0.4,
      "technical-seo": 0.4,
      "umbraco-ai": 0.5,
    },
    reinforcementCount: 2,
  },
};

const weekendStrategy: DayStrategy = {
  name: "Auto Distribution",
  description:
    "No new original work. The system auto-renders a short AI caption clip from this week's core asset — ready for Metricool to schedule across all social channels. Optional: skim the research feed for next week.",
  emitsCoreAsset: false,
  preferredChannels: ["linkedin", "internal"],
  preferredCategoryIds: [
    "video-caption-derivative",
    "research-session",
  ],
  includeResearch: true,
  includeReview: false,
  themeWeights: Object.fromEntries(themes.map((t) => [t.id, 1.0])),
  reinforcementCount: 1,
};

// ─── Deterministic Seed ──────────────────────────────────────

function dateToSeed(dateStr: string): number {
  const d = new Date(dateStr);
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Priority Scoring ────────────────────────────────────────
// Reinforcement tasks now score competitively with heavy content.
// The platform's thesis: consistency + repetition + corroboration
// often beats another original article.

function scoreCoreTopic(
  topic: TopicIdea,
  strategy: DayStrategy,
  themeRotationBonus: number
): PriorityScore {
  const impactMap = { high: 9, medium: 6, low: 3 } as const;
  const difficultyMap = { advanced: 8, intermediate: 5, beginner: 3 } as const;

  const themeWeight = strategy.themeWeights[topic.theme] ?? 1.0;

  const strategicPriority = Math.min(10, Math.round(themeWeight * 5));
  const authorityImpact = impactMap[topic.authorityImpact];
  const semanticValue = Math.min(
    10,
    Math.round((themeWeight * 4 + themeRotationBonus) * 1.2)
  );
  const executionDifficulty = difficultyMap[topic.difficulty];
  const reinforcementValue = 5; // core assets generate reinforcement, but aren't reinforcement themselves

  const overall = Math.round(
    strategicPriority * 0.3 +
      authorityImpact * 0.3 +
      semanticValue * 0.25 +
      (10 - executionDifficulty) * 0.15
  );

  return {
    strategicPriority,
    authorityImpact,
    semanticValue,
    executionDifficulty,
    reinforcementValue,
    overall,
  };
}

function scoreReinforcementTopic(
  topic: ReinforcementTopic,
  strategy: DayStrategy,
  hasCoreAssetThisWeek: boolean
): PriorityScore {
  const themeWeight = strategy.themeWeights[topic.theme] ?? 1.0;
  const category = getCategoryById(topic.categoryId);
  const load = category ? loadForFormat(category.format) : null;

  // Reinforcement value is the new core metric for these tasks.
  // Tasks that compound a recent core asset score higher.
  const compoundBonus =
    topic.requiresCoreAsset && hasCoreAssetThisWeek ? 3 :
    topic.requiresCoreAsset && !hasCoreAssetThisWeek ? -3 :
    1;

  const channelBonus = category && strategy.preferredChannels.includes(category.channel) ? 2 : 0;
  const categoryBonus = strategy.preferredCategoryIds.includes(topic.categoryId) ? 2 : 0;

  const reinforcementValue = Math.max(
    1,
    Math.min(10, 5 + compoundBonus + channelBonus + categoryBonus)
  );

  const strategicPriority = Math.min(10, Math.round(themeWeight * 5 + categoryBonus));
  const authorityImpact = reinforcementValue;
  const semanticValue = Math.min(10, Math.round(themeWeight * 4 + 2));
  const executionDifficulty = load
    ? (load.tier === "heavy" ? 8 : load.tier === "medium" ? 5 : 3)
    : 3;

  const overall = Math.round(
    reinforcementValue * 0.35 +
      strategicPriority * 0.2 +
      authorityImpact * 0.2 +
      semanticValue * 0.15 +
      (10 - executionDifficulty) * 0.1
  );

  return {
    strategicPriority,
    authorityImpact,
    semanticValue,
    executionDifficulty,
    reinforcementValue,
    overall,
  };
}

// ─── Main Generator ──────────────────────────────────────────

export function generateDailyPlan(dateStr: string): DailyPlan {
  const date = new Date(dateStr + "T00:00:00");
  const dayOfWeek = date.getDay();
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const strategy =
    dayOfWeek >= 1 && dayOfWeek <= 5
      ? dayStrategies[dayOfWeek]
      : weekendStrategy;

  const rand = seededRandom(dateToSeed(dateStr));
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const themeRotationIndex = dayOfYear % themes.length;

  const missions: PlannedMission[] = [];

  // ── 1. Core Authority Asset (Monday only) ───────────────────
  if (strategy.emitsCoreAsset) {
    const core = selectCoreAsset(strategy, themeRotationIndex, rand);
    if (core) missions.push(core);
  }

  // ── 2. Reinforcement Tasks (every weekday) ──────────────────
  const hasCoreAssetThisWeek = true; // Friday assumes Monday's core was published
  const reinforcement = selectReinforcement(
    strategy,
    hasCoreAssetThisWeek,
    rand,
    missions.length // start execution order after core asset
  );
  missions.push(...reinforcement);

  // ── 3. Friday research + strategic review ───────────────────
  if (strategy.includeResearch) {
    const research = makeReinforcementMission(
      reinforcementTopics.find((t) => t.id === "research-weekly-session")!,
      strategy,
      missions.length,
      hasCoreAssetThisWeek
    );
    if (research) missions.push(research);
  }
  if (strategy.includeReview) {
    const review = makeReinforcementMission(
      reinforcementTopics.find((t) => t.id === "strategic-week-review")!,
      strategy,
      missions.length,
      hasCoreAssetThisWeek
    );
    if (review) missions.push(review);
  }

  // ── Identify the Core Asset for downstream consumers ─────────
  const coreAsset = missions.find((m) => m.isCoreAsset) ?? null;

  // ── Cognitive load summary ──────────────────────────────────
  const load = { heavy: 0, medium: 0, light: 0, totalMinutes: 0 };
  for (const m of missions) {
    if (m.loadTier === "heavy") load.heavy++;
    else if (m.loadTier === "medium") load.medium++;
    else load.light++;
    const mins = parseInt(m.estimatedTime);
    if (!isNaN(mins)) load.totalMinutes += mins;
  }

  // ── Focus themes + reinforced signals ───────────────────────
  const focusThemes = [...new Set(missions.map((m) => m.theme.id))]
    .map((id) => themes.find((t) => t.id === id))
    .filter((t): t is Theme => t !== undefined);

  const reinforcedSignals = [
    ...new Set(
      missions.flatMap((m) => [m.theme.name, ...m.theme.keywords.slice(0, 2)])
    ),
  ].slice(0, 8);

  return {
    date: dateStr,
    dayName: dayNames[dayOfWeek],
    dayStrategy: strategy.description,
    missions,
    coreAsset,
    focusThemes,
    reinforcedSignals,
    cognitiveLoad: load,
  };
}

// ─── Core Asset Selection ────────────────────────────────────

function selectCoreAsset(
  strategy: DayStrategy,
  themeRotationIndex: number,
  rand: () => number
): PlannedMission | null {
  // Pick from heavy topicIdeas matching preferred core categories.
  const coreCategoryIds = strategy.preferredCategoryIds.filter((id) => {
    const c = getCategoryById(id);
    return c?.eligibleAsCore;
  });

  // Score every heavy topic; pick the highest with theme rotation favoured.
  // Long-form video is intentionally excluded from core-asset selection —
  // the week's single video lands on Thursday as a short.
  const scored = topicIdeas
    .filter((topic) => topic.format !== "video")
    .map((topic) => {
      const themeIdx = themes.findIndex((t) => t.id === topic.theme);
      const rotationBonus =
        themeIdx === themeRotationIndex
          ? 3
          : themeIdx === (themeRotationIndex + 1) % themes.length
            ? 1.5
            : 0;
      return { topic, score: scoreCoreTopic(topic, strategy, rotationBonus) };
    })
    .sort((a, b) => {
      const noise = (rand() - 0.5) * 1.5;
      return b.score.overall - a.score.overall + noise;
    });

  // Map topic format → core category. Prefer formats that match strategy.preferredCategoryIds.
  for (const { topic, score } of scored) {
    const matchingCategory = findCategoryForTopicFormat(topic, coreCategoryIds);
    if (!matchingCategory) continue;
    const theme = themes.find((t) => t.id === topic.theme)!;
    const angleId =
      theme.contentAngles.find((a) => a === topic.contentAngle) ??
      theme.contentAngles[0];
    const angle = contentAngles.find((a) => a.id === angleId);

    return {
      id: `core-${todayId(strategy)}`,
      title: topic.title,
      category: matchingCategory.label,
      categoryDef: matchingCategory,
      loadTier: "heavy",
      taskKind: "core-authority",
      isCoreAsset: true,
      theme,
      topic,
      reinforcementTopic: null,
      contentAngle: angle?.name ?? topic.contentAngle,
      platform: topic.platform,
      channel: matchingCategory.channel,
      estimatedTime: topic.estimatedTime,
      objective: topic.semanticGoal,
      semanticGoal: topic.semanticGoal,
      priority: score,
      executionOrder: 1,
    };
  }
  return null;
}

function findCategoryForTopicFormat(
  topic: TopicIdea,
  preferredIds: string[]
): MissionCategoryDef | undefined {
  // Topic format strings from topicIdeas.ts → category format strings
  const formatMap: Record<string, string[]> = {
    article: ["authority-article", "geo-educational-article"],
    "case-study": ["case-study"],
    guide: ["geo-educational-article", "authority-article"],
    video: ["youtube-explainer"],
    audit: ["authority-audit"],
  };
  const candidates = formatMap[topic.format] ?? ["authority-article"];

  // Prefer those in preferred list
  const preferred = candidates
    .filter((id) => preferredIds.includes(id))
    .map((id) => getCategoryById(id))
    .filter((c): c is MissionCategoryDef => Boolean(c));
  if (preferred.length > 0) return preferred[0];

  return getCategoryById(candidates[0]);
}

function todayId(strategy: DayStrategy): string {
  // Deterministic: the strategy name uniquely identifies the day,
  // and there is only one core asset per day. Keeping this stable
  // avoids SSR/CSR hydration mismatches.
  return `core-${strategy.name.replace(/\s+/g, "-").toLowerCase()}`;
}

// ─── Reinforcement Selection ─────────────────────────────────

function selectReinforcement(
  strategy: DayStrategy,
  hasCoreAssetThisWeek: boolean,
  rand: () => number,
  startOrder: number
): PlannedMission[] {
  if (strategy.reinforcementCount <= 0) return [];

  // Pool = topics whose category is in this day's preferred list,
  // falling back to topics in any preferred channel.
  const pool = reinforcementTopics.filter((t) => {
    const cat = getCategoryById(t.categoryId);
    if (!cat) return false;
    if (strategy.preferredCategoryIds.includes(t.categoryId)) return true;
    if (strategy.preferredChannels.includes(cat.channel)) return true;
    return false;
  });

  // Don't pick research/review here — they're added separately on Friday.
  const filtered = pool.filter((t) => {
    const cat = getCategoryById(t.categoryId);
    return cat && cat.kind !== "research" && cat.kind !== "strategic-review";
  });

  // Score + sort + enforce category/theme diversity.
  const scored = filtered
    .map((topic) => ({
      topic,
      score: scoreReinforcementTopic(topic, strategy, hasCoreAssetThisWeek),
    }))
    .sort((a, b) => {
      const noise = (rand() - 0.5) * 1.5;
      return b.score.overall - a.score.overall + noise;
    });

  const selected: typeof scored = [];
  const usedCategories = new Set<string>();
  const usedThemes = new Set<string>();

  for (const item of scored) {
    if (selected.length >= strategy.reinforcementCount) break;
    if (usedCategories.has(item.topic.categoryId)) continue; // category diversity
    // Allow up to 2 of the same theme (light tasks compounding the same territory is fine)
    const themeCount = selected.filter(
      (s) => s.topic.theme === item.topic.theme
    ).length;
    if (themeCount >= 2) continue;
    selected.push(item);
    usedCategories.add(item.topic.categoryId);
    usedThemes.add(item.topic.theme);
  }

  return selected.map((item, i) =>
    materializeReinforcement(item.topic, item.score, strategy, startOrder + i + 1)
  );
}

function makeReinforcementMission(
  topic: ReinforcementTopic,
  strategy: DayStrategy,
  startOrder: number,
  hasCoreAssetThisWeek: boolean
): PlannedMission | null {
  const score = scoreReinforcementTopic(topic, strategy, hasCoreAssetThisWeek);
  return materializeReinforcement(topic, score, strategy, startOrder + 1);
}

function materializeReinforcement(
  topic: ReinforcementTopic,
  score: PriorityScore,
  _strategy: DayStrategy,
  executionOrder: number
): PlannedMission {
  const cat = getCategoryById(topic.categoryId)!;
  const theme = themes.find((t) => t.id === topic.theme) ?? themes[0];
  const load = loadForFormat(cat.format);
  const kind = kindForFormat(cat.format);

  return {
    // Deterministic id keyed on (topic, executionOrder). Used as React
    // key + draft cache lookup; must be stable across SSR + CSR renders.
    id: `reinforce-${topic.id}-${executionOrder}`,
    title: topic.title,
    category: cat.label,
    categoryDef: cat,
    loadTier: load.tier,
    taskKind: kind,
    isCoreAsset: false,
    executionPrompt: topic.prompt,
    theme,
    topic: null,
    reinforcementTopic: topic,
    contentAngle: "Reinforcement",
    platform: channelToPlatform(cat.channel),
    channel: cat.channel,
    estimatedTime: `${load.inputs.timeMinutes} min`,
    objective: topic.semanticGoal,
    semanticGoal: topic.semanticGoal,
    priority: score,
    executionOrder,
  };
}

function channelToPlatform(channel: Channel): string {
  switch (channel) {
    case "blog": return "Blog";
    case "linkedin": return "LinkedIn";
    case "youtube": return "YouTube";
    case "reddit": return "Reddit";
    case "community": return "Community";
    case "internal-site": return "Interon Site";
    case "entity-platforms": return "Entity Platforms";
    case "podcast": return "Podcast";
    case "conference": return "Conference";
    case "internal": return "Internal";
  }
}

// ─── Helpers ─────────────────────────────────────────────────

export function getTodayDateStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function getWeekDatesFrom(startDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate + "T00:00:00");
  const day = start.getDay();
  const monday = new Date(start);
  monday.setDate(start.getDate() - ((day + 6) % 7));
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

// Surface the weekly budget for any caller that wants it
export { DEFAULT_WEEKLY_BUDGET };
