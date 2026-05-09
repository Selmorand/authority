import nlp from "compromise";
import { researchSignals } from "@/data/researchSignals";
import { ecosystemDevelopments, geoTerminology } from "@/data/searchEcosystem";
import { topicIdeas } from "@/data/topicIdeas";
import { themes } from "@/data/themes";

// ─── Types ───────────────────────────────────────────────────

export interface SemanticCluster {
  id: string;
  label: string;
  terms: string[];
  frequency: number;
  momentum: "rising" | "stable" | "emerging" | "declining";
  relatedThemes: string[];
  description: string;
}

export interface TermFrequency {
  term: string;
  count: number;
  sources: string[];
  momentum: "rising" | "stable" | "emerging";
  isAuthority: boolean; // part of Interon's positioning
}

export interface NarrativeMomentum {
  narrative: string;
  strength: number; // 1-10
  direction: "growing" | "stable" | "emerging" | "declining";
  evidence: string[];
  opportunityType: "dominate" | "expand" | "enter" | "monitor";
}

export interface WhitespaceOpportunity {
  area: string;
  description: string;
  competitiveGap: "wide" | "moderate" | "narrow";
  urgency: "high" | "medium" | "low";
  suggestedAction: string;
  relatedTheme: string;
}

export interface SaturationIndicator {
  term: string;
  saturationLevel: "oversaturated" | "competitive" | "moderate" | "open";
  risk: string;
  differentiation: string;
}

export interface TrendClusteringReport {
  clusters: SemanticCluster[];
  terminology: TermFrequency[];
  narratives: NarrativeMomentum[];
  whitespace: WhitespaceOpportunity[];
  saturation: SaturationIndicator[];
  insights: string[];
}

// ─── Corpus Building ─────────────────────────────────────────

function buildCorpus(): string[] {
  const texts: string[] = [];

  for (const s of researchSignals) {
    texts.push(s.title);
    texts.push(s.insightSummary);
  }

  for (const d of ecosystemDevelopments) {
    texts.push(d.title);
    texts.push(d.summary);
    texts.push(d.interonImplication);
  }

  for (const t of topicIdeas) {
    texts.push(t.title);
    texts.push(t.semanticGoal);
  }

  for (const t of themes) {
    texts.push(t.description);
    texts.push(t.strategicGoal);
  }

  return texts;
}

// ─── Terminology Extraction ──────────────────────────────────

