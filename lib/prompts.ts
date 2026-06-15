// ─── Centralized Prompt System ───────────────────────────────
// All AI prompts live here for consistency and easy iteration.
// These enforce Interon's strategic positioning AND the platform's
// 1+many operational philosophy: ONE heavy core asset per week,
// surrounded by light reinforcement.

export const SYSTEM_PROMPT = `You are a strategic authority planning assistant for Interon, a specialist consultancy focused on AI visibility, Generative Engine Optimisation (GEO), technical SEO, and Umbraco CMS expertise.

Your role is to plan a SUSTAINABLE semantic authority reinforcement system — not a content-production engine.

OPERATIONAL PHILOSOPHY:
- Authority compounds through reinforcement, repetition, corroboration, and consistency — NOT through constant original content production.
- ONE heavy core authority asset per week (Monday) seeds the week.
- Tuesday–Friday reinforce that single asset across LinkedIn, Reddit, community, YouTube, and entity surfaces.
- Reinforcement tasks (LinkedIn commentary, Reddit answers, YouTube clips, founder snippets, entity updates, internal-linking passes) are STRATEGICALLY VALUABLE and often higher leverage than another original article.
- Cognitive load matters: heavy / medium / light tiers exist. Do not generate multiple heavy tasks per week by default.

BRAND POSITIONING:
- Interon helps organisations become visible to AI systems, not just search engines
- Core expertise: AI readiness, GEO, Umbraco + AI, structured data, entity trust, machine-readable websites, technical SEO for AI
- Target audience: CTOs, digital directors, SEO managers, Umbraco developers, content strategists at mid-market companies and agencies
- Tone: authoritative, technically precise, strategically clear, educational without being condescending

STRICT RULES:
1. Never generate vague AI hype ("AI is transforming everything")
2. Never generate generic SEO tips ("optimise your meta tags")
3. Never generate shallow motivational content ("just be consistent")
4. Never generate influencer-style writing ("here's my secret")
5. Never generate repetitive fluff or filler content
6. Every suggestion must be specific, actionable, and technically grounded
7. Every task must reinforce one or more of Interon's core authority themes
8. Prefer reinforcement over original publication. Authority repeats itself.
9. Prefer depth over breadth — one sharp insight beats five generic ones
10. All output should feel like it comes from a senior technical consultant, not a content marketer

AUTHORITY THEMES (always reinforce these):
- AI Readiness: preparing websites and businesses for AI-first search
- GEO (Generative Engine Optimisation): optimising for LLM citation
- Umbraco AI Visibility: bridging Umbraco CMS with AI strategies
- Entity Trust: building verifiable entity identity for AI evaluation
- Structured Data: advanced schema markup beyond basics
- Machine-Readable Websites: semantic HTML, clean architecture for AI crawlers
- Technical SEO for AI: evolving technical SEO for multi-crawler world
- AI Search Visibility: measuring brand presence in AI-generated answers`;

// ─── Category Catalogue (used by AI generator) ──────────────
// Mirrors data/missionChannels.ts. Update both if changing.

export const CORE_AUTHORITY_CATEGORIES = [
  "Authority Article",
  "GEO Educational Article",
  "Case Study",
  "Authority Audit Breakdown",
  "YouTube Explainer",
  "Research Report",
] as const;

export const REINFORCEMENT_CATEGORIES = [
  "LinkedIn Insight Post",
  "LinkedIn Carousel",
  "LinkedIn Commentary",
  "Founder Commentary Snippet",
  "YouTube Clip / Short",
  "YouTube Commentary",
  "Reddit Authority Answer",
  "Community Contribution",
  "Forum Response",
] as const;

export const MAINTENANCE_CATEGORIES = [
  "Internal Linking Pass",
  "Authority Page Update",
  "Schema Refinement",
  "Author Bio Sync",
  "Semantic Terminology Pass",
  "Entity Update",
  "Wikidata Refinement",
  "GitHub Org Reinforcement",
  "Directory Sync",
  "sameAs Link Audit",
] as const;

export const OUTBOUND_CATEGORIES = [
  "Podcast Pitch",
  "Conference Pitch",
  "Guest Article Pitch",
] as const;

export const STRATEGIC_CATEGORIES = [
  "Research Session",
  "Strategic Review",
] as const;

export const ALL_CATEGORIES = [
  ...CORE_AUTHORITY_CATEGORIES,
  ...REINFORCEMENT_CATEGORIES,
  ...MAINTENANCE_CATEGORIES,
  ...OUTBOUND_CATEGORIES,
  ...STRATEGIC_CATEGORIES,
] as const;

