// ─── Mission Generator (Pillar-Aligned, With Drafts) ─────────
// Replacement for the original OpenAI-based skeleton generator.
//
// Produces 5 tasks per call, each with the actual deliverable already
// written by Claude — not just a suggestion. The user reviews,
// regenerates, edits, or approves; no "Execute with AI" round-trip
// needed for the common path.
//
// Persists directly to the Mission table so the dashboard picks the
// tasks up immediately.

import Anthropic from "@anthropic-ai/sdk";
import { themes } from "@/data/themes";
import { SYSTEM_PROMPT, PILLAR_WEIGHTS } from "./prompts";
import prisma from "./prisma";
import type { Mission } from "@prisma/client";

const MODEL = "claude-sonnet-4-6";

// Hard caps on output length per task type. The model will respect
// these in the prompt.
const DRAFT_TARGET_WORDS: Record<string, [number, number]> = {
  "Blog Post Brief":            [800, 1500],
  "Case Study":                 [700, 1200],
  "Authority Article":          [800, 1500],
  "Original Research Report":   [600, 1000],
  "LinkedIn Post":              [150, 250],
  "Facebook Post":              [120, 200],
  "Short Video Script":         [100, 150],
  "Founder Snippet":            [80,  120],
  "Authority Comment":          [80,  150],
  "FAQ Answer":                 [100, 200],
  "Website Page Improvement":   [120, 250],
  "Service Page Clarity Review":[150, 250],
  "FAQ Section Addition":       [150, 300],
  "Customer Pain Point Capture":[80,  150],
  "Visual / Diagram Idea":      [100, 200],
  "Automation Example":         [200, 400],
};

const DAY_PROFILES: Record<number, string> = {
  0: "Sunday — weekend. Optional low-load tasks only. Mostly research-feed scanning.",
  1: "Monday — produce ONE heavy core authority asset (Blog Post Brief OR Case Study OR Authority Article). Add 1 light reinforcement.",
  2: "Tuesday — LinkedIn reinforcement of Monday's core. 1 LinkedIn Post + 2 lighter reinforcement (Facebook, Founder Snippet, Authority Comment, FAQ Answer).",
  3: "Wednesday — Community / FAQ day. 1 FAQ Answer + 1 Authority Comment + 1 Customer Pain Point Capture. NO LinkedIn today.",
  4: "Thursday — Video reinforcement. 1 Short Video Script + 2 lighter tasks (Founder Snippet, Visual/Diagram Idea, Automation Example).",
  5: "Friday — Website + maintenance day. 1 Website Page Improvement + 1 Service Page Clarity Review + 1 FAQ Section Addition. No new social content.",
  6: "Saturday — weekend. Optional research scanning only.",
};

// ─── Types ───────────────────────────────────────────────────

export interface GenerateContext {
  date: string;              // YYYY-MM-DD
  count?: number;            // defaults to 5
  recentTitles?: string[];   // to avoid repeats
  forcePillar?: string;      // override the rotation pick
}

export interface GeneratedMission {
  title: string;
  pillar: string;
  taskType: string;
  platform: string;
  effortLevel: "low" | "medium" | "high";
  postType: string;
  estimatedTime: string;
  objective: string;
  contentAngle: string;
  draftContent: string;
  draftFormat: "markdown" | "text";
}

export interface GenerateResult {
  success: boolean;
  missions: Mission[];
  rawCount: number;          // how many Claude returned
  saved: number;             // how many ended up in the DB
  filtered: number;          // rejected by validation
  error?: string;
}

// ─── Client ──────────────────────────────────────────────────

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.length < 20) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  return new Anthropic({ apiKey });
}

// ─── Pillar selection ────────────────────────────────────────

