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
import { pollUntilDone, submitMovie } from "./json2video";
import { renderTemplate } from "./videoTemplates";
import { pickBackgroundForDate } from "@/data/videoBackgroundPresets";

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
  videoUrl?: string | null;
  videoProject?: string | null;
  videoError?: string | null;
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

  // Video-caption-derivative branches into the JSON2Video pipeline.
  if (input.mission.categoryId === "video-caption-derivative") {
    return executeVideoCaption(input, coreAsset, apiKey);
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

// ─── Video Caption Derivative (JSON2Video) ──────────────────
// Picks a template based on the core asset's theme, picks a
// background from the rotation pool by date, extracts captions
// (template-aware so e.g. Stat Reveal gets `||`-delimited lines),
// submits to JSON2Video, returns the MP4 URL.

const THEME_TEMPLATE_MAP: Record<string, string> = {
  "original-research": "stat-reveal",
  "founder-pov": "quote-block",
  "enterprise-architecture": "numbered-list",
  "umbraco-craft": "numbered-list",
  "ai-workflow": "caption-stack",
  "ai-readiness": "term-definition",
  // Legacy AI-readiness-cluster themes fall through to caption-stack
};

function templateForTheme(themeId: string | undefined): string {
  if (themeId && THEME_TEMPLATE_MAP[themeId]) return THEME_TEMPLATE_MAP[themeId];
  return "caption-stack";
}

const CAPTION_BASE_RULES = `You write short-form video captions for an AI-visibility consultancy.

Voice: George Whiteside, founder of Interon. Direct, technical, opinionated. No marketing fluff. No emoji. Concrete over generic.

Your output is rendered as a 15-25 second vertical short. Sequence the lines so the viewer wants to keep watching: hook first, payoff last.`;

const TEMPLATE_FORMAT_INSTRUCTIONS: Record<string, string> = {
  "caption-stack":
    "Produce 5-7 single-line captions. Each line ≤ 50 chars. One thought per line. Final line is the takeaway/action.",
  "stat-reveal":
    "Produce 5-7 lines, each in the format `STAT||LABEL` using the literal `||` delimiter. STAT is a short number, percent, or word (≤ 6 chars: '87%', '300', 'BELOW 40'). LABEL is the supporting context (≤ 38 chars). Pick the most striking quantitative findings from the source.",
  "quote-block":
    "Produce ONE substantive quote-worthy line (≤ 90 chars). It should be opinionated, defensible, and quotable. The headline field will be the attribution — set it to `— George Whiteside, Interon`.",
  "question-answer":
    "Produce 4-6 lines, each in the format `Question?||Answer.` using the `||` delimiter. Q (≤ 50 chars) is a short question; A (≤ 60 chars) is a sharp answer. Each line is a self-contained Q&A pair.",
  "numbered-list":
    "Produce 4-7 single-line steps in logical order. Each ≤ 60 chars. Imperative voice ('Verify X', 'Audit Y'). The system numbers them automatically — don't prefix numbers yourself.",
  "before-after":
    "Produce 3-5 lines, each in the format `Before state||After state` using the `||` delimiter. Each side ≤ 60 chars. Show the gap your work closes — be specific about the change.",
  "hook-reveal":
    "Produce 3-5 single-line phrases that build suspense, with the LAST line being the payoff/reveal. Earlier lines (≤ 30 chars) tease; final line (≤ 50 chars) lands the answer. Example: 'Most websites' → 'fail one test' → 'AI can't read them' → 'FIX: schema markup'.",
  "term-definition":
    "Produce 4-6 lines, each in the format `TERM||plain-english definition` using the `||` delimiter. TERM is the technical term in caps (≤ 24 chars). DEFINITION explains it without jargon (≤ 100 chars).",
  "bold-statement":
    "Produce 3-5 short single-line statements (≤ 35 chars each). Each line stands alone as a maximum-impact moment. No headline needed — set headline to empty.",
};

const HEADLINE_INSTRUCTIONS: Record<string, string> = {
  "quote-block": "Use the headline field for the attribution: `— George Whiteside, Interon`.",
  "bold-statement": "Leave the headline empty.",
};
const DEFAULT_HEADLINE_INSTRUCTION =
  'Set headline to a short brand stamp (e.g. "Interon — AI Readiness").';

function captionSystemPromptFor(templateId: string): string {
  const format =
    TEMPLATE_FORMAT_INSTRUCTIONS[templateId] ?? TEMPLATE_FORMAT_INSTRUCTIONS["caption-stack"];
  const headlineInstr =
    HEADLINE_INSTRUCTIONS[templateId] ?? DEFAULT_HEADLINE_INSTRUCTION;

  return `${CAPTION_BASE_RULES}

TEMPLATE FOR THIS RENDER: ${templateId}

FORMAT REQUIREMENT:
${format}

HEADLINE:
${headlineInstr}

OUTPUT FORMAT — IMPORTANT:
Respond using exactly these tags. Anything outside the tags is discarded.

<headline>...short text or empty...</headline>
<lines>
- First line (formatted as required above)
- Second line
- ...
</lines>`;
}

interface CaptionExtraction {
  headline: string;
  lines: string[];
}

async function extractCaptionLines(
  client: Anthropic,
  templateId: string,
  source: string,
  topic: string
): Promise<CaptionExtraction> {
  const response = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 700,
    system: captionSystemPromptFor(templateId),
    messages: [
      {
        role: "user",
        content: `TOPIC FRAMING:
${topic}

SOURCE MATERIAL TO COMPRESS INTO CAPTIONS:
${source.slice(0, 4000)}

Produce the caption sequence for template "${templateId}" now.`,
      },
    ],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  const headline = (matchTag(text, "headline") ?? "").trim();
  const linesBlock = matchTag(text, "lines") ?? "";
  const lines = linesBlock
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("-") || l.startsWith("*"))
    .map((l) => l.replace(/^[-*]\s*/, "").trim())
    .filter((l) => l.length > 0)
    .slice(0, 7);

  return { headline, lines };
}

