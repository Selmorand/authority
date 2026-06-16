// ─── YouTube Discovery ───────────────────────────────────────
// Searches YouTube for recent videos on pillar-aligned topics
// where a thoughtful comment is likely to land well. Uses the
// YouTube Data API v3 (free quota ~10k units/day; each search
// query costs 100 units).
//
// Posting comments is NOT done here — that requires OAuth with
// the youtube.force-ssl scope (not in MVP).

export interface YouTubeCandidate {
  url: string;
  postTitle: string;
  postSnippet: string;
  postAuthor: string;
  postMetric: string;
  pillar: string;
  topicKeyword: string;
}

// Pillar → search keywords. Each keyword burns 100 quota units.
// Conservative set so a daily scan stays well under 10k/day.
const PILLAR_KEYWORDS: Record<string, string[]> = {
  "website-health": ["website maintenance small business", "outdated website rebuild"],
  "ai-visibility-geo": ["AI search optimization", "GEO generative engine optimization"],
  "agentic-automation": ["n8n automation tutorial", "small business AI automation"],
  "business-systems": ["small business tech stack", "CRM integration small business"],
  "trust-security-risk": ["small business website security", "outdated CMS risk"],
  "practical-ai-owners": ["AI tools for small business owners"],
  "digital-authority": ["B2B thought leadership content"],
};

const MAX_RESULTS_PER_KEYWORD = 3;
const MAX_AGE_DAYS = 14;

interface YouTubeSearchItem {
  id: { videoId?: string };
  snippet: {
    publishedAt: string;
    channelTitle: string;
    title: string;
    description: string;
  };
}

interface YouTubeSearchResponse {
  items?: YouTubeSearchItem[];
  error?: { message?: string };
}

interface YouTubeVideoItem {
  id: string;
  statistics?: {
    viewCount?: string;
    commentCount?: string;
  };
}

interface YouTubeVideosResponse {
  items?: YouTubeVideoItem[];
}

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

async function searchYouTube(
  keyword: string,
  apiKey: string,
  publishedAfter: string
): Promise<YouTubeSearchItem[]> {
  const params = new URLSearchParams({
    part: "snippet",
    q: keyword,
    type: "video",
    order: "date",
    maxResults: String(MAX_RESULTS_PER_KEYWORD),
    publishedAfter,
    key: apiKey,
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as YouTubeSearchResponse;
    throw new Error(errBody.error?.message ?? `YouTube search failed: HTTP ${res.status}`);
  }
  const data = (await res.json()) as YouTubeSearchResponse;
  return data.items ?? [];
}

async function fetchVideoStats(
  videoIds: string[],
  apiKey: string
): Promise<Map<string, { views: string; comments: string }>> {
  const out = new Map<string, { views: string; comments: string }>();
  if (videoIds.length === 0) return out;
  const params = new URLSearchParams({
    part: "statistics",
    id: videoIds.join(","),
    key: apiKey,
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`);
  if (!res.ok) return out;
  const data = (await res.json()) as YouTubeVideosResponse;
  for (const item of data.items ?? []) {
    out.set(item.id, {
      views: item.statistics?.viewCount ?? "—",
      comments: item.statistics?.commentCount ?? "—",
    });
  }
  return out;
}

export async function discoverYouTubePosts(
  pillars?: string[]
): Promise<{ available: boolean; candidates: YouTubeCandidate[]; error?: string }> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return {
      available: false,
      candidates: [],
      error:
        "YouTube credentials missing. Set YOUTUBE_API_KEY to enable YouTube discovery.",
    };
  }

  const wanted = pillars && pillars.length > 0 ? pillars : Object.keys(PILLAR_KEYWORDS);
  const publishedAfter = new Date(Date.now() - MAX_AGE_DAYS * 86400 * 1000).toISOString();
  const collected: { item: YouTubeSearchItem; pillar: string; keyword: string }[] = [];

  for (const pillar of wanted) {
    const keywords = PILLAR_KEYWORDS[pillar];
    if (!keywords) continue;
    for (const keyword of keywords) {
      try {
        const items = await searchYouTube(keyword, apiKey, publishedAfter);
        for (const item of items) {
          if (item.id.videoId) collected.push({ item, pillar, keyword });
        }
      } catch {
        // skip this keyword on failure; quota errors stop the rest from happening anyway
      }
    }
  }

  const videoIds = collected.map((c) => c.item.id.videoId).filter((v): v is string => Boolean(v));
  const stats = await fetchVideoStats(videoIds, apiKey).catch(() => new Map());

  const candidates: YouTubeCandidate[] = collected.map(({ item, pillar, keyword }) => {
    const id = item.id.videoId as string;
    const s = stats.get(id);
    return {
      url: `https://www.youtube.com/watch?v=${id}`,
      postTitle: item.snippet.title,
      postSnippet: (item.snippet.description ?? "").slice(0, 400),
      postAuthor: item.snippet.channelTitle,
      postMetric: s
        ? `${s.views} views · ${s.comments} comments · ${formatRelativeTime(item.snippet.publishedAt)}`
        : formatRelativeTime(item.snippet.publishedAt),
      pillar,
      topicKeyword: keyword,
    };
  });

  return { available: true, candidates };
}
