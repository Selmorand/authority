"use client";

import { useState, useMemo } from "react";
import {
  generateDailyPlan,
  getTodayDateStr,
} from "@/lib/generateDailyPlan";
import type { PlannedMission, DailyPlan } from "@/lib/generateDailyPlan";

type MissionStatus = "pending" | "in-progress" | "completed";

const statusConfig: Record<
  MissionStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  pending: {
    label: "Pending",
    color: "#94a3b8",
    bg: "#94a3b815",
    border: "#94a3b830",
  },
  "in-progress": {
    label: "In Progress",
    color: "#f59e0b",
    bg: "#f59e0b15",
    border: "#f59e0b30",
  },
  completed: {
    label: "Completed",
    color: "#22c55e",
    bg: "#22c55e15",
    border: "#22c55e30",
  },
};

const statusCycle: MissionStatus[] = ["pending", "in-progress", "completed"];

export default function GeneratedDailyPlan() {
  const [dateStr, setDateStr] = useState(getTodayDateStr);
  const plan = useMemo(() => generateDailyPlan(dateStr), [dateStr]);

  const dayLabel = new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const totalTime = plan.missions.reduce((sum, m) => {
    const mins = parseInt(m.estimatedTime);
    return sum + (isNaN(mins) ? 0 : mins);
  }, 0);

  function shiftDate(days: number) {
    const d = new Date(dateStr + "T00:00:00");
    d.setDate(d.getDate() + days);
    setDateStr(d.toISOString().split("T")[0]);
  }

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            Daily Mission Plan
          </h2>
          <p className="text-sm text-muted mt-0.5">{dayLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <button
              onClick={() => shiftDate(-1)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-card-border bg-background/50 text-muted hover:text-foreground cursor-pointer transition-colors"
            >
              Prev
            </button>
            <button
              onClick={() => setDateStr(getTodayDateStr())}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-accent/30 bg-accent/10 text-accent cursor-pointer transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => shiftDate(1)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-card-border bg-background/50 text-muted hover:text-foreground cursor-pointer transition-colors"
            >
              Next
            </button>
          </div>
          <div className="flex gap-3 text-xs text-muted">
            <span>{plan.missions.length} missions</span>
            <span>{totalTime} min</span>
          </div>
        </div>
      </div>

      {/* Day strategy */}
      <div className="rounded-lg bg-accent/5 border border-accent/15 px-4 py-3">
        <p className="text-xs font-medium text-accent uppercase tracking-wider mb-1">
          {plan.dayName} Strategy
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {plan.dayStrategy}
        </p>
      </div>

      {/* Missions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plan.missions.map((m) => (
          <PlanMissionCard key={m.id} mission={m} />
        ))}
      </div>
    </section>
  );
}

function PlanMissionCard({ mission }: { mission: PlannedMission }) {
  const [status, setStatus] = useState<MissionStatus>("pending");
  const s = statusConfig[status];

  function cycleStatus() {
    const idx = statusCycle.indexOf(status);
    setStatus(statusCycle[(idx + 1) % statusCycle.length]);
  }

  const priorityColor =
    mission.priority.overall >= 7
      ? "#ef4444"
      : mission.priority.overall >= 5
        ? "#f59e0b"
        : "#3b82f6";

  return (
    <div
      className={`rounded-lg border bg-card-bg/60 p-4 flex flex-col gap-3 transition-opacity ${
        status === "completed" ? "opacity-60" : ""
      }`}
      style={{ borderColor: s.border }}
    >
      {/* Order + Title */}
      <div className="flex items-start gap-2.5">
        <span className="shrink-0 w-6 h-6 rounded-full bg-background/80 border border-card-border flex items-center justify-center text-xs font-bold text-muted">
          {mission.executionOrder}
        </span>
        <h3
          className={`text-sm font-semibold leading-snug flex-1 ${
            status === "completed" ? "line-through text-muted" : "text-foreground-bright"
          }`}
        >
          {mission.title}
        </h3>
      </div>

      {/* Objective */}
      <p className="text-xs text-muted leading-relaxed">{mission.objective}</p>

      {/* Meta */}
      <div className="flex flex-wrap gap-1.5 text-xs">
        <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
          {mission.theme.name}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {mission.platform}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {mission.contentAngle}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {mission.estimatedTime}
        </span>
      </div>

      {/* Priority scores */}
      <div className="grid grid-cols-4 gap-1.5 text-xs">
        <ScorePill label="Strategic" value={mission.priority.strategicPriority} />
        <ScorePill label="Impact" value={mission.priority.authorityImpact} />
        <ScorePill label="Semantic" value={mission.priority.semanticValue} />
        <ScorePill label="Overall" value={mission.priority.overall} highlight />
      </div>

      {/* Status toggle */}
      <button
        onClick={cycleStatus}
        className="self-start text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors"
        style={{
          color: s.color,
          backgroundColor: s.bg,
          borderWidth: 1,
          borderColor: s.border,
        }}
      >
        {s.label}
      </button>
    </div>
  );
}

function ScorePill({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  const color =
    value >= 7 ? "#22c55e" : value >= 5 ? "#f59e0b" : "#94a3b8";

  return (
    <div
      className={`text-center rounded px-1 py-1 ${
        highlight
          ? "bg-accent/10 border border-accent/20"
          : "bg-background/40 border border-card-border/30"
      }`}
    >
      <p className="font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-muted">{label}</p>
    </div>
  );
}
