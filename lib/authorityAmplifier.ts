import OpenAI from "openai";
import { INSIGHT_SYSTEM_PROMPT } from "./insightPrompts";
import { themes } from "@/data/themes";
import { seedMemory } from "@/data/strategicMemory";

// ─── Types ───────────────────────────────────────────────────

export type AssetType = "article" | "case-study" | "research-insight" | "audit-finding" | "strategic-observation";

export type OutputFormat =
  | "linkedin-authority"
  | "founder-insight"
  | "technical-explainer"
  | "youtube-talking-points"
  | "case-study-snippet"
  | "semantic-reinforcement"
  | "geo-reinforcement"
  | "executive-summary";

export type AmplificationTemplate =
  | "myth-busting"
  | "technical-breakdown"
  | "before-vs-after"
  | "founder-commentary"
  | "strategic-warning"
  | "industry-observation"
  | "case-study-summary"
  | "semantic-clarification"
  | "geo-reinforcement";

export interface SourceAsset {
  title: string;
  content: string;
  type: AssetType;
  theme: string; // theme id
  keyInsights: string[];
}

export interface AmplifiedOutput {
  format: OutputFormat;
  platform: string;
  title: string;
  content: string;
  template: AmplificationTemplate;
  semanticKeywords: string[];
  estimatedTime: string;
  authorityAngle: string;
}

export interface DilutionWarning {
  type: "excessive-repetition" | "semantic-drift" | "weak-amplification" | "platform-inconsistency" | "diluted-messaging";
  message: string;
  severity: "high" | "medium" | "low";
}

export interface AmplificationResult {
  success: boolean;
  source: SourceAsset;
  outputs: AmplifiedOutput[];
  semanticScore: number; // 1-10
  densityScore: number; // 1-10
  warnings: DilutionWarning[];
  error?: string;
}

export interface DensityMetrics {
  themeRepetition: { theme: string; count: number; frequency: string }[];
  semanticReinforcement: number; // 1-10
  amplificationDepth: number; // 1-10
  messagingCohesion: number; // 1-10
}

// ─── Templates ───────────────────────────────────────────────

export const amplificationTemplates: {
  id: AmplificationTemplate;
  name: string;
  description: string;
  platforms: string[];
  structure: string;
}[] = [
  {
    id: "myth-busting",
    name: "Myth Busting",
    description: "Challenge a common assumption with evidence from the source asset",
    platforms: ["LinkedIn", "Blog"],
    structure: "Hook (the myth) → Evidence (from asset) → Reality → Takeaway",
  },
  {
    id: "technical-breakdown",
    name: "Technical Breakdown",
    description: "Extract the technical detail and present it as standalone expertise",
    platforms: ["Blog", "LinkedIn"],
    structure: "Problem → Technical detail → Implementation → Result",
  },
  {
    id: "before-vs-after",
    name: "Before vs After",
    description: "Frame the asset's findings as a transformation narrative",
    platforms: ["LinkedIn", "Case Study"],
    structure: "Before state → What changed → After state → Measurable impact",
  },
  {
    id: "founder-commentary",
    name: "Founder Commentary",
    description: "Add personal perspective and strategic context to the findings",
    platforms: ["LinkedIn", "Podcast"],
    structure: "Personal observation → Strategic context → Industry implication → Call to action",
  },
  {
    id: "strategic-warning",
    name: "Strategic Warning",
    description: "Frame a key finding as an urgent risk the audience needs to address",
    platforms: ["LinkedIn", "Blog"],
    structure: "The risk → Evidence → Who's affected → What to do",
  },
  {
    id: "industry-observation",
    name: "Industry Observation",
    description: "Position the finding within broader industry trends",
    platforms: ["LinkedIn", "Blog"],
    structure: "Trend → Observation → Implication → Strategic response",
  },
  {
    id: "case-study-summary",
    name: "Case Study Summary",
    description: "Distill results into a compelling evidence-based summary",
    platforms: ["LinkedIn", "Website"],
    structure: "Challenge → Approach → Result → Key learning",
  },
  {
    id: "semantic-clarification",
    name: "Semantic Clarification",
    description: "Clarify terminology and positioning to reinforce semantic authority",
    platforms: ["Blog", "LinkedIn"],
    structure: "Term/concept → Common misunderstanding → Correct framing → Why it matters",
  },
  {
    id: "geo-reinforcement",
    name: "GEO Reinforcement",
    description: "Optimise the output specifically for AI citation and GEO positioning",
    platforms: ["Blog"],
    structure: "Clear answer → Supporting evidence → Structured data context → Expert citation",
  },
];

