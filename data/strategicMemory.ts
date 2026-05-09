export type MemoryType =
  | "completed-mission"
  | "successful-topic"
  | "authority-insight"
  | "content-performance"
  | "semantic-pattern"
  | "strategic-lesson";

export interface MemoryItem {
  id: string;
  date: string;
  type: MemoryType;
  theme: string; // theme id
  insight: string;
  authorityImpact: number; // 1-10
  semanticValue: number; // 1-10
  outcomeSummary: string;
  strategicNotes: string;
  category?: string;
  platform?: string;
}

// ─── Seed Data: Realistic Historical Memory ──────────────────
// Represents 4 weeks of prior strategic execution

export const seedMemory: MemoryItem[] = [
  // Week -4
  {
    id: "mem-001",
    date: "2026-04-14",
    type: "completed-mission",
    theme: "ai-readiness",
    insight: "LinkedIn post on AI readiness checklist generated strong engagement from CTOs",
    authorityImpact: 8,
    semanticValue: 7,
    outcomeSummary: "42 reactions, 12 comments, 3 DM inquiries about AI audits",
    strategicNotes: "CTO audience responds well to checklist format. AI readiness framing resonates more than 'AI SEO'.",
    category: "LinkedIn Authority Post",
    platform: "LinkedIn",
  },
  {
    id: "mem-002",
    date: "2026-04-15",
    type: "successful-topic",
    theme: "structured-data",
    insight: "Technical article on JSON-LD patterns for AI crawlers outperformed expectations",
    authorityImpact: 9,
    semanticValue: 8,
    outcomeSummary: "Top 3 organic position within 2 weeks, cited by 2 industry newsletters",
    strategicNotes: "Deep technical content with code examples performs significantly better than overview articles. Should prioritise implementation-focused structured data content.",
    category: "GEO Educational Article",
    platform: "Blog",
  },
  {
    id: "mem-003",
    date: "2026-04-16",
    type: "authority-insight",
    theme: "geo",
    insight: "GEO terminology is not yet saturated — early mover advantage still available",
    authorityImpact: 9,
    semanticValue: 9,
    outcomeSummary: "Competitive analysis shows fewer than 5 UK agencies using GEO terminology actively",
    strategicNotes: "Window of opportunity to define GEO category. Publish framework content before competitors adopt the terminology.",
  },
  {
    id: "mem-004",
    date: "2026-04-17",
    type: "content-performance",
    theme: "umbraco-ai",
    insight: "Umbraco community content gets shared widely within ecosystem but low external reach",
    authorityImpact: 7,
    semanticValue: 6,
    outcomeSummary: "Blog post shared in Umbraco Discord (200+ views) but limited LinkedIn traction",
    strategicNotes: "Umbraco content builds deep community authority but needs cross-platform amplification. Pair Umbraco posts with LinkedIn summaries.",
    category: "Umbraco Authority Contribution",
    platform: "Blog",
  },

  // Week -3
  {
    id: "mem-005",
    date: "2026-04-21",
    type: "completed-mission",
    theme: "entity-trust",
    insight: "Knowledge Panel optimisation efforts showing early results",
    authorityImpact: 7,
    semanticValue: 8,
    outcomeSummary: "Wikidata entry updated, sameAs links verified, Knowledge Panel now showing additional attributes",
    strategicNotes: "Entity reinforcement takes 2-4 weeks to reflect in Knowledge Panel. Consistent cross-platform signals are key.",
    category: "Entity Reinforcement",
    platform: "Google",
  },
  {
    id: "mem-006",
    date: "2026-04-22",
    type: "strategic-lesson",
    theme: "technical-seo",
    insight: "Technical SEO content performs best when anchored to a specific problem, not a general topic",
    authorityImpact: 8,
    semanticValue: 7,
    outcomeSummary: "Comparison: 'crawl budget management' post got 2x engagement vs generic 'technical SEO tips' post",
    strategicNotes: "Always frame technical SEO content around a specific problem or scenario. Avoid broad topic posts.",
  },
  {
    id: "mem-007",
    date: "2026-04-23",
    type: "semantic-pattern",
    theme: "ai-search-visibility",
    insight: "AI visibility + entity trust creates the strongest compound authority signal",
    authorityImpact: 9,
    semanticValue: 9,
    outcomeSummary: "Content combining both themes consistently outperforms single-theme content",
    strategicNotes: "Cross-theme content (AI visibility + entity trust) creates compounding authority. Prioritise content that bridges multiple core themes.",
  },
  {
    id: "mem-008",
    date: "2026-04-24",
    type: "completed-mission",
    theme: "geo",
    insight: "Case study draft on GEO for B2B SaaS showing strong narrative potential",
    authorityImpact: 8,
    semanticValue: 8,
    outcomeSummary: "First draft completed with before/after AI citation data. Client approved anonymised publication.",
    strategicNotes: "B2B SaaS is an underserved GEO audience. This case study could become a key authority asset.",
    category: "Case Study Development",
    platform: "Blog",
  },

  // Week -2
  {
    id: "mem-009",
    date: "2026-04-28",
    type: "content-performance",
    theme: "machine-readable",
    insight: "Machine-readable website checklist article becoming a consistent organic traffic driver",
    authorityImpact: 8,
    semanticValue: 8,
    outcomeSummary: "Steady organic growth — now ranking for 'machine readable website' and related terms",
    strategicNotes: "Checklist/framework content has long-tail staying power. Consider creating more framework-style pieces.",
    category: "GEO Educational Article",
    platform: "Blog",
  },
  {
    id: "mem-010",
    date: "2026-04-29",
    type: "strategic-lesson",
    theme: "ai-readiness",
    insight: "Video content takes 3x longer to produce but only 1.5x the reach of written content",
    authorityImpact: 5,
    semanticValue: 4,
    outcomeSummary: "YouTube audit video: 180 views in 2 weeks vs LinkedIn post: 120 views in 2 days",
    strategicNotes: "Written content is more authority-efficient. Use video selectively for high-impact topics only.",
    category: "YouTube Audit Breakdown",
    platform: "YouTube",
  },
  {
    id: "mem-011",
    date: "2026-04-30",
    type: "authority-insight",
    theme: "structured-data",
    insight: "Being cited in industry newsletters creates measurable authority compounding",
    authorityImpact: 9,
    semanticValue: 7,
    outcomeSummary: "After newsletter citation, saw 40% increase in branded search queries",
    strategicNotes: "Newsletter citations are high-value authority signals. Create content specifically designed to be newsletter-worthy.",
  },

  // Week -1
  {
    id: "mem-012",
    date: "2026-05-05",
    type: "completed-mission",
    theme: "geo",
    insight: "LinkedIn GEO series generating consistent authority positioning signals",
    authorityImpact: 8,
    semanticValue: 9,
    outcomeSummary: "4-post GEO series completed. Average 35 reactions per post. Multiple DMs requesting GEO consultations.",
    strategicNotes: "Series format works well for authority building. Each post reinforces the previous. Plan more thematic series.",
    category: "LinkedIn Authority Post",
    platform: "LinkedIn",
  },
  {
    id: "mem-013",
    date: "2026-05-06",
    type: "semantic-pattern",
    theme: "ai-readiness",
    insight: "Market shifting from 'AI for business' to 'AI readiness' — Interon's framing winning",
    authorityImpact: 10,
    semanticValue: 10,
    outcomeSummary: "Competitor audit shows 3 agencies now using 'AI readiness' terminology Interon popularised",
    strategicNotes: "Critical validation that semantic category creation is working. Double down on AI readiness framework content.",
  },
  {
    id: "mem-014",
    date: "2026-05-07",
    type: "content-performance",
    theme: "entity-trust",
    insight: "Founder insight posts on entity trust outperform educational posts on the same topic",
    authorityImpact: 7,
    semanticValue: 6,
    outcomeSummary: "Personal perspective post: 55 reactions vs educational post: 28 reactions on same topic",
    strategicNotes: "Entity trust content benefits from personal authority framing. Founder voice builds trust faster than institutional voice.",
    category: "LinkedIn Authority Post",
    platform: "LinkedIn",
  },
  {
    id: "mem-015",
    date: "2026-05-08",
    type: "strategic-lesson",
    theme: "geo",
    insight: "Publishing first on emerging topics creates lasting citation advantage",
    authorityImpact: 9,
    semanticValue: 9,
    outcomeSummary: "GEO framework article published 3 weeks before competitor equivalents — still ranking #1 and being cited by AI systems",
    strategicNotes: "First-mover advantage in GEO content is real and measurable. Speed of publication on emerging topics is a strategic priority.",
  },
];
