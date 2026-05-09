import OpenAI from "openai";
import {
  INSIGHT_SYSTEM_PROMPT,
  SIGNAL_SUMMARY_PROMPT,
  SEMANTIC_SHIFT_PROMPT,
  NARRATIVE_DETECTION_PROMPT,
} from "./insightPrompts";
import type { LiveSignal } from "./fetchResearchSignals";
import type { ResearchSignal } from "@/data/researchSignals";

// ─── Types ───────────────────────────────────────────────────

export interface KeyFinding {
  finding: string;
  whyItMatters: string;
  authorityOpportunity: string;
  suggestedResponse: string;
  contentOpportunity: string;
  founderInsight: string;
  competitiveAngle: string;
  urgency: "immediate" | "this-week" | "this-month";
  relevantThemes: string[];
}

export interface SemanticShift {
  term: string;
  direction: "emerging" | "evolving" | "declining" | "contested";
  currentUsage: string;
  strategicImplication: string;
  suggestedAction: string;
}

export interface EmergingNarrative {
  narrative: string;
  evidence: string;
  marketConcern: string;
  interonAngle: string;
  contentStrategy: string;
  competitorBlindSpot: string;
}

export interface AuthorityGap {
  gap: string;
  evidence: string;
  opportunitySize: string;
}

export interface StrategicBriefing {
  keyFindings: KeyFinding[];
  semanticShifts: SemanticShift[];
  emergingNarratives: EmergingNarrative[];
  authorityGaps: AuthorityGap[];
  weeklyPriority: string;
}

export interface BriefingResult {
  success: boolean;
  briefing: StrategicBriefing | null;
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

// ─── Signal Formatting ───────────────────────────────────────

function formatSignalsForAI(
  liveSignals: LiveSignal[],
  mockSignals: ResearchSignal[]
): string {
  const lines: string[] = [];

  if (liveSignals.length > 0) {
    lines.push("LIVE RESEARCH SIGNALS:");
    for (const s of liveSignals.slice(0, 15)) {
      lines.push(
        `- [${s.source}] "${s.title}" (relevance: ${s.relevanceScore}/10, themes: ${s.matchedThemes.join(", ")})`
      );
      if (s.summary) lines.push(`  Summary: ${s.summary.slice(0, 150)}`);
    }
  }

  if (mockSignals.length > 0) {
    lines.push("\nSTRATEGIC INTELLIGENCE SIGNALS:");
    for (const s of mockSignals.slice(0, 10)) {
      lines.push(
        `- "${s.title}" (urgency: ${s.urgency}, authority opportunity: ${s.authorityOpportunity}/10, themes: ${s.relatedThemes.join(", ")})`
      );
      lines.push(`  Insight: ${s.insightSummary.slice(0, 150)}`);
    }
  }

  return lines.join("\n");
}

// ─── Main Briefing Generator ─────────────────────────────────

export async function generateStrategicBriefing(
  liveSignals: LiveSignal[],
  mockSignals: ResearchSignal[]
): Promise<BriefingResult> {
  const client = getClient();
  const signalText = formatSignalsForAI(liveSignals, mockSignals);

  if (!signalText.trim()) {
    return {
      success: false,
      briefing: null,
      error: "No signals to analyze",
    };
  }

  const userPrompt = `${SIGNAL_SUMMARY_PROMPT}

SIGNALS TO ANALYZE:
${signalText}`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: INSIGHT_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      return { success: false, briefing: null, error: "Empty AI response" };
    }

    const briefing = JSON.parse(content) as StrategicBriefing;
    return { success: true, briefing };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, briefing: null, error: message };
  }
}

// ─── Semantic Shift Detection ────────────────────────────────

export async function detectSemanticShifts(
  liveSignals: LiveSignal[],
  mockSignals: ResearchSignal[]
): Promise<{ success: boolean; shifts: SemanticShift[]; error?: string }> {
  const client = getClient();
  const signalText = formatSignalsForAI(liveSignals, mockSignals);

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: INSIGHT_SYSTEM_PROMPT },
        {
          role: "user",
          content: `${SEMANTIC_SHIFT_PROMPT}\n\nSIGNALS:\n${signalText}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      return { success: false, shifts: [], error: "Empty response" };
    }

    const shifts = JSON.parse(content) as SemanticShift[];
    return { success: true, shifts };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, shifts: [], error: message };
  }
}

// ─── Narrative Detection ─────────────────────────────────────

export async function detectNarratives(
  liveSignals: LiveSignal[],
  mockSignals: ResearchSignal[]
): Promise<{
  success: boolean;
  narratives: EmergingNarrative[];
  error?: string;
}> {
  const client = getClient();
  const signalText = formatSignalsForAI(liveSignals, mockSignals);

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: INSIGHT_SYSTEM_PROMPT },
        {
          role: "user",
          content: `${NARRATIVE_DETECTION_PROMPT}\n\nSIGNALS:\n${signalText}`,
        },
      ],
      temperature: 0.6,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      return { success: false, narratives: [], error: "Empty response" };
    }

    const narratives = JSON.parse(content) as EmergingNarrative[];
    return { success: true, narratives };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, narratives: [], error: message };
  }
}
