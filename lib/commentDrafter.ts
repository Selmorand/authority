// ─── Comment Drafter ────────────────────────────────────────
// Writes a 60-120 word reply in Interon's voice for a post on
// LinkedIn, Facebook, TikTok, Reddit, Discord, or YouTube.
//
// Hard rules: no pitching, no "great post", anchored to one of
// the 8 pillars, never names a non-existent Interon audit.

import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./prompts";

const MODEL = "claude-sonnet-4-6";

export interface DraftCommentInput {
  platform: string;
  url?: string;
  postTitle?: string;
  postSnippet?: string;
  postAuthor?: string;
  pillar?: string;
}

export interface DraftCommentResult {
  success: boolean;
  draftComment?: string;
  pillar?: string;
  error?: string;
}

const PLATFORM_STYLE: Record<string, string> = {
  linkedin:
    "Professional tone, 80-120 words. No emojis. Plain text. Lead with the substantive point, not a compliment. End with one question that invites continued discussion.",
  facebook:
    "Conversational tone, 60-100 words. One emoji max, only if it fits naturally. Plain text.",
  tiktok:
    "Casual, short, 40-80 words. Up to one emoji. No links (TikTok strips them in comments).",
  reddit:
    "Reddit-native tone, 80-150 words. NO sales/marketing voice. Reads like a peer in the subreddit. Use plain text, no headers. If linking somewhere, it must be informational, not interon.co.za.",
  discord:
    "Casual, 50-100 words. Conversational. Plain text. Match the channel's vibe based on the post you've been given.",
  youtube:
    "60-100 words. Substantive comment that adds to the video's point. No 'great video' opener. End with a concrete observation or question.",
};

function styleFor(platform: string): string {
  return PLATFORM_STYLE[platform.toLowerCase()] ?? PLATFORM_STYLE.reddit;
}

export async function draftComment(input: DraftCommentInput): Promise<DraftCommentResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { success: false, error: "ANTHROPIC_API_KEY not set" };
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const platform = input.platform || "reddit";
  const style = styleFor(platform);

  const userPrompt = `You are drafting a comment that George (founder of Interon) will post on ${platform}.

POST CONTEXT:
- Platform: ${platform}
- URL: ${input.url ?? "(not provided)"}
- Author: ${input.postAuthor ?? "(unknown)"}
- Title: ${input.postTitle ?? "(no title — short-form platform)"}
- Body / snippet:
${input.postSnippet ?? "(not provided — write a comment based on what you can infer from title/URL)"}

PILLAR (if known): ${input.pillar ?? "(infer the most relevant pillar from the post)"}

WRITING STYLE FOR THIS PLATFORM:
${style}

HARD RULES (re-stated):
- Never lead with "Great post" / "Love this" / "Couldn't agree more". Lead with a substantive point.
- Never pitch Interon. No links to interon.co.za. No mention of buying anything.
- Never mention "Security Audit", "AI Readiness Audit", or "GEO Audit" as Interon products — those are NOT real SKUs. The only real audits are SEO Audit and Site Health Audit (via Tidua), and you should NOT name even those in a comment unless directly asked.
- One concrete, defensible insight is better than three generic ones.
- Sound like a senior practitioner, not a content marketer. No hype words ("game-changer", "cutting-edge", "transform").
- If the post is about something genuinely outside Interon's pillars (e.g. politics, sport, personal life), respond with: SKIP — and one sentence explaining why.

Return JSON only, no markdown fences:
{
  "draftComment": "<the comment text, or empty string if skipping>",
  "pillar": "<the pillar id you anchored to, or empty string if skipping>",
  "skipped": <true|false>,
  "skipReason": "<one sentence, only if skipped=true>"
}`;

  let raw: string;
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });
    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      return { success: false, error: "Claude returned no text block" };
    }
    raw = block.text.trim();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Anthropic call failed";
    return { success: false, error: message };
  }

  // Strip ```json fences if present
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  let parsed: {
    draftComment?: string;
    pillar?: string;
    skipped?: boolean;
    skipReason?: string;
  };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return { success: false, error: `Could not parse Claude response: ${cleaned.slice(0, 200)}` };
  }

  if (parsed.skipped) {
    return {
      success: true,
      draftComment: "",
      pillar: "",
      error: parsed.skipReason ?? "Comment skipped (off-topic)",
    };
  }

  return {
    success: true,
    draftComment: parsed.draftComment ?? "",
    pillar: parsed.pillar ?? input.pillar ?? "",
  };
}
