// ─── Mission Executor ────────────────────────────────────────
// Turns a reinforcement (or core) task into a finished deliverable
// via Claude. For community/answer-style tasks, an optional Tavily
// web-search step finds the real target URL (Reddit thread, LinkedIn
// post, Stack Overflow question, etc.) so the deliverable can be
// posted to a specific, existing destination.

import Anthropic from "@anthropic-ai/sdk";
import { generateDailyPlan } from "./generateDailyPlan";
import type { PlannedMission } from "./generateDailyPlan";
import {
  resolveSearchStrategy,
  runTargetSearch,
  targetConstraintsFor,
} from "./missionTargetSearch";
import type { TavilyResult } from "./tavilySearch";

const ANTHROPIC_MODEL = "claude-sonnet-4-6";

// ─── Types ───────────────────────────────────────────────────

export interface ExecuteInput {
  draftKey: string;
  date: string;
  mission: {
    title: string;
    channel: string;
    category: string;
    categoryId?: string;
    reinforcementTopicId?: string;
    platform: string;
    theme: string;
    contentAngle: string;
    semanticGoal: string;
    estimatedTime: string;
    objective: string;
    loadTier: string;
    taskKind: string;
    isCoreAsset: boolean;
    executionPrompt?: string;
    requiresCoreAsset?: boolean;
  };
}

export interface AlternateTarget {
  url: string;
  why: string;
}

export interface ExecuteResult {
  success: boolean;
  content?: string;
  model?: string;
  targetUrl?: string | null;
  alternates?: AlternateTarget[];
  searchQuery?: string | null;
  searchError?: string | null;
  error?: string;
}

// ─── Prompts ─────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an execution assistant for an AI-visibility consultancy that operates on a "one core authority asset per week + reinforcement" model.

Your job: take a single reinforcement (or maintenance) task and produce the FINISHED, ready-to-use deliverable. Not advice. Not an outline. The actual thing the user will publish or do.

Operating rules:
- Match the format precisely to the channel. LinkedIn post = LinkedIn post (hook, body, takeaway). Reddit answer = Reddit-flavored markdown answer. YouTube clip = spoken script with timecodes. Internal-link pass = a concrete checklist with specific page-to-page suggestions. Pitch = an actual email.
- Voice: plain, specific, technically credible. No hype. No "in today's fast-paced world". No emoji unless the channel demands it.
- Substantive over generic. Concrete examples beat abstract framing.
- When the task references "this week's core asset", reinforce it directly — quote it, link conceptually back to it, repeat its key terms.
- For community/forum/Reddit tasks: educational and non-promotional. No Interon plug unless explicitly invited.
- Length: respect the estimated time. A 10-min task gets a 10-min deliverable.
- When a deliverable has multiple parts (e.g. a carousel = 6 slides), label them clearly (Slide 1, Slide 2, ...).
- For checklists, use - bullets. For scripts, use [00:00] timecodes. For pitches, include subject line.

Audience: SEO, GEO, AI-search-visibility, and technical-leadership readers. Assume intelligence; do not over-explain.

OUTPUT FORMAT — IMPORTANT:
You must respond using these exact tags. The tags are parsed mechanically; any text outside the tags is discarded.

When SEARCH RESULTS were provided for this task, you MUST pick the single best matching target from the search results and output:
<target_url>https://... (must be a real URL from the search results, not invented)</target_url>
<target_why>One sentence explaining why this target is the best match.</target_why>
<alternates>
- https://url-of-second-best — one-line reason
- https://url-of-third-best — one-line reason
</alternates>
<deliverable>
The finished deliverable, formatted for direct copy-paste. No preamble, no trailing notes.
</deliverable>

When NO search results were provided (authoring-only task), output ONLY:
<deliverable>
The finished deliverable, formatted for direct copy-paste. No preamble, no trailing notes.
</deliverable>

If the search results returned NOTHING useful for the task (all irrelevant or expired), output:
<target_url>NONE</target_url>
<target_why>No suitably relevant target was found in the search results.</target_why>
<deliverable>
The finished deliverable, written generically so the user can post it once they manually find a fitting thread.
</deliverable>`;

function buildUserPrompt(
  input: ExecuteInput,
  coreAsset: PlannedMission | null,
  searchResults: TavilyResult[] | null,
  searchRationale: string | null
): string {
  const m = input.mission;

  const coreBlock = m.requiresCoreAsset && coreAsset
    ? `
THIS WEEK'S CORE AUTHORITY ASSET (reinforce this):
- Title: ${coreAsset.title}
- Theme: ${coreAsset.theme.name}
- Channel: ${coreAsset.channel}
- Objective: ${coreAsset.objective}
- Semantic goal: ${coreAsset.semanticGoal}
- Content angle: ${coreAsset.contentAngle}
`
    : m.requiresCoreAsset
      ? "\n[Note: this task references a core asset, but none was found for the current week. Produce a generic reinforcement on the same theme instead.]\n"
      : "";

  const constraints = targetConstraintsFor(input.mission.categoryId);
  const constraintsBlock = constraints ? `\n${constraints}\n` : "";

  const searchBlock = searchResults && searchResults.length > 0
    ? `${constraintsBlock}
SEARCH RESULTS (real URLs — apply the constraints above, then pick the single best target and use it verbatim):
Strategy: ${searchRationale ?? "Find a real target URL for this task."}