async function executeVideoCaption(
  input: ExecuteInput,
  coreAsset: PlannedMission | null,
  apiKey: string
): Promise<ExecuteResult> {
  if (!process.env.JSON2VIDEO_API_KEY) {
    return {
      success: false,
      error: "JSON2VIDEO_API_KEY is not configured — caption-clip rendering disabled.",
    };
  }

  // Source material: prefer the week's core asset draft (if it exists),
  // otherwise fall back to the task's own framing.
  const m = input.mission;
  const source = coreAsset
    ? `${coreAsset.title}\n\nObjective: ${coreAsset.objective}\nSemantic goal: ${coreAsset.semanticGoal}\nContent angle: ${coreAsset.contentAngle}`
    : `${m.title}\n\nObjective: ${m.objective}\nSemantic goal: ${m.semanticGoal}`;

  // Theme drives the template choice. Prefer the core asset's theme
  // (since the captions are derived from its content); fall back to
  // the reinforcement task's own theme.
  const sourceThemeId = coreAsset?.theme.id ?? m.theme;
  const templateId = templateForTheme(sourceThemeId);

  // Date-driven background rotation. Salt with the mission category so
  // two caption tasks on the same day still pick different backgrounds.
  const background = pickBackgroundForDate(input.date, m.categoryId ?? m.category);
  const backgroundImageUrl = background?.url;

  const client = new Anthropic({ apiKey });

  let extraction: CaptionExtraction;
  try {
    extraction = await extractCaptionLines(
      client,
      templateId,
      source,
      m.executionPrompt ?? m.objective
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Caption extraction failed";
    return { success: false, error: message };
  }

  if (extraction.lines.length === 0) {
    return {
      success: false,
      error: "Claude produced no usable caption lines.",
    };
  }

  // Resolve relative background URLs to absolute (so JSON2Video can fetch them).
  // The auto-render path has no request to derive an origin from, so it relies
  // on APP_PUBLIC_URL. Fail fast if we have a relative path and no way to absolutize it —
  // otherwise JSON2Video errors with "Source URL is required" and burns a poll cycle.
  let resolvedBgUrl = backgroundImageUrl;
  if (resolvedBgUrl && resolvedBgUrl.startsWith("/")) {
    const publicBase = process.env.APP_PUBLIC_URL?.replace(/\/$/, "");
    if (!publicBase) {
      return {
        success: false,
        error:
          `Background image is a relative path (${resolvedBgUrl}) but APP_PUBLIC_URL is not set. ` +
          `Set APP_PUBLIC_URL=https://<your-deployed-domain> in the environment so JSON2Video can fetch committed backgrounds. ` +
          `(Local dev cannot use committed backgrounds because JSON2Video cannot reach localhost.)`,
        videoError: "APP_PUBLIC_URL missing — relative background path could not be resolved",
      };
    }
    resolvedBgUrl = `${publicBase}${resolvedBgUrl}`;
  }

  // Render via the template loader (matches the look the test panel produces)
  let spec;
  try {
    spec = await renderTemplate(templateId, {
      lines: extraction.lines,
      headline: extraction.headline || undefined,
      backgroundImageUrl: resolvedBgUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Template render failed";
    return { success: false, error: `Template "${templateId}" failed: ${message}` };
  }

  const submit = await submitMovie(spec);
  if (!submit.success || !submit.project) {
    return {
      success: false,
      error: submit.error ?? "JSON2Video did not accept the render request.",
      videoError: submit.error ?? null,
    };
  }

  // Poll until done (or 4-minute timeout).
  const final = await pollUntilDone(submit.project, {
    intervalMs: 4000,
    timeoutMs: 240_000,
  });

  // Build a deliverable the user can copy + a clear note about the video.
  const captionBody = extraction.lines.map((l, i) => `${i + 1}. ${l}`).join("\n");
  const headlineLine = extraction.headline
    ? `Headline: ${extraction.headline}`
    : "Headline: (none — template requires no brand stamp)";
  const baseContent = [
    "🎬 AUTO-RENDERED CAPTION CLIP",
    "",
    `Template: ${templateId} (chosen for theme "${sourceThemeId}")`,
    background
      ? `Background: ${background.label} — ${background.url}`
      : "Background: (solid color — no rotation match)",
    "",
    headlineLine,
    "",
    "Caption sequence:",
    captionBody,
  ];

  if (final.status === "done" && final.movie?.url) {
    baseContent.push(
      "",
      "Rendered video:",
      final.movie.url,
      "",
      `Duration: ${final.movie.duration?.toFixed(1) ?? "?"}s · ${final.movie.width}×${final.movie.height}`,
      "",
      "Review the clip, then publish to LinkedIn / X / Reels."
    );
    return {
      success: true,
      content: baseContent.join("\n"),
      model: `${ANTHROPIC_MODEL} + JSON2Video`,
      targetUrl: null,
      alternates: [],
      searchQuery: null,
      searchError: null,
      videoUrl: final.movie.url,
      videoProject: submit.project,
    };
  }

  // Render hit a terminal error — surface it so the UI shows a real failure
  // rather than the misleading "render in progress" message.
  if (final.status === "error") {
    const errMsg = final.error ?? final.message ?? "JSON2Video render failed";
    return {
      success: false,
      error: `Video render failed (project ${submit.project}): ${errMsg}`,
      videoProject: submit.project,
      videoError: errMsg,
    };
  }

  // Render didn't finish in time — return the project id so UI can poll.
  baseContent.push(
    "",
    `Render in progress (project ${submit.project}). Status: ${final.status}.`,
    final.error ? `Error: ${final.error}` : "Re-open the task in a minute to refresh."
  );
  return {
    success: true,
    content: baseContent.join("\n"),
    model: `${ANTHROPIC_MODEL} + JSON2Video`,
    targetUrl: null,
    alternates: [],
    searchQuery: null,
    searchError: null,
    videoUrl: null,
    videoProject: submit.project,
    videoError: final.error ?? null,
  };
}
