import RSSParser from "rss-parser";
import axios from "axios";
import { researchSources } from "@/data/researchSources";
import { themes } from "@/data/themes";
import type { ResearchSource } from "@/data/researchSources";

// ─── Types ───────────────────────────────────────────────────

export interface LiveSignal {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  sourceId: string;
  publishedAt: string;
  category: string;
  relevanceScore: number; // 1-10
  matchedThemes: string[]; // theme ids
  matchedKeywords: string[];
  opportunityType: string;
  isHighValue: boolean;
}

export interface FetchResult {
  signals: LiveSignal[];
  sourcesFetched: number;
  sourcesFailed: number;
  totalFiltered: number;
}

// ─── Keyword Matchers ────────────────────────────────────────
// These detect authority-relevant content from raw feed items.

const themeKeywords: Record<string, string[]> = {
  "ai-readiness": [
    "ai ready",
    "ai readiness",
    "ai-ready",
    "ai preparedness",
    "prepare for ai",
  ],
  geo: [
    "generative engine",
    "geo ",
    "llm optimization",
    "llm optimisation",
    "ai search optimization",
    "generative seo",
    "ai citation",
  ],
  "umbraco-ai": [
    "umbraco",
    "umbraco cms",
    "umbraco 14",
    "umbraco 15",
    "codegarden",
  ],
  "entity-trust": [
    "entity seo",
    "entity authority",
    "knowledge panel",
    "knowledge graph",
    "entity recognition",
    "entity confidence",
  ],
  "structured-data": [
    "structured data",
    "schema markup",
    "json-ld",
    "schema.org",
    "rich results",
    "rich snippets",
  ],
  "machine-readable": [
    "machine-readable",
    "machine readable",
    "semantic html",
    "semantic markup",
    "ai crawler",
    "ai crawl",
  ],
  "technical-seo": [
    "technical seo",
    "crawl budget",
    "robots.txt",
    "core web vitals",
    "site speed",
    "indexing",
    "crawlability",
  ],
  "ai-search-visibility": [
    "ai overview",
    "ai overviews",
    "sge",
    "search generative",
    "ai search",
    "perplexity",
    "chatgpt search",
    "ai answer",
    "ai visibility",
  ],
};

// Noise filters — reject items matching these patterns
const noisePatterns = [
  /sponsored/i,
  /advertisement/i,
  /product launch/i,
  /pricing update/i,
  /webinar registration/i,
  /free trial/i,
  /sign up now/i,
  /limited time offer/i,
  /black friday/i,
  /sale\b/i,
  /discount/i,
];

// ─── RSS Fetcher ─────────────────────────────────────────────

const parser = new RSSParser({
  timeout: 10000,
  headers: {
    "User-Agent": "Signal/1.0 (Research Intelligence)",
  },
});

async function fetchRSSSource(
  source: ResearchSource
): Promise<LiveSignal[]> {
  try {
    const feed = await parser.parseURL(source.feedUrl);
    const items = (feed.items || []).slice(0, 10); // max 10 per source

    return items
      .map((item, i) => analyzeItem(item, source, i))
      .filter((s): s is LiveSignal => s !== null);
  } catch {
    return [];
  }
}

async function fetchRedditSource(
  source: ResearchSource
): Promise<LiveSignal[]> {
  try {
    const { data } = await axios.get(source.feedUrl, {
      timeout: 10000,
      headers: {
        "User-Agent": "Signal/1.0 (Research Intelligence)",
      },
    });

    const posts = data?.data?.children || [];
    return posts
      .slice(0, 10)
      .map((post: { data: { title: string; selftext: string; url: string; created_utc: number; id: string } }, i: number) => {
        const d = post.data;
        const text = `${d.title} ${d.selftext || ""}`.toLowerCase();
        const matched = matchThemes(text);
        if (matched.themes.length === 0) return null;
        if (isNoise(`${d.title} ${d.selftext || ""}`)) return null;

        const relevance = calculateRelevance(
          matched.themes.length,
          matched.keywords.length,
          source.quality.overall
        );
        if (relevance < 4) return null;

        return {
          id: `${source.id}-${d.id || i}`,
          title: d.title,
          summary: (d.selftext || "").slice(0, 200),
          url: d.url,
          source: source.name,
          sourceId: source.id,
          publishedAt: new Date(d.created_utc * 1000).toISOString(),
          category: source.category,
          relevanceScore: relevance,
          matchedThemes: matched.themes,
          matchedKeywords: matched.keywords,
          opportunityType: determineOpportunity(matched.themes, relevance),
          isHighValue: relevance >= 7,
        } satisfies LiveSignal;
      })
      .filter((s: LiveSignal | null): s is LiveSignal => s !== null);
  } catch {
    return [];
  }
}

