export type AuthorityLevel = "core" | "supporting" | "emerging";

export interface Theme {
  id: string;
  name: string;
  description: string;
  strategicGoal: string;
  targetAudience: string;
  authorityLevel: AuthorityLevel;
  relatedThemes: string[]; // theme ids
  keywords: string[];
  contentAngles: string[]; // content angle ids
}

export const themes: Theme[] = [
  {
    id: "ai-readiness",
    name: "AI Readiness",
    description:
      "Preparing organisations and their digital properties to perform in an AI-first search landscape. Covers technical, structural, and strategic readiness.",
    strategicGoal:
      "Position Interon as the definitive authority on making websites and businesses AI-ready",
    targetAudience:
      "CTOs, digital directors, marketing leaders at mid-market companies",
    authorityLevel: "core",
    relatedThemes: ["geo", "structured-data", "entity-trust", "ai-search-visibility"],
    keywords: [
      "AI readiness",
      "AI-ready website",
      "AI readiness audit",
      "AI readiness framework",
      "AI preparedness",
    ],
    contentAngles: [
      "audit-breakdown",
      "framework-explanation",
      "before-vs-after",
      "strategic-warning",
    ],
  },
  {
    id: "geo",
    name: "Generative Engine Optimisation",
    description:
      "Optimising content and websites specifically for generative AI engines — ensuring LLMs can discover, understand, and cite your content.",
    strategicGoal:
      "Own the GEO category in the UK consultancy space before competitors define it",
    targetAudience:
      "SEO managers, content strategists, heads of digital",
    authorityLevel: "core",
    relatedThemes: ["ai-readiness", "machine-readable", "ai-search-visibility", "entity-trust"],
    keywords: [
      "GEO",
      "generative engine optimisation",
      "LLM optimisation",
      "AI search optimisation",
      "generative SEO",
    ],
    contentAngles: [
      "technical-explainer",
      "myth-busting",
      "founder-insight",
      "framework-explanation",
    ],
  },
  {
    id: "umbraco-ai",
    name: "Umbraco AI Visibility",
    description:
      "Leveraging Umbraco CMS capabilities to build AI-visible, machine-readable websites. Bridging the Umbraco community with AI-first strategies.",
    strategicGoal:
      "Become the recognised Umbraco + AI authority globally within the Umbraco ecosystem",
    targetAudience:
      "Umbraco developers, agencies, solution architects, Umbraco community",
    authorityLevel: "core",
    relatedThemes: ["ai-readiness", "structured-data", "machine-readable", "technical-seo"],
    keywords: [
      "Umbraco AI",
      "Umbraco structured data",
      "Umbraco SEO",
      "Umbraco AI readiness",
      "Umbraco schema markup",
    ],
    contentAngles: [
      "audit-breakdown",
      "case-study",
      "technical-explainer",
      "before-vs-after",
    ],
  },
  {
    id: "entity-trust",
    name: "Entity Trust",
    description:
      "Building verifiable entity identity and trust signals that AI systems use to evaluate source credibility and citation worthiness.",
    strategicGoal:
      "Establish entity trust as a core pillar of modern SEO strategy in industry discourse",
    targetAudience:
      "SEO professionals, brand managers, digital PR specialists",
    authorityLevel: "core",
    relatedThemes: ["ai-readiness", "geo", "structured-data", "ai-search-visibility"],
    keywords: [
      "entity trust",
      "entity authority",
      "knowledge panel",
      "entity recognition",
      "entity confidence",
    ],
    contentAngles: [
      "myth-busting",
      "technical-explainer",
      "framework-explanation",
      "founder-insight",
    ],
  },
  {
    id: "structured-data",
    name: "Structured Data",
    description:
      "Implementing and optimising schema markup and structured data to make content machine-interpretable across search engines and AI systems.",
    strategicGoal:
      "Be the go-to resource for advanced structured data implementation beyond basic how-tos",
    targetAudience:
      "Technical SEO specialists, web developers, CMS architects",
    authorityLevel: "supporting",
    relatedThemes: ["ai-readiness", "umbraco-ai", "machine-readable", "entity-trust"],
    keywords: [
      "structured data",
      "schema markup",
      "JSON-LD",
      "rich results",
      "semantic markup",
    ],
    contentAngles: [
      "technical-explainer",
      "audit-breakdown",
      "before-vs-after",
      "case-study",
    ],
  },
  {
    id: "machine-readable",
    name: "Machine-Readable Websites",
    description:
      "Designing and building websites that are fully comprehensible to AI crawlers, LLMs, and automated systems through semantic HTML, clean architecture, and structured content.",
    strategicGoal:
      "Define the machine-readable website standard and be cited as the source of that framework",
    targetAudience:
      "Web developers, UX architects, technical directors",
    authorityLevel: "supporting",
    relatedThemes: ["ai-readiness", "structured-data", "umbraco-ai", "technical-seo"],
    keywords: [
      "machine-readable website",
      "semantic HTML",
      "AI-friendly website",
      "accessible to AI",
      "machine-interpretable content",
    ],
    contentAngles: [
      "framework-explanation",
      "technical-explainer",
      "audit-breakdown",
      "industry-critique",
    ],
  },
  {
    id: "technical-seo",
    name: "Technical SEO for AI",
    description:
      "Evolving technical SEO practices to account for AI crawlers, LLM indexing, and generative search — beyond traditional Googlebot optimisation.",
    strategicGoal:
      "Redefine technical SEO for the AI era and lead that conversation publicly",
    targetAudience:
      "SEO specialists, web performance engineers, dev teams",
    authorityLevel: "supporting",
    relatedThemes: ["ai-readiness", "machine-readable", "structured-data", "umbraco-ai"],
    keywords: [
      "technical SEO",
      "AI crawlers",
      "crawl budget AI",
      "robots.txt AI",
      "GPTBot",
      "Core Web Vitals",
    ],
    contentAngles: [
      "technical-explainer",
      "audit-breakdown",
      "strategic-warning",
      "myth-busting",
    ],
  },
  {
    id: "ai-search-visibility",
    name: "AI Search Visibility",
    description:
      "Measuring and improving how visible a brand or website is within AI-generated search results, AI Overviews, and conversational AI interfaces.",
    strategicGoal:
      "Create the measurement framework for AI search visibility that the industry adopts",
    targetAudience:
      "CMOs, heads of SEO, digital strategists, analytics teams",
    authorityLevel: "emerging",
    relatedThemes: ["geo", "ai-readiness", "entity-trust", "technical-seo"],
    keywords: [
      "AI search visibility",
      "AI Overviews",
      "LLM citations",
      "AI brand visibility",
      "AI share of voice",
    ],
    contentAngles: [
      "framework-explanation",
      "founder-insight",
      "strategic-warning",
      "industry-critique",
    ],
  },

  // ─── New broader themes (added to widen content surface) ───
  // The themes above this line are the original AI-readiness
  // cluster. Their weights are intentionally dimmed in
  // dayStrategies so the themes below get fair air-time.

  {
    id: "umbraco-craft",
    name: "Umbraco Craft",
    description:
      "General Umbraco development — patterns, gotchas, package choices, v15→v16, headless setups, .NET conventions. Authority in the Umbraco community beyond the narrow AI lens.",
    strategicGoal:
      "Become a recognised technical voice in the global Umbraco community, not only the Umbraco+AI corner",
    targetAudience:
      "Umbraco developers, technical leads, agencies, solution architects",
    authorityLevel: "core",
    relatedThemes: ["umbraco-ai", "enterprise-architecture", "ai-readiness"],
    keywords: [
      "Umbraco",
      "Umbraco development",
      "Umbraco v15",
      "Umbraco v16",
      "headless Umbraco",
      ".NET CMS",
    ],
    contentAngles: [
      "technical-explainer",
      "audit-breakdown",
      "case-study",
      "before-vs-after",
    ],
  },

  {
    id: "founder-pov",
    name: "Founder POV & Industry Critique",
    description:
      "George's personal voice. Hot takes on the SEO/GEO/agency industry, lessons from running Interon, history-of-the-web perspective from 30 years in. Personal, opinionated, occasionally argumentative.",
    strategicGoal:
      "Build George Whiteside as a recognisable founder voice in the AI-visibility space",
    targetAudience:
      "Agency founders, in-house SEO leaders, B2B consultants, founders generally",
    authorityLevel: "core",
    relatedThemes: ["ai-readiness", "ai-workflow", "umbraco-craft"],
    keywords: [
      "founder perspective",
      "agency life",
      "industry critique",
      "Interon",
      "George Whiteside",
      "consultancy",
    ],
    contentAngles: [
      "founder-insight",
      "industry-critique",
      "strategic-warning",
      "before-vs-after",
    ],
  },

  {
    id: "ai-workflow",
    name: "AI in Business Workflow",
    description:
      "Using LLMs and AI tools in the day-to-day work of running a consultancy — proposals, research, audits, dev work. NOT about AI for SEO. About AI augmenting how a B2B services business operates.",
    strategicGoal:
      "Position Interon as one of the consultancies that actually uses AI internally, with real receipts",
    targetAudience:
      "Agency owners, consultancy leaders, B2B services founders, ops-minded operators",
    authorityLevel: "core",
    relatedThemes: ["founder-pov", "enterprise-architecture", "original-research"],
    keywords: [
      "AI workflow",
      "Claude for business",
      "AI-augmented consultancy",
      "LLM in operations",
      "AI agents in services",
    ],
    contentAngles: [
      "technical-explainer",
      "founder-insight",
      "case-study",
      "framework-explanation",
    ],
  },

  {
    id: "enterprise-architecture",
    name: "Enterprise Architecture & Integration",
    description:
      "Custom .NET application development, API-first integrations, CRM/ERP bridges, the architecture work that sits behind the websites. The technical-delivery side of Interon that isn't pure SEO.",
    strategicGoal:
      "Surface the full delivery capability — Interon is not only an audit shop",
    targetAudience:
      "CTOs, IT directors, mid-market technology leads, integration architects",
    authorityLevel: "core",
    relatedThemes: ["umbraco-craft", "ai-workflow", "ai-readiness"],
    keywords: [
      ".NET application development",
      "API-first integration",
      "CRM integration",
      "ERP integration",
      "custom application",
      "enterprise architecture",
    ],
    contentAngles: [
      "technical-explainer",
      "framework-explanation",
      "case-study",
      "audit-breakdown",
    ],
  },

  {
    id: "original-research",
    name: "Original Research & Audit Data",
    description:
      "Findings from running real audits at scale — the 300-site Tranco-top-100 study, entity-confidence patterns, AI Overviews citation analysis. Differentiator: Interon has measured the things competitors only talk about.",
    strategicGoal:
      "Become the source of data others cite about AI visibility patterns",
    targetAudience:
      "Senior SEO professionals, analysts, journalists covering AI search, fellow consultancies",
    authorityLevel: "core",
    relatedThemes: ["ai-readiness", "ai-search-visibility", "founder-pov"],
    keywords: [
      "audit research",
      "AI Overviews data",
      "entity confidence research",
      "Tranco study",
      "AI readiness scoring",
    ],
    contentAngles: [
      "framework-explanation",
      "audit-breakdown",
      "before-vs-after",
      "strategic-warning",
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────

export function getThemeById(id: string): Theme | undefined {
  return themes.find((t) => t.id === id);
}

export function getRelatedThemes(themeId: string): Theme[] {
  const theme = getThemeById(themeId);
  if (!theme) return [];
  return theme.relatedThemes
    .map((id) => getThemeById(id))
    .filter((t): t is Theme => t !== undefined);
}

export function getThemesByAuthority(level: AuthorityLevel): Theme[] {
  return themes.filter((t) => t.authorityLevel === level);
}