function extractTerminology(corpus: string[]): TermFrequency[] {
  const termCounts: Record<string, { count: number; sources: Set<string> }> = {};
  const authorityTerms = new Set(
    themes.flatMap((t) => t.keywords.map((k) => k.toLowerCase()))
  );
  const geoTerms = new Set(
    geoTerminology.map((g) => g.term.toLowerCase())
  );

  for (const text of corpus) {
    const doc = nlp(text);

    // Extract noun phrases
    const nouns = doc.nouns().out("array") as string[];
    for (const noun of nouns) {
      const lower = noun.toLowerCase().trim();
      if (lower.length < 4 || lower.length > 60) continue;
      if (isStopPhrase(lower)) continue;

      if (!termCounts[lower]) {
        termCounts[lower] = { count: 0, sources: new Set() };
      }
      termCounts[lower].count++;
      termCounts[lower].sources.add(text.slice(0, 50));
    }
  }

  // Also count known authority terms
  for (const text of corpus) {
    const lower = text.toLowerCase();
    for (const term of [...authorityTerms, ...geoTerms]) {
      if (lower.includes(term)) {
        if (!termCounts[term]) {
          termCounts[term] = { count: 0, sources: new Set() };
        }
        termCounts[term].count++;
        termCounts[term].sources.add(text.slice(0, 50));
      }
    }
  }

  return Object.entries(termCounts)
    .filter(([, v]) => v.count >= 2)
    .map(([term, v]) => ({
      term,
      count: v.count,
      sources: [...v.sources].slice(0, 3),
      momentum: (v.count >= 8 ? "rising" : v.count >= 4 ? "stable" : "emerging") as TermFrequency["momentum"],
      isAuthority: authorityTerms.has(term) || geoTerms.has(term),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 40);
}

// ─── Semantic Clustering ─────────────────────────────────────

function clusterTerms(terms: TermFrequency[]): SemanticCluster[] {
  const clusterDefs: {
    id: string;
    label: string;
    keywords: string[];
    themes: string[];
    description: string;
  }[] = [
    {
      id: "ai-search",
      label: "AI Search & Visibility",
      keywords: ["ai search", "ai visibility", "ai overview", "ai citation", "ai answer", "sge", "ai readiness", "ai-ready", "ai readiness audit"],
      themes: ["ai-readiness", "ai-search-visibility"],
      description: "Cluster around AI search presence, citation, and discoverability",
    },
    {
      id: "geo-cluster",
      label: "Generative Engine Optimisation",
      keywords: ["geo", "generative engine", "llm optimisation", "generative seo", "ai citation rate", "ai share of voice"],
      themes: ["geo"],
      description: "GEO terminology, methodology, and adoption signals",
    },
    {
      id: "entity-semantic",
      label: "Entity & Semantic Authority",
      keywords: ["entity trust", "entity authority", "entity confidence", "knowledge panel", "entity seo", "semantic authority", "entity recognition"],
      themes: ["entity-trust"],
      description: "Entity identity, trust signals, and semantic positioning",
    },
    {
      id: "structured-machine",
      label: "Structured Data & Machine Readability",
      keywords: ["structured data", "schema markup", "json-ld", "machine-readable", "machine readable", "semantic html", "rich results"],
      themes: ["structured-data", "machine-readable"],
      description: "Technical implementation of machine-interpretable content",
    },
    {
      id: "technical-crawl",
      label: "Technical SEO & AI Crawlers",
      keywords: ["technical seo", "crawl budget", "robots.txt", "gptbot", "claudebot", "ai crawler", "core web vitals", "crawlability"],
      themes: ["technical-seo"],
      description: "Technical SEO evolution for multi-crawler environments",
    },
    {
      id: "umbraco-cms",
      label: "Umbraco & CMS Intelligence",
      keywords: ["umbraco", "umbraco cms", "umbraco ai", "codegarden", "cms ai readiness"],
      themes: ["umbraco-ai"],
      description: "CMS-specific authority and Umbraco ecosystem positioning",
    },
    {
      id: "source-confidence",
      label: "Source Confidence & Citation",
      keywords: ["source confidence", "citation", "source quality", "perplexity", "chatgpt search", "source selection", "topic authority"],
      themes: ["ai-search-visibility", "geo"],
      description: "How AI systems evaluate and select sources for citation",
    },
  ];

  return clusterDefs.map((def) => {
    const matchedTerms = terms.filter((t) =>
      def.keywords.some((kw) => t.term.includes(kw) || kw.includes(t.term))
    );
    const totalFreq = matchedTerms.reduce((s, t) => s + t.count, 0);
    const risingCount = matchedTerms.filter((t) => t.momentum === "rising").length;

    return {
      id: def.id,
      label: def.label,
      terms: matchedTerms.map((t) => t.term).slice(0, 8),
      frequency: totalFreq,
      momentum: (risingCount >= 2 ? "rising" : totalFreq >= 10 ? "stable" : totalFreq > 0 ? "emerging" : "declining") as SemanticCluster["momentum"],
      relatedThemes: def.themes,
      description: def.description,
    };
  }).sort((a, b) => b.frequency - a.frequency);
}

// ─── Narrative Momentum ──────────────────────────────────────

function detectNarrativeMomentum(): NarrativeMomentum[] {
  const narratives: NarrativeMomentum[] = [
    {
      narrative: "GEO is becoming a distinct discipline from traditional SEO",
      strength: 8,
      direction: "growing",
      evidence: [
        "GEO terminology appearing in agency services",
        "Conference talks on GEO increasing 3x",
        "B2B companies including GEO in RFPs",
      ],
      opportunityType: "dominate",
    },
    {
      narrative: "Entity trust is becoming a functional retrieval mechanism in AI search",
      strength: 7,
      direction: "growing",
      evidence: [
        "Knowledge Panel data used for LLM entity verification",
        "Semantic entity matching replacing keyword matching",
        "Entity confidence scoring emerging as a concept",
      ],
      opportunityType: "expand",
    },
    {
      narrative: "Structured data is shifting from Google-only to multi-platform AI signal",
      strength: 7,
      direction: "growing",
      evidence: [
        "Schema.org releasing AI agent types",
        "Multiple AI platforms evaluating structured data",
        "Structured data validation tools not testing for AI consumption",
      ],
      opportunityType: "dominate",
    },
    {
      narrative: "AI search visibility is becoming a measurable KPI category",
      strength: 6,
      direction: "emerging",
      evidence: [
        "Perplexity introducing topic authority scoring",
        "AI share of voice as an emerging concept",
        "AI citation rate being discussed as a metric",
      ],
      opportunityType: "enter",
    },
    {
      narrative: "Machine readability is evolving from best practice to competitive necessity",
      strength: 5,
      direction: "emerging",
      evidence: [
        "AI crawler frequency increasing 40%",
        "Semantic HTML adoption declining in templates",
        "Client-side vs server-side rendering affecting AI discoverability",
      ],
      opportunityType: "expand",
    },
    {
      narrative: "Generic 'AI for business' content is saturating and losing effectiveness",
      strength: 6,
      direction: "stable",
      evidence: [
        "Growing volume of shallow AI content",
        "Diminishing returns on generic AI articles",
        "Technical depth becoming a differentiator",
      ],
      opportunityType: "monitor",
    },
  ];

  return narratives.sort((a, b) => b.strength - a.strength);
}

// ─── Whitespace Detection ────────────────────────────────────

function detectWhitespace(): WhitespaceOpportunity[] {
  return [
    {
      area: "AI readiness measurement frameworks",
      description: "No standardised methodology exists for measuring AI readiness. Interon could define the standard.",
      competitiveGap: "wide",
      urgency: "high",
      suggestedAction: "Publish a comprehensive AI Readiness Scoring Framework with measurable criteria",
      relatedTheme: "ai-readiness",
    },
    {
      area: "Umbraco + AI integration guides",
      description: "The Umbraco community has near-zero AI readiness content. Complete authority vacuum.",
      competitiveGap: "wide",
      urgency: "high",
      suggestedAction: "Create the definitive Umbraco AI Readiness Guide for the community",
      relatedTheme: "umbraco-ai",
    },
    {
      area: "AI visibility benchmarking",
      description: "No established benchmarks for AI search visibility exist. First publisher defines the category.",
      competitiveGap: "wide",
      urgency: "medium",
      suggestedAction: "Develop and publish AI Visibility Benchmarks by industry/sector",
      relatedTheme: "ai-search-visibility",
    },
    {
      area: "GEO for professional services",
      description: "B2B professional services firms lack GEO-specific guidance. Underserved high-value audience.",
      competitiveGap: "moderate",
      urgency: "medium",
      suggestedAction: "Publish a GEO Guide for Professional Services with sector-specific methodology",
      relatedTheme: "geo",
    },
    {
      area: "Entity confidence scoring methodology",
      description: "Emerging concept with no established methodology. Opportunity to define the approach.",
      competitiveGap: "wide",
      urgency: "medium",
      suggestedAction: "Develop and publish an Entity Confidence Scoring Methodology",
      relatedTheme: "entity-trust",
    },
    {
      area: "AI crawler management for enterprises",
      description: "Enterprise robots.txt strategies for AI crawlers are undocumented. Technical authority opportunity.",
      competitiveGap: "moderate",
      urgency: "low",
      suggestedAction: "Create an Enterprise AI Crawler Management Guide",
      relatedTheme: "technical-seo",
    },
  ];
}

// ─── Saturation Detection ────────────────────────────────────

function detectSaturation(): SaturationIndicator[] {
  return [
    { term: "AI for business", saturationLevel: "oversaturated", risk: "Content drowning in noise — diminishing returns", differentiation: "Focus on technical specifics, not general AI business advice" },
    { term: "SEO tips", saturationLevel: "oversaturated", risk: "Commodity content with no authority value", differentiation: "Publish advanced technical analysis, not beginner tips" },
    { term: "content marketing strategy", saturationLevel: "competitive", risk: "Crowded but still viable with depth", differentiation: "Position through GEO and AI-specific content strategy" },
    { term: "structured data implementation", saturationLevel: "moderate", risk: "Growing competition from tool vendors", differentiation: "Focus on AI-specific structured data outcomes, not just implementation" },
    { term: "generative engine optimisation", saturationLevel: "moderate", risk: "Competitors starting to enter", differentiation: "Maintain first-mover advantage with deeper methodology and case studies" },
    { term: "AI readiness audit", saturationLevel: "open", risk: "Low competition currently — window of opportunity", differentiation: "Establish the definitive methodology before competitors define it" },
    { term: "entity confidence scoring", saturationLevel: "open", risk: "Extremely low competition — concept still emerging", differentiation: "Define the concept and own the category" },
    { term: "machine-readable website", saturationLevel: "open", risk: "Virtually no competition", differentiation: "Create the standard framework others reference" },
  ];
}

// ─── Main Report ─────────────────────────────────────────────

export function generateTrendReport(): TrendClusteringReport {
  const corpus = buildCorpus();
  const terminology = extractTerminology(corpus);
  const clusters = clusterTerms(terminology);
  const narratives = detectNarrativeMomentum();
  const whitespace = detectWhitespace();
  const saturation = detectSaturation();

  const insights: string[] = [];

  const risingClusters = clusters.filter((c) => c.momentum === "rising");
  if (risingClusters.length > 0) {
    insights.push(`${risingClusters.length} semantic clusters are rising: ${risingClusters.map((c) => c.label).join(", ")}`);
  }

  const openTerms = saturation.filter((s) => s.saturationLevel === "open");
  if (openTerms.length > 0) {
    insights.push(`${openTerms.length} terms have virtually no competition: ${openTerms.map((s) => s.term).join(", ")}`);
  }

  const wideGaps = whitespace.filter((w) => w.competitiveGap === "wide");
  if (wideGaps.length > 0) {
    insights.push(`${wideGaps.length} wide-open authority gaps detected — first-mover advantage available`);
  }

  const dominateNarratives = narratives.filter((n) => n.opportunityType === "dominate");
  if (dominateNarratives.length > 0) {
    insights.push(`Category domination opportunity: ${dominateNarratives.map((n) => n.narrative.slice(0, 50)).join("; ")}`);
  }

  return { clusters, terminology, narratives, whitespace, saturation, insights };
}

// ─── Helpers ─────────────────────────────────────────────────

const stopPhrases = new Set([
  "the", "and", "for", "that", "this", "with", "from", "they", "have", "been",
  "more", "their", "which", "other", "each", "about", "such", "than", "most",
]);

function isStopPhrase(term: string): boolean {
  return stopPhrases.has(term) || term.split(" ").length > 5;
}
