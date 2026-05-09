import { generateDailyPlan, getWeekDatesFrom } from "./generateDailyPlan";
import type { PlannedMission, DailyPlan } from "./generateDailyPlan";
import { themes } from "@/data/themes";

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

export const recurringCycles: RecurringCycle[] = [
  {
    dayOfWeek: 1,
    dayName: "Monday",
    focus: "Strategic Positioning",
    description: "Set the week's direction with high-visibility authority content and strategic planning",
    preferredCategories: ["LinkedIn Authority Post", "GEO Educational Article"],
  },
  {
    dayOfWeek: 2,
    dayName: "Tuesday",
    focus: "Technical Authority",
    description: "Build deep technical credibility with detailed breakdowns, audits, and implementation guides",
    preferredCategories: ["Technical SEO Breakdown", "Umbraco Authority Contribution"],
  },
  {
    dayOfWeek: 3,
    dayName: "Wednesday",
    focus: "Founder Visibility",
    description: "Amplify personal brand and entity signals through thought leadership and outreach",
    preferredCategories: ["Entity Reinforcement", "LinkedIn Authority Post"],
  },
  {
    dayOfWeek: 4,
    dayName: "Thursday",
    focus: "Case Studies & Video",
    description: "Create high-impact evidence-based content that demonstrates methodology and results",
    preferredCategories: ["Case Study Development", "YouTube Audit Breakdown"],
  },
  {
    dayOfWeek: 5,
    dayName: "Friday",
    focus: "Research & Reinforcement",
    description: "Close the week with research collection, entity signal strengthening, and next-week planning",
    preferredCategories: ["Research Collection", "Entity Reinforcement"],
  },
];

// ─── Mission Scheduling ─────────────────────────────────────

function assignTimeBlock(
  mission: PlannedMission,
  index: number,
  total: number
): TimeBlock {
  // High-priority and high-impact missions go in the morning
  if (mission.priority.overall >= 7 || index === 0) return "morning";
  // Creative/research tasks in the afternoon
  if (
    mission.category === "research" ||
    mission.category === "case-study"
  )
    return "afternoon";
  // Middle tasks midday
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

  // Semantic reinforcement (weekly)
  if (dayOfWeek === 3) {
    reminders.push({
      type: "semantic",
      title: "Mid-week semantic check",
      description:
        "Review this week's content output for theme consistency. Ensure at least 3 core themes have been touched.",
      urgency: "today",
    });
  }

  // Friday planning reminder
  if (dayOfWeek === 5) {
    reminders.push({
      type: "opportunity",
      title: "Weekly authority review",
      description:
        "Review completed missions, assess authority progress, and draft next week's strategic priorities.",
      urgency: "today",
    });
  }

  return reminders;
}