// ─── Platform Adapters ───────────────────────────────────────

const platformGuidelines: Record<string, string> = {
  LinkedIn: "Max 1,300 characters. Opening hook in first 2 lines. Professional but direct. End with a question or clear takeaway. No hashtag spam — max 3 relevant hashtags.",
  Blog: "1,000-2,000 words. Clear headings. Technical depth. Structured for AI readability with schema-ready structure.",
  YouTube: "5-8 talking points. Visual-friendly examples. Clear opening hook. Conversational but authoritative tone.",
  "Case Study": "Problem → Approach → Result format. Include specific metrics. Client-friendly language.",
  Podcast: "Discussion points format. Personal anecdotes. Strategic context. Conversational depth.",
  Website: "Concise. Scannable. Key metrics prominent. Clear value proposition.",
};

// ─── Deterministic Amplification ─────────────────────────────

export function amplifyAssetLocal(source: SourceAsset): AmplificationResult {
  const theme = themes.find((t) => t.id === source.theme);
  const keywords = theme?.keywords ?? [];
  const outputs: AmplifiedOutput[] = [];

  // LinkedIn Authority
  outputs.push({
    format: "linkedin-authority",
    platform: "LinkedIn",
    title: `LinkedIn: ${source.title}`,
    content: buildLinkedInPost(source, theme),
    template: "industry-observation",
    semanticKeywords: keywords.slice(0, 3),
    estimatedTime: "20 min",
    authorityAngle: `Position as ${theme?.name ?? "authority"} expert`,
  });

  // Founder Insight
  outputs.push({
    format: "founder-insight",
    platform: "LinkedIn",
    title: `Founder take: ${source.keyInsights[0] ?? source.title}`,
    content: buildFounderInsight(source, theme),
    template: "founder-commentary",
    semanticKeywords: [...keywords.slice(0, 2), "founder insight"],
    estimatedTime: "15 min",
    authorityAngle: "Personal authority and entity reinforcement",
  });

  // Technical Explainer
  outputs.push({
    format: "technical-explainer",
    platform: "Blog",
    title: `Technical deep-dive: ${source.title}`,
    content: buildTechnicalExplainer(source, theme),
    template: "technical-breakdown",
    semanticKeywords: keywords,
    estimatedTime: "45 min",
    authorityAngle: "Technical credibility and depth",
  });

  // YouTube Talking Points
  outputs.push({
    format: "youtube-talking-points",
    platform: "YouTube",
    title: `Video: ${source.title}`,
    content: buildYouTubePoints(source, theme),
    template: "technical-breakdown",
    semanticKeywords: keywords.slice(0, 3),
    estimatedTime: "30 min",
    authorityAngle: "Visual authority demonstration",
  });

  // GEO Reinforcement
  outputs.push({
    format: "geo-reinforcement",
    platform: "Blog",
    title: `GEO-optimised: ${source.title}`,
    content: buildGEOReinforcement(source, theme),
    template: "geo-reinforcement",
    semanticKeywords: [...keywords, "generative engine optimisation"],
    estimatedTime: "40 min",
    authorityAngle: "AI citation optimisation",
  });

  // Executive Summary
  outputs.push({
    format: "executive-summary",
    platform: "Website",
    title: `Summary: ${source.title}`,
    content: buildExecutiveSummary(source, theme),
    template: "case-study-summary",
    semanticKeywords: keywords.slice(0, 3),
    estimatedTime: "15 min",
    authorityAngle: "Concise authority signal",
  });

  // Dilution protection
  const warnings = checkDilution(source, outputs);

  // Scoring
  const semanticScore = Math.min(10, 5 + keywords.length + (source.keyInsights.length > 2 ? 2 : 0));
  const densityScore = Math.min(10, outputs.length + (theme ? 2 : 0));

  return {
    success: true,
    source,
    outputs,
    semanticScore,
    densityScore,
    warnings,
  };
}

// ─── AI-Powered Amplification ────────────────────────────────

