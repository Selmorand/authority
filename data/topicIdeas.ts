export type TopicDifficulty = "beginner" | "intermediate" | "advanced";
export type AuthorityImpact = "high" | "medium" | "low";
export type TopicFormat =
  | "article"
  | "linkedin-post"
  | "video"
  | "case-study"
  | "guide"
  | "thread"
  | "audit";

export interface TopicIdea {
  title: string;
  theme: string; // theme id
  platform: string;
  difficulty: TopicDifficulty;
  authorityImpact: AuthorityImpact;
  format: TopicFormat;
  audience: string;
  contentAngle: string; // content angle id
  estimatedTime: string;
  semanticGoal: string;
}

export const topicIdeas: TopicIdea[] = [];

// ─── Helpers ─────────────────────────────────────────────────

export function getTopicsByTheme(themeId: string): TopicIdea[] {
  return topicIdeas.filter((t) => t.theme === themeId);
}

export function getTopicsByPlatform(platform: string): TopicIdea[] {
  return topicIdeas.filter((t) => t.platform === platform);
}

export function getTopicsByImpact(impact: AuthorityImpact): TopicIdea[] {
  return topicIdeas.filter((t) => t.authorityImpact === impact);
}
