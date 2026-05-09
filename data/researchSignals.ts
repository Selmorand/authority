export type SignalCategory =
  | "trend"
  | "topic-shift"
  | "industry-observation"
  | "competitor-pattern"
  | "semantic-opportunity"
  | "authority-gap";

export type SignalUrgency = "high" | "medium" | "low";

export type AlertType =
  | "high-priority-opportunity"
  | "authority-gap-warning"
  | "emerging-trend"
  | "competitor-movement"
  | "topic-saturation-risk";

export interface ResearchSignal {
  id: string;
  title: string;
  category: SignalCategory;
  relevance: number; // 1-10
  authorityOpportunity: number; // 1-10
  urgency: SignalUrgency;
  relatedThemes: string[]; // theme ids
  insightSummary: string;
  suggestedActions: string[];
  alertType: AlertType;
  dateDetected: string; // ISO date
}

export const researchSignals: ResearchSignal[] = [
  // ─── High Urgency ─────────────────────────────────────────
  {
    id: "sig-001",
    title: "Google AI Overviews now citing structured data sources more frequently",
    category: "trend",
    relevance: 9,
    authorityOpportunity: 9,
    urgency: "high",
    relatedThemes: ["structured-data", "ai-search-visibility", "geo"],
    insightSummary:
      "Analysis of AI Overview citations shows a measurable increase in sources with comprehensive schema markup being cited. Sites with Organization, Article, and FAQ schema are appearing 3x more often than those without.",
    suggestedActions: [
      "Write a data-backed article on schema markup's impact on AI citations",
      "Create a LinkedIn post with before/after citation data",
      "Update the AI readiness audit checklist to weight structured data higher",
    ],
    alertType: "high-priority-opportunity",
    dateDetected: "2026-05-07",
  },
  {
    id: "sig-002",
    title: "GEO terminology adoption accelerating in UK SEO communities",
    category: "topic-shift",
    relevance: 9,
    authorityOpportunity: 10,
    urgency: "high",
    relatedThemes: ["geo", "ai-readiness", "ai-search-visibility"],
    insightSummary:
      "The term 'Generative Engine Optimisation' is appearing in more LinkedIn discussions, conference talks, and blog posts within UK SEO circles. Early movers defining the category will establish long-term authority positioning.",
    suggestedActions: [
      "Publish a definitive GEO framework article before competitors",
      "Create a LinkedIn series establishing Interon as a GEO authority",
      "Propose a GEO-focused talk for upcoming UK SEO conferences",
    ],
    alertType: "high-priority-opportunity",
    dateDetected: "2026-05-05",
  },
  {
    id: "sig-003",
    title: "Umbraco community showing zero AI readiness discussion",
    category: "authority-gap",
    relevance: 8,
    authorityOpportunity: 10,
    urgency: "high",
    relatedThemes: ["umbraco-ai", "ai-readiness", "structured-data"],
    insightSummary:
      "The Umbraco community forums, Discord, and blog ecosystem have almost no content about AI readiness, GEO, or structured data for AI visibility. This is a wide-open authority gap that Interon can own completely.",
    suggestedActions: [
      "Write the first Umbraco + AI readiness guide for the community",
      "Submit a community PR for AI readiness checklist in Umbraco",
      "Propose an Umbraco + AI talk for Codegarden or local meetups",
      "Create a case study from an Umbraco AI readiness project",
    ],
    alertType: "authority-gap-warning",
    dateDetected: "2026-05-06",
  },
  {
    id: "sig-004",
    title: "ClaudeBot and GPTBot crawl frequency increasing across monitored sites",
    category: "industry-observation",
    relevance: 8,
    authorityOpportunity: 8,
    urgency: "high",
    relatedThemes: ["technical-seo", "machine-readable", "ai-readiness"],
    insightSummary:
      "Server log analysis shows a 40% increase in AI crawler visits over the past quarter. ClaudeBot, GPTBot, and PerplexityBot are now visiting more frequently than some traditional crawlers. Most sites have no strategy for managing this traffic.",
    suggestedActions: [
      "Publish a technical breakdown of AI crawler behaviour patterns",
      "Create a robots.txt management guide for AI crawlers",
      "Build a server log analysis case study showing crawler frequency data",
    ],
    alertType: "emerging-trend",
    dateDetected: "2026-05-08",
  },

  // ─── Medium Urgency ────────────────────────────────────────
  {
    id: "sig-005",
    title: "Enterprise SEO agencies beginning to mention 'AI readiness' in service pages",
    category: "competitor-pattern",
    relevance: 7,
    authorityOpportunity: 7,
    urgency: "medium",
    relatedThemes: ["ai-readiness", "ai-search-visibility", "geo"],
    insightSummary:
      "Three major UK SEO agencies have added 'AI readiness' or 'AI-ready SEO' to their service offerings in the past month. However, none have published substantive content or frameworks — it's primarily positioning without depth.",
    suggestedActions: [
      "Audit competitor AI readiness pages and identify depth gaps",
      "Publish a detailed AI readiness framework that competitors can't easily replicate",
      "Create comparison content positioning Interon's technical depth vs generic claims",
    ],
    alertType: "competitor-movement",
    dateDetected: "2026-05-04",
  },
  {
    id: "sig-006",
    title: "Entity confidence becoming measurable through Knowledge Panel changes",
    category: "semantic-opportunity",
    relevance: 8,
    authorityOpportunity: 8,
    urgency: "medium",
    relatedThemes: ["entity-trust", "structured-data", "ai-search-visibility"],
    insightSummary:
      "Emerging research shows correlations between Knowledge Panel presence/completeness and AI citation frequency. Entities with verified, cross-referenced data are being cited more reliably by LLMs.",
    suggestedActions: [
      "Write a technical article connecting Knowledge Panel signals to AI citations",
      "Develop an entity confidence scoring methodology",
      "Create a founder insight piece on personal entity authority building",
    ],
    alertType: "emerging-trend",
    dateDetected: "2026-05-03",
  },
  {
    id: "sig-007",
    title: "Perplexity introducing source quality indicators in search results",
    category: "industry-observation",
    relevance: 8,
    authorityOpportunity: 7,
    urgency: "medium",
    relatedThemes: ["geo", "ai-search-visibility", "entity-trust"],
    insightSummary:
      "Perplexity is testing visible source quality indicators that show users why certain sources were selected. This makes AI source selection criteria more transparent and creates a measurable optimisation target.",
    suggestedActions: [
      "Document Perplexity's source quality signals for a technical breakdown",
      "Test how different content structures affect Perplexity citation selection",
      "Create a GEO-focused guide specifically for Perplexity optimisation",
    ],
    alertType: "high-priority-opportunity",
    dateDetected: "2026-05-06",
  },
  {
    id: "sig-008",
    title: "Semantic HTML adoption declining in new CMS templates",
    category: "industry-observation",
    relevance: 7,
    authorityOpportunity: 7,
    urgency: "medium",
    relatedThemes: ["machine-readable", "technical-seo", "umbraco-ai"],
    insightSummary:
      "Analysis of popular CMS starter templates shows a trend toward div-heavy markup with CSS-only semantics. This makes websites less machine-readable at a time when AI crawlers need semantic signals more than ever.",
    suggestedActions: [
      "Write an industry critique on declining semantic HTML standards",
      "Create a machine-readable website scoring tool concept",
      "Publish a comparison showing how AI crawlers parse semantic vs non-semantic markup",
    ],
    alertType: "authority-gap-warning",
    dateDetected: "2026-05-02",
  },

  // ─── Low Urgency ───────────────────────────────────────────
  {
    id: "sig-009",
    title: "LinkedIn algorithm favouring educational carousels over text posts",
    category: "topic-shift",
    relevance: 6,
    authorityOpportunity: 5,
    urgency: "low",
    relatedThemes: ["ai-readiness", "geo", "entity-trust"],
    insightSummary:
      "LinkedIn engagement data suggests educational carousels and document posts are receiving 2-3x more reach than text-only posts. This affects content format strategy for authority building.",
    suggestedActions: [
      "Convert top-performing text posts into carousel format",
      "Create an AI readiness carousel summarising the audit checklist",
      "Test carousel vs text post performance for GEO-focused content",
    ],
    alertType: "emerging-trend",
    dateDetected: "2026-05-01",
  },
  {
    id: "sig-010",
    title: "Growing saturation in generic 'AI for business' content",
    category: "competitor-pattern",
    relevance: 7,
    authorityOpportunity: 6,
    urgency: "low",
    relatedThemes: ["ai-readiness", "ai-search-visibility"],
    insightSummary:
      "The volume of generic 'AI for business' content has increased dramatically, creating noise that drowns out substantive technical content. This makes Interon's specific, technical positioning more valuable but harder to discover.",
    suggestedActions: [
      "Double down on technical depth that generic content can't match",
      "Use specific data and case studies to differentiate from surface-level content",
      "Target long-tail, technically specific queries that generic content ignores",
    ],
    alertType: "topic-saturation-risk",
    dateDetected: "2026-04-28",
  },
  {
    id: "sig-011",
    title: "Structured data validation tools not testing for AI crawler consumption",
    category: "authority-gap",
    relevance: 7,
    authorityOpportunity: 8,
    urgency: "low",
    relatedThemes: ["structured-data", "technical-seo", "machine-readable"],
    insightSummary:
      "Current schema validation tools (Schema.org validator, Rich Results Test) only check syntax and Google compatibility. None test whether structured data is actually being consumed by AI systems like ChatGPT or Perplexity.",
    suggestedActions: [
      "Conceptualise an AI-specific structured data validation methodology",
      "Publish a guide on manually testing structured data consumption by AI",
      "Create content positioning this gap as a major blind spot in technical SEO",
    ],
    alertType: "authority-gap-warning",
    dateDetected: "2026-04-25",
  },
  {
    id: "sig-012",
    title: "B2B SaaS companies beginning to ask about GEO in RFPs",
    category: "semantic-opportunity",
    relevance: 7,
    authorityOpportunity: 7,
    urgency: "medium",
    relatedThemes: ["geo", "ai-readiness", "ai-search-visibility"],
    insightSummary:
      "Several B2B SaaS companies have started including AI search visibility and GEO requirements in their digital marketing RFPs. This signals market readiness for GEO as a purchasable service.",
    suggestedActions: [
      "Develop a GEO service page with clear deliverables and methodology",
      "Create a GEO case study targeting B2B SaaS decision-makers",
      "Write a LinkedIn post addressing what GEO means for B2B marketing teams",
    ],
    alertType: "high-priority-opportunity",
    dateDetected: "2026-05-07",
  },
];

// ─── Helpers ─────────────────────────────────────────────────

export function getSignalsByUrgency(urgency: SignalUrgency): ResearchSignal[] {
  return researchSignals.filter((s) => s.urgency === urgency);
}

export function getSignalsByTheme(themeId: string): ResearchSignal[] {
  return researchSignals.filter((s) => s.relatedThemes.includes(themeId));
}

export function getSignalsByAlert(alertType: AlertType): ResearchSignal[] {
  return researchSignals.filter((s) => s.alertType === alertType);
}
