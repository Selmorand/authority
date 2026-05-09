export type EcosystemArea =
  | "google-ai"
  | "openai"
  | "anthropic"
  | "bing-ai"
  | "geo-adoption"
  | "semantic-search"
  | "entity-seo"
  | "structured-data";

export interface EcosystemDevelopment {
  id: string;
  area: EcosystemArea;
  title: string;
  summary: string;
  impact: "high" | "medium" | "low";
  dateObserved: string;
  relevantThemes: string[];
  interonImplication: string;
}

export interface GEOTerminologySignal {
  term: string;
  frequency: "rising" | "stable" | "emerging" | "declining";
  context: string;
  firstSeen: string;
  platforms: string[];
}

export const ecosystemDevelopments: EcosystemDevelopment[] = [
  {
    id: "eco-001",
    area: "google-ai",
    title: "AI Overviews expanding to more query types including commercial intent",
    summary: "Google is broadening AI Overview triggers beyond informational queries. Commercial and comparison queries now increasingly show AI-generated summaries, shifting click-through patterns for B2B content.",
    impact: "high",
    dateObserved: "2026-05-06",
    relevantThemes: ["ai-search-visibility", "geo", "technical-seo"],
    interonImplication: "Content optimised for AI citation in commercial queries becomes critical. Interon should create GEO frameworks specifically for B2B commercial content.",
  },
  {
    id: "eco-002",
    area: "openai",
    title: "ChatGPT search introducing source attribution improvements",
    summary: "OpenAI is enhancing how ChatGPT surfaces and attributes sources in search results, with clearer citation links and source quality indicators visible to users.",
    impact: "high",
    dateObserved: "2026-05-04",
    relevantThemes: ["ai-search-visibility", "entity-trust", "geo"],
    interonImplication: "Stronger attribution means higher-authority sources gain more visibility. Entity trust and structured data become direct ranking factors in ChatGPT search.",
  },
  {
    id: "eco-003",
    area: "anthropic",
    title: "Claude introducing web search with structured source evaluation",
    summary: "Anthropic is rolling out web search capabilities for Claude with an emphasis on evaluating source credibility through structured data, entity verification, and cross-referencing.",
    impact: "high",
    dateObserved: "2026-05-03",
    relevantThemes: ["ai-readiness", "structured-data", "entity-trust"],
    interonImplication: "Claude's emphasis on structured source evaluation validates Interon's core thesis. Content with strong schema markup and entity signals will be preferentially selected.",
  },
  {
    id: "eco-004",
    area: "bing-ai",
    title: "Bing Copilot increasing citation density in responses",
    summary: "Microsoft's Bing Copilot is now citing more sources per response, with a preference for sources that provide clear, structured answers with supporting evidence.",
    impact: "medium",
    dateObserved: "2026-05-01",
    relevantThemes: ["ai-search-visibility", "machine-readable", "structured-data"],
    interonImplication: "Higher citation density means more opportunities to appear in AI responses. Machine-readable content structure becomes a competitive advantage.",
  },
  {
    id: "eco-005",
    area: "geo-adoption",
    title: "GEO appearing in agency service offerings across UK and US markets",
    summary: "Multiple agencies are now listing GEO or 'generative engine optimisation' as a service. Most lack substantive methodology — positioning is surface-level.",
    impact: "high",
    dateObserved: "2026-05-05",
    relevantThemes: ["geo", "ai-readiness"],
    interonImplication: "The GEO category is becoming competitive. Interon must demonstrate deeper methodology through case studies and frameworks to maintain first-mover authority.",
  },
  {
    id: "eco-006",
    area: "semantic-search",
    title: "Semantic entity matching becoming primary retrieval mechanism in AI search",
    summary: "AI search systems are shifting from keyword matching to entity-based retrieval. Sources with clear entity relationships and structured knowledge graphs are retrieved more frequently.",
    impact: "high",
    dateObserved: "2026-04-28",
    relevantThemes: ["entity-trust", "structured-data", "machine-readable"],
    interonImplication: "Entity trust is now a functional retrieval mechanism, not just a ranking signal. Interon's entity reinforcement strategy directly influences discoverability.",
  },
  {
    id: "eco-007",
    area: "entity-seo",
    title: "Knowledge Panel data being used as entity verification by LLMs",
    summary: "Research indicates that LLMs cross-reference Knowledge Panel data when evaluating source credibility. Entities with complete, consistent Knowledge Panels receive higher citation confidence.",
    impact: "high",
    dateObserved: "2026-04-30",
    relevantThemes: ["entity-trust", "ai-search-visibility"],
    interonImplication: "Knowledge Panel optimisation is no longer vanity — it directly influences AI citation confidence. Founder entity reinforcement is strategically critical.",
  },
  {
    id: "eco-008",
    area: "structured-data",
    title: "Schema.org releasing new types relevant to AI agent consumption",
    summary: "Schema.org is introducing structured data types designed for AI agent consumption, including action schemas and capability descriptions that help AI systems understand what services an entity provides.",
    impact: "medium",
    dateObserved: "2026-04-25",
    relevantThemes: ["structured-data", "machine-readable", "ai-readiness"],
    interonImplication: "Early adoption of new schema types creates competitive advantage. Interon should publish implementation guides before competitors.",
  },
  {
    id: "eco-009",
    area: "geo-adoption",
    title: "Conference talks on GEO increasing 3x year-over-year",
    summary: "SEO and digital marketing conferences are accepting significantly more talks on GEO, AI visibility, and AI-first content strategy compared to the previous year.",
    impact: "medium",
    dateObserved: "2026-05-02",
    relevantThemes: ["geo", "ai-search-visibility"],
    interonImplication: "Conference speaking opportunities on GEO are expanding. Interon should submit proposals to establish founder authority on the conference circuit.",
  },
  {
    id: "eco-010",
    area: "semantic-search",
    title: "Perplexity introducing topic authority scoring in source selection",
    summary: "Perplexity is testing a visible topic authority indicator that shows users why certain sources were selected, based on topical depth, publication consistency, and entity verification.",
    impact: "high",
    dateObserved: "2026-05-07",
    relevantThemes: ["ai-search-visibility", "entity-trust", "geo"],
    interonImplication: "Visible authority scoring makes the connection between consistent publishing and AI visibility measurable and demonstrable to clients.",
  },
];

