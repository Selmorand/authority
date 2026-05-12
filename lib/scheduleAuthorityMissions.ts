import { generateDailyPlan, getWeekDatesFrom } from "./generateDailyPlan";
import type { PlannedMission } from "./generateDailyPlan";

// ─── Types ───────────────────────────────────────────────────

export type TimeBlock = "morning" | "midday" | "afternoon";

export interface ScheduledMission extends PlannedMission {
  timeBlock: TimeBlock;
  isHighPriority: boolean;
  isOverdue: boolean;
  dueDate: string;
}

export interface DaySchedule {
  date: string;
  dayName: string;
  dayStrategy: string;
  morning: ScheduledMission[];
  midday: ScheduledMission[];
  afternoon: ScheduledMission[];
  totalEstimatedMins: number;
  highPriorityCount: number;
}

export interface WeekSchedule {
  weekStart: string;
  days: DaySchedule[];
  totalMissions: number;
  totalMinutes: number;
  themeDistribution: { theme: string; count: number }[];
}

export interface RecurringCycle {
  dayOfWeek: number; // 1=Mon...5=Fri
  dayName: string;
  focus: string;
  description: string;
  preferredCategories: string[];
}

export interface StrategicReminder {
  type: "high-priority" | "overdue" | "strategic" | "semantic" | "opportunity";
  title: string;
  description: string;
  urgency: "immediate" | "today" | "this-week";
  relatedTheme?: string;
}

// ─── Recurring Strategic Cycles ──────────────────────────────

// ─── 1+many Weekly Cadence ──────────────────────────────────
// Authority compounds through reinforcement, not production volume.
// One heavy core asset on Monday seeds the week; Tue–Fri reinforce
// it across channels without forcing more original content.

export const recurringCycles: RecurringCycle[] = [
  {
    dayOfWeek: 1,
    dayName: "Monday",
    focus: "Core Authority Asset",
    description: "Produce the ONE heavy authority asset for the week — long-form article, case study, audit, or YouTube explainer. The rest of the week reinforces it.",
    preferredCategories: ["Authority Article", "GEO Educational Article", "Case Study", "Authority Audit Breakdown", "YouTube Explainer"],
  },
  {
    dayOfWeek: 2,
    dayName: "Tuesday",
    focus: "LinkedIn Reinforcement",
    description: "Reinforce yesterday's core asset on LinkedIn — insight post, carousel, and substantive commentary on peer posts. No new long-form.",
    preferredCategories: ["LinkedIn Insight Post", "LinkedIn Carousel", "LinkedIn Commentary", "Founder Commentary Snippet"],
  },
  {
    dayOfWeek: 3,
    dayName: "Wednesday",
    focus: "Community Contribution",
    description: "Authority through participation. Educational, non-promotional answers in Reddit, Umbraco forums, Stack Overflow, dev.to, or technical Slacks.",
    preferredCategories: ["Reddit Authority Answer", "Community Contribution", "Forum Response"],
  },
  {
    dayOfWeek: 4,
    dayName: "Thursday",
    focus: "Video Reinforcement",
    description: "YouTube as a primary reinforcement channel. Record a short clip or 2-minute founder commentary — no full-scale production.",
    preferredCategories: ["YouTube Clip / Short", "YouTube Commentary", "Founder Commentary Snippet"],
  },
  {
    dayOfWeek: 5,
    dayName: "Friday",
    focus: "Entity Reinforcement & Review",
    description: "Close the week with entity and internal-site reinforcement, plus the weekly strategic review. No new content production.",
    preferredCategories: ["Entity Update", "Internal Linking Pass", "Schema Refinement", "Strategic Review"],
  },
];

// ─── Mission Scheduling ─────────────────────────────────────

function assignTimeBlock(
  mission: PlannedMission,
  index: number,
  total: number
): TimeBlock {
  // Core authority asset always lives in the morning — protect the high-focus block
  if (mission.isCoreAsset) return "morning";
  // Heavy reinforcement (carousels, long video) in the morning
  if (mission.loadTier === "heavy") return "morning";
  // Strategic review at end of day
  if (mission.taskKind === "strategic-review") return "afternoon";
  // Research sessions in the afternoon
  if (mission.taskKind === "research") return "afternoon";
  // High-priority light tasks early
  if (mission.priority.overall >= 7 || index === 0) return "morning";
  if (index < total * 0.6) return "midday";
  return "afternoon";
}

