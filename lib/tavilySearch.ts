// ─── Tavily Search ───────────────────────────────────────────
// Minimal client for Tavily's REST search API. Used by the mission
// executor to find real target URLs (Reddit threads, LinkedIn posts,
// Stack Overflow questions, etc.) for community-answer tasks.

const TAVILY_ENDPOINT = "https://api.tavily.com/search";

export interface TavilySearchOptions {
  query: string;
  includeDomains?: string[];
  excludeDomains?: string[];
  maxResults?: number;
  searchDepth?: "basic" | "advanced";
  topic?: "general" | "news";
  timeRange?: "day" | "week" | "month" | "year";
}

export interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string;
}

export interface TavilySearchResult {
  success: boolean;
  query: string;
  results: TavilyResult[];
  error?: string;
}

export async function tavilySearch(
  options: TavilySearchOptions
): Promise<TavilySearchResult> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      query: options.query,
      results: [],
      error: "TAVILY_API_KEY is not configured",
    };
  }

  try {
    const response = await fetch(TAVILY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query: options.query,
        search_depth: options.searchDepth ?? "advanced",
        topic: options.topic ?? "general",
        max_results: options.maxResults ?? 5,
        include_domains: options.includeDomains ?? undefined,
        exclude_domains: options.excludeDomains ?? undefined,
        time_range: options.timeRange ?? undefined,
        include_answer: false,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return {
        success: false,
        query: options.query,
        results: [],
        error: `Tavily ${response.status}: ${text || response.statusText}`,
      };
    }

    const data = (await response.json()) as {
      results?: Array<{
        title?: string;
        url?: string;
        content?: string;
        score?: number;
        published_date?: string;
      }>;
    };

    const results: TavilyResult[] = (data.results ?? []).map((r) => ({
      title: r.title ?? "",
      url: r.url ?? "",
      content: r.content ?? "",
      score: typeof r.score === "number" ? r.score : 0,
      publishedDate: r.published_date,
    }));

    return { success: true, query: options.query, results };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, query: options.query, results: [], error: message };
  }
}
