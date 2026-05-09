export type MissionStatus = "pending" | "in-progress" | "completed";
export type MissionPriority = "high" | "medium" | "low";

export type MissionCategory =
  | "LinkedIn Authority Post"
  | "GEO Educational Article"
  | "YouTube Audit Breakdown"
  | "Case Study Development"
  | "Umbraco Authority Contribution"
  | "Research Collection"
  | "Entity Reinforcement"
  | "Technical SEO Breakdown";

export interface Mission {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  title: string;
  category: MissionCategory;
  authorityFocus: string;
  platform: string;
  estimatedTime: string;
  objective: string;
  topic: string;
  description: string;
  status: MissionStatus;
  priority: MissionPriority;
}

// ─── 2 Weeks of Realistic Mock Missions ─────────────────────

export const missions: Mission[] = [
  // ══════════════════════════════════════════
  // WEEK 1
  // ══════════════════════════════════════════

  // Monday — Week 1
  {
    id: "w1-mon-1",
    date: "2026-05-11",
    title: "Publish LinkedIn post: Why most websites are invisible to AI",
    category: "LinkedIn Authority Post",
    authorityFocus: "AI Visibility",
    platform: "LinkedIn",
    estimatedTime: "45 min",
    objective: "Establish thought leadership on AI visibility gap",
    topic: "AI Visibility",
    description:
      "Write a punchy LinkedIn post explaining why traditional SEO-optimised websites still fail to appear in AI-generated answers. Include a real example and a clear takeaway.",
    status: "completed",
    priority: "high",
  },
  {
    id: "w1-mon-2",
    date: "2026-05-11",
    title: "Draft GEO article outline: Machine-readable content patterns",
    category: "GEO Educational Article",
    authorityFocus: "GEO",
    platform: "Blog",
    estimatedTime: "60 min",
    objective: "Create foundational GEO content for the blog",
    topic: "Generative Engine Optimisation",
    description:
      "Outline a 1,500-word article covering the top 8 content patterns that make websites machine-readable for LLMs. Focus on structured data, semantic HTML, and entity clarity.",
    status: "completed",
    priority: "high",
  },
  {
    id: "w1-mon-3",
    date: "2026-05-11",
    title: "Collect research: Google SGE citation sources",
    category: "Research Collection",
    authorityFocus: "AI Visibility",
    platform: "Internal",
    estimatedTime: "30 min",
    objective: "Build evidence base for AI citation claims",
    topic: "SGE Research",
    description:
      "Gather 5-10 examples of Google SGE citing specific sources. Document URL, query, and citation format for future content use.",
    status: "in-progress",
    priority: "medium",
  },

  // Tuesday — Week 1
  {
    id: "w1-tue-1",
    date: "2026-05-12",
    title: "Write case study draft: Umbraco AI readiness transformation",
    category: "Case Study Development",
    authorityFocus: "Umbraco Authority",
    platform: "Blog",
    estimatedTime: "90 min",
    objective: "Demonstrate Umbraco expertise with measurable results",
    topic: "Umbraco AI Readiness",
    description:
      "Draft case study covering a client migration from Umbraco 8 to 13 with structured data, semantic markup, and improved AI discoverability. Include before/after metrics.",
    status: "pending",
    priority: "high",
  },
  {
    id: "w1-tue-2",
    date: "2026-05-12",
    title: "LinkedIn post: 3 schema types every B2B site needs for AI",
    category: "LinkedIn Authority Post",
    authorityFocus: "Technical SEO",
    platform: "LinkedIn",
    estimatedTime: "40 min",
    objective: "Position as technical SEO authority for AI readiness",
    topic: "Schema Markup",
    description:
      "Create a carousel or text post covering Organization, Article, and FAQ schema — explaining why each matters for LLM comprehension.",
    status: "pending",
    priority: "medium",
  },

  // Wednesday — Week 1
  {
    id: "w1-wed-1",
    date: "2026-05-13",
    title: "Technical SEO breakdown: Crawl budget in the age of AI bots",
    category: "Technical SEO Breakdown",
    authorityFocus: "Technical SEO",
    platform: "Blog",
    estimatedTime: "75 min",
    objective: "Educate audience on evolving crawl dynamics",
    topic: "Crawl Budget & AI Bots",
    description:
      "Write a technical breakdown covering how AI crawlers (GPTBot, Google-Extended, ClaudeBot) affect crawl budget and what to do about it in robots.txt and server config.",
    status: "pending",
    priority: "high",
  },
  {
    id: "w1-wed-2",
    date: "2026-05-13",
    title: "Entity reinforcement: Update Google Knowledge Panel info",
    category: "Entity Reinforcement",
    authorityFocus: "Entity Authority",
    platform: "Google",
    estimatedTime: "30 min",
    objective: "Strengthen founder entity signals across Google",
    topic: "Knowledge Panel Optimisation",
    description:
      "Review and update structured data on personal site, Wikidata entry, and key directory listings to reinforce entity consistency for Knowledge Panel.",
    status: "pending",
    priority: "medium",
  },

  // Thursday — Week 1
  {
    id: "w1-thu-1",
    date: "2026-05-14",
    title: "GEO article: How LLMs decide which sources to cite",
    category: "GEO Educational Article",
    authorityFocus: "GEO",
    platform: "Blog",
    estimatedTime: "90 min",
    objective: "Publish definitive GEO content on citation mechanics",
    topic: "LLM Citation Patterns",
    description:
      "Write a detailed article explaining what makes LLMs cite one source over another — covering authority signals, content structure, recency, and entity recognition.",
    status: "pending",
    priority: "high",
  },
  {
    id: "w1-thu-2",
    date: "2026-05-14",
    title: "YouTube script: 5-minute audit of a real website's AI readiness",
    category: "YouTube Audit Breakdown",
    authorityFocus: "AI Visibility",
    platform: "YouTube",
    estimatedTime: "60 min",
    objective: "Create video content showing audit methodology",
    topic: "AI Readiness Audit",
    description:
      "Script a short-form video walking through a live audit: checking schema, semantic HTML, robots.txt AI directives, and content structure.",
    status: "pending",
    priority: "medium",
  },

  // Friday — Week 1
  {
    id: "w1-fri-1",
    date: "2026-05-15",
    title: "Umbraco community contribution: AI readiness checklist PR",
    category: "Umbraco Authority Contribution",
    authorityFocus: "Umbraco Authority",
    platform: "GitHub / Umbraco",
    estimatedTime: "60 min",
    objective: "Build authority within Umbraco community",
    topic: "Umbraco AI Readiness",
    description:
      "Create a pull request or community article proposing an AI readiness checklist for Umbraco sites: structured data defaults, semantic rendering, and crawl configuration.",
    status: "pending",
    priority: "high",
  },
  {
    id: "w1-fri-2",
    date: "2026-05-15",
    title: "Weekly research roundup: AI search developments",
    category: "Research Collection",
    authorityFocus: "AI Visibility",
    platform: "Internal",
    estimatedTime: "45 min",
    objective: "Stay current on AI search landscape",
    topic: "AI Search Trends",
    description:
      "Compile key developments from the week: new AI search features, algorithm updates, competitor moves, and relevant research papers.",
    status: "pending",
    priority: "low",
  },

  // ══════════════════════════════════════════
  // WEEK 2
  // ══════════════════════════════════════════

  // Monday — Week 2
  {
    id: "w2-mon-1",
    date: "2026-05-18",
    title: "LinkedIn post: The death of 'content for content's sake'",
    category: "LinkedIn Authority Post",
    authorityFocus: "GEO",
    platform: "LinkedIn",
    estimatedTime: "45 min",
    objective: "Challenge conventional content marketing thinking",
    topic: "Content Strategy for AI",
    description:
      "Argue that volume-based content strategies are failing in an AI-first search world. Position entity-driven, structured content as the alternative.",
    status: "pending",
    priority: "high",
  },
  {
    id: "w2-mon-2",
    date: "2026-05-18",
    title: "Begin case study: GEO strategy for professional services firm",
    category: "Case Study Development",
    authorityFocus: "GEO",
    platform: "Blog",
    estimatedTime: "60 min",
    objective: "Document GEO methodology with real results",
    topic: "GEO Case Study",
    description:
      "Start drafting a case study on implementing GEO for a professional services client — covering content restructuring, schema deployment, and AI visibility gains.",
    status: "pending",
    priority: "high",
  },

  // Tuesday — Week 2
  {
    id: "w2-tue-1",
    date: "2026-05-19",
    title: "Technical SEO: Structured data testing across AI platforms",
    category: "Technical SEO Breakdown",
    authorityFocus: "Technical SEO",
    platform: "Blog",
    estimatedTime: "75 min",
    objective: "Create practical testing methodology content",
    topic: "Structured Data Validation",
    description:
      "Document how to test whether your structured data is actually being consumed by ChatGPT, Perplexity, and Google AI Overviews. Include step-by-step testing process.",
    status: "pending",
    priority: "high",
  },
  {
    id: "w2-tue-2",
    date: "2026-05-19",
    title: "LinkedIn post: What I learned auditing 20 Umbraco sites for AI",
    category: "LinkedIn Authority Post",
    authorityFocus: "Umbraco Authority",
    platform: "LinkedIn",
    estimatedTime: "40 min",
    objective: "Combine Umbraco + AI authority signals",
    topic: "Umbraco AI Audits",
    description:
      "Share aggregated insights from auditing multiple Umbraco sites: common AI readiness gaps, quick wins, and the biggest missed opportunities.",
    status: "pending",
    priority: "medium",
  },

  // Wednesday — Week 2
  {
    id: "w2-wed-1",
    date: "2026-05-20",
    title: "GEO article: Building entity authority for AI citation",
    category: "GEO Educational Article",
    authorityFocus: "Entity Authority",
    platform: "Blog",
    estimatedTime: "90 min",
    objective: "Publish key entity authority framework",
    topic: "Entity Authority Building",
    description:
      "Write a comprehensive article on how to build entity authority that LLMs recognise: consistent NAP, cross-platform presence, structured data, and topical depth.",
    status: "pending",
    priority: "high",
  },
  {
    id: "w2-wed-2",
    date: "2026-05-20",
    title: "Entity reinforcement: Publish author bio pages with schema",
    category: "Entity Reinforcement",
    authorityFocus: "Entity Authority",
    platform: "Website",
    estimatedTime: "45 min",
    objective: "Strengthen personal entity signals on own properties",
    topic: "Author Entity Markup",
    description:
      "Create or update author bio pages with Person schema, sameAs links, and clear topical associations to reinforce entity recognition by AI systems.",
    status: "pending",
    priority: "medium",
  },

  // Thursday — Week 2
  {
    id: "w2-thu-1",
    date: "2026-05-21",
    title: "YouTube script: Umbraco vs WordPress — AI readiness comparison",
    category: "YouTube Audit Breakdown",
    authorityFocus: "Umbraco Authority",
    platform: "YouTube",
    estimatedTime: "60 min",
    objective: "Create comparison content positioning Umbraco strengths",
    topic: "CMS AI Readiness",
    description:
      "Script a video comparing how Umbraco and WordPress handle structured data, semantic output, and AI crawler access out of the box. Fair but highlighting Umbraco's flexibility.",
    status: "pending",
    priority: "medium",
  },
  {
    id: "w2-thu-2",
    date: "2026-05-21",
    title: "Research: Perplexity and ChatGPT source selection patterns",
    category: "Research Collection",
    authorityFocus: "GEO",
    platform: "Internal",
    estimatedTime: "45 min",
    objective: "Deepen understanding of AI source selection",
    topic: "AI Source Selection",
    description:
      "Run 20 test queries across Perplexity and ChatGPT, documenting which sources are cited, their domain authority, content structure, and schema presence.",
    status: "pending",
    priority: "medium",
  },

  // Friday — Week 2
  {
    id: "w2-fri-1",
    date: "2026-05-22",
    title: "Publish case study: Technical SEO overhaul with 3x organic growth",
    category: "Case Study Development",
    authorityFocus: "Technical SEO",
    platform: "Blog",
    estimatedTime: "60 min",
    objective: "Publish flagship technical SEO case study",
    topic: "Technical SEO Results",
    description:
      "Finalise and publish the technical SEO case study showing crawl optimisation, structured data deployment, and Core Web Vitals improvements leading to 3x organic traffic.",
    status: "pending",
    priority: "high",
  },
  {
    id: "w2-fri-2",
    date: "2026-05-22",
    title: "Weekly authority review and next week planning",
    category: "Research Collection",
    authorityFocus: "Strategic Planning",
    platform: "Internal",
    estimatedTime: "30 min",
    objective: "Maintain strategic consistency and momentum",
    topic: "Authority Strategy",
    description:
      "Review the week's completed missions, assess authority-building progress, identify gaps, and draft next week's mission priorities.",
    status: "pending",
    priority: "low",
  },
];

// ─── Helpers ─────────────────────────────────────────────────

export function getMissionsByDate(date: string): Mission[] {
  return missions.filter((m) => m.date === date);
}

export function getMissionsForWeek(weekStartDate: string): Mission[] {
  const start = new Date(weekStartDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 5); // Mon-Fri
  return missions.filter((m) => {
    const d = new Date(m.date);
    return d >= start && d < end;
  });
}

export function getWeekDates(weekStartDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(weekStartDate);
  for (let i = 0; i < 5; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}
