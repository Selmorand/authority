export type SourceCategory =
  | "search-engine"
  | "ai-platform"
  | "seo-publication"
  | "cms-ecosystem"
  | "community"
  | "research";

export interface ResearchSource {
  id: string;
  name: string;
  url: string;
  feedUrl: string;
  category: SourceCategory;
  quality: SourceQuality;
  relevantThemes: string[]; // theme ids
}

export interface SourceQuality {
  authority: number; // 1-10
  relevance: number; // 1-10
  geoRelevance: number; // 1-10
  aiRelevance: number; // 1-10
  semanticAlignment: number; // 1-10
  overall: number; // weighted composite
}

function score(q: Omit<SourceQuality, "overall">): SourceQuality {
  return {
    ...q,
    overall: Math.round(
      q.authority * 0.2 +
        q.relevance * 0.25 +
        q.geoRelevance * 0.2 +
        q.aiRelevance * 0.2 +
        q.semanticAlignment * 0.15
    ),
  };
}

export const researchSources: ResearchSource[] = [
  {
    id: "google-search-central",
    name: "Google Search Central Blog",
    url: "https://developers.google.com/search/blog",
    feedUrl: "https://developers.google.com/search/blog/rss.xml",
    category: "search-engine",
    quality: score({
      authority: 10,
      relevance: 10,
      geoRelevance: 8,
      aiRelevance: 9,
      semanticAlignment: 9,
    }),
    relevantThemes: [
      "technical-seo",
      "structured-data",
      "ai-search-visibility",
      "machine-readable",
    ],
  },
  {
    id: "openai-blog",
    name: "OpenAI Blog",
    url: "https://openai.com/blog",
    feedUrl: "https://openai.com/blog/rss.xml",
    category: "ai-platform",
    quality: score({
      authority: 10,
      relevance: 7,
      geoRelevance: 8,
      aiRelevance: 10,
      semanticAlignment: 6,
    }),
    relevantThemes: ["ai-readiness", "ai-search-visibility", "geo"],
  },
  {
    id: "anthropic-news",
    name: "Anthropic News",
    url: "https://www.anthropic.com/news",
    feedUrl: "https://www.anthropic.com/rss.xml",
    category: "ai-platform",
    quality: score({
      authority: 10,
      relevance: 7,
      geoRelevance: 7,
      aiRelevance: 10,
      semanticAlignment: 6,
    }),
    relevantThemes: ["ai-readiness", "ai-search-visibility"],
  },
  {
    id: "microsoft-ai",
    name: "Microsoft AI Blog",
    url: "https://blogs.microsoft.com/ai/",
    feedUrl: "https://blogs.microsoft.com/ai/feed/",
    category: "ai-platform",
    quality: score({
      authority: 9,
      relevance: 6,
      geoRelevance: 7,
      aiRelevance: 9,
      semanticAlignment: 5,
    }),
    relevantThemes: ["ai-readiness", "ai-search-visibility"],
  },
  {
    id: "search-engine-journal",
    name: "Search Engine Journal",
    url: "https://www.searchenginejournal.com",
    feedUrl: "https://www.searchenginejournal.com/feed/",
    category: "seo-publication",
    quality: score({
      authority: 8,
      relevance: 9,
      geoRelevance: 7,
      aiRelevance: 7,
      semanticAlignment: 8,
    }),
    relevantThemes: [
      "technical-seo",
      "structured-data",
      "ai-search-visibility",
      "geo",
    ],
  },
  {
    id: "search-engine-land",
    name: "Search Engine Land",
    url: "https://searchengineland.com",
    feedUrl: "https://searchengineland.com/feed",
    category: "seo-publication",
    quality: score({
      authority: 9,
      relevance: 9,
      geoRelevance: 7,
      aiRelevance: 8,
      semanticAlignment: 8,
    }),
    relevantThemes: [
      "technical-seo",
      "ai-search-visibility",
      "structured-data",
      "geo",
    ],
  },
  {
    id: "ahrefs-blog",
    name: "Ahrefs Blog",
    url: "https://ahrefs.com/blog",
    feedUrl: "https://ahrefs.com/blog/feed/",
    category: "seo-publication",
    quality: score({
      authority: 9,
      relevance: 8,
      geoRelevance: 6,
      aiRelevance: 6,
      semanticAlignment: 7,
    }),
    relevantThemes: ["technical-seo", "entity-trust", "structured-data"],
  },
  {
    id: "umbraco-blog",
    name: "Umbraco Blog",
    url: "https://umbraco.com/blog",
    feedUrl: "https://umbraco.com/blog/rss/",
    category: "cms-ecosystem",
    quality: score({
      authority: 8,
      relevance: 7,
      geoRelevance: 4,
      aiRelevance: 5,
      semanticAlignment: 7,
    }),
    relevantThemes: ["umbraco-ai", "machine-readable", "structured-data"],
  },
  {
    id: "schema-org-updates",
    name: "Schema.org Community",
    url: "https://schema.org",
    feedUrl: "https://github.com/schemaorg/schemaorg/releases.atom",
    category: "research",
    quality: score({
      authority: 10,
      relevance: 8,
      geoRelevance: 7,
      aiRelevance: 7,
      semanticAlignment: 10,
    }),
    relevantThemes: ["structured-data", "machine-readable", "entity-trust"],
  },
  {
    id: "reddit-seo",
    name: "Reddit r/SEO",
    url: "https://www.reddit.com/r/SEO/",
    feedUrl: "https://www.reddit.com/r/SEO/hot.json",
    category: "community",
    quality: score({
      authority: 5,
      relevance: 7,
      geoRelevance: 5,
      aiRelevance: 6,
      semanticAlignment: 6,
    }),
    relevantThemes: [
      "technical-seo",
      "ai-search-visibility",
      "geo",
      "entity-trust",
    ],
  },
  {
    id: "reddit-artificial",
    name: "Reddit r/artificial",
    url: "https://www.reddit.com/r/artificial/",
    feedUrl: "https://www.reddit.com/r/artificial/hot.json",
    category: "community",
    quality: score({
      authority: 4,
      relevance: 5,
      geoRelevance: 5,
      aiRelevance: 8,
      semanticAlignment: 4,
    }),
    relevantThemes: ["ai-readiness", "ai-search-visibility"],
  },
];

// ─── Helpers ─────────────────────────────────────────────────

export function getSourcesByCategory(
  category: SourceCategory
): ResearchSource[] {
  return researchSources.filter((s) => s.category === category);
}

export function getSourcesByQuality(minOverall: number): ResearchSource[] {
  return researchSources
    .filter((s) => s.quality.overall >= minOverall)
    .sort((a, b) => b.quality.overall - a.quality.overall);
}
