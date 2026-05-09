import OpenAI from "openai";
import { INSIGHT_SYSTEM_PROMPT } from "./insightPrompts";
import { themes } from "@/data/themes";

// ─── Types ───────────────────────────────────────────────────

export type ModelId = "openai" | "claude" | "gemini" | "perplexity" | "internal";

export interface ModelConfig {
  id: ModelId;
  name: string;
  available: boolean;
  description: string;
}

export interface ModelInsight {
  modelId: ModelId;
  modelName: string;
  keyInsights: string[];
  opportunities: string[];
  warnings: string[];
  recommendedActions: string[];
  confidenceLevel: number; // 1-10
}

export interface ConsensusItem {
  insight: string;
  agreementCount: number;
  models: string[];
  confidenceScore: number; // 1-10
  type: "consensus" | "warning" | "opportunity";
}

export interface Contradiction {
  topic: string;
  positions: { model: string; position: string }[];
  implication: string;
}

export interface BlindSpot {
  area: string;
  evidence: string;
  severity: "high" | "medium" | "low";
  suggestedAction: string;
}

export interface MultiModelAnalysis {
  modelInsights: ModelInsight[];
  consensus: ConsensusItem[];
  contradictions: Contradiction[];
  blindSpots: BlindSpot[];
  highConfidenceActions: string[];
  overallConfidence: number;
}

// ─── Model Registry ──────────────────────────────────────────

export const modelRegistry: ModelConfig[] = [
  {
    id: "openai",
    name: "OpenAI GPT-4o",
    available: true,
    description: "Primary strategic analysis via GPT-4o-mini",
  },
  {
    id: "claude",
    name: "Claude",
    available: false,
    description: "Future: Anthropic Claude for nuanced strategic analysis",
  },
  {
    id: "gemini",
    name: "Gemini",
    available: false,
    description: "Future: Google Gemini for search-aware insights",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    available: false,
    description: "Future: Perplexity for research-backed intelligence",
  },
  {
    id: "internal",
    name: "Internal Logic",
    available: true,
    description: "Deterministic analysis from strategic memory and signals",
  },
];

// ─── OpenAI Client ───────────────────────────────────────────

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your-openai-api-key-here") {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

// ─── Model-Specific Prompts ─────────────────────────────────

const MULTI_MODEL_PROMPT = `You are providing strategic intelligence analysis for Interon, a consultancy specialising in AI visibility, GEO, and technical SEO.

Analyze the given context and provide your strategic assessment. Return as JSON:
{
  "keyInsights": ["insight1", "insight2", ...],
  "opportunities": ["opp1", "opp2", ...],
  "warnings": ["warning1", "warning2", ...],
  "recommendedActions": ["action1", "action2", ...],
  "confidenceLevel": 7
}

Rules:
- Be specific to Interon's positioning, not generic
- Every insight must be actionable
- Warnings should identify real strategic risks
- Confidence level reflects certainty (1=speculative, 10=highly confident)
- Maximum 5 items per category`;

// ─── Fetch Model Insights ────────────────────────────────────

async function fetchOpenAIInsight(
  context: string
): Promise<ModelInsight> {
  const client = getOpenAIClient();

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: INSIGHT_SYSTEM_PROMPT },
        {
          role: "user",
          content: `${MULTI_MODEL_PROMPT}\n\nCONTEXT:\n${context}`,
        },
      ],
      temperature: 0.6,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) throw new Error("Empty response");

    const parsed = JSON.parse(content);
    return {
      modelId: "openai",
      modelName: "OpenAI GPT-4o",
      keyInsights: parsed.keyInsights || [],
      opportunities: parsed.opportunities || [],
      warnings: parsed.warnings || [],
      recommendedActions: parsed.recommendedActions || [],
      confidenceLevel: parsed.confidenceLevel || 5,
    };
  } catch (err) {
    return {
      modelId: "openai",
      modelName: "OpenAI GPT-4o",
      keyInsights: ["Analysis unavailable — API error"],
      opportunities: [],
      warnings: [],
      recommendedActions: [],
      confidenceLevel: 0,
    };
  }
}

