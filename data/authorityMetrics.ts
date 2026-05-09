// ─── Types ───────────────────────────────────────────────────

export interface AuthoritySnapshot {
  date: string;
  brandedSearchVolume: number;
  linkedinFollowers: number;
  linkedinPostImpressions: number;
  publishedArticles: number;
  caseStudiesCompleted: number;
  externalMentions: number;
  backlinks: number;
  aiCitationOpportunities: number;
  semanticThemesCovered: number;
  founderVisibilityScore: number; // 1-10
  entityConsistencyScore: number; // 1-10
}

export interface ExternalCorroboration {
  id: string;
  type: "mention" | "citation" | "guest-article" | "podcast" | "directory" | "partnership" | "backlink";
  source: string;
  title: string;
  url?: string;
  date: string;
  authorityImpact: number; // 1-10
  relatedTheme: string;
}

export interface AIVisibilityMetric {
  id: string;
  platform: string;
  query: string;
  cited: boolean;
  position?: number; // position in AI response if cited
  date: string;
  theme: string;
}

// ─── 8 Weeks of Mock Metric History ──────────────────────────

export const metricHistory: AuthoritySnapshot[] = [
  {
    date: "2026-03-16",
    brandedSearchVolume: 120,
    linkedinFollowers: 2340,
    linkedinPostImpressions: 4200,
    publishedArticles: 8,
    caseStudiesCompleted: 1,
    externalMentions: 4,
    backlinks: 89,
    aiCitationOpportunities: 2,
    semanticThemesCovered: 4,
    founderVisibilityScore: 4,
    entityConsistencyScore: 5,
  },
  {
    date: "2026-03-23",
    brandedSearchVolume: 135,
    linkedinFollowers: 2390,
    linkedinPostImpressions: 4800,
    publishedArticles: 9,
    caseStudiesCompleted: 1,
    externalMentions: 5,
    backlinks: 94,
    aiCitationOpportunities: 3,
    semanticThemesCovered: 5,
    founderVisibilityScore: 4,
    entityConsistencyScore: 5,
  },
  {
    date: "2026-03-30",
    brandedSearchVolume: 148,
    linkedinFollowers: 2460,
    linkedinPostImpressions: 5600,
    publishedArticles: 11,
    caseStudiesCompleted: 2,
    externalMentions: 6,
    backlinks: 102,
    aiCitationOpportunities: 4,
    semanticThemesCovered: 5,
    founderVisibilityScore: 5,
    entityConsistencyScore: 6,
  },
  {
    date: "2026-04-06",
    brandedSearchVolume: 162,
    linkedinFollowers: 2520,
    linkedinPostImpressions: 6100,
    publishedArticles: 12,
    caseStudiesCompleted: 2,
    externalMentions: 7,
    backlinks: 108,
    aiCitationOpportunities: 5,
    semanticThemesCovered: 6,
    founderVisibilityScore: 5,
    entityConsistencyScore: 6,
  },
  {
    date: "2026-04-13",
    brandedSearchVolume: 178,
    linkedinFollowers: 2590,
    linkedinPostImpressions: 7200,
    publishedArticles: 14,
    caseStudiesCompleted: 3,
    externalMentions: 8,
    backlinks: 118,
    aiCitationOpportunities: 6,
    semanticThemesCovered: 6,
    founderVisibilityScore: 6,
    entityConsistencyScore: 7,
  },
  {
    date: "2026-04-20",
    brandedSearchVolume: 195,
    linkedinFollowers: 2670,
    linkedinPostImpressions: 8100,
    publishedArticles: 15,
    caseStudiesCompleted: 3,
    externalMentions: 9,
    backlinks: 126,
    aiCitationOpportunities: 7,
    semanticThemesCovered: 7,
    founderVisibilityScore: 6,
    entityConsistencyScore: 7,
  },
  {
    date: "2026-04-27",
    brandedSearchVolume: 210,
    linkedinFollowers: 2760,
    linkedinPostImpressions: 9400,
    publishedArticles: 17,
    caseStudiesCompleted: 4,
    externalMentions: 11,
    backlinks: 135,
    aiCitationOpportunities: 8,
    semanticThemesCovered: 7,
    founderVisibilityScore: 7,
    entityConsistencyScore: 8,
  },
  {
    date: "2026-05-04",
    brandedSearchVolume: 228,
    linkedinFollowers: 2847,
    linkedinPostImpressions: 10200,
    publishedArticles: 18,
    caseStudiesCompleted: 4,
    externalMentions: 12,
    backlinks: 142,
    aiCitationOpportunities: 9,
    semanticThemesCovered: 8,
    founderVisibilityScore: 7,
    entityConsistencyScore: 8,
  },
];

