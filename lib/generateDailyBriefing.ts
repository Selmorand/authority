import { generateDailyPlan, getTodayDateStr } from "./generateDailyPlan";
import { generateReminders } from "./scheduleAuthorityMissions";
import { calculateExecutionStats, analyzeCadence, detectStrategicDrift } from "./executionTracker";
import { generateHealthReport } from "./authorityHealth";
import { getScoredSignals } from "./opportunityEngine";

// ─── Types ───────────────────────────────────────────────────

export interface DailyBriefing {
  date: string;
  dayName: string;
  greeting: string;
  // Priorities
  topPriority: string;
  missionCount: number;
  estimatedMinutes: number;
  focusThemes: string[];
  // Strategic context
  authorityHealth: number;
  consistencyStreak: number;
  aiVisibility: number;
  momentumStatus: string;
  // Reminders
  reminders: BriefingReminder[];
  // Overdue awareness
  overdueAreas: string[];
  // Opportunities
  topOpportunity: string;
  // Weekly context
  weeklyFocusArea: string;
  semanticReinforcement: string;
  // Execution flow
  executionFlow: ExecutionStep[];
}

export interface BriefingReminder {
  type: "priority" | "strategic" | "research" | "founder" | "semantic";
  message: string;
  urgency: "high" | "medium" | "low";
}

export interface ExecutionStep {
  order: number;
  timeBlock: string;
  title: string;
  theme: string;
  estimatedTime: string;
  priority: "high" | "medium" | "low";
}

export interface WeeklyReview {
  weekOf: string;
  completedMissions: number;
  consistencyScore: number;
  strongestThemes: string[];
  weakestThemes: string[];
  executionRate: number; // percentage
  adjustments: string[];
  nextWeekFocus: string[];
}

// ─── Daily Briefing Generator ────────────────────────────────