function generateInternalInsight(context: string): ModelInsight {
  // Deterministic analysis from internal strategic logic
  const coreThemes = themes.filter((t) => t.authorityLevel === "core");
  const contextLower = context.toLowerCase();

  const keyInsights: string[] = [];
  const opportunities: string[] = [];
  const warnings: string[] = [];
  const actions: string[] = [];

  // Detect themes mentioned in context
  for (const theme of coreThemes) {
    const mentioned = theme.keywords.some((kw) =>
      contextLower.includes(kw.toLowerCase())
    );
    if (mentioned) {
      keyInsights.push(
        `"${theme.name}" is active in current signals — aligns with core authority positioning`
      );
      opportunities.push(
        `Publish authoritative content on ${theme.name} while the topic is active`
      );
    }
  }

  // Generic strategic logic
  if (contextLower.includes("geo") || contextLower.includes("generative engine")) {
    keyInsights.push(
      "GEO category is still being defined — first-mover content has lasting citation advantage"
    );
    actions.push(
      "Publish a GEO framework article within the next 7 days to maintain category leadership"
    );
  }

  if (contextLower.includes("umbraco")) {
    opportunities.push(
      "Umbraco community has minimal AI readiness content — wide-open authority gap"
    );
    actions.push(
      "Create an Umbraco + AI readiness guide for the community before competitors enter"
    );
  }

  if (contextLower.includes("entity") || contextLower.includes("knowledge panel")) {
    warnings.push(
      "Entity trust signals take 2-4 weeks to propagate — start reinforcement now for future payoff"
    );
  }

  if (contextLower.includes("competitor") || contextLower.includes("agency")) {
    warnings.push(
      "Competitors are beginning to adopt AI readiness language — speed of publication is critical"
    );
  }

  // Ensure minimum content
  if (keyInsights.length === 0) {
    keyInsights.push(
      "Maintain consistent cross-theme authority building across all core pillars"
    );
  }
  if (actions.length === 0) {
    actions.push(
      "Review current week's mission plan against strategic memory for alignment"
    );
  }

  return {
    modelId: "internal",
    modelName: "Internal Logic",
    keyInsights: keyInsights.slice(0, 5),
    opportunities: opportunities.slice(0, 5),
    warnings: warnings.slice(0, 5),
    recommendedActions: actions.slice(0, 5),
    confidenceLevel: 7, // deterministic = moderate-high confidence
  };
}

// ─── Consensus Detection ─────────────────────────────────────

function detectConsensus(insights: ModelInsight[]): ConsensusItem[] {
  const consensus: ConsensusItem[] = [];
  const allInsights = insights.flatMap((i) =>
    i.keyInsights.map((text) => ({ text, model: i.modelName }))
  );
  const allOpps = insights.flatMap((i) =>
    i.opportunities.map((text) => ({ text, model: i.modelName }))
  );
  const allWarnings = insights.flatMap((i) =>
    i.warnings.map((text) => ({ text, model: i.modelName }))
  );

  // Find thematic overlaps using keyword matching
  const themeMatches = findThematicOverlaps(
    allInsights,
    "consensus"
  );
  const oppMatches = findThematicOverlaps(allOpps, "opportunity");
  const warnMatches = findThematicOverlaps(allWarnings, "warning");

  consensus.push(...themeMatches, ...oppMatches, ...warnMatches);

  return consensus
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, 8);
}

function findThematicOverlaps(
  items: { text: string; model: string }[],
  type: "consensus" | "opportunity" | "warning"
): ConsensusItem[] {
  const results: ConsensusItem[] = [];
  const themeKeywords: Record<string, string[]> = {};

  // Extract key themes from each item
  for (const theme of themes) {
    themeKeywords[theme.name] = theme.keywords.map((k) => k.toLowerCase());
  }

  // Check which themes appear across multiple models
  const themeModels: Record<string, Set<string>> = {};
  const themeTexts: Record<string, string[]> = {};

  for (const item of items) {
    const lower = item.text.toLowerCase();
    for (const [name, keywords] of Object.entries(themeKeywords)) {
      if (keywords.some((kw) => lower.includes(kw))) {
        if (!themeModels[name]) {
          themeModels[name] = new Set();
          themeTexts[name] = [];
        }
        themeModels[name].add(item.model);
        themeTexts[name].push(item.text);
      }
    }
  }

  for (const [theme, models] of Object.entries(themeModels)) {
    if (models.size >= 1) {
      results.push({
        insight: themeTexts[theme][0],
        agreementCount: models.size,
        models: [...models],
        confidenceScore: Math.min(10, models.size * 4 + 2),
        type,
      });
    }
  }

  return results;
}

// ─── Contradiction Detection ─────────────────────────────────

