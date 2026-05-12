// ─── Mission Channels & Categories ───────────────────────────
// Replaces the hard-coded 8-category union with an open registry.
// Every category declares its channel, task kind, default format,
// and cognitive load tier so the planner and dashboard can reason
// about them generically.

import type { TaskFormat, TaskKind, LoadTier } from "@/lib/cognitiveLoad";
import { loadForFormat, kindForFormat } from "@/lib/cognitiveLoad";

export type Channel =
  | "blog"
  | "linkedin"
  | "youtube"
  | "reddit"
  | "community"
  | "internal-site"
  | "entity-platforms" // Wikidata / Crunchbase / Knowledge Panel / directories
  | "podcast"
  | "conference"
  | "internal";        // research, planning

export interface MissionCategoryDef {
  id: string;
  label: string;
  channel: Channel;
  format: TaskFormat;
  kind: TaskKind;
  loadTier: LoadTier;
  description: string;
  // True when this category is allowed as the weekly Core Authority Asset
  eligibleAsCore: boolean;
  // True when this is a Reinforcement channel — surfaces as a "Light Wins" task
  reinforcement: boolean;
}

function def(
  id: string,
  label: string,
  channel: Channel,
  format: TaskFormat,
  description: string,
  flags: { eligibleAsCore?: boolean; reinforcement?: boolean } = {}
): MissionCategoryDef {
  const kind = kindForFormat(format);
  const loadTier = loadForFormat(format).tier;
  return {
    id,
    label,
    channel,
    format,
    kind,
    loadTier,
    description,
    eligibleAsCore: flags.eligibleAsCore ?? kind === "core-authority",
    reinforcement: flags.reinforcement ?? kind === "reinforcement",
  };
}

// ─── Registry ────────────────────────────────────────────────

export const missionCategories: MissionCategoryDef[] = [
  // ── Core Authority Assets (heavy — max 1/week) ───────────────
  def("authority-article",        "Authority Article",         "blog",     "article",        "Long-form authority article: framework, technical breakdown, or narrative argument."),
  def("geo-educational-article",  "GEO Educational Article",   "blog",     "guide",          "Structured GEO/AI-readiness guide aimed at the GEO category."),
  def("case-study",               "Case Study",                "blog",     "case-study",     "Client-result narrative with measurable outcomes."),
  def("research-report",          "Research Report",           "blog",     "research-report","Original research with data — establishes referenceable authority."),
  def("authority-audit",          "Authority Audit Breakdown", "blog",     "audit",          "Technical audit of a real site walking through methodology."),
  def("youtube-explainer",        "YouTube Explainer",         "youtube",  "video-long",     "Long-form YouTube video — explainer, audit walkthrough, or methodology."),

  // ── LinkedIn Reinforcement ───────────────────────────────────
  def("linkedin-insight",         "LinkedIn Insight Post",     "linkedin", "linkedin-post",       "Sharp founder/expert insight derived from the week's core asset."),
  def("linkedin-commentary",      "LinkedIn Commentary",       "linkedin", "linkedin-commentary", "Thoughtful comment on someone else's post — visibility through participation."),
  def("linkedin-carousel",        "LinkedIn Carousel",         "linkedin", "linkedin-carousel",   "Carousel/document repurpose of the week's core asset."),

  // ── YouTube Reinforcement (clip + commentary) ───────────────
  def("youtube-clip",             "YouTube Clip / Short",      "youtube",  "video-clip",        "Short-form clip extracted from a long-form video or written asset."),
  def("youtube-commentary",       "YouTube Commentary",        "youtube",  "video-commentary",  "1–3 minute founder commentary on a single insight or development."),

  // ── Reddit + Community Participation (non-promotional) ──────
  def("reddit-answer",            "Reddit Authority Answer",   "reddit",     "reddit-answer",          "Helpful, educational answer to a high-value Reddit question. Non-promotional."),
  def("community-contribution",   "Community Contribution",    "community",  "community-contribution", "Stack Overflow / GitHub Discussions / dev.to / Discord / Slack / LinkedIn Group answer."),
  def("forum-response",           "Forum Response",            "community",  "forum-response",         "Umbraco forum / SEO forum / Slack technical response."),

  // ── Founder Authority (light) ────────────────────────────────
  def("founder-snippet",          "Founder Commentary Snippet","linkedin", "founder-snippet",   "Short personal-voice take connecting a development to Interon's positioning."),

  // ── Internal Authority Reinforcement (maintenance) ──────────
  def("internal-link-pass",       "Internal Linking Pass",     "internal-site", "internal-link-pass", "Add/refine internal links across authority pages."),
  def("authority-page-update",    "Authority Page Update",     "internal-site", "internal-link-pass", "Strengthen a service / methodology / about page on Interon's site."),
  def("schema-refinement",        "Schema Refinement",         "internal-site", "schema-refinement",  "Improve JSON-LD on a key page (Organization, Article, FAQ, Person)."),
  def("author-bio-sync",          "Author Bio Sync",           "internal-site", "author-bio-sync",    "Ensure author bio consistency across pages and external profiles."),
  def("semantic-terminology-pass","Semantic Terminology Pass", "internal-site", "semantic-pass",      "Sweep for terminology consistency: ensure one term per concept across pages."),

  // ── Entity / Corroboration (maintenance) ────────────────────
  def("entity-update",            "Entity Update",             "entity-platforms", "entity-update",  "Refresh Crunchbase / LinkedIn Company / Knowledge Panel data."),
  def("wikidata-refinement",      "Wikidata Refinement",       "entity-platforms", "entity-update",  "Edit Wikidata entries to reinforce entity identity."),
  def("github-org-reinforcement", "GitHub Org Reinforcement",  "entity-platforms", "entity-update",  "Update GitHub org profile, pinned repos, README authority signals."),
  def("directory-sync",           "Directory Sync",            "entity-platforms", "directory-sync", "Sync information across directory listings (Clutch, G2, etc.)."),
  def("sameas-link-audit",        "sameAs Link Audit",         "entity-platforms", "directory-sync", "Audit and update sameAs links across owned and external entity properties."),

  // ── Outbound / Pitching (reinforcement) ─────────────────────
  def("podcast-pitch",            "Podcast Pitch",             "podcast",     "linkedin-commentary","Pitch to a podcast aligned with current authority themes."),
  def("conference-pitch",         "Conference Pitch",          "conference",  "linkedin-commentary","Submit a talk proposal aligned with current authority themes."),
  def("guest-article-pitch",      "Guest Article Pitch",       "podcast",     "linkedin-commentary","Pitch a guest article to a high-authority publication."),

  // ── Research + Strategic Review ─────────────────────────────
  def("research-session",         "Research Session",          "internal", "research-session",  "Dedicated weekly research session — scan signals, capture opportunities."),
  def("strategic-review",         "Strategic Review",          "internal", "strategic-review",  "End-of-week or end-of-month review and re-planning."),
];

