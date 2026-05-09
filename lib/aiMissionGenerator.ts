import OpenAI from "openai";
import {
  SYSTEM_PROMPT,
  MISSION_GENERATION_PROMPT,
  TOPIC_EXPANSION_PROMPT,
  validateMissionTitle,
} from "./prompts";
import { themes } from "@/data/themes";
import type { Theme } from "@/data/themes";

// ─── Types ───────────────────────────────────────────────────

export interface AIMission {
  title: string;
  category: string;
  theme: string;
  platform: string;
  estimatedTime: string;
  objective: string;
  contentAngle: string;
  semanticGoal: string;
  strategicPriority: number;
  authorityImpact: number;
}

export interface TopicExpansion {
  angle: string;
  title: string;
  platform: string;
  keyPoint: string;
  authoritySignal: string;
  estimatedTime: string;
}

export interface GenerationResult<T> {
  success: boolean;
  data: T[];
  filtered: number; // count of items removed by validation
  error?: string;
}

// ─── Client ──────────────────────────────────────────────────

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your-openai-api-key-here") {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

// ─── Mission Generation ──────────────────────────────────────

export async function generateMissions(context: {
  focusThemes?: string[];
  previousTopics?: string[];
  dayOfWeek?: string;
  count?: number;
}): Promise<GenerationResult<AIMission>> {
  const client = getClient();
  const count = context.count ?? 5;

  const focusThemeDetails = (context.focusThemes ?? [])
    .map((id) => themes.find((t) => t.id === id))
    .filter((t): t is Theme => t !== undefined)
    .map((t) => `${t.name}: ${t.strategicGoal}`)
    .join("\n");

  const avoidList = context.previousTopics?.length
    ? `\n\nAVOID these topics (already covered recently):\n${context.previousTopics.map((t) => `- ${t}`).join("\n")}`
    : "";

  const dayContext = context.dayOfWeek
    ? `\n\nToday is ${context.dayOfWeek}. Align suggestions with this day's strategic focus.`
    : "";

  const userPrompt = `${MISSION_GENERATION_PROMPT}

CURRENT FOCUS THEMES:
${focusThemeDetails || "All themes — balanced coverage"}
${avoidList}${dayContext}

Generate exactly ${count} missions. Return as a JSON array.

Response format (JSON array only, no markdown):
[{"title": "...", "category": "...", "theme": "...", "platform": "...", "estimatedTime": "... min", "objective": "...", "contentAngle": "...", "semanticGoal": "...", "strategicPriority": 8, "authorityImpact": 7}]`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      return { success: false, data: [], filtered: 0, error: "Empty response" };
    }

    const parsed = JSON.parse(content) as AIMission[];
    const { validated, filtered } = validateMissions(parsed);

    return { success: true, data: validated, filtered };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, data: [], filtered: 0, error: message };
  }
}

// ─── Topic Expansion ─────────────────────────────────────────

export async function expandTopic(
  topic: string,
  themeId?: string
): Promise<GenerationResult<TopicExpansion>> {
  const client = getClient();

  const theme = themeId ? themes.find((t) => t.id === themeId) : undefined;
  const themeContext = theme
    ? `\n\nThis topic falls under the "${theme.name}" theme. Strategic goal: ${theme.strategicGoal}`
    : "";

  const userPrompt = `${TOPIC_EXPANSION_PROMPT}

TOPIC TO EXPAND:
"${topic}"${themeContext}

Return as a JSON array of exactly 5 objects.

Response format (JSON array only, no markdown):
[{"angle": "...", "title": "...", "platform": "...", "keyPoint": "...", "authoritySignal": "...", "estimatedTime": "... min"}]`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      return { success: false, data: [], filtered: 0, error: "Empty response" };
    }

    const parsed = JSON.parse(content) as TopicExpansion[];
    return { success: true, data: parsed, filtered: 0 };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, data: [], filtered: 0, error: message };
  }
}

// ─── Validation Layer ────────────────────────────────────────

function validateMissions(missions: AIMission[]): {
  validated: AIMission[];
  filtered: number;
} {
  const validated: AIMission[] = [];
  let filtered = 0;

  for (const mission of missions) {
    const titleCheck = validateMissionTitle(mission.title);
    if (!titleCheck.valid) {
      filtered++;
      continue;
    }

    // Ensure scores are in range
    mission.strategicPriority = clamp(mission.strategicPriority, 1, 10);
    mission.authorityImpact = clamp(mission.authorityImpact, 1, 10);

    validated.push(mission);
  }

  return { validated, filtered };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
