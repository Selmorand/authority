import { themes } from "@/data/themes";
import { topicIdeas } from "@/data/topicIdeas";
import { contentAngles } from "@/data/contentAngles";
import type { Theme } from "@/data/themes";
import type { TopicIdea } from "@/data/topicIdeas";

// ─── Types ───────────────────────────────────────────────────

export interface PriorityScore {
  strategicPriority: number; // 1-10
  authorityImpact: number; // 1-10
  semanticValue: number; // 1-10
  executionDifficulty: number; // 1-10 (10 = hardest)
  overall: number; // weighted composite
}

export interface PlannedMission {
  id: string;
  title: string;
  category: string;
  theme: Theme;
  topic: TopicIdea;
  contentAngle: string;
  platform: string;
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
  focusThemes: Theme[];
  reinforcedSignals: string[];
}

// ─── Day Strategy Definitions ────────────────────────────────

interface DayStrategy {
  name: string;
  description: string;
  preferredCategories: string[];
  preferredPlatforms: string[];
  themeWeights: Record<string, number>; // theme id -> weight multiplier
}

const dayStrategies: Record<number, DayStrategy> = {
  1: {
    // Monday
    name: "Strategic Content & Planning",
    description:
      "Set the week's direction with high-visibility content and strategic planning. LinkedIn authority posts establish presence; frameworks position expertise.",
    preferredCategories: [
      "linkedin-post",
      "article",
      "guide",
    ],
    preferredPlatforms: ["LinkedIn", "Blog"],
    themeWeights: {
      "ai-readiness": 1.5,
      geo: 1.3,
      "ai-search-visibility": 1.4,
      "entity-trust": 1.0,
      "umbraco-ai": 0.8,
      "structured-data": 0.8,
      "machine-readable": 0.9,
      "technical-seo": 0.7,
    },
  },
  2: {
    // Tuesday
    name: "Technical Authority",
    description:
      "Build deep technical credibility with detailed breakdowns, audits, and implementation guides. Focus on structured data, technical SEO, and machine readability.",
    preferredCategories: ["article", "guide", "audit"],
    preferredPlatforms: ["Blog", "LinkedIn"],
    themeWeights: {
      "technical-seo": 1.5,
      "structured-data": 1.4,
      "machine-readable": 1.3,
      "umbraco-ai": 1.2,
      "ai-readiness": 1.0,
      geo: 0.8,
      "entity-trust": 0.7,
      "ai-search-visibility": 0.8,
    },
  },
  3: {
    // Wednesday
    name: "Outreach & Founder Authority",
    description:
      "Amplify personal brand and entity signals. Founder insights, entity reinforcement, and thought leadership content build the human authority behind the brand.",
    preferredCategories: [
      "linkedin-post",
      "article",
      "thread",
    ],
    preferredPlatforms: ["LinkedIn", "Blog"],
    themeWeights: {
      "entity-trust": 1.5,
      geo: 1.3,
      "ai-search-visibility": 1.3,
      "ai-readiness": 1.1,
      "umbraco-ai": 0.9,
      "structured-data": 0.7,
      "machine-readable": 0.7,
      "technical-seo": 0.8,
    },
  },
  4: {
    // Thursday
    name: "Video & Case Studies",
    description:
      "Create high-impact visual and evidence-based content. Video audits demonstrate methodology; case studies prove results and build trust.",
    preferredCategories: [
      "video",
      "case-study",
      "article",
    ],
    preferredPlatforms: ["YouTube", "Blog"],
    themeWeights: {
      "umbraco-ai": 1.4,
      "ai-readiness": 1.3,
      "technical-seo": 1.2,
      geo: 1.1,
      "machine-readable": 1.0,
      "structured-data": 0.9,
      "entity-trust": 0.8,
      "ai-search-visibility": 1.0,
    },
  },
  5: {
    // Friday
    name: "Research & Entity Reinforcement",
    description:
      "Close the week with research collection and entity signal strengthening. Build the evidence base for next week's authority content.",
    preferredCategories: [
      "article",
      "guide",
      "linkedin-post",
    ],
    preferredPlatforms: ["Internal", "Blog", "LinkedIn"],
    themeWeights: {
      "entity-trust": 1.4,
      "ai-search-visibility": 1.3,
      geo: 1.2,
      "ai-readiness": 1.1,
      "structured-data": 1.0,
      "machine-readable": 0.9,
      "technical-seo": 0.9,
      "umbraco-ai": 0.8,
    },
  },
};

// Weekend fallback
const weekendStrategy: DayStrategy = {
  name: "Review & Light Planning",
  description:
    "Optional light work: review the week's output, collect research, and note content ideas for the upcoming week.",
  preferredCategories: ["linkedin-post", "article"],
  preferredPlatforms: ["LinkedIn", "Internal"],
  themeWeights: {
    "ai-readiness": 1.0,
    geo: 1.0,
    "umbraco-ai": 1.0,
    "entity-trust": 1.0,
    "structured-data": 1.0,
    "machine-readable": 1.0,
    "technical-seo": 1.0,
    "ai-search-visibility": 1.0,
  },
};

// ─── Deterministic Seed ──────────────────────────────────────

