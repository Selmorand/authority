import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { missions } from "../data/missions";
import { seedMemory } from "../data/strategicMemory";
import { researchSignals } from "../data/researchSignals";
import {
  metricHistory,
  externalCorroborations,
  aiVisibilityChecks,
} from "../data/authorityMetrics";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  console.log(`  Seeding ${missions.length} missions...`);
  for (const m of missions) {
    await prisma.mission.create({
      data: {
        date: m.date,
        title: m.title,
        category: m.category,
        authorityFocus: m.authorityFocus,
        platform: m.platform,
        estimatedTime: m.estimatedTime,
        objective: m.objective,
        topic: m.topic,
        description: m.description,
        status: m.status,
        priority: m.priority,
      },
    });
  }

  console.log(`  Seeding ${seedMemory.length} memory items...`);
  for (const m of seedMemory) {
    await prisma.strategicMemory.create({
      data: {
        date: m.date,
        type: m.type,
        theme: m.theme,
        insight: m.insight,
        authorityImpact: m.authorityImpact,
        semanticValue: m.semanticValue,
        outcomeSummary: m.outcomeSummary,
        strategicNotes: m.strategicNotes,
        category: m.category ?? null,
        platform: m.platform ?? null,
      },
    });
  }

  console.log(`  Seeding ${researchSignals.length} research signals...`);
  for (const s of researchSignals) {
    await prisma.researchSignal.create({
      data: {
        title: s.title,
        category: s.category,
        relevance: s.relevance,
        authorityOpportunity: s.authorityOpportunity,
        urgency: s.urgency,
        relatedThemes: JSON.stringify(s.relatedThemes),
        insightSummary: s.insightSummary,
        suggestedActions: JSON.stringify(s.suggestedActions),
        alertType: s.alertType,
        dateDetected: s.dateDetected,
      },
    });
  }

  console.log(`  Seeding ${metricHistory.length} authority snapshots...`);
  for (const s of metricHistory) {
    await prisma.authoritySnapshot.create({
      data: {
        date: s.date,
        brandedSearchVolume: s.brandedSearchVolume,
        linkedinFollowers: s.linkedinFollowers,
        linkedinPostImpressions: s.linkedinPostImpressions,
        publishedArticles: s.publishedArticles,
        caseStudiesCompleted: s.caseStudiesCompleted,
        externalMentions: s.externalMentions,
        backlinks: s.backlinks,
        aiCitationOpportunities: s.aiCitationOpportunities,
        semanticThemesCovered: s.semanticThemesCovered,
        founderVisibilityScore: s.founderVisibilityScore,
        entityConsistencyScore: s.entityConsistencyScore,
      },
    });
  }

  console.log(`  Seeding ${externalCorroborations.length} corroborations...`);
  for (const c of externalCorroborations) {
    await prisma.externalCorroboration.create({
      data: {
        type: c.type,
        source: c.source,
        title: c.title,
        url: c.url ?? null,
        date: c.date,
        authorityImpact: c.authorityImpact,
        relatedTheme: c.relatedTheme,
      },
    });
  }

  console.log(`  Seeding ${aiVisibilityChecks.length} visibility checks...`);
  for (const v of aiVisibilityChecks) {
    await prisma.aIVisibilityCheck.create({
      data: {
        platform: v.platform,
        query: v.query,
        cited: v.cited,
        position: v.position ?? null,
        date: v.date,
        theme: v.theme,
      },
    });
  }

  console.log("Seeding complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("Seed error:", e);
    prisma.$disconnect();
    process.exit(1);
  });
