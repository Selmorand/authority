// ─── Mission Target Search Strategy ──────────────────────────
// Decides whether a mission requires a real target URL (Reddit
// thread, LinkedIn post, Stack Overflow question, etc.) and, if so,
// produces the Tavily query parameters to find it.

import { tavilySearch } from "./tavilySearch";
import type { TavilyResult } from "./tavilySearch";

export interface TargetSearchStrategy {
  query: string;
  includeDomains?: string[];
  excludeDomains?: string[];
  timeRange?: "day" | "week" | "month" | "year";
  topic?: "general" | "news";
  rationale: string;
}

export interface MissionShapeForSearch {
  title: string;
  theme: string;
  semanticGoal: string;
  contentAngle: string;
  channel: string;
  category: string;
  categoryId?: string;
  reinforcementTopicId?: string;
  executionPrompt?: string;
}

// Build a precise query from the mission. The model later judges
// relevance, so we err on the side of specificity over breadth.
function buildQuery(m: MissionShapeForSearch, extra?: string): string {
  const parts = [m.theme, m.semanticGoal, extra].filter(Boolean);
  return parts.join(" ").slice(0, 200);
}

export function resolveSearchStrategy(
  m: MissionShapeForSearch
): TargetSearchStrategy | null {
  const id = m.categoryId ?? "";
  const topicId = m.reinforcementTopicId ?? "";

  // ── Reddit answers ──
  if (id === "reddit-answer") {
    const sub = topicId.includes("seo")
      ? "r/SEO OR r/bigseo"
      : topicId.includes("webdev")
        ? "r/webdev OR r/SEO"
        : topicId.includes("entrepreneur")
          ? "r/entrepreneur OR r/marketing"
          : "r/SEO OR r/bigseo OR r/marketing";
    return {
      query: buildQuery(m, `${sub} question`),
      includeDomains: ["reddit.com"],
      timeRange: "month",
      rationale: "Locate a real Reddit thread to answer.",
    };
  }

  // ── LinkedIn commentary ──
  if (id === "linkedin-commentary") {
    return {
      query: buildQuery(m, "LinkedIn post"),
      includeDomains: ["linkedin.com"],
      timeRange: "week",
      rationale: "Find a recent peer/competitor LinkedIn post to comment on.",
    };
  }

  // ── Our Umbraco forum ──
  if (id === "forum-response") {
    return {
      // our.umbraco.com only — exclude umbraco.com (marketing/blog/docs)
      query: buildQuery(m, "forum question Umbraco SEO schema content modelling"),
      includeDomains: ["our.umbraco.com"],
      excludeDomains: ["umbraco.com"],
      timeRange: "month",
      rationale: "Find an unanswered Our-Umbraco forum thread (not a blog post) to answer.",
    };
  }

  // ── Community contributions (Stack Overflow / GitHub / Slack / dev.to) ──
  if (id === "community-contribution") {
    if (topicId.includes("stackoverflow")) {
      return {
        query: buildQuery(m, "schema JSON-LD structured data question"),
        includeDomains: ["stackoverflow.com"],
        timeRange: "month",
        rationale: "Locate an under-answered Stack Overflow question.",
      };
    }
    if (topicId.includes("github")) {
      return {
        query: buildQuery(m, "Umbraco SEO schema package open issue"),
        includeDomains: ["github.com"],
        timeRange: "month",
        rationale: "Find an Umbraco-ecosystem repo with an open issue worth a PR.",
      };
    }
    // dev.to / slack — authoring or unindexable; no URL needed.
    return null;
  }

  // ── YouTube commentary ── (find a news story worth reacting to)
  if (id === "youtube-commentary") {
    return {
      query: buildQuery(m, "AI search ChatGPT Perplexity Google AI Overview"),
      includeDomains: [
        "searchengineland.com",
        "searchenginejournal.com",
        "techcrunch.com",
        "theverge.com",
        "anthropic.com",
        "openai.com",
      ],
      timeRange: "week",
      topic: "news",
      rationale: "Surface a recent ecosystem development worth a 2-minute reaction.",
    };
  }

  // ── Podcast pitch ──
  if (id === "podcast-pitch") {
    return {
      query: buildQuery(m, "podcast SEO GEO AI search marketing accepting guests"),
      timeRange: "year",
      rationale: "Identify a podcast actively booking guests on this topic.",
    };
  }

  // ── Guest article pitch ──
  if (id === "guest-article-pitch") {
    return {
      query: buildQuery(m, "guest contributor write for us submission guidelines"),
      includeDomains: [
        "searchengineland.com",
        "searchenginejournal.com",
        "ahrefs.com",
        "moz.com",
      ],
      timeRange: "year",
      rationale: "Find an SEO publication's open contributor program.",
    };
  }

  // ── Conference CFP ──
  if (id === "conference-pitch") {
    return {
      query: buildQuery(m, "SEO marketing AI search conference 2026 call for papers"),
      timeRange: "month",
      rationale: "Identify a relevant conference with an open CFP.",
    };
  }

  // ── Research session ──
  if (id === "research-session") {
    return {
      query: buildQuery(m, "AI search visibility this week"),
      timeRange: "week",
      topic: "news",
      rationale: "Capture this week's most significant ecosystem signals.",
    };
  }

  return null;
}