export function scheduleDayMissions(
  dateStr: string,
  overdueMissions: PlannedMission[] = []
): DaySchedule {
  const plan = generateDailyPlan(dateStr);
  const scheduled: ScheduledMission[] = [];

  // Add overdue missions first (high priority)
  for (const m of overdueMissions) {
    scheduled.push({
      ...m,
      timeBlock: "morning",
      isHighPriority: true,
      isOverdue: true,
      dueDate: m.id.split("-")[1] || dateStr,
    });
  }

  // Schedule today's missions
  for (let i = 0; i < plan.missions.length; i++) {
    const m = plan.missions[i];
    scheduled.push({
      ...m,
      timeBlock: assignTimeBlock(m, i, plan.missions.length),
      isHighPriority: m.priority.overall >= 7,
      isOverdue: false,
      dueDate: dateStr,
    });
  }

  const morning = scheduled.filter((m) => m.timeBlock === "morning");
  const midday = scheduled.filter((m) => m.timeBlock === "midday");
  const afternoon = scheduled.filter((m) => m.timeBlock === "afternoon");

  const totalMins = scheduled.reduce((s, m) => {
    const mins = parseInt(m.estimatedTime);
    return s + (isNaN(mins) ? 0 : mins);
  }, 0);

  return {
    date: dateStr,
    dayName: plan.dayName,
    dayStrategy: plan.dayStrategy,
    morning,
    midday,
    afternoon,
    totalEstimatedMins: totalMins,
    highPriorityCount: scheduled.filter((m) => m.isHighPriority).length,
  };
}

export function scheduleWeek(startDate: string): WeekSchedule {
  const dates = getWeekDatesFrom(startDate);
  const days = dates.map((d) => scheduleDayMissions(d));

  const totalMissions = days.reduce(
    (s, d) => s + d.morning.length + d.midday.length + d.afternoon.length,
    0
  );
  const totalMinutes = days.reduce((s, d) => s + d.totalEstimatedMins, 0);

  // Theme distribution
  const themeCounts: Record<string, number> = {};
  for (const day of days) {
    const allMissions = [...day.morning, ...day.midday, ...day.afternoon];
    for (const m of allMissions) {
      const name = m.theme.name;
      themeCounts[name] = (themeCounts[name] || 0) + 1;
    }
  }

  const themeDistribution = Object.entries(themeCounts)
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count);

  return {
    weekStart: dates[0],
    days,
    totalMissions,
    totalMinutes,
    themeDistribution,
  };
}

// ─── Strategic Reminders ─────────────────────────────────────

export function generateReminders(
  dateStr: string
): StrategicReminder[] {
  const reminders: StrategicReminder[] = [];
  const schedule = scheduleDayMissions(dateStr);
  const dayOfWeek = new Date(dateStr + "T00:00:00").getDay();
  const cycle = recurringCycles.find((c) => c.dayOfWeek === dayOfWeek);

  // High-priority missions
  const highPriority = [
    ...schedule.morning,
    ...schedule.midday,
    ...schedule.afternoon,
  ].filter((m) => m.isHighPriority);

  if (highPriority.length > 0) {
    reminders.push({
      type: "high-priority",
      title: `${highPriority.length} high-priority mission${highPriority.length > 1 ? "s" : ""} today`,
      description: highPriority.map((m) => m.title).join("; "),
      urgency: "immediate",
    });
  }

  // Recurring cycle reminder
  if (cycle) {
    reminders.push({
      type: "strategic",
      title: `${cycle.dayName}: ${cycle.focus}`,
      description: cycle.description,
      urgency: "today",
    });
  }

  // Monday: anchor the week on the core asset
  if (dayOfWeek === 1) {
    reminders.push({
      type: "strategic",
      title: "Anchor the week on one core asset",
      description:
        "Publish one substantial authority asset today. The rest of the week amplifies it — don't queue more heavy work behind it.",
      urgency: "immediate",
    });
  }

  // Mid-week: community participation prompt
  if (dayOfWeek === 3) {
    reminders.push({
      type: "semantic",
      title: "Community participation day",
      description:
        "Authority through visible expertise: answer real questions in Reddit / Umbraco / Stack Overflow today. Educational, non-promotional.",
      urgency: "today",
    });
  }

  // Friday: entity + strategic review reminder
  if (dayOfWeek === 5) {
    reminders.push({
      type: "opportunity",
      title: "Friday — close the loop",
      description:
        "Entity / internal-site reinforcement, then the weekly strategic review. Set Monday's core asset focus before signing off.",
      urgency: "today",
    });
  }

  return reminders;
}