export async function amplifyAssetAI(source: SourceAsset): Promise<AmplificationResult> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "your-openai-api-key-here") {
      return amplifyAssetLocal(source);
    }

    const client = new OpenAI({ apiKey });
    const theme = themes.find((t) => t.id === source.theme);

    const prompt = `You are amplifying an authority asset for Interon. Transform this source into multiple strategic outputs.

SOURCE ASSET:
Title: ${source.title}
Type: ${source.type}
Theme: ${theme?.name ?? source.theme}
Key Insights: ${source.keyInsights.join("; ")}
Content: ${source.content.slice(0, 1500)}

Generate exactly 6 amplified outputs as a JSON array:
[
  {"format": "linkedin-authority", "platform": "LinkedIn", "title": "...", "content": "...(max 1200 chars)...", "template": "industry-observation", "authorityAngle": "..."},
  {"format": "founder-insight", "platform": "LinkedIn", "title": "...", "content": "...(max 1000 chars)...", "template": "founder-commentary", "authorityAngle": "..."},
  {"format": "technical-explainer", "platform": "Blog", "title": "...", "content": "...(300 word outline)...", "template": "technical-breakdown", "authorityAngle": "..."},
  {"format": "youtube-talking-points", "platform": "YouTube", "title": "...", "content": "...(5-7 bullet points)...", "template": "technical-breakdown", "authorityAngle": "..."},
  {"format": "geo-reinforcement", "platform": "Blog", "title": "...", "content": "...(GEO-optimised structure)...", "template": "geo-reinforcement", "authorityAngle": "..."},
  {"format": "executive-summary", "platform": "Website", "title": "...", "content": "...(3-4 sentences)...", "template": "case-study-summary", "authorityAngle": "..."}
]

Rules:
- Every output must reinforce "${theme?.name ?? "AI readiness"}" authority
- Use keywords: ${(theme?.keywords ?? []).join(", ")}
- Maintain technical credibility — no marketing fluff
- Each output must be immediately usable, not a template`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: INSIGHT_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) return amplifyAssetLocal(source);

    const parsed = JSON.parse(content) as Partial<AmplifiedOutput>[];
    const keywords = theme?.keywords ?? [];

    const outputs: AmplifiedOutput[] = parsed.map((p) => ({
      format: (p.format ?? "linkedin-authority") as OutputFormat,
      platform: p.platform ?? "LinkedIn",
      title: p.title ?? source.title,
      content: p.content ?? "",
      template: (p.template ?? "industry-observation") as AmplificationTemplate,
      semanticKeywords: keywords.slice(0, 3),
      estimatedTime: p.format === "technical-explainer" ? "45 min" : "20 min",
      authorityAngle: p.authorityAngle ?? "Authority reinforcement",
    }));

    const warnings = checkDilution(source, outputs);
    const semanticScore = Math.min(10, 6 + keywords.length);
    const densityScore = Math.min(10, outputs.length + 2);

    return { success: true, source, outputs, semanticScore, densityScore, warnings };
  } catch {
    return amplifyAssetLocal(source);
  }
}

// ─── Builders (Deterministic) ────────────────────────────────

function buildLinkedInPost(source: SourceAsset, theme?: typeof themes[0]): string {
  const insight = source.keyInsights[0] ?? "a critical insight";
  return `${insight}\n\nFrom our work on ${source.title.toLowerCase()}, we found that ${source.keyInsights[1] ?? "the data tells a different story than the industry assumes"}.\n\nThis matters for ${theme?.targetAudience ?? "digital leaders"} because ${theme?.strategicGoal ?? "AI visibility is becoming the primary competitive advantage"}.\n\nKey takeaway: ${source.keyInsights[2] ?? "the organisations acting on this now will compound their advantage"}.\n\n#${(theme?.keywords[0] ?? "AIReadiness").replace(/\s/g, "")} #${(theme?.keywords[1] ?? "GEO").replace(/\s/g, "")}`;
}

function buildFounderInsight(source: SourceAsset, theme?: typeof themes[0]): string {
  return `A personal observation from working on ${source.title.toLowerCase()}:\n\n${source.keyInsights[0] ?? "What we're seeing challenges conventional thinking"}.\n\nIn my experience advising on ${theme?.name ?? "AI visibility"}, ${source.keyInsights[1] ?? "the gap between what companies think works and what AI systems actually need is widening"}.\n\nThe strategic implication: ${source.keyInsights[2] ?? "acting early creates compounding advantage"}.`;
}

function buildTechnicalExplainer(source: SourceAsset, theme?: typeof themes[0]): string {
  const sections = [
    `## Problem\n${source.keyInsights[0] ?? source.title}`,
    `## Technical Analysis\n${source.content.slice(0, 300)}`,
    `## Implementation\nBased on our findings, the recommended approach involves:`,
    ...source.keyInsights.map((i, idx) => `${idx + 1}. ${i}`),
    `## Results & Implications\nFor ${theme?.targetAudience ?? "technical teams"}, this means ${theme?.strategicGoal ?? "rethinking current approaches"}.`,
  ];
  return sections.join("\n\n");
}