async function pickUnderservedPillars(date: string, count: number): Promise<string[]> {
  // Look at missions created this month and rank pillars by how many
  // are below their target weight. Returns N pillar ids to suggest.
  const monthStart = date.slice(0, 7) + "-01";
  let recent: { pillar: string | null }[] = [];
  try {
    recent = await prisma.mission.findMany({
      where: { date: { gte: monthStart, lte: date } },
      select: { pillar: true },
    });
  } catch {
    recent = [];
  }

  const counts: Record<string, number> = {};
  for (const t of themes) counts[t.id] = 0;
  for (const r of recent) {
    if (r.pillar && counts[r.pillar] !== undefined) counts[r.pillar]++;
  }
  const total = recent.length || 1;

  // Score = target_share - actual_share. Higher score = more under-served.
  const scored = themes
    .map((t) => {
      const targetShare = PILLAR_WEIGHTS[t.id] ?? 0;
      const actualShare = counts[t.id] / total;
      return { pillar: t.id, score: targetShare - actualShare };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, count).map((s) => s.pillar);
}

// ─── Prompt building ─────────────────────────────────────────

function buildGenerationPrompt(
  date: string,
  dayOfWeek: number,
  count: number,
  underservedPillars: string[],
  recentTitles: string[]
): string {
  const dayProfile = DAY_PROFILES[dayOfWeek] ?? DAY_PROFILES[1];
  const pillarSummary = themes
    .map((t) => `- ${t.id} (target ${Math.round((PILLAR_WEIGHTS[t.id] ?? 0) * 100)}%): ${t.description.slice(0, 110)}`)
    .join("\n");

  const draftSpecs = Object.entries(DRAFT_TARGET_WORDS)
    .map(([type, [min, max]]) => `- ${type}: ${min}-${max} words`)
    .join("\n");

  const avoidBlock = recentTitles.length > 0
    ? `\n\nAVOID repeating these recent titles or their themes:\n${recentTitles.slice(0, 10).map((t) => `- ${t}`).join("\n")}`
    : "";

  return `Generate exactly ${count} content tasks for ${date} (day-of-week index ${dayOfWeek}).

DAY PROFILE:
${dayProfile}

UNDER-SERVED PILLARS (prioritise these first):
${underservedPillars.map((p) => `- ${p}`).join("\n")}

CONTENT PILLARS:
${pillarSummary}

DRAFT LENGTH BY TASK TYPE (respect strictly):
${draftSpecs}${avoidBlock}

CRITICAL OUTPUT RULES:
- Each task MUST include a fully-written draftContent — the actual deliverable, ready to copy and paste. No "outline" or "talking points only". A real post / article / FAQ answer / script.
- draftContent must be plain text or markdown. No HTML tags except the most basic structural ones if absolutely needed.
- LinkedIn / Facebook posts: write the body only, ending with the implied CTA from prompts.ts. No "[link in comments]" placeholders. No invented stats. No invented URLs.
- Blog Post Brief and Case Study: provide the full prose article in markdown with a clear ## H2 structure. The brief IS the article — no separate research step. Use 800-1500 words.
- FAQ Answer: a Q: line then an A: paragraph. Clear, customer-facing.
- Short Video Script: spoken script with [Hook 0:00] / [Beat 1] / etc. markers. 60-90 second target.
- Website Page Improvement: bullet list naming specific pages on interon.co.za and concrete changes ("Add a 2-sentence service summary at the top of /services/website-audits").
- Automation Example: a real, specific scenario with named tools and a simple step-by-step.

Output a JSON array of exactly ${count} objects with this shape:
[{
  "title": "...",
  "pillar": "website-health | ai-visibility-geo | agentic-automation | business-systems | trust-security-risk | practical-ai-owners | digital-authority | behind-the-scenes",
  "taskType": "<one of the task types in the draft-length table above>",
  "platform": "LinkedIn | Facebook | Blog | Website | Reels/Shorts/TikTok | YouTube | Internal",
  "effortLevel": "low | medium | high",
  "postType": "educational-explainer | business-warning | practical-checklist | myth-busting | short-story | case-study | founder-opinion | comparison | simple-analogy | before-after | short-video-script | faq-answer | diagram-idea | website-improvement",
  "estimatedTime": "<NN> min",
  "objective": "what authority signal or business outcome this builds",
  "contentAngle": "one of: Educational Explainer, Business Warning, Practical Checklist, Myth Busting, Short Story / Scenario, Case Study, Founder Opinion, Comparison, Simple Analogy, Before vs After, Short Video Script, FAQ Answer, Diagram Idea, Website Improvement",
  "draftContent": "<the full deliverable, plain text or markdown>",
  "draftFormat": "markdown | text"
}]

Return ONLY the JSON array. No preamble, no trailing commentary, no markdown code fence.`;
}

// ─── Generation ──────────────────────────────────────────────

export async function generateMissionsWithDrafts(
  context: GenerateContext
): Promise<GenerateResult> {
  const count = Math.min(Math.max(context.count ?? 5, 1), 8);
  const dateObj = new Date(context.date + "T00:00:00");
  const dayOfWeek = dateObj.getDay();

  const underservedPillars = context.forcePillar
    ? [context.forcePillar]
    : await pickUnderservedPillars(context.date, Math.min(count, 4));

  const client = getClient();
  const userPrompt = buildGenerationPrompt(
    context.date,
    dayOfWeek,
    count,
    underservedPillars,
    context.recentTitles ?? []
  );

  let parsed: GeneratedMission[];
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      temperature: 0.5,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { success: false, missions: [], rawCount: 0, saved: 0, filtered: 0, error: "Empty Claude response" };
    }
    const raw = textBlock.text.trim();
    const stripped = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    parsed = JSON.parse(stripped) as GeneratedMission[];
    if (!Array.isArray(parsed)) {
      return { success: false, missions: [], rawCount: 0, saved: 0, filtered: 0, error: "Response was not a JSON array" };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown generation error";
    return { success: false, missions: [], rawCount: 0, saved: 0, filtered: 0, error: message };
  }

  // Validate + filter
  const validPillarIds = new Set(themes.map((t) => t.id));
  const cleaned: GeneratedMission[] = [];
  let filtered = 0;
  for (const m of parsed) {
    if (!m.title || !m.draftContent || !m.pillar) { filtered++; continue; }
    if (!validPillarIds.has(m.pillar)) { filtered++; continue; }
    if (m.title.length < 8 || m.title.length > 200) { filtered++; continue; }
    if (m.draftContent.length < 40) { filtered++; continue; }
    cleaned.push(m);
  }

  // Persist to DB
  const saved: Mission[] = [];
  for (const m of cleaned) {
    const theme = themes.find((t) => t.id === m.pillar);
    try {
      const created = await prisma.mission.create({
        data: {
          date: context.date,
          title: m.title,
          category: m.taskType,
          authorityFocus: theme?.name ?? m.pillar,
          platform: m.platform,
          estimatedTime: m.estimatedTime,
          objective: m.objective,
          topic: theme?.name ?? m.pillar,
          description: m.objective,
          status: "pending",
          priority: m.effortLevel === "high" ? "high" : m.effortLevel === "low" ? "low" : "medium",
          themeId: m.pillar,
          contentAngle: m.contentAngle,
          pillar: m.pillar,
          taskType: m.taskType,
          effortLevel: m.effortLevel,
          postType: m.postType,
          draftContent: m.draftContent,
          draftFormat: m.draftFormat ?? "markdown",
          publishStatus: "draft",
        },
      });
      saved.push(created);
    } catch {
      // Persistence failure on a single row shouldn't abort the batch.
      filtered++;
    }
  }

  // If Claude returned tasks but none survived validation + persistence,
  // treat that as a failure so the UI shows it instead of going quiet.
  if (saved.length === 0 && parsed.length > 0) {
    return {
      success: false,
      missions: [],
      rawCount: parsed.length,
      saved: 0,
      filtered,
      error: `Generator returned ${parsed.length} task(s) but all ${filtered} were rejected (likely invalid pillar or schema mismatch — has prisma db push run?).`,
    };
  }

  return {
    success: true,
    missions: saved,
    rawCount: parsed.length,
    saved: saved.length,
    filtered,
  };
}

