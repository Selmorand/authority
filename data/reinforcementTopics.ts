// ─── Reinforcement Topic Library ─────────────────────────────
// Light/medium task templates that the planner can schedule
// without requiring the user to write original long-form content.
// Pairs with data/topicIdeas.ts (which holds heavy/core topics).

import type { MissionCategoryDef } from "./missionChannels";
import { getCategoryById } from "./missionChannels";

export interface ReinforcementTopic {
  id: string;
  categoryId: string;   // → MissionCategoryDef
  theme: string;        // theme id
  title: string;        // mission title shown to user
  prompt: string;       // execution prompt — what to actually do
  audience: string;
  semanticGoal: string;
  // Reinforcement vs amplification — does this require a recent core asset?
  requiresCoreAsset: boolean;
}

// ─── Helpers (build templates) ───────────────────────────────

function t(
  id: string,
  categoryId: string,
  theme: string,
  title: string,
  prompt: string,
  semanticGoal: string,
  opts: { audience?: string; requiresCoreAsset?: boolean } = {}
): ReinforcementTopic {
  return {
    id,
    categoryId,
    theme,
    title,
    prompt,
    audience: opts.audience ?? "Authority audience across SEO, GEO, and technical leadership",
    semanticGoal,
    requiresCoreAsset: opts.requiresCoreAsset ?? false,
  };
}

// ─── Library ─────────────────────────────────────────────────

export const reinforcementTopics: ReinforcementTopic[] = [];

// ─── Helpers ─────────────────────────────────────────────────

export function topicsByCategory(categoryId: string): ReinforcementTopic[] {
  return reinforcementTopics.filter((t) => t.categoryId === categoryId);
}

export function topicsByTheme(themeId: string): ReinforcementTopic[] {
  return reinforcementTopics.filter((t) => t.theme === themeId);
}

export function topicsRequiringCore(): ReinforcementTopic[] {
  return reinforcementTopics.filter((t) => t.requiresCoreAsset);
}

export function topicsWithoutCore(): ReinforcementTopic[] {
  return reinforcementTopics.filter((t) => !t.requiresCoreAsset);
}

export function resolveTopicCategory(t: ReinforcementTopic): MissionCategoryDef | undefined {
  return getCategoryById(t.categoryId);
}