export const geoTerminology: GEOTerminologySignal[] = [
  { term: "Generative Engine Optimisation", frequency: "rising", context: "Primary category term for AI search optimisation", firstSeen: "2024-11", platforms: ["LinkedIn", "Blog", "Conference"] },
  { term: "GEO", frequency: "rising", context: "Abbreviation gaining mainstream adoption", firstSeen: "2025-01", platforms: ["LinkedIn", "Twitter/X", "SEO Publications"] },
  { term: "AI visibility", frequency: "rising", context: "Broader concept covering all AI search presence", firstSeen: "2025-03", platforms: ["LinkedIn", "Blog", "Podcast"] },
  { term: "AI readiness", frequency: "stable", context: "Preparedness framing for AI-first search", firstSeen: "2025-06", platforms: ["LinkedIn", "Blog", "Agency Services"] },
  { term: "Entity confidence", frequency: "emerging", context: "Emerging metric for AI citation trust", firstSeen: "2026-01", platforms: ["Research", "Blog"] },
  { term: "Machine-readable website", frequency: "emerging", context: "Architectural approach to AI discoverability", firstSeen: "2025-09", platforms: ["Blog", "Conference"] },
  { term: "AI citation rate", frequency: "emerging", context: "Measurement of source appearance in AI responses", firstSeen: "2026-02", platforms: ["Research", "Blog"] },
  { term: "Semantic authority", frequency: "stable", context: "Authority built through topical depth and consistency", firstSeen: "2025-04", platforms: ["LinkedIn", "Blog"] },
  { term: "AI share of voice", frequency: "emerging", context: "Brand measurement in AI-generated answers", firstSeen: "2026-03", platforms: ["Research"] },
  { term: "Source confidence scoring", frequency: "emerging", context: "How AI systems evaluate source trustworthiness", firstSeen: "2026-04", platforms: ["Research", "Blog"] },
];
