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