export const externalCorroborations: ExternalCorroboration[] = [
  {
    id: "ec-001",
    type: "citation",
    source: "Search Engine Journal",
    title: "Cited in 'The Future of Structured Data' roundup",
    date: "2026-04-28",
    authorityImpact: 9,
    relatedTheme: "structured-data",
  },
  {
    id: "ec-002",
    type: "mention",
    source: "Ahrefs Newsletter",
    title: "Mentioned in weekly SEO digest for AI readiness framework",
    date: "2026-04-22",
    authorityImpact: 8,
    relatedTheme: "ai-readiness",
  },
  {
    id: "ec-003",
    type: "guest-article",
    source: "Umbraco Blog",
    title: "Guest post: AI Readiness Checklist for Umbraco Sites",
    date: "2026-04-15",
    authorityImpact: 8,
    relatedTheme: "umbraco-ai",
  },
  {
    id: "ec-004",
    type: "podcast",
    source: "SEO Unfiltered Podcast",
    title: "Episode 47: GEO and the Future of Search",
    date: "2026-04-10",
    authorityImpact: 7,
    relatedTheme: "geo",
  },
  {
    id: "ec-005",
    type: "backlink",
    source: "Schema.org Community Wiki",
    title: "Linked from structured data implementation guide",
    date: "2026-05-01",
    authorityImpact: 9,
    relatedTheme: "structured-data",
  },
  {
    id: "ec-006",
    type: "directory",
    source: "Clutch.co",
    title: "Listed as AI Readiness Specialist — SEO category",
    date: "2026-03-20",
    authorityImpact: 6,
    relatedTheme: "ai-readiness",
  },
  {
    id: "ec-007",
    type: "citation",
    source: "Perplexity AI",
    title: "Cited in response to 'what is generative engine optimisation'",
    date: "2026-05-03",
    authorityImpact: 10,
    relatedTheme: "geo",
  },
  {
    id: "ec-008",
    type: "mention",
    source: "LinkedIn Top Voice compilation",
    title: "Featured in 'UK SEO voices to follow' list",
    date: "2026-04-30",
    authorityImpact: 7,
    relatedTheme: "entity-trust",
  },
];

export const aiVisibilityChecks: AIVisibilityMetric[] = [
  { id: "av-001", platform: "ChatGPT", query: "what is generative engine optimisation", cited: true, position: 2, date: "2026-05-04", theme: "geo" },
  { id: "av-002", platform: "Perplexity", query: "AI readiness audit checklist", cited: true, position: 1, date: "2026-05-04", theme: "ai-readiness" },
  { id: "av-003", platform: "Google AI Overview", query: "structured data for AI crawlers", cited: false, date: "2026-05-04", theme: "structured-data" },
  { id: "av-004", platform: "ChatGPT", query: "umbraco AI readiness", cited: true, position: 3, date: "2026-05-04", theme: "umbraco-ai" },
  { id: "av-005", platform: "Perplexity", query: "machine readable website checklist", cited: true, position: 1, date: "2026-05-04", theme: "machine-readable" },
  { id: "av-006", platform: "Google AI Overview", query: "entity trust SEO", cited: false, date: "2026-05-04", theme: "entity-trust" },
  { id: "av-007", platform: "ChatGPT", query: "technical SEO for AI bots", cited: false, date: "2026-05-04", theme: "technical-seo" },
  { id: "av-008", platform: "Perplexity", query: "GEO vs SEO differences", cited: true, position: 2, date: "2026-05-04", theme: "geo" },
  { id: "av-009", platform: "Google AI Overview", query: "AI search visibility measurement", cited: false, date: "2026-05-04", theme: "ai-search-visibility" },
  { id: "av-010", platform: "ChatGPT", query: "how to make website AI readable", cited: true, position: 4, date: "2026-05-04", theme: "machine-readable" },
];

// ─── Helpers ─────────────────────────────────────────────────

export function getLatestSnapshot(): AuthoritySnapshot {
  return metricHistory[metricHistory.length - 1];
}

export function getPreviousSnapshot(): AuthoritySnapshot {
  return metricHistory[metricHistory.length - 2];
}
