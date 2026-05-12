// ─── Reinforcement Topic Library ─────────────────────────────
// Light/medium task templates that the planner can schedule
// without requiring the user to write original long-form content.
// Pairs with data/topicIdeas.ts (which holds heavy/core topics).

import type { MissionCategoryDef } from "./missionChannels";
import { getCategoryById } from "./missionChannels";

export interface ReinforcementTopic {
  id: string;
  categoryId: string;   // → MissionCategoryDef
  theme: string;        // theme id
  title: string;        // mission title shown to user
  prompt: string;       // execution prompt — what to actually do
  audience: string;
  semanticGoal: string;
  // Reinforcement vs amplification — does this require a recent core asset?
  requiresCoreAsset: boolean;
}

// ─── Helpers (build templates) ───────────────────────────────

function t(
  id: string,
  categoryId: string,
  theme: string,
  title: string,
  prompt: string,
  semanticGoal: string,
  opts: { audience?: string; requiresCoreAsset?: boolean } = {}
): ReinforcementTopic {
  return {
    id,
    categoryId,
    theme,
    title,
    prompt,
    audience: opts.audience ?? "Authority audience across SEO, GEO, and technical leadership",
    semanticGoal,
    requiresCoreAsset: opts.requiresCoreAsset ?? false,
  };
}

// ─── Library ─────────────────────────────────────────────────