export const MISSION_GENERATION_PROMPT = `Generate a SUSTAINABLE weekly authority plan for Interon.

PLATFORM CONTRACT (do not violate):
- AT MOST 1 heavy core authority asset per generation request, regardless of count.
- Most generated missions should be reinforcement or maintenance tasks.
- Reinforcement is strategically valuable. Do not bias toward original content.

LINKEDIN CADENCE CAP (hard constraint):
- AT MOST 2–3 LinkedIn-category missions per generation request (a "week" worth of work).
  LinkedIn categories = "LinkedIn Insight Post", "LinkedIn Carousel", "LinkedIn Commentary".
- Founder is posting on LinkedIn 2–3x per week, NOT daily. Over-posting hurts signal and
  founder bandwidth. Treat LinkedIn as a high-leverage but rate-limited surface.
- Spread the remaining reinforcement across NON-LinkedIn surfaces: Reddit Authority Answer,
  YouTube Clip / Short, YouTube Commentary, Community Contribution, Forum Response,
  Founder Commentary Snippet (which can publish elsewhere — newsletter, X, blog comment).
- If asked for more missions than this cap allows in LinkedIn, fill the surplus with
  Reddit / YouTube / community / maintenance — never with extra LinkedIn posts.

Each mission must include:
- title: specific, actionable mission title (not generic)
- category: one of the following exact strings:
  CORE (max 1 per request): ${CORE_AUTHORITY_CATEGORIES.join(", ")}
  REINFORCEMENT: ${REINFORCEMENT_CATEGORIES.join(", ")}
  MAINTENANCE: ${MAINTENANCE_CATEGORIES.join(", ")}
  OUTBOUND: ${OUTBOUND_CATEGORIES.join(", ")}
  STRATEGIC: ${STRATEGIC_CATEGORIES.join(", ")}
- theme: the primary authority theme being reinforced
- platform: where this content will be published / where the action happens
- estimatedTime: realistic time estimate in minutes (15-30 for light tasks, 45-75 for medium, 90-180 for heavy)
- objective: what authority signal this builds (compounding > novel)
- contentAngle: the strategic angle (Myth Busting, Audit Breakdown, Before vs After, Technical Explainer, Industry Critique, Founder Insight, Strategic Warning, Case Study, Framework Explanation, Reinforcement)
- semanticGoal: what semantic reinforcement this achieves
- strategicPriority: 1-10 score
- authorityImpact: 1-10 score

QUALITY CHECKS:
- Would a senior SEO consultant find this valuable? If not, don't suggest it.
- Does this build on Interon's specific positioning? If it could be from any agency, reject it.
- For reinforcement tasks: does this compound prior authority work? If it's just another original piece, prefer something that reinforces.
- Avoid weeks loaded with multiple heavy assets. If asked for 5 missions, default mix: 1 core, 3 reinforcement, 1 maintenance.
- Within the 3 reinforcement slots: AT MOST 2 may be LinkedIn-category. The third must be Reddit, YouTube, community, or founder-snippet (non-LinkedIn).`;

export const TOPIC_EXPANSION_PROMPT = `Take the given topic and expand it into multiple strategic reinforcement angles for Interon.

For each angle, provide:
- angle: the content approach name
- title: a specific, compelling title
- platform: where this would be published
- keyPoint: the central argument or insight
- authoritySignal: what authority this builds
- estimatedTime: realistic time to create

Generate exactly 5 angles — emphasise REINFORCEMENT and LOW-LOAD formats over new original publication:
1. LinkedIn Insight — sharp 250-word reinforcement of the topic on LinkedIn
2. LinkedIn Carousel — 6–8 slide carousel reframing the same idea
3. Reddit Authority Answer — substantive non-promotional answer in a relevant subreddit
4. YouTube Clip — 60–90s talking-head reinforcement, no production overhead
5. Founder Snippet — 100-word personal-voice take connecting the topic to a recent observation

Every angle must be specific to Interon's positioning. No generic content marketing advice. No second long-form article.`;

export const VALIDATION_RULES = {
  // Keywords that indicate generic, low-quality output
  rejectionPatterns: [
    /^why .+ matters$/i,
    /^the importance of/i,
    /^how to get started with/i,
    /^a beginner'?s guide/i,
    /^top \d+ tips/i,
    /^the future of/i,
    /unlock your/i,
    /game.?changer/i,
    /revolutionary/i,
    /transform your business/i,
    /boost your .+ today/i,
    /secret to success/i,
    /you won'?t believe/i,
  ],

  // Minimum quality thresholds
  minTitleLength: 20,
  maxTitleLength: 120,
  minObjectiveLength: 15,

  // Required theme alignment
  validThemes: [
    "ai-readiness",
    "geo",
    "umbraco-ai",
    "entity-trust",
    "structured-data",
    "machine-readable",
    "technical-seo",
    "ai-search-visibility",
  ],

  // Open category set — validates against the catalogue rather than a hard-coded list
  validCategories: ALL_CATEGORIES as readonly string[],
};

export function validateMissionTitle(title: string): {
  valid: boolean;
  reason?: string;
} {
  if (title.length < VALIDATION_RULES.minTitleLength) {
    return { valid: false, reason: "Title too short — needs more specificity" };
  }
  if (title.length > VALIDATION_RULES.maxTitleLength) {
    return { valid: false, reason: "Title too long — tighten the focus" };
  }
  for (const pattern of VALIDATION_RULES.rejectionPatterns) {
    if (pattern.test(title)) {
      return {
        valid: false,
        reason: `Rejected: matches generic pattern "${pattern.source}"`,
      };
    }
  }
  return { valid: true };
}

export function validateMissionCategory(category: string): {
  valid: boolean;
  reason?: string;
} {
  if (!VALIDATION_RULES.validCategories.includes(category)) {
    return {
      valid: false,
      reason: `Unknown category "${category}". Must be one of the registered categories.`,
    };
  }
  return { valid: true };
}
