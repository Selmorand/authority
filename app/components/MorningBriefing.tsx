"use client";

import { useMemo } from "react";
import { generateDailyBriefing, generateWeeklyReview } from "@/lib/generateDailyBriefing";
import type { BriefingReminder, ExecutionStep } from "@/lib/generateDailyBriefing";

const reminderTypeColors: Record<string, string> = {
  priority: "#ef4444",
  strategic: "#f59e0b",
  research: "#a855f7",
  founder: "#ec4899",
  semantic: "#38bdf8",
};

const priorityColors: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#6b7280",
};

export default function MorningBriefing() {
  const briefing = useMemo(() => generateDailyBriefing(), []);
  const review = useMemo(() => generateWeeklyReview(), []);
  const tasks = useMemo(() => [
    { name: "Morning Briefing", schedule: "0 7 * * 1-5", description: "Daily authority briefing generation" },
    { name: "Weekly Review", schedule: "0 17 * * 5", description: "Weekly strategic review" },
    { name: "Cadence Check", schedule: "0 12 * * 1-5", description: "Mid-day execution cadence check" },
    { name: "Research Refresh", schedule: "0 9 * * 2,4", description: "Research feed scan prompt" },
  ], []);

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            Morning Briefing
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {briefing.dayName} &middot; {briefing.missionCount} missions &middot;{" "}
            {Math.round(briefing.estimatedMinutes / 60 * 10) / 10}h estimated
          </p>
        </div>
        <div className="flex gap-3">
          <MiniScore label="Health" value={briefing.authorityHealth} />
          <MiniScore label="Streak" value={briefing.consistencyStreak} suffix="d" />
          <MiniScore label="AI Vis." value={briefing.aiVisibility} suffix="%" />
        </div>
      </div>

      {/* Greeting + top priority */}
      <div className="rounded-lg bg-accent/5 border border-accent/15 px-4 py-3.5">
        <p className="text-xs text-accent/80 mb-1">{briefing.greeting}</p>
        <p className="text-sm text-foreground-bright font-medium">
          Top Priority: {briefing.topPriority}
        </p>
        <p className="text-xs text-muted mt-1">{briefing.momentumStatus}</p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Execution flow */}
        <div>
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Recommended Execution Flow
          </h3>
          <div className="space-y-1.5">
            {briefing.executionFlow.map((step) => (
              <StepCard key={step.order} step={step} />
            ))}
          </div>
        </div>

        {/* Right: Context */}
        <div className="flex flex-col gap-4">
          {/* Reminders */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Reminders
            </h3>
            <div className="space-y-1.5">
              {briefing.reminders.slice(0, 5).map((r, i) => (
                <ReminderCard key={i} reminder={r} />
              ))}
            </div>
          </div>

          {/* Focus areas */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Focus Areas
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {briefing.focusThemes.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 rounded-full bg-accent/8 text-accent border border-accent/15"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Semantic reinforcement */}
          <div className="rounded-lg bg-background-raised border border-card-border-subtle px-3 py-2.5">
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">
              Semantic Reinforcement
            </p>
            <p className="text-xs text-foreground/80">{briefing.semanticReinforcement}</p>
          </div>

          {/* Overdue areas */}
          {briefing.overdueAreas.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Overdue Areas
              </h3>
              <div className="space-y-1">
                {briefing.overdueAreas.map((a) => (
                  <div
                    key={a}
                    className="flex items-center gap-2 text-xs text-yellow-400/80 bg-yellow-500/4 border border-yellow-500/10 rounded-lg px-3 py-1.5"
                  >
                    <span className="shrink-0">!</span> {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top opportunity */}
          <div className="rounded-lg bg-green-500/4 border border-green-500/10 px-3 py-2.5">
            <p className="text-xs font-medium text-green-400 uppercase tracking-wider mb-1">
              Top Opportunity
            </p>
            <p className="text-xs text-foreground/80">{briefing.topOpportunity}</p>
          </div>
        </div>
      </div>

      {/* Weekly review summary */}
      <div className="rounded-lg bg-background-raised border border-card-border-subtle px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
            Weekly Review
          </h3>
          <span className="text-xs text-muted">
            Consistency: {review.consistencyScore}/10 &middot; Execution: {review.executionRate}%
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted mb-1">Strongest Themes</p>
            {review.strongestThemes.map((t) => (
              <p key={t} className="text-foreground/80 flex items-center gap-1.5">
                <span className="text-green-400 text-xs">^</span> {t}
              </p>
            ))}
          </div>
          <div>
            <p className="text-muted mb-1">Next Week Focus</p>
            {review.nextWeekFocus.map((f, i) => (
              <p key={i} className="text-foreground/80 flex items-center gap-1.5">
                <span className="text-accent text-xs">-&gt;</span> {f}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Scheduled tasks */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          Scheduled Operations
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {tasks.map((t) => (
            <div
              key={t.name}
              className="rounded-lg bg-background-raised border border-card-border-subtle px-3 py-2"
            >
              <p className="text-xs text-foreground-bright font-medium">{t.name}</p>
              <p className="text-xs text-muted mt-0.5">{t.description}</p>
              <p className="text-xs text-accent/60 mt-1 font-mono">{t.schedule}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniScore({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  const color = value >= 7 ? "#22c55e" : value >= 5 ? "#38bdf8" : "#f59e0b";
  return (
    <div className="text-center">
      <p className="text-lg font-bold" style={{ color }}>
        {value}{suffix ?? "/10"}
      </p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function StepCard({ step }: { step: ExecutionStep }) {
  const color = priorityColors[step.priority];
  return (
    <div className="flex items-start gap-2.5 bg-background-raised border border-card-border-subtle rounded-lg px-3 py-2.5">
      <span
        className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
        style={{ color, backgroundColor: `${color}12`, border: `1px solid ${color}25` }}
      >
        {step.order}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-foreground-bright font-medium leading-snug">
          {step.title}
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted">
          <span>{step.timeBlock}</span>
          <span className="text-card-border">|</span>
          <span>{step.theme}</span>
          <span className="text-card-border">|</span>
          <span>{step.estimatedTime}</span>
        </div>
      </div>
    </div>
  );
}

function ReminderCard({ reminder }: { reminder: BriefingReminder }) {
  const color = reminderTypeColors[reminder.type] ?? "#6b7280";
  return (
    <div
      className="flex items-start gap-2 rounded-lg border px-3 py-2"
      style={{ borderColor: `${color}15`, backgroundColor: `${color}04` }}
    >
      <span
        className="shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
        style={{ backgroundColor: color }}
      />
      <p className="text-xs text-foreground/80 leading-relaxed">
        {reminder.message}
      </p>
    </div>
  );
}