function detectContradictions(
  insights: ModelInsight[]
): Contradiction[] {
  const contradictions: Contradiction[] = [];

  // Compare opportunities vs warnings across models
  for (let i = 0; i < insights.length; i++) {
    for (let j = i + 1; j < insights.length; j++) {
      const a = insights[i];
      const b = insights[j];

      // Check if one model sees opportunity where another sees risk
      for (const opp of a.opportunities) {
        for (const warn of b.warnings) {
          const overlap = findKeywordOverlap(opp, warn);
          if (overlap) {
            contradictions.push({
              topic: overlap,
              positions: [
                { model: a.modelName, position: `Opportunity: ${opp}` },
                { model: b.modelName, position: `Warning: ${warn}` },
              ],
              implication: `Models disagree on ${overlap} — investigate further before committing resources`,
            });
          }
        }
      }
    }
  }

  return contradictions.slice(0, 5);
}

function findKeywordOverlap(a: string, b: string): string | null {
  const aWords = new Set(
    a.toLowerCase().split(/\s+/).filter((w) => w.length > 4)
  );
  const bWords = b.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
  const shared = bWords.filter((w) => aWords.has(w));
  return shared.length >= 2 ? shared.slice(0, 3).join(" ") : null;
}

// ─── Blind Spot Detection ────────────────────────────────────

function detectBlindSpots(insights: ModelInsight[]): BlindSpot[] {
  const blindSpots: BlindSpot[] = [];
  const allThemeIds = themes.map((t) => t.id);
  const mentionedThemes = new Set<string>();

  // Find which themes are mentioned across all model outputs
  const allText = insights
    .flatMap((i) => [
      ...i.keyInsights,
      ...i.opportunities,
      ...i.warnings,
      ...i.recommendedActions,
    ])
    .join(" ")
    .toLowerCase();

  for (const theme of themes) {
    if (theme.keywords.some((kw) => allText.includes(kw.toLowerCase()))) {
      mentionedThemes.add(theme.id);
    }
  }

  // Themes not mentioned = potential blind spots
  for (const themeId of allThemeIds) {
    if (!mentionedThemes.has(themeId)) {
      const theme = themes.find((t) => t.id === themeId)!;
      blindSpots.push({
        area: theme.name,
        evidence: `No model mentioned ${theme.name} in their analysis — this may indicate an overlooked authority area`,
        severity:
          theme.authorityLevel === "core"
            ? "high"
            : theme.authorityLevel === "supporting"
              ? "medium"
              : "low",
        suggestedAction: `Review ${theme.name} coverage and consider whether current authority-building is sufficient`,
      });
    }
  }

  // Check for repeated warnings across models
  const warningThemes: Record<string, number> = {};
  for (const insight of insights) {
    for (const w of insight.warnings) {
      const lower = w.toLowerCase();
      for (const theme of themes) {
        if (theme.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
          warningThemes[theme.name] = (warningThemes[theme.name] || 0) + 1;
        }
      }
    }
  }

  for (const [theme, count] of Object.entries(warningThemes)) {
    if (count >= 2) {
      blindSpots.push({
        area: `${theme} — repeated warning`,
        evidence: `${count} models flagged warnings related to ${theme}`,
        severity: "high",
        suggestedAction: `Address ${theme} warnings as a priority — multiple intelligence sources agree this is a risk`,
      });
    }
  }

  return blindSpots.sort((a, b) => {
    const sev = { high: 3, medium: 2, low: 1 };
    return sev[b.severity] - sev[a.severity];
  });
}

// ─── Main Analysis Function ──────────────────────────────────

export async function runMultiModelAnalysis(
  context: string
): Promise<MultiModelAnalysis> {
  // Run available models in parallel
  const [openaiInsight, internalInsight] = await Promise.all([
    fetchOpenAIInsight(context),
    Promise.resolve(generateInternalInsight(context)),
  ]);

  const modelInsights = [openaiInsight, internalInsight];

  // Detect patterns across models
  const consensus = detectConsensus(modelInsights);
  const contradictions = detectContradictions(modelInsights);
  const blindSpots = detectBlindSpots(modelInsights);

  // High confidence actions: actions that appear across multiple models or have high individual confidence
  const highConfidenceActions = modelInsights
    .filter((i) => i.confidenceLevel >= 6)
    .flatMap((i) => i.recommendedActions)
    .slice(0, 5);

  const overallConfidence = Math.round(
    modelInsights.reduce((s, i) => s + i.confidenceLevel, 0) /
      modelInsights.length
  );

  return {
    modelInsights,
    consensus,
    contradictions,
    blindSpots,
    highConfidenceActions,
    overallConfidence,
  };
}