export const reinforcementTopics: ReinforcementTopic[] = [
  // ── LinkedIn Reinforcement (amplifies core asset) ───────────
  t("li-insight-from-core",     "linkedin-insight",    "ai-readiness",       "Pull the sharpest insight from this week's core asset into a LinkedIn post",
    "Take the single sharpest sentence from this week's core authority asset. Rewrite as a LinkedIn hook + 3-line elaboration + takeaway. Link back to the full asset.",
    "Reinforce the week's core asset across LinkedIn", { requiresCoreAsset: true }),
  t("li-carousel-from-core",    "linkedin-carousel",   "geo",                "Repurpose this week's core asset into a LinkedIn carousel",
    "Convert the core asset into a 6–8 slide carousel. Each slide = one point. Final slide = CTA back to the full piece.",
    "Multi-format reinforcement of the same semantic territory", { requiresCoreAsset: true }),
  t("li-commentary-strategic",  "linkedin-commentary", "ai-search-visibility","Comment on 3 high-signal LinkedIn posts in the GEO/AI-visibility conversation",
    "Find 3 posts from peers/competitors in the AI visibility space. Leave a substantive, non-promotional reply that demonstrates expertise.",
    "Authority through visible participation, not just publication"),
  t("li-founder-snippet",       "founder-snippet",     "entity-trust",       "Post a 100-word founder observation on entity trust",
    "Write a short personal-voice take connecting a recent client/audit observation to the entity-trust theme. Plain, specific, no hype.",
    "Build founder entity authority without producing a long-form asset"),

  // ── YouTube Reinforcement ───────────────────────────────────
  t("yt-clip-from-core",        "youtube-clip",        "ai-readiness",       "Extract a 60–90s clip from this week's core video or article",
    "If the week's core was video — clip the sharpest 60–90s. If written — record a single-take 60–90s talking-head of the same insight. Upload as Short.",
    "Establish YouTube as a primary reinforcement channel", { requiresCoreAsset: true }),
  t("yt-commentary-ecosystem",  "youtube-commentary",  "ai-search-visibility","Record a 2-minute founder commentary on a current AI search development",
    "Pick the highest-signal ecosystem development from this week's intelligence feed. Record 2 minutes: what happened, what it means for the audience, what to do.",
    "Visible founder commentary on industry shifts"),
  t("yt-clip-audit-snippet",    "youtube-clip",        "umbraco-ai",         "Clip a 60s audit-finding from a real site review",
    "Open any site in audit view. Record 60s walking through one specific AI-readiness finding. No edit, no graphics.",
    "Build a library of bite-sized audit clips"),
  t("yt-commentary-myth-bust",  "youtube-commentary",  "geo",                "Record 2-minute myth-bust on a common GEO misconception",
    "Pick one widespread misconception about GEO. Record 2 minutes: the myth → the reality → the implication.",
    "Reinforce GEO category ownership through repeated framing"),

  // ── Reddit Authority Answers ────────────────────────────────
  t("reddit-seo-geo",           "reddit-answer",       "geo",                "Answer one r/SEO question about GEO with educational depth",
    "Find an honest question about generative engine optimisation, AI search, or AI citation on r/SEO from the last 14 days. Write a substantive, non-promotional answer (200–400 words). No links to Interon unless directly asked.",
    "Educational presence in the SEO community"),
  t("reddit-bigseo-ai",         "reddit-answer",       "ai-search-visibility","Answer one r/bigseo or r/SEO question about AI visibility",
    "Locate a real question about ChatGPT/Perplexity/AI Overview visibility. Provide a structured answer: diagnosis → mechanism → action.",
    "Authority through visible expertise in community spaces"),
  t("reddit-webdev-schema",     "reddit-answer",       "structured-data",    "Answer one r/webdev or r/SEO question on structured data",
    "Find a question about schema, JSON-LD, or structured data implementation. Answer with code + reasoning. Concrete, not generic.",
    "Technical authority through community contribution"),
  t("reddit-entrepreneur-aisearch","reddit-answer",    "ai-readiness",       "Answer a founder/business question about AI visibility on r/entrepreneur or r/marketing",
    "Find a non-technical question about being found in AI answers. Answer in plain language: what's actually going on, what to do first.",
    "Bring AI-readiness vocabulary into adjacent audiences"),

  // ── Industry Community Contributions ────────────────────────
  t("community-umbraco-forum",  "forum-response",      "umbraco-ai",         "Answer one question on Our Umbraco forum or Discord",
    "Find an unanswered question on Our Umbraco or in the Umbraco Discord that relates to SEO, schema, content modelling, or AI readiness. Provide a concrete, non-promotional answer.",
    "Build authority inside the Umbraco community"),
  t("community-stackoverflow",  "community-contribution","structured-data",  "Answer one Stack Overflow question on schema or JSON-LD",
    "Find an unanswered or under-answered Stack Overflow question on schema/JSON-LD. Provide a correct, well-explained answer with example code.",
    "Long-tail technical authority that AI systems index heavily"),
  t("community-devto-post",     "community-contribution","machine-readable","Post a short technical note on dev.to or Hashnode",
    "Write a 300–500 word technical note on one machine-readability pattern. Cross-post or link to the deeper Interon article.",
    "Distribute authority signal into developer-native surfaces"),
  t("community-slack-answer",   "community-contribution","technical-seo",    "Answer one question in an SEO Slack community",
    "Find a substantive question in a technical SEO Slack (Traffic Think Tank, SEO Signal, etc.). Answer with depth. No promotion.",
    "Authority in moderated peer communities"),
  t("community-github-pr",      "community-contribution","umbraco-ai",       "Open a small PR or issue on an Umbraco-ecosystem repo",
    "Find a documentation gap, schema bug, or SEO-related issue in an Umbraco ecosystem package. Open a PR or detailed issue.",
    "Tangible Umbraco-ecosystem authority signal"),

  // ── Internal Authority Reinforcement ────────────────────────
  t("internal-link-pass-week",  "internal-link-pass",  "ai-readiness",       "Internal-linking pass on this week's published asset",
    "Open the new asset. Find 3–5 existing pages that should link to it, and 3–5 places inside it that should link to existing authority pages. Add the links.",
    "Strengthen internal authority architecture", { requiresCoreAsset: true }),
  t("authority-page-improve",   "authority-page-update","geo",               "Tighten one service or methodology page",
    "Pick one Interon service / methodology / pillar page. Improve headings, add one concrete example, ensure schema is present, and tighten the lede.",
    "Make Interon's own site a stronger authority surface"),
  t("schema-refinement-key",    "schema-refinement",   "structured-data",    "Refine schema on a key page",
    "Pick one high-priority page. Validate Organization / Article / Person / FAQ schema. Fill missing fields. Re-test with Rich Results.",
    "Compound structured-data authority on owned surfaces"),
  t("semantic-terminology-sweep","semantic-terminology-pass","ai-readiness",  "Terminology consistency sweep across site",
    "Pick one concept (e.g. 'AI readiness'). Sweep the site for synonyms and inconsistencies. Standardise on one phrasing.",
    "Reduce semantic dilution; reinforce entity-topic association"),
  t("author-bio-sync-cycle",    "author-bio-sync",     "entity-trust",       "Sync author bio across site + external profiles",
    "Verify Interon author bio is identical across blog posts, LinkedIn, Crunchbase, and Wikidata. Update any drift.",
    "Entity consistency for founder/brand identity"),

  // ── Entity / Corroboration Maintenance ──────────────────────
  t("entity-knowledge-panel",   "entity-update",       "entity-trust",       "Audit Knowledge Panel signals for founder + brand",
    "Check the founder + brand Knowledge Panels. Note inconsistencies. Update sameAs targets and bios where you control them.",
    "Direct entity-confidence input to AI systems"),
  t("entity-wikidata-cycle",    "wikidata-refinement", "entity-trust",       "Reinforce Wikidata entries for Interon + founder",
    "Open Wikidata. Add one new reference or property to the Interon and founder entities. Ensure sameAs links resolve.",
    "Wikidata is a primary LLM entity-verification source"),
  t("entity-crunchbase",        "entity-update",       "entity-trust",       "Refresh Crunchbase profile",
    "Open Crunchbase. Update services, leadership, recent press, and add any new corroboration mentions from the last month.",
    "Corroboration surface AI systems cross-reference"),
  t("entity-github-org",        "github-org-reinforcement","umbraco-ai",     "Reinforce GitHub org as authority signal",
    "Update the Interon GitHub org: pinned repos, README authority paragraph, contact links, sameAs to LinkedIn/Crunchbase/website.",
    "GitHub presence as developer-facing entity signal"),
  t("entity-directory-cycle",   "directory-sync",      "ai-readiness",       "Directory sync pass",
    "Open Clutch + G2 + relevant directories. Sync description, services, and add any new case studies.",
    "Directory consistency feeds AI source-evaluation"),
  t("entity-sameas-audit",      "sameas-link-audit",   "entity-trust",       "sameAs link audit",
    "Verify sameAs links on the site's Organization + Person schema. Ensure every external entity surface links back consistently.",
    "Close the entity identity graph"),

  // ── Outbound Pitching ───────────────────────────────────────
  t("pitch-podcast-week",       "podcast-pitch",       "geo",                "Pitch one podcast aligned to GEO/AI visibility",
    "Identify one podcast with the right audience. Send a specific, well-researched pitch with two concrete topic angles.",
    "Founder voice on borrowed audiences"),
  t("pitch-conference-talk",    "conference-pitch",    "geo",                "Submit one conference talk proposal",
    "Pick one conference with open CFP. Submit a single sharp talk proposal aligned to current narrative momentum (GEO, entity confidence, machine-readability).",
    "Speaker-circuit authority signal"),
  t("pitch-guest-article",      "guest-article-pitch", "ai-search-visibility","Pitch one guest article to a high-authority SEO publication",
    "Pick one target publication (SE Journal, SE Land, Ahrefs, Moz). Pitch a specific, data-backed angle.",
    "Borrowed authority surface + backlink"),

  // ── Research + Strategic Review ─────────────────────────────
  t("research-weekly-session",  "research-session",    "ai-search-visibility","Weekly research session",
    "Scan the live research feed + ecosystem monitor. Note 3 signals worth responding to. Capture into strategic memory.",
    "Intelligence capture without execution pressure"),
  t("strategic-week-review",    "strategic-review",    "ai-readiness",       "Friday strategic review",
    "Review the week's completed missions, drift indicators, and authority health. Set the next week's core asset focus.",
    "Closed-loop weekly cadence"),
];

// ─── Helpers ─────────────────────────────────────────────────

export function topicsByCategory(categoryId: string): ReinforcementTopic[] {
  return reinforcementTopics.filter((t) => t.categoryId === categoryId);
}

export function topicsByTheme(themeId: string): ReinforcementTopic[] {
  return reinforcementTopics.filter((t) => t.theme === themeId);
}

export function topicsRequiringCore(): ReinforcementTopic[] {
  return reinforcementTopics.filter((t) => t.requiresCoreAsset);
}

export function topicsWithoutCore(): ReinforcementTopic[] {
  return reinforcementTopics.filter((t) => !t.requiresCoreAsset);
}

export function resolveTopicCategory(t: ReinforcementTopic): MissionCategoryDef | undefined {
  return getCategoryById(t.categoryId);
}
