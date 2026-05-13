// ─── Mission Executor ────────────────────────────────────────
// Turns a reinforcement (or core) task into a finished deliverable
// via OpenAI. The model is given full context: the task's execution
// prompt, the channel/format, the theme, the semantic goal, and —
// when relevant — the week's core authority asset to reinforce.

import OpenAI from "openai";
import { generateDailyPlan } from "./generateDailyPlan";
import type { PlannedMission } from "./generateDailyPlan";

const OPENAI_MODEL = "gpt-4o-mini";

// ─── Types ───────────────────────────────────────────────────

export interface ExecuteInput {
  // Stable identity (used as draft cache key)
  draftKey: string;
  date: string;
  // Mission shape — supplied from the client so the executor doesn't
  // have to re-derive the user's mission ids.
  mission: {
    title: string;
    channel: string;
    category: string;
    platform: string;
    theme: string;          // theme name (e.g. "AI Readiness")
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

export interface ExecuteResult {
  success: boolean;
  content?: string;
  model?: string;
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
- Format the output for copy-paste use. No prologue ("Here's a draft..."), no trailing caveats. Just the deliverable.
- When a deliverable has multiple parts (e.g. a carousel = 6 slides), label them clearly (Slide 1, Slide 2, ...).
- For checklists, use - bullets. For scripts, use [00:00] timecodes. For pitches, include subject line.

You are writing for an audience of SEO, GEO, AI-search-visibility, and technical-leadership readers. Assume intelligence; do not over-explain.`;

function buildUserPrompt(input: ExecuteInput, coreAsset: PlannedMission | null): string {
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
${coreBlock}
Produce the finished deliverable now. Format it for direct copy-paste use. No preamble, no trailing notes.`;
}

// ─── Executor ────────────────────────────────────────────────

export async function executeMission(input: ExecuteInput): Promise<ExecuteResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your-openai-api-key-here") {
    return { success: false, error: "OPENAI_API_KEY is not configured" };
  }

  // Find this week's core asset by re-running the planner for the Monday
  // of the week containing the requested date.
  let coreAsset: PlannedMission | null = null;
  if (input.mission.requiresCoreAsset) {
    try {
      const monday = mondayOf(input.date);
      const weekPlan = generateDailyPlan(monday);
      coreAsset = weekPlan.coreAsset;
    } catch {
      coreAsset = null;
    }
  }

  const client = new OpenAI({ apiKey });

  try {
    const response = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input, coreAsset) },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      return { success: false, error: "Empty response from model" };
    }
    return { success: true, content, model: OPENAI_MODEL };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

// ─── Helpers ─────────────────────────────────────────────────

function mondayOf(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay(); // 0 = Sun
  const offset = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - offset);
  return d.toISOString().split("T")[0];
}