// ─── Analysis ────────────────────────────────────────────────

function analyzeItem(
  item: RSSParser.Item,
  source: ResearchSource,
  index: number
): LiveSignal | null {
  const title = item.title || "";
  const summary =
    item.contentSnippet || item.content || item.summary || "";
  const text = `${title} ${summary}`.toLowerCase();

  // Check noise
  if (isNoise(`${title} ${summary}`)) return null;

  // Match themes
  const matched = matchThemes(text);
  if (matched.themes.length === 0) return null;

  const relevance = calculateRelevance(
    matched.themes.length,
    matched.keywords.length,
    source.quality.overall
  );
  if (relevance < 4) return null;

  return {
    id: `${source.id}-${item.guid || index}`,
    title,
    summary: summary.slice(0, 300),
    url: item.link || source.url,
    source: source.name,
    sourceId: source.id,
    publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
    category: source.category,
    relevanceScore: relevance,
    matchedThemes: matched.themes,
    matchedKeywords: matched.keywords,
    opportunityType: determineOpportunity(matched.themes, relevance),
    isHighValue: relevance >= 7,
  };
}

function matchThemes(text: string): {
  themes: string[];
  keywords: string[];
} {
  const matchedThemes: string[] = [];
  const matchedKeywords: string[] = [];

  for (const [themeId, keywords] of Object.entries(themeKeywords)) {
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        if (!matchedThemes.includes(themeId)) {
          matchedThemes.push(themeId);
        }
        if (!matchedKeywords.includes(kw)) {
          matchedKeywords.push(kw);
        }
      }
    }
  }

  return { themes: matchedThemes, keywords: matchedKeywords };
}

function isNoise(text: string): boolean {
  return noisePatterns.some((p) => p.test(text));
}

function calculateRelevance(
  themeCount: number,
  keywordCount: number,
  sourceQuality: number
): number {
  const base = Math.min(10, themeCount * 2 + keywordCount);
  const qualityBonus = sourceQuality >= 8 ? 2 : sourceQuality >= 6 ? 1 : 0;
  return Math.min(10, Math.round((base + qualityBonus) * 0.9));
}

function determineOpportunity(
  matchedThemes: string[],
  relevance: number
): string {
  if (relevance >= 8) return "high-priority-opportunity";
  if (matchedThemes.length >= 3) return "semantic-convergence";
  if (
    matchedThemes.includes("geo") ||
    matchedThemes.includes("ai-search-visibility")
  )
    return "geo-opportunity";
  if (matchedThemes.includes("umbraco-ai")) return "umbraco-opportunity";
  if (matchedThemes.includes("entity-trust")) return "entity-opportunity";
  return "general-intelligence";
}

// ─── Main Fetch Function ─────────────────────────────────────

export async function fetchLiveSignals(): Promise<FetchResult> {
  let sourcesFetched = 0;
  let sourcesFailed = 0;
  let totalFiltered = 0;
  const allSignals: LiveSignal[] = [];

  const fetchPromises = researchSources.map(async (source) => {
    try {
      const signals =
        source.category === "community" && source.feedUrl.includes("json")
          ? await fetchRedditSource(source)
          : await fetchRSSSource(source);
      sourcesFetched++;
      return signals;
    } catch {
      sourcesFailed++;
      return [];
    }
  });

  const results = await Promise.allSettled(fetchPromises);
  for (const result of results) {
    if (result.status === "fulfilled") {
      allSignals.push(...result.value);
    } else {
      sourcesFailed++;
    }
  }

  // Sort by relevance, then recency
  allSignals.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return (
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  });

  // Deduplicate by similar titles
  const seen = new Set<string>();
  const deduped = allSignals.filter((s) => {
    const key = s.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 50);
    if (seen.has(key)) {
      totalFiltered++;
      return false;
    }
    seen.add(key);
    return true;
  });

  return {
    signals: deduped.slice(0, 30), // max 30 signals
    sourcesFetched,
    sourcesFailed,
    totalFiltered,
  };
}
