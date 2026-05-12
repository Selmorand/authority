import cron from "node-cron";
import { generateDailyBriefing, generateWeeklyReview } from "./generateDailyBriefing";
import { generateMonthlyReport } from "./monthlyReinforcement";
import type { MonthlyReport } from "./monthlyReinforcement";

// ─── Types ───────────────────────────────────────────────────

export interface ScheduledTask {
  name: string;
  schedule: string; // cron expression
  description: string;
  lastRun: string | null;
  nextRun: string;
  status: "active" | "paused";
}

export interface SchedulerState {
  isRunning: boolean;
  tasks: ScheduledTask[];
  briefingCache: ReturnType<typeof generateDailyBriefing> | null;
  reviewCache: ReturnType<typeof generateWeeklyReview> | null;
  monthlyReportCache: MonthlyReport | null;
}

// ─── Scheduler ───────────────────────────────────────────────

const state: SchedulerState = {
  isRunning: false,
  tasks: [],
  briefingCache: null,
  reviewCache: null,
  monthlyReportCache: null,
};

const taskDefinitions = [
  {
    name: "Daily Morning Briefing",
    schedule: "0 7 * * 1-5", // 7:00 AM Mon-Fri
    description: "Generate daily authority briefing with priorities and execution flow",
    handler: () => {
      state.briefingCache = generateDailyBriefing();
    },
  },
  {
    name: "Weekly Strategic Review",
    schedule: "0 17 * * 5", // 5:00 PM Friday
    description: "Generate weekly authority review with adjustments and next-week focus",
    handler: () => {
      state.reviewCache = generateWeeklyReview();
    },
  },
  {
    name: "Authority Cadence Check",
    schedule: "0 12 * * 1-5", // Noon Mon-Fri
    description: "Mid-day check on authority execution cadence",
    handler: () => {
      // Refresh briefing with latest state
      state.briefingCache = generateDailyBriefing();
    },
  },
  {
    name: "Research Refresh",
    schedule: "0 9 * * 2,4", // 9:00 AM Tue/Thu
    description: "Prompt research feed scan for new intelligence",
    handler: () => {
      // In future: auto-trigger /api/research/signals
    },
  },
  {
    name: "Monthly Reinforcement Report",
    schedule: "0 8 1 * *", // 8:00 AM on the 1st of every month
    description: "Generate entity / corroboration / drift / balance / visibility findings for the month",
    handler: () => {
      state.monthlyReportCache = generateMonthlyReport();
    },
  },
  {
    name: "Mid-Month Entity Sweep",
    schedule: "0 9 15 * *", // 9:00 AM on the 15th
    description: "Mid-month nudge to run an entity / directory / Wikidata sweep",
    handler: () => {
      // Refresh the cached report so the dashboard reflects mid-cycle state
      state.monthlyReportCache = generateMonthlyReport();
    },
  },
];

// ─── Control Functions ───────────────────────────────────────

export function startScheduler(): SchedulerState {
  if (state.isRunning) return state;

  const tasks: ScheduledTask[] = [];

  for (const def of taskDefinitions) {
    if (cron.validate(def.schedule)) {
      cron.schedule(def.schedule, def.handler, { timezone: "Europe/London" });
      tasks.push({
        name: def.name,
        schedule: def.schedule,
        description: def.description,
        lastRun: null,
        nextRun: getNextRun(def.schedule),
        status: "active",
      });
    }
  }

  // Generate initial briefing immediately
  state.briefingCache = generateDailyBriefing();
  state.reviewCache = generateWeeklyReview();
  state.monthlyReportCache = generateMonthlyReport();
  state.isRunning = true;
  state.tasks = tasks;

  return state;
}

export function getSchedulerState(): SchedulerState {
  // Always ensure caches are fresh
  if (!state.briefingCache) {
    state.briefingCache = generateDailyBriefing();
  }
  if (!state.reviewCache) {
    state.reviewCache = generateWeeklyReview();
  }
  if (!state.monthlyReportCache) {
    state.monthlyReportCache = generateMonthlyReport();
  }
  return state;
}

export function getTaskDefinitions() {
  return taskDefinitions.map((t) => ({
    name: t.name,
    schedule: t.schedule,
    description: t.description,
    nextRun: getNextRun(t.schedule),
  }));
}

// ─── Helpers ─────────────────────────────────────────────────

function getNextRun(cronExpr: string): string {
  // Simple estimation — not exact but good enough for display
  const now = new Date();
  const parts = cronExpr.split(" ");
  const minute = parseInt(parts[0]);
  const hour = parseInt(parts[1]);

  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);

  return next.toISOString();
}
