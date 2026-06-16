// ─── Reddit Discovery ────────────────────────────────────────
// Surfaces fresh Reddit posts in pillar-aligned subreddits that
// Interon could meaningfully comment on. Uses Reddit's app-only
// OAuth (client_credentials) — no user account, no posting.
//
// Posting comments is NOT done from here. Auto-post happens in a
// separate route once OAuth user-flow is added (not in MVP).

export interface RedditCandidate {
  url: string;
  postTitle: string;
  postSnippet: string;
  postAuthor: string;
  postMetric: string;
  pillar: string;
  topicKeyword: string;
}

// Pillar → subreddits to scan. Conservative set; expand later.
const PILLAR_SUBREDDITS: Record<string, string[]> = {
  "website-health": ["webdev", "Wordpress", "smallbusiness"],
  "ai-visibility-geo": ["SEO", "bigseo", "TechSEO"],
  "agentic-automation": ["automation", "n8n", "Zapier", "AI_Agents"],
  "business-systems": ["smallbusiness", "EntrepreneurRideAlong"],
  "trust-security-risk": ["webdev", "sysadmin"],
  "practical-ai-owners": ["smallbusiness", "Entrepreneur"],
  "digital-authority": ["marketing", "content_marketing"],
};

const MAX_POSTS_PER_SUB = 3;
const MAX_AGE_DAYS = 7;
const MIN_SCORE = 1;
const SKIP_AUTHORS = new Set(["AutoModerator", "[deleted]"]);

// ─── App-only token ─────────────────────────────────────────

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAppToken(): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const userAgent = process.env.REDDIT_USER_AGENT;

  if (!clientId || !clientSecret || !userAgent) return null;

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": userAgent,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`Reddit token request failed: HTTP ${res.status}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

// ─── Subreddit listing ──────────────────────────────────────

interface RedditListingChild {
  data: {
    title: string;
    selftext: string;
    author: string;
    permalink: string;
    ups: number;
    num_comments: number;
    created_utc: number;
    is_self: boolean;
    over_18: boolean;
    stickied: boolean;
  };
}

interface RedditListing {
  data: { children: RedditListingChild[] };
}

async function fetchSubredditNew(
  subreddit: string,
  token: string,
  userAgent: string
): Promise<RedditListingChild[]> {
  const url = `https://oauth.reddit.com/r/${subreddit}/new?limit=25`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": userAgent,
    },
  });
  if (!res.ok) {
    throw new Error(`Reddit listing failed for r/${subreddit}: HTTP ${res.status}`);
  }
  const data = (await res.json()) as RedditListing;
  return data.data.children;
}

function formatRelativeTime(unixSeconds: number): string {
  const seconds = Math.floor(Date.now() / 1000) - unixSeconds;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ─── Main entry ─────────────────────────────────────────────

export async function discoverRedditPosts(
  pillars?: string[]
): Promise<{ available: boolean; candidates: RedditCandidate[]; error?: string }> {
  const userAgent = process.env.REDDIT_USER_AGENT;
  const token = await getAppToken().catch((err) => {
    return Promise.reject(err);
  });

  if (!token || !userAgent) {
    return {
      available: false,
      candidates: [],
      error:
        "Reddit credentials missing. Set REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT to enable Reddit discovery.",
    };
  }

  const wanted = pillars && pillars.length > 0 ? pillars : Object.keys(PILLAR_SUBREDDITS);
  const candidates: RedditCandidate[] = [];
  const maxAgeUnix = Math.floor(Date.now() / 1000) - MAX_AGE_DAYS * 86400;

  for (const pillar of wanted) {
    const subs = PILLAR_SUBREDDITS[pillar];
    if (!subs) continue;
    for (const sub of subs) {
      let children: RedditListingChild[];
      try {
        children = await fetchSubredditNew(sub, token, userAgent);
      } catch {
        continue;
      }
      const filtered = children
        .filter((c) => {
          const d = c.data;
          if (!d.is_self) return false;
          if (d.stickied || d.over_18) return false;
          if (SKIP_AUTHORS.has(d.author)) return false;
          if (d.ups < MIN_SCORE) return false;
          if (d.created_utc < maxAgeUnix) return false;
          return true;
        })
        .slice(0, MAX_POSTS_PER_SUB);

      for (const c of filtered) {
        const d = c.data;
        candidates.push({
          url: `https://www.reddit.com${d.permalink}`,
          postTitle: d.title,
          postSnippet: (d.selftext ?? "").slice(0, 400),
          postAuthor: `u/${d.author}`,
          postMetric: `${d.ups} upvotes · ${d.num_comments} comments · ${formatRelativeTime(d.created_utc)}`,
          pillar,
          topicKeyword: `r/${sub}`,
        });
      }
    }
  }

  return { available: true, candidates };
}