${searchResults
  .map(
    (r, i) =>
      `[${i + 1}] ${r.title}
URL: ${r.url}
${r.publishedDate ? `Published: ${r.publishedDate}\n` : ""}Snippet: ${r.content.slice(0, 400)}`
  )
  .join("\n\n")}

If NONE of these results satisfy the target constraints (wrong URL pattern, locked/closed, archived, too old, marketing/blog rather than question), output <target_url>NONE</target_url> with <target_why> explaining what was wrong, and still produce a generic <deliverable> the user can use once they manually find a suitable thread.
`
    : searchResults && searchResults.length === 0
      ? "\n[Search ran but returned no results. Output <target_url>NONE</target_url> and write a generic deliverable.]\n"
      : "";

  return `TASK:
${m.title}

EXECUTION PROMPT (what to do):
${m.executionPrompt ?? m.objective}

CONTEXT:
- Channel: ${m.channel}
- Platform: ${m.platform}
- Format / category: ${m.category}
- Theme: ${m.theme}
- Content angle: ${m.contentAngle}
- Semantic goal: ${m.semanticGoal}
- Cognitive load: ${m.loadTier}
- Task kind: ${m.taskKind}
- Estimated time: ${m.estimatedTime}
${coreBlock}${searchBlock}
Produce the finished deliverable now. Use the exact output tags described in the system prompt.`;
}

// ─── Executor ────────────────────────────────────────────────

export async function executeMission(input: ExecuteInput): Promise<ExecuteResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-anthropic-api-key-here") {
    return { success: false, error: "ANTHROPIC_API_KEY is not configured" };
  }

  // 1. Resolve the week's core asset if the task reinforces one.
  let coreAsset: PlannedMission | null = null;
  if (input.mission.requiresCoreAsset) {
    try {
      const monday = mondayOf(input.date);
      coreAsset = generateDailyPlan(monday).coreAsset;
    } catch {
      coreAsset = null;
    }
  }

  // 2. If this is a community/answer-style task, search for a real target URL.
  const strategy = resolveSearchStrategy({
    title: input.mission.title,
    theme: input.mission.theme,
    semanticGoal: input.mission.semanticGoal,
    contentAngle: input.mission.contentAngle,
    channel: input.mission.channel,
    category: input.mission.category,
    categoryId: input.mission.categoryId,
    reinforcementTopicId: input.mission.reinforcementTopicId,
    executionPrompt: input.mission.executionPrompt,
  });

  let searchResults: TavilyResult[] | null = null;
  let searchError: string | null = null;
  let searchQuery: string | null = null;
  if (strategy) {
    searchQuery = strategy.query;
    const { results, error } = await runTargetSearch(strategy);
    if (error) {
      searchError = error;
      searchResults = []; // tell the model no results found
    } else {
      searchResults = results;
    }
  }

  // 3. Generate the deliverable with Claude.
  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildUserPrompt(
            input,
            coreAsset,
            searchResults,
            strategy?.rationale ?? null
          ),
        },
      ],
    });

    const raw = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (!raw) {
      return { success: false, error: "Empty response from model" };
    }

    const parsed = parseTaggedOutput(raw);
    if (!parsed.deliverable) {
      // Fall back to raw output if the model didn't honour the tags.
      return {
        success: true,
        content: raw,
        model: ANTHROPIC_MODEL,
        targetUrl: null,
        alternates: [],
        searchQuery,
        searchError,
      };
    }

    return {
      success: true,
      content: parsed.deliverable,
      model: ANTHROPIC_MODEL,
      targetUrl:
        parsed.targetUrl && parsed.targetUrl !== "NONE" ? parsed.targetUrl : null,
      alternates: parsed.alternates,
      searchQuery,
      searchError,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message, searchQuery, searchError };
  }
}

// ─── Output parsing ──────────────────────────────────────────

interface ParsedOutput {
  targetUrl?: string;
  targetWhy?: string;
  alternates: AlternateTarget[];
  deliverable?: string;
}

function parseTaggedOutput(raw: string): ParsedOutput {
  const out: ParsedOutput = { alternates: [] };

  const url = matchTag(raw, "target_url");
  if (url) out.targetUrl = url.trim();

  const why = matchTag(raw, "target_why");
  if (why) out.targetWhy = why.trim();

  const altBlock = matchTag(raw, "alternates");
  if (altBlock) {
    out.alternates = altBlock
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("-") || line.startsWith("*"))
      .map((line) => {
        const stripped = line.replace(/^[-*]\s*/, "");
        const [urlPart, ...rest] = stripped.split(/—|–|--|\s-\s/);
        const u = (urlPart ?? "").trim();
        const w = rest.join(" - ").trim();
        return u ? { url: u, why: w } : null;
      })
      .filter((x): x is AlternateTarget => x !== null);
  }

  const deliv = matchTag(raw, "deliverable");
  if (deliv) out.deliverable = deliv.trim();

  return out;
}

function matchTag(raw: string, tag: string): string | null {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i");
  const m = raw.match(re);
  return m ? m[1] : null;
}

// ─── Helpers ─────────────────────────────────────────────────

function mondayOf(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const offset = (day + 6) % 7;
  d.setDate(d.getDate() - offset);
  return d.toISOString().split("T")[0];
}