export async function runTargetSearch(
  strategy: TargetSearchStrategy
): Promise<{ results: TavilyResult[]; error?: string }> {
  const r = await tavilySearch({
    query: strategy.query,
    includeDomains: strategy.includeDomains,
    excludeDomains: strategy.excludeDomains,
    timeRange: strategy.timeRange,
    topic: strategy.topic,
    maxResults: 8,
    searchDepth: "advanced",
  });
  if (!r.success) return { results: [], error: r.error };
  return { results: r.results };
}

// ─── Per-category target constraints ─────────────────────────
// Tells the model what makes a URL valid for this task type.
// The model uses these to reject technically-matching results
// where commenting/answering isn't actually possible.

export function targetConstraintsFor(categoryId?: string): string {
  switch (categoryId) {
    case "reddit-answer":
      return `TARGET CONSTRAINTS — STRICT (reject any result that fails any of these):
- URL pattern MUST match: reddit.com/r/{subreddit}/comments/{id}/{slug}
- Reject subreddit overview pages (/r/X/ alone), /top/, /hot/, /new/, /wiki/, /about/, /rules/
- Reject if the title contains [Locked], [Closed], [Archived], [Removed]
- Reject AMAs (auto-locked after ~6 hours), megathreads, weekly help threads
- Reject threads older than 6 months (Reddit auto-locks comments at 6 months)
- Strongly prefer threads from the last 30 days
- The thread must contain a genuine question — not a job posting, self-promo, news share, or rant`;

    case "forum-response":
      return `TARGET CONSTRAINTS — STRICT:
- URL pattern MUST be a forum thread on our.umbraco.com (e.g. /forum/... or a topic page)
- REJECT: any umbraco.com URL (marketing/blog), our.umbraco.com/packages/, /docs/, /releases/, /jobs/, /members/, /blog/
- Replies must be open. Reject locked or "Solved + closed" threads where no further answer adds value
- Prefer threads from the last 30 days
- Topic must be a real question, not an announcement or release note`;

    case "community-contribution":
      return `TARGET CONSTRAINTS — STRICT:
- For Stack Overflow: URL must match stackoverflow.com/questions/{id}/{slug}. Reject /tags/, /users/, /search, archived/closed questions
- For GitHub: URL must be /issues/{id} or /pull/{id} on a relevant Umbraco-ecosystem repo. Reject /tree/, /blob/, /releases/
- Question/issue must be OPEN (not closed, not duplicate, not already answered exhaustively)
- Prefer items from the last 60 days`;

    case "linkedin-commentary":
      return `TARGET CONSTRAINTS — STRICT:
- URL must be a public LinkedIn post: linkedin.com/posts/... or linkedin.com/feed/update/...
- Reject: personal profile pages (/in/), company pages (/company/), LinkedIn search results
- Reject /pulse/ articles unless the post itself is the comment surface
- Prefer posts from the last 14 days
- Skip posts where comments are clearly restricted to connections only (heuristic: corporate accounts, sensitive topics)`;

    case "youtube-commentary":
      return `TARGET CONSTRAINTS:
- This finds a NEWS STORY worth a 2-minute reaction (not a YouTube video to comment on)
- URL should be a news article from the last 7 days from an authoritative AI/SEO ecosystem source
- Reject opinion blogs without primary reporting, sponsored content, generic listicles`;

    case "podcast-pitch":
      return `TARGET CONSTRAINTS:
- URL must be a podcast show's home page (website, Apple Podcasts, or Spotify show URL)
- Show must be actively publishing (at least one episode in the last 60 days)
- Reject single-episode pages, defunct shows`;

    case "guest-article-pitch":
      return `TARGET CONSTRAINTS:
- URL must be a "write for us" / "contribute" / "submission guidelines" page
- Submissions must currently be open (not "we're not accepting submissions at this time")`;

    case "conference-pitch":
      return `TARGET CONSTRAINTS:
- URL must be a conference CFP / speakers / call-for-papers page
- CFP deadline must NOT have passed yet
- Reject already-concluded conferences and CFPs that closed last year`;

    case "research-session":
      return `TARGET CONSTRAINTS:
- Multiple recent sources acceptable — return up to 3 worth tracking
- Prefer items from the last 7 days
- Focus on ChatGPT, Perplexity, Google AI Overview, Anthropic, OpenAI ecosystem changes`;

    default:
      return "";
  }
}