// ─── Helpers ─────────────────────────────────────────────────

export function getCategoryById(id: string): MissionCategoryDef | undefined {
  return missionCategories.find((c) => c.id === id);
}

export function getCategoryByLabel(label: string): MissionCategoryDef | undefined {
  return missionCategories.find((c) => c.label === label);
}

export function categoriesByKind(kind: TaskKind): MissionCategoryDef[] {
  return missionCategories.filter((c) => c.kind === kind);
}

export function categoriesByChannel(channel: Channel): MissionCategoryDef[] {
  return missionCategories.filter((c) => c.channel === channel);
}

export function coreEligibleCategories(): MissionCategoryDef[] {
  return missionCategories.filter((c) => c.eligibleAsCore);
}

export function reinforcementCategories(): MissionCategoryDef[] {
  return missionCategories.filter((c) => c.reinforcement);
}

// ─── Legacy Bridge ───────────────────────────────────────────
// Maps the old hard-coded labels onto the open registry so existing
// data (seed memory, prisma rows, mock missions) keeps working.

export const legacyCategoryAliases: Record<string, string> = {
  "LinkedIn Authority Post":        "linkedin-insight",
  "GEO Educational Article":        "geo-educational-article",
  "YouTube Audit Breakdown":        "youtube-explainer",
  "Case Study Development":         "case-study",
  "Umbraco Authority Contribution": "community-contribution",
  "Research Collection":            "research-session",
  "Entity Reinforcement":           "entity-update",
  "Technical SEO Breakdown":        "authority-article",
};

export function resolveCategory(input: string): MissionCategoryDef | undefined {
  const direct = getCategoryById(input) ?? getCategoryByLabel(input);
  if (direct) return direct;
  const aliasId = legacyCategoryAliases[input];
  return aliasId ? getCategoryById(aliasId) : undefined;
}

// ─── Channel Metadata (for dashboards) ───────────────────────

export interface ChannelMeta {
  id: Channel;
  label: string;
  description: string;
  color: string;
}

export const channelMeta: ChannelMeta[] = [
  { id: "blog",             label: "Blog",              description: "Long-form authority + GEO surface",            color: "#a855f7" },
  { id: "linkedin",         label: "LinkedIn",          description: "Founder + brand authority reinforcement",      color: "#38bdf8" },
  { id: "youtube",          label: "YouTube",           description: "Video authority — long-form + clips + commentary", color: "#ef4444" },
  { id: "reddit",           label: "Reddit",            description: "Educational community contribution",            color: "#f97316" },
  { id: "community",        label: "Industry Communities", description: "Umbraco / forums / Slack / dev.to / SO",     color: "#22c55e" },
  { id: "internal-site",    label: "Internal Site",     description: "Interon.co.za authority surface",               color: "#ec4899" },
  { id: "entity-platforms", label: "Entity Platforms",  description: "Wikidata, Crunchbase, GitHub, directories",     color: "#f59e0b" },
  { id: "podcast",          label: "Podcasts",          description: "Founder voice on external shows",               color: "#8b5cf6" },
  { id: "conference",       label: "Conferences",       description: "Speaker pipeline",                              color: "#10b981" },
  { id: "internal",         label: "Strategic Ops",     description: "Research and review work",                      color: "#94a3b8" },
];