// ─── Single-mission regenerate ───────────────────────────────
// Used by the "Regenerate" button — replaces draftContent on an
// existing mission without creating a new one.

export async function regenerateDraft(missionId: string): Promise<{
  success: boolean;
  draftContent?: string;
  error?: string;
}> {
  const mission = await prisma.mission.findUnique({ where: { id: missionId } });
  if (!mission) return { success: false, error: "Mission not found" };

  const taskType = mission.taskType ?? mission.category;
  const wordTarget = DRAFT_TARGET_WORDS[taskType] ?? [100, 200];

  const client = getClient();
  const prompt = `Regenerate the deliverable for this task. Output ONLY the deliverable text — no preamble, no commentary, no JSON.

Task: ${mission.title}
Task type: ${taskType}
Pillar: ${mission.pillar ?? mission.themeId}
Platform: ${mission.platform}
Content angle: ${mission.contentAngle ?? "—"}
Objective: ${mission.objective}
Target length: ${wordTarget[0]}-${wordTarget[1]} words.

Output the finished deliverable in ${mission.draftFormat ?? "markdown"} format, ready to copy and paste.`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { success: false, error: "Empty Claude response" };
    }
    const draftContent = textBlock.text.trim();
    await prisma.mission.update({
      where: { id: missionId },
      data: { draftContent, publishStatus: "draft" },
    });
    return { success: true, draftContent };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Regeneration failed" };
  }
}
