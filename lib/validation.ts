import { z } from "zod";

// ─── Mission Schemas ─────────────────────────────────────────

export const MissionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  title: z.string().min(5, "Title too short").max(200, "Title too long"),
  category: z.string().min(1),
  authorityFocus: z.string().min(1),
  platform: z.string().min(1),
  estimatedTime: z.string().min(1),
  objective: z.string().min(5),
  topic: z.string().min(1),
  description: z.string().min(10),
  status: z.enum(["pending", "in-progress", "completed"]).default("pending"),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  themeId: z.string().optional(),
  contentAngle: z.string().optional(),
  // ─── New pillar-aligned fields ───────────────────────────────
  pillar: z.string().optional(),
  taskType: z.string().optional(),
  effortLevel: z.enum(["low", "medium", "high"]).optional(),
  postType: z.string().optional(),
  draftContent: z.string().optional(),
  draftFormat: z.enum(["markdown", "html", "text"]).optional(),
  publishStatus: z
    .enum(["idea", "draft", "approved", "scheduled", "published"])
    .default("idea")
    .optional(),
  publishedUrl: z.string().url().optional(),
});

export const MissionStatusUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["pending", "in-progress", "completed"]),
});

// ─── Strategic Memory Schemas ────────────────────────────────

export const MemoryItemSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).default(() => new Date().toISOString().split("T")[0]),
  type: z.enum([
    "completed-mission", "successful-topic", "authority-insight",
    "content-performance", "semantic-pattern", "strategic-lesson",
  ]).default("strategic-lesson"),
  theme: z.string().min(1, "Theme is required"),
  insight: z.string().min(5, "Insight too short"),
  authorityImpact: z.number().int().min(1).max(10).default(5),
  semanticValue: z.number().int().min(1).max(10).default(5),
  outcomeSummary: z.string().default(""),
  strategicNotes: z.string().default(""),
  category: z.string().optional(),
  platform: z.string().optional(),
});

// ─── Research Signal Schemas ─────────────────────────────────

export const ResearchSignalSchema = z.object({
  title: z.string().min(5),
  category: z.enum([
    "trend", "topic-shift", "industry-observation",
    "competitor-pattern", "semantic-opportunity", "authority-gap",
  ]),
  relevance: z.number().int().min(1).max(10),
  authorityOpportunity: z.number().int().min(1).max(10),
  urgency: z.enum(["high", "medium", "low"]),
  relatedThemes: z.string(), // JSON array
  insightSummary: z.string().min(10),
  suggestedActions: z.string(), // JSON array
  alertType: z.string().min(1),
  dateDetected: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// ─── Authority Snapshot Schemas ──────────────────────────────

export const AuthoritySnapshotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  brandedSearchVolume: z.number().int().min(0),
  linkedinFollowers: z.number().int().min(0),
  linkedinPostImpressions: z.number().int().min(0),
  publishedArticles: z.number().int().min(0),
  caseStudiesCompleted: z.number().int().min(0),
  externalMentions: z.number().int().min(0),
  backlinks: z.number().int().min(0),
  aiCitationOpportunities: z.number().int().min(0),
  semanticThemesCovered: z.number().int().min(0).max(10),
  founderVisibilityScore: z.number().int().min(1).max(10),
  entityConsistencyScore: z.number().int().min(1).max(10),
});

// ─── Amplification Schemas ───────────────────────────────────

export const AmplifyRequestSchema = z.object({
  title: z.string().min(3, "Title is required"),
  content: z.string().min(20, "Content too short for meaningful amplification"),
  type: z.enum(["article", "case-study", "research-insight", "audit-finding", "strategic-observation"]).default("article"),
  theme: z.string().default("website-health"),
  keyInsights: z.array(z.string()).default([]),
  useAI: z.boolean().default(true),
});

// ─── AI Request Schemas ──────────────────────────────────────

export const GenerateMissionsRequestSchema = z.object({
  focusThemes: z.array(z.string()).optional(),
  previousTopics: z.array(z.string()).optional(),
  dayOfWeek: z.string().optional(),
  count: z.number().int().min(1).max(10).optional(),
});

export const ExpandTopicRequestSchema = z.object({
  topic: z.string().min(3, "Topic is required"),
  themeId: z.string().optional(),
});

// ─── Validation Helper ───────────────────────────────────────

export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
  return { success: false, error: errors };
}
