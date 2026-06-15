import prisma from "./prisma";

// ─── Missions ────────────────────────────────────────────────

export async function getMissions(date?: string) {
  const where = date ? { date } : {};
  return prisma.mission.findMany({ where, orderBy: { date: "desc" } });
}

export async function getMissionsByDateRange(start: string, end: string) {
  return prisma.mission.findMany({
    where: { date: { gte: start, lte: end } },
    orderBy: { date: "asc" },
  });
}

export async function createMission(data: {
  date: string;
  title: string;
  category: string;
  authorityFocus: string;
  platform: string;
  estimatedTime: string;
  objective: string;
  topic: string;
  description: string;
  status?: string;
  priority?: string;
  themeId?: string;
  contentAngle?: string;
  // New pillar-aligned fields
  pillar?: string;
  taskType?: string;
  effortLevel?: string;
  postType?: string;
  draftContent?: string;
  draftFormat?: string;
  publishStatus?: string;
  publishedUrl?: string;
  publishTarget?: string;
  howToPublish?: string;
  imagePrompt?: string;
  firstComment?: string;
}) {
  return prisma.mission.create({ data });
}

export async function updateMissionDraft(
  id: string,
  data: {
    draftContent?: string;
    draftFormat?: string;
    publishStatus?: string;
    publishedUrl?: string;
    publishTarget?: string;
    howToPublish?: string;
    imagePrompt?: string;
    firstComment?: string;
  }
) {
  return prisma.mission.update({ where: { id }, data });
}

export async function updateMissionStatus(id: string, status: string) {
  return prisma.mission.update({ where: { id }, data: { status } });
}

// ─── Strategic Memory ────────────────────────────────────────

export async function getMemories() {
  return prisma.strategicMemory.findMany({ orderBy: { date: "desc" } });
}

export async function createMemory(data: {
  date: string;
  type: string;
  theme: string;
  insight: string;
  authorityImpact: number;
  semanticValue: number;
  outcomeSummary: string;
  strategicNotes: string;
  category?: string;
  platform?: string;
}) {
  return prisma.strategicMemory.create({ data });
}

// ─── Research Signals ────────────────────────────────────────

export async function getResearchSignals() {
  return prisma.researchSignal.findMany({ orderBy: { dateDetected: "desc" } });
}

export async function createResearchSignal(data: {
  title: string;
  category: string;
  relevance: number;
  authorityOpportunity: number;
  urgency: string;
  relatedThemes: string; // JSON string
  insightSummary: string;
  suggestedActions: string; // JSON string
  alertType: string;
  dateDetected: string;
}) {
  return prisma.researchSignal.create({ data });
}

// ─── Authority Snapshots ─────────────────────────────────────

export async function getAuthoritySnapshots() {
  return prisma.authoritySnapshot.findMany({ orderBy: { date: "asc" } });
}

export async function createAuthoritySnapshot(data: {
  date: string;
  brandedSearchVolume: number;
  linkedinFollowers: number;
  linkedinPostImpressions: number;
  publishedArticles: number;
  caseStudiesCompleted: number;
  externalMentions: number;
  backlinks: number;
  aiCitationOpportunities: number;
  semanticThemesCovered: number;
  founderVisibilityScore: number;
  entityConsistencyScore: number;
}) {
  return prisma.authoritySnapshot.create({ data });
}

// ─── External Corroboration ──────────────────────────────────

export async function getCorroborations() {
  return prisma.externalCorroboration.findMany({ orderBy: { date: "desc" } });
}

export async function createCorroboration(data: {
  type: string;
  source: string;
  title: string;
  url?: string;
  date: string;
  authorityImpact: number;
  relatedTheme: string;
}) {
  return prisma.externalCorroboration.create({ data });
}

// ─── AI Visibility Checks ────────────────────────────────────

export async function getVisibilityChecks() {
  return prisma.aIVisibilityCheck.findMany({ orderBy: { date: "desc" } });
}

export async function createVisibilityCheck(data: {
  platform: string;
  query: string;
  cited: boolean;
  position?: number;
  date: string;
  theme: string;
}) {
  return prisma.aIVisibilityCheck.create({ data });
}

// ─── Executive Briefings ─────────────────────────────────────

export async function getLatestBriefing() {
  return prisma.executiveBriefing.findFirst({ orderBy: { createdAt: "desc" } });
}

export async function saveBriefing(data: {
  date: string;
  authorityHealthScore: number;
  executionConsistencyScore: number;
  aiVisibilityRate: number;
  semanticCoverage: number;
  momentumDirection: string;
  whatMattersMost: string;
  highestLeverageOpp: string;
  biggestRisk: string;
  recommendedFocus: string;
  briefingSectionsJson: string;
}) {
  return prisma.executiveBriefing.create({ data });
}

// ─── Seed Check ──────────────────────────────────────────────

export async function isDatabaseSeeded(): Promise<boolean> {
  const count = await prisma.mission.count();
  return count > 0;
}
