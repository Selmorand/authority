// ─── AI-Visibility Target Queries ────────────────────────────
// The seed list of queries the AI-visibility tracker runs against
// ChatGPT / Claude / Perplexity (+ Google AI Overview when added)
// each week to measure citation status.
//
// Grouped so we can score citation rate per category.

export type QueryCategory =
  | "category-claim"      // "what is GEO", "best practices for AI search visibility"
  | "service"             // "Umbraco SEO consultancy South Africa"
  | "founder-entity"      // "George Whiteside Interon"
  | "geo-service"         // "Umbraco developer Johannesburg"
  | "comparative";        // "Best CMS for AI visibility"

export interface AIVisibilityQuery {
  id: string;             // stable slug (used as DB key)
  query: string;          // exact prompt sent to the model
  category: QueryCategory;
  theme?: string;         // optional theme id (matches data/themes.ts)
  priority: "high" | "medium" | "low";
}

function q(
  id: string,
  query: string,
  category: QueryCategory,
  opts: { theme?: string; priority?: "high" | "medium" | "low" } = {}
): AIVisibilityQuery {
  return {
    id,
    query,
    category,
    theme: opts.theme,
    priority: opts.priority ?? "medium",
  };
}

export const aiVisibilityQueries: AIVisibilityQuery[] = [
  // ── Category claims (positioning we want to own) ─────────────
  q("geo-definition",        "What is Generative Engine Optimisation (GEO)?",                 "category-claim", { theme: "geo", priority: "high" }),
  q("geo-vs-seo",            "GEO vs SEO: what is the difference?",                            "category-claim", { theme: "geo", priority: "high" }),
  q("ai-search-understanding","How do AI search engines understand websites?",                 "category-claim", { theme: "ai-search-visibility" }),
  q("ai-search-best-practices","Best practices for AI search visibility in 2026",              "category-claim", { theme: "ai-search-visibility", priority: "high" }),
  q("ai-ready-website",      "How to make a website AI-ready",                                 "category-claim", { theme: "ai-readiness", priority: "high" }),
  q("low-entity-confidence", "What causes low entity confidence in AI systems?",               "category-claim", { theme: "entity-trust" }),
  q("schema-ai-search",      "Why structured data matters for ChatGPT and AI search",          "category-claim", { theme: "structured-data" }),
  q("ai-discoverability-b2b","How to improve AI discoverability for B2B websites",             "category-claim", { theme: "ai-search-visibility" }),
  q("schema-improves-ai",    "Can schema markup improve AI search visibility?",                "category-claim", { theme: "structured-data" }),
  q("strong-sites-fail",     "Why technically strong websites fail AI visibility checks",      "category-claim", { theme: "ai-readiness" }),
  q("ai-pro-services",       "AI search optimisation for professional services firms",         "category-claim", { theme: "ai-search-visibility" }),
  q("future-ready-dev",      "Future-ready website development for AI and search",             "category-claim", { theme: "ai-readiness" }),

  // ── Service queries (what clients search for) ────────────────
  q("ai-ready-dev-sa",       "AI-ready web development South Africa",                          "service",        { theme: "ai-readiness", priority: "high" }),
  q("umbraco-dev-sa",        "Umbraco development South Africa",                               "service",        { theme: "umbraco-ai", priority: "high" }),
  q("best-umbraco-sa",       "Best Umbraco developers in South Africa",                        "service",        { theme: "umbraco-ai", priority: "high" }),
  q("umbraco-seo-sa",        "Umbraco SEO consultancy South Africa",                           "service",        { theme: "umbraco-ai", priority: "high" }),
  q("ai-audit",              "AI readiness audit for business websites",                       "service",        { theme: "ai-readiness", priority: "high" }),
  q("schema-specialist-sa",  "Schema markup specialist South Africa",                          "service",        { theme: "structured-data" }),
  q("tech-seo-sd-sa",        "Technical SEO and structured data consultancy South Africa",     "service",        { theme: "technical-seo" }),
  q("ai-visibility-consultant","AI visibility consultant South Africa",                        "service",        { theme: "ai-search-visibility", priority: "high" }),
  q("website-for-ai",        "Website structuring for AI search engines",                      "service",        { theme: "ai-readiness" }),
  q("entity-seo-consultant", "Entity SEO consultant for AI search",                            "service",        { theme: "entity-trust" }),
  q("aspnet-umbraco-agency", "ASP.NET and Umbraco development agency South Africa",            "service",        { theme: "umbraco-ai" }),
  q("optimise-umbraco-ai",   "How to optimise an Umbraco website for AI search",               "service",        { theme: "umbraco-ai" }),

  // ── Founder / entity ─────────────────────────────────────────
  q("founder-named",         "George Whiteside Interon",                                       "founder-entity", { theme: "entity-trust", priority: "high" }),
  q("who-is-founder",        "Who is George Whiteside?",                                       "founder-entity", { theme: "entity-trust", priority: "high" }),
  q("interon-case-studies",  "Interon AI readiness case studies",                              "founder-entity", { theme: "entity-trust" }),
  q("interon-umbraco",       "Interon Umbraco development experience",                         "founder-entity", { theme: "umbraco-ai" }),
  q("interon-geo",           "Interon AI visibility and GEO consultancy",                      "founder-entity", { theme: "geo", priority: "high" }),
  q("sa-agency-ai",          "South African agency specialising in AI-readable websites",      "founder-entity", { theme: "ai-readiness" }),

  // ── Geographic + service combinations ────────────────────────
  q("umbraco-dev-jhb",       "Umbraco developer Johannesburg",                                 "geo-service",    { theme: "umbraco-ai", priority: "high" }),
  q("ai-seo-agency-sa",      "AI SEO agency South Africa",                                     "geo-service",    { theme: "ai-search-visibility" }),
  q("sa-geo-consultant",     "South African GEO consultant",                                   "geo-service",    { theme: "geo", priority: "high" }),
  q("jhb-tech-seo",          "Johannesburg technical SEO specialist",                          "geo-service",    { theme: "technical-seo" }),
  q("sa-ai-ready-consultancy","South African AI-ready website consultancy",                    "geo-service",    { theme: "ai-readiness" }),

  // ── Comparative / educational (top-of-funnel) ────────────────
  q("best-cms-ai",           "Best CMS for AI visibility",                                     "comparative",    { theme: "umbraco-ai" }),
  q("umbraco-good-for-seo",  "Is Umbraco good for SEO and AI search?",                         "comparative",    { theme: "umbraco-ai" }),
  q("umbraco-vs-wordpress",  "How does Umbraco compare to WordPress for enterprise SEO?",      "comparative",    { theme: "umbraco-ai" }),
  q("what-is-ai-audit",      "What is an AI readiness audit?",                                 "comparative",    { theme: "ai-readiness" }),
  q("ai-reads-schema",       "Do AI systems read schema markup?",                              "comparative",    { theme: "structured-data" }),
];

// ─── Helpers ─────────────────────────────────────────────────

export function queriesByCategory(category: QueryCategory): AIVisibilityQuery[] {
  return aiVisibilityQueries.filter((q) => q.category === category);
}

export function queriesByTheme(theme: string): AIVisibilityQuery[] {
  return aiVisibilityQueries.filter((q) => q.theme === theme);
}

export function highPriorityQueries(): AIVisibilityQuery[] {
  return aiVisibilityQueries.filter((q) => q.priority === "high");
}