function dateToSeed(dateStr: string): number {
  const d = new Date(dateStr);
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// Simple seeded pseudo-random (Mulberry32)
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

function scoreTopic(
  topic: TopicIdea,
  strategy: DayStrategy,
  themeRotationBonus: number
): PriorityScore {
  const impactMap = { high: 9, medium: 6, low: 3 };
  const difficultyMap = { advanced: 8, intermediate: 5, beginner: 3 };

  const themeWeight = strategy.themeWeights[topic.theme] ?? 1.0;
  const platformBonus = strategy.preferredPlatforms.includes(topic.platform)
    ? 1.5
    : 0.8;
  const formatBonus = strategy.preferredCategories.includes(topic.format)
    ? 1.3
    : 0.9;

  const strategicPriority = Math.min(
    10,
    Math.round(themeWeight * platformBonus * formatBonus * 5)
  );
  const authorityImpact = impactMap[topic.authorityImpact];
  const semanticValue = Math.min(
    10,
    Math.round((themeWeight * 4 + themeRotationBonus) * 1.2)
  );
  const executionDifficulty = difficultyMap[topic.difficulty];

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
    overall,
  };
}

// ─── Main Generator ──────────────────────────────────────────

export function generateDailyPlan(dateStr: string): DailyPlan {
  const date = new Date(dateStr + "T00:00:00");
  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon...
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
  const missionCount = dayOfWeek === 0 || dayOfWeek === 6 ? 3 : 3 + Math.floor(rand() * 3); // 3-5 on weekdays

  // Calculate theme rotation bonus based on day-of-year to cycle focus
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const themeRotationIndex = dayOfYear % themes.length;

  // Score all topics
  const scored = topicIdeas.map((topic) => {
    const themeIdx = themes.findIndex((t) => t.id === topic.theme);
    const rotationBonus =
      themeIdx === themeRotationIndex
        ? 3
        : themeIdx === (themeRotationIndex + 1) % themes.length
          ? 1.5
          : 0;

    return {
      topic,
      score: scoreTopic(topic, strategy, rotationBonus),
    };
  });

  // Sort by overall score with slight randomization to avoid identical days
  scored.sort((a, b) => {
    const noise = (rand() - 0.5) * 2;
    return b.score.overall - a.score.overall + noise;
  });

  // Select missions ensuring diversity
  const selected: typeof scored = [];
  const usedThemes = new Set<string>();
  const usedPlatforms = new Set<string>();
  const usedFormats = new Set<string>();

  for (const item of scored) {
    if (selected.length >= missionCount) break;

    // Allow max 2 from same theme
    const themeCount = selected.filter(
      (s) => s.topic.theme === item.topic.theme
    ).length;
    if (themeCount >= 2) continue;

    // Allow max 2 from same platform
    const platformCount = selected.filter(
      (s) => s.topic.platform === item.topic.platform
    ).length;
    if (platformCount >= 2) continue;

    // Prefer format diversity
    if (usedFormats.has(item.topic.format) && selected.length < missionCount - 1) {
      // Skip if we have other options, but allow if we're running low
      const remaining = scored.filter(
        (s) =>
          !selected.includes(s) &&
          !usedFormats.has(s.topic.format)
      );
      if (remaining.length > 0) continue;
    }

    selected.push(item);
    usedThemes.add(item.topic.theme);
    usedPlatforms.add(item.topic.platform);
    usedFormats.add(item.topic.format);
  }

  // Build missions with execution order (highest priority first)
  selected.sort((a, b) => b.score.overall - a.score.overall);

  const missions: PlannedMission[] = selected.map((item, i) => {
    const theme = themes.find((t) => t.id === item.topic.theme)!;
    const angleId =
      theme.contentAngles.find((a) => a === item.topic.contentAngle) ??
      theme.contentAngles[0];
    const angle = contentAngles.find((a) => a.id === angleId);

    return {
      id: `gen-${dateStr}-${i}`,
      title: item.topic.title,
      category: item.topic.format,
      theme,
      topic: item.topic,
      contentAngle: angle?.name ?? item.topic.contentAngle,
      platform: item.topic.platform,
      estimatedTime: item.topic.estimatedTime,
      objective: item.topic.semanticGoal,
      semanticGoal: item.topic.semanticGoal,
      priority: item.score,
      executionOrder: i + 1,
    };
  });

  // Identify focus themes
  const focusThemeIds = [...usedThemes];
  const focusThemes = focusThemeIds
    .map((id) => themes.find((t) => t.id === id))
    .filter((t): t is Theme => t !== undefined);

  // Identify reinforced signals
  const reinforcedSignals = [
    ...new Set(
      missions.flatMap((m) => [
        m.theme.name,
        m.topic.audience,
        ...m.theme.keywords.slice(0, 2),
      ])
    ),
  ].slice(0, 8);

  return {
    date: dateStr,
    dayName: dayNames[dayOfWeek],
    dayStrategy: strategy.description,
    missions,
    focusThemes,
    reinforcedSignals,
  };
}

// ─── Helpers ─────────────────────────────────────────────────

export function getTodayDateStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function getWeekDatesFrom(startDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate + "T00:00:00");
  // Find Monday
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