function buildYouTubePoints(source: SourceAsset, theme?: typeof themes[0]): string {
  const points = [
    `HOOK: "${source.keyInsights[0] ?? source.title}"`,
    `CONTEXT: Why this matters for ${theme?.name ?? "AI visibility"}`,
    ...source.keyInsights.map((i, idx) => `POINT ${idx + 1}: ${i}`),
    `DEMO: Show real example or audit walkthrough`,
    `TAKEAWAY: What to do about this right now`,
    `CTA: Comment with your experience / follow for more ${theme?.name ?? "AI visibility"} insights`,
  ];
  return points.join("\n");
}

function buildGEOReinforcement(source: SourceAsset, theme?: typeof themes[0]): string {
  return `# ${source.title}\n\n## Summary\n${source.keyInsights.join(". ")}.\n\n## Detailed Analysis\n${source.content.slice(0, 500)}\n\n## Key Findings\n${source.keyInsights.map((i) => `- ${i}`).join("\n")}\n\n## Expert Context\nAs specialists in ${theme?.name ?? "AI visibility"}, our analysis indicates that ${theme?.strategicGoal ?? "this represents a significant opportunity for organisations prepared to act"}.`;
}

function buildExecutiveSummary(source: SourceAsset, theme?: typeof themes[0]): string {
  return `${source.title}: ${source.keyInsights[0] ?? "Key findings from our analysis"}. ${source.keyInsights[1] ?? "The data reveals significant implications"} for ${theme?.targetAudience ?? "digital leaders"}. ${source.keyInsights[2] ?? "Organisations acting on these insights now will gain compounding advantage"}.`;
}

// ─── Dilution Protection ─────────────────────────────────────

function checkDilution(source: SourceAsset, outputs: AmplifiedOutput[]): DilutionWarning[] {
  const warnings: DilutionWarning[] = [];

  // Check for excessive repetition of exact phrases
  const titles = outputs.map((o) => o.title.toLowerCase());
  const duplicateTitles = titles.filter((t, i) => titles.indexOf(t) !== i);
  if (duplicateTitles.length > 0) {
    warnings.push({
      type: "excessive-repetition",
      message: "Multiple outputs have identical titles — differentiate angles for each platform",
      severity: "medium",
    });
  }

  // Check platform diversity
  const platforms = new Set(outputs.map((o) => o.platform));
  if (platforms.size < 3) {
    warnings.push({
      type: "platform-inconsistency",
      message: `Only ${platforms.size} platforms covered — expand to at least 3 for broader authority reinforcement`,
      severity: "low",
    });
  }

  // Check if source content is too short for meaningful amplification
  if (source.content.length < 200) {
    warnings.push({
      type: "weak-amplification",
      message: "Source content is thin — amplified outputs may lack depth. Consider expanding the source first.",
      severity: "high",
    });
  }

  // Check if key insights are missing
  if (source.keyInsights.length < 2) {
    warnings.push({
      type: "diluted-messaging",
      message: "Fewer than 2 key insights — outputs may repeat the same point. Add more insights for stronger variation.",
      severity: "medium",
    });
  }

  return warnings;
}

// ─── Density Metrics ─────────────────────────────────────────

export function calculateDensityMetrics(): DensityMetrics {
  const themeCounts: Record<string, number> = {};
  for (const m of seedMemory) {
    const name = themes.find((t) => t.id === m.theme)?.name ?? m.theme;
    themeCounts[name] = (themeCounts[name] || 0) + 1;
  }

  const themeRepetition = Object.entries(themeCounts)
    .map(([theme, count]) => ({
      theme,
      count,
      frequency: count >= 4 ? "high" : count >= 2 ? "moderate" : "low",
    }))
    .sort((a, b) => b.count - a.count);

  const avgCount = Object.values(themeCounts).reduce((s, v) => s + v, 0) / Object.keys(themeCounts).length;

  return {
    themeRepetition,
    semanticReinforcement: Math.min(10, Math.round(avgCount * 2)),
    amplificationDepth: Math.min(10, Object.keys(themeCounts).length + 2),
    messagingCohesion: Math.min(10, Object.keys(themeCounts).length >= 6 ? 8 : 5),
  };
}