export function generateDailyBriefing(dateStr?: string): DailyBriefing {
  const date = dateStr ?? getTodayDateStr();
  const plan = generateDailyPlan(date);
  const reminders = generateReminders(date);
  const stats = calculateExecutionStats();
  const cadence = analyzeCadence();
  const drift = detectStrategicDrift();
  const health = generateHealthReport();
  const signals = getScoredSignals();

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayOfWeek = new Date(date + "T00:00:00").getDay();
  const dayName = dayNames[dayOfWeek];

  // Day strategies — aligned with the 1+many model
  const dayStrategies: Record<number, string> = {
    1: "Core authority asset — the one heavy publication that seeds the week",
    2: "LinkedIn reinforcement of yesterday's core asset",
    3: "Community contribution — Reddit, Umbraco, Stack Overflow (educational, non-promotional)",
    4: "Video reinforcement — YouTube clips and founder commentary, no full-scale production",
    5: "Entity reinforcement, internal-site work, and weekly strategic review",
  };

  const totalMins = plan.missions.reduce((s, m) => {
    const mins = parseInt(m.estimatedTime);
    return s + (isNaN(mins) ? 0 : mins);
  }, 0);

  const focusThemes = [...new Set(plan.missions.map((m) => m.theme.name))];

  // Determine momentum — the new model prioritises sustainability over volume
  const momentumStatus = stats.consistencyScore >= 7
    ? "Strong cadence — protect it. Sustainability > volume."
    : stats.consistencyScore >= 5
      ? "Steady — keep one core asset per week and let reinforcement do the rest"
      : "Rebuilding — complete one light reinforcement today. Authority compounds slowly.";

  // Overdue areas
  const overdueAreas = cadence
    .filter((c) => c.frequency === "inactive")
    .map((c) => c.theme);

  // Top opportunity
  const topSignal = signals[0];
  const topOpportunity = topSignal
    ? topSignal.signal.title
    : "Maintain balanced authority-building across all themes";

  // Weekly focus
  const weeklyFocusArea = dayStrategies[dayOfWeek] ?? "Review and planning";

  // Semantic reinforcement focus
  const weakThemes = cadence
    .filter((c) => c.frequency === "low" || c.frequency === "inactive")
    .slice(0, 2)
    .map((c) => c.theme);
  const semanticReinforcement = weakThemes.length > 0
    ? `Prioritise ${weakThemes.join(" and ")} for semantic balance`
    : "All themes well-covered — maintain current distribution";

  // Briefing reminders
  const briefingReminders: BriefingReminder[] = [];

  // Priority missions
  const highPriority = plan.missions.filter((m) => m.priority.overall >= 7);
  if (highPriority.length > 0) {
    briefingReminders.push({
      type: "priority",
      message: `${highPriority.length} high-priority mission${highPriority.length > 1 ? "s" : ""}: start with "${highPriority[0].title}"`,
      urgency: "high",
    });
  }

  // Strategic reminders from scheduler
  for (const r of reminders) {
    briefingReminders.push({
      type: r.type === "high-priority" ? "priority" : r.type === "semantic" ? "semantic" : "strategic",
      message: r.description,
      urgency: r.urgency === "immediate" ? "high" : r.urgency === "today" ? "medium" : "low",
    });
  }

  // Research reminder (Tue/Thu)
  if (dayOfWeek === 2 || dayOfWeek === 4) {
    briefingReminders.push({
      type: "research",
      message: "Check live research feed for new authority opportunities",
      urgency: "low",
    });
  }

  // Founder visibility (Wed)
  if (dayOfWeek === 3) {
    briefingReminders.push({
      type: "founder",
      message: "Today's focus: founder insight content and entity reinforcement",
      urgency: "medium",
    });
  }

  // Drift warnings
  for (const d of drift.filter((d) => d.severity === "high").slice(0, 1)) {
    briefingReminders.push({
      type: "strategic",
      message: `Drift warning: ${d.area} — ${d.correction}`,
      urgency: "high",
    });
  }

  // Execution flow
  const executionFlow: ExecutionStep[] = plan.missions.map((m, i) => ({
    order: i + 1,
    timeBlock: i === 0 ? "Morning" : i < plan.missions.length - 1 ? "Midday" : "Afternoon",
    title: m.title,
    theme: m.theme.name,
    estimatedTime: m.estimatedTime,
    priority: m.priority.overall >= 7 ? "high" : m.priority.overall >= 5 ? "medium" : "low",
  }));

  // Greeting — calibrated to the reinforcement philosophy
  const greetings: Record<number, string> = {
    1: "Anchor the week. One core asset — the rest of the week amplifies it.",
    2: "Reinforce on LinkedIn. Repetition compounds.",
    3: "Participate. Visible expertise in communities beats another original post.",
    4: "Capture a clip or a 2-minute take. Quick reinforcement, not a production.",
    5: "Close the loop. Entity work, then strategic review.",
    0: "Weekend. Rest is part of the system — authority compounds either way.",
    6: "Weekend. Rest is part of the system — authority compounds either way.",
  };

  return {
    date,
    dayName,
    greeting: greetings[dayOfWeek],
    topPriority: highPriority[0]?.title ?? plan.missions[0]?.title ?? "Review strategic priorities",
    missionCount: plan.missions.length,
    estimatedMinutes: totalMins,
    focusThemes,
    authorityHealth: health.overallScore,
    consistencyStreak: stats.currentStreak,
    aiVisibility: health.aiVisibilityRate,
    momentumStatus,
    reminders: briefingReminders,
    overdueAreas,
    topOpportunity,
    weeklyFocusArea,
    semanticReinforcement,
    executionFlow,
  };
}

// ─── Weekly Review Generator ─────────────────────────────────

export function generateWeeklyReview(): WeeklyReview {
  const stats = calculateExecutionStats();
  const cadence = analyzeCadence();
  const drift = detectStrategicDrift();
  const health = generateHealthReport();

  const strongestThemes = cadence
    .filter((c) => c.frequency === "high" || c.frequency === "moderate")
    .slice(0, 3)
    .map((c) => c.theme);

  const weakestThemes = cadence
    .filter((c) => c.frequency === "low" || c.frequency === "inactive")
    .slice(0, 3)
    .map((c) => c.theme);

  const adjustments: string[] = [];
  for (const d of drift.slice(0, 3)) {
    adjustments.push(d.correction);
  }
  if (adjustments.length === 0) {
    adjustments.push("Maintain current execution cadence — no major adjustments needed");
  }

  const nextWeekFocus: string[] = [];
  if (weakestThemes.length > 0) {
    nextWeekFocus.push(`Increase coverage of ${weakestThemes[0]}`);
  }
  const weakHealth = health.healthIndicators.filter((h) => h.status === "weak");
  if (weakHealth.length > 0) {
    nextWeekFocus.push(`Strengthen ${weakHealth[0].area}`);
  }
  nextWeekFocus.push("Maintain daily mission completion");

  return {
    weekOf: getTodayDateStr(),
    completedMissions: stats.totalCompleted,
    consistencyScore: stats.consistencyScore,
    strongestThemes,
    weakestThemes,
    executionRate: Math.round(stats.weeklyRate * 20), // approximate %
    adjustments,
    nextWeekFocus,
  };
}
