// ─── Mission Target Search Strategy ──────────────────────────
// Decides whether a mission requires a real target URL (Reddit
// thread, LinkedIn post, Stack Overflow question, etc.) and, if so,
// produces the Tavily query parameters to find it.

import { tavilySearch } from "./tavilySearch";
import type { TavilyResult } from "./tavilySearch";

export interface TargetSearchStrategy {
  query: string;
  includeDomains?: string[];
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
      query: buildQuery(m, "Umbraco SEO schema content modelling question"),
      includeDomains: ["our.umbraco.com", "umbraco.com"],
      timeRange: "month",
      rationale: "Find an unanswered Our-Umbraco forum question to answer.",
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
    timeRange: strategy.timeRange,
    topic: strategy.topic,
    maxResults: 6,
    searchDepth: "advanced",
  });
  if (!r.success) return { results: [], error: r.error };
  return { results: r.results };
}
