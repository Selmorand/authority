"use client";

import { useState, useMemo } from "react";
import {
  scheduleWeek,
  recurringCycles,
} from "@/lib/scheduleAuthorityMissions";
import type { DaySchedule, ScheduledMission } from "@/lib/scheduleAuthorityMissions";

const timeBlockLabels: Record<string, { label: string; color: string }> = {
  morning: { label: "Morning", color: "#38bdf8" },
  midday: { label: "Midday", color: "#22c55e" },
  afternoon: { label: "Afternoon", color: "#a855f7" },
};

export default function AuthorityCalendar() {
  const [weekOffset, setWeekOffset] = useState(0);

  const startDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d.toISOString().split("T")[0];
  }, [weekOffset]);

  const week = useMemo(() => scheduleWeek(startDate), [startDate]);

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            Authority Calendar
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {week.totalMissions} missions &middot;{" "}
            {Math.round(week.totalMinutes / 60)} hours estimated
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-card-border bg-background-raised text-muted hover:text-foreground cursor-pointer transition-colors"
          >
            Prev
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-accent/30 bg-accent/10 text-accent cursor-pointer transition-colors"
          >
            This Week
          </button>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-card-border bg-background-raised text-muted hover:text-foreground cursor-pointer transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Recurring cycles legend */}
      <div className="flex flex-wrap gap-2">
        {recurringCycles.map((c) => (
          <div
            key={c.dayOfWeek}
            className="text-xs px-2.5 py-1 rounded-lg bg-background-raised border border-card-border-subtle text-muted"
          >
            <span className="text-foreground-bright font-medium">
              {c.dayName}
            </span>{" "}
            &middot; {c.focus}
          </div>
        ))}
      </div>

      {/* Weekly grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {week.days.map((day) => (
          <DayColumn key={day.date} day={day} />
        ))}
      </div>

      {/* Theme distribution */}
      {week.themeDistribution.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Theme Distribution
          </h3>
          <div className="flex flex-wrap gap-2">
            {week.themeDistribution.map((t) => (
              <span
                key={t.theme}
                className="text-xs px-2 py-0.5 rounded-full bg-accent/8 text-foreground/70 border border-card-border-subtle"
              >
                {t.theme}: {t.count}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function DayColumn({ day }: { day: DaySchedule }) {
  const dateLabel = new Date(day.date + "T00:00:00").toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short" }
  );
  const allMissions = [...day.morning, ...day.midday, ...day.afternoon];
  const isToday = day.date === new Date().toISOString().split("T")[0];

  return (
    <div
      className={`rounded-lg border p-3 flex flex-col gap-2 ${
        isToday
          ? "border-accent/30 bg-accent/3"
          : "border-card-border-subtle bg-background-raised/50"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground-bright uppercase tracking-wider">
          {day.dayName.slice(0, 3)}
        </h3>
        <span className="text-xs text-muted">{dateLabel}</span>
      </div>

      {/* Time blocks */}
      {(["morning", "midday", "afternoon"] as const).map((block) => {
        const missions =
          block === "morning"
            ? day.morning
            : block === "midday"
              ? day.midday
              : day.afternoon;
        if (missions.length === 0) return null;
        const cfg = timeBlockLabels[block];

        return (
          <div key={block}>
            <p
              className="text-xs font-medium uppercase tracking-wider mb-1"
              style={{ color: cfg.color }}
            >
              {cfg.label}
            </p>
            <div className="space-y-1">
              {missions.map((m) => (
                <MissionSlot key={m.id} mission={m} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Day stats */}
      <div className="flex items-center justify-between text-xs text-muted mt-auto pt-1 border-t border-card-border-subtle">
        <span>{allMissions.length} missions</span>
        <span>{day.totalEstimatedMins} min</span>
      </div>
    </div>
  );
}

function MissionSlot({ mission }: { mission: ScheduledMission }) {
  return (
    <div
      className={`rounded-md px-2 py-1.5 text-xs leading-snug border ${
        mission.isHighPriority
          ? "border-accent/20 bg-accent/5"
          : "border-card-border-subtle/50 bg-card-bg/40"
      } ${mission.isOverdue ? "border-red-500/20 bg-red-500/5" : ""}`}
    >
      <p className="text-foreground/80 line-clamp-2">{mission.title}</p>
      <div className="flex items-center gap-1.5 mt-1 text-xs text-muted">
        <span>{mission.estimatedTime}</span>
        {mission.isHighPriority && (
          <span className="text-accent font-medium">priority</span>
        )}
        {mission.isOverdue && (
          <span className="text-red-400 font-medium">overdue</span>
        )}
      </div>
    </div>
  );
}
