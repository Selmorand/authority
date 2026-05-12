"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  generateDailyPlan,
  getTodayDateStr,
} from "@/lib/generateDailyPlan";
import type { PlannedMission } from "@/lib/generateDailyPlan";
import type { LoadTier, TaskKind } from "@/lib/cognitiveLoad";

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

const loadTierConfig: Record<LoadTier, { label: string; color: string; bg: string }> = {
  heavy: { label: "Heavy", color: "#ef4444", bg: "#ef444415" },
  medium: { label: "Medium", color: "#f59e0b", bg: "#f59e0b15" },
  light: { label: "Light", color: "#22c55e", bg: "#22c55e15" },
};

const kindConfig: Record<TaskKind, { label: string; color: string }> = {
  "core-authority": { label: "Core Authority Asset", color: "#a855f7" },
  reinforcement: { label: "Reinforcement", color: "#38bdf8" },
  research: { label: "Research", color: "#94a3b8" },
  maintenance: { label: "Maintenance", color: "#f59e0b" },
  "strategic-review": { label: "Strategic Review", color: "#ec4899" },
};

const statusCycle: MissionStatus[] = ["pending", "in-progress", "completed"];

export default function GeneratedDailyPlan() {
  const [dateStr, setDateStr] = useState(getTodayDateStr);
  const plan = useMemo(() => generateDailyPlan(dateStr), [dateStr]);
  const [statusMap, setStatusMap] = useState<Record<string, MissionStatus>>({});

  useEffect(() => {
    fetch(`/api/mission-progress?date=${dateStr}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStatusMap(data.statusMap);
        else setStatusMap({});
      })
      .catch(() => setStatusMap({}));
  }, [dateStr]);

  const handleStatusChange = useCallback(
    (id: string, newStatus: MissionStatus, mission?: PlannedMission) => {
      setStatusMap((prev) => ({ ...prev, [id]: newStatus }));
      const payload: Record<string, unknown> = { id, date: dateStr, status: newStatus };
      if (newStatus === "completed" && mission) {
        payload.mission = {
          title: mission.title,
          category: mission.category,
          platform: mission.platform,
          objective: mission.objective,
          contentAngle: mission.contentAngle,
          themeId: mission.theme.id,
          authorityImpact: Math.round(mission.priority.authorityImpact),
          semanticValue: Math.round(mission.priority.semanticValue),
        };
      }
      fetch("/api/mission-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },
    [dateStr]
  );

  const dayLabel = new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const totalTime = plan.cognitiveLoad.totalMinutes;

  function shiftDate(days: number) {
    const d = new Date(dateStr + "T00:00:00");
    d.setDate(d.getDate() + days);
    setDateStr(d.toISOString().split("T")[0]);
  }

  // Group missions by kind for the new visual hierarchy
  const reinforcement = plan.missions.filter((m) => m.taskKind === "reinforcement");
  const maintenance = plan.missions.filter((m) => m.taskKind === "maintenance");
  const research = plan.missions.filter((m) => m.taskKind === "research");
  const review = plan.missions.filter((m) => m.taskKind === "strategic-review");

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-5">
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
            <span>{plan.missions.length} tasks</span>
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
        <div className="flex gap-3 mt-3 text-xs">
          <LoadCount label="Heavy" value={plan.cognitiveLoad.heavy} tier="heavy" />
          <LoadCount label="Medium" value={plan.cognitiveLoad.medium} tier="medium" />
          <LoadCount label="Light" value={plan.cognitiveLoad.light} tier="light" />
        </div>
      </div>

      {/* Core Authority Asset — distinct banner */}
      {plan.coreAsset && (
        <CoreAssetBanner
          mission={plan.coreAsset}
          status={statusMap[plan.coreAsset.id] ?? "pending"}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Reinforcement Tasks */}
      {reinforcement.length > 0 && (
        <TaskGroup
          title="Reinforcement"
          subtitle="Light/medium tasks that compound the week's core asset"
          color={kindConfig.reinforcement.color}
          missions={reinforcement}
          statusMap={statusMap}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Maintenance Tasks */}
      {maintenance.length > 0 && (
        <TaskGroup
          title="Maintenance"
          subtitle="Internal site, entity, and corroboration upkeep"
          color={kindConfig.maintenance.color}
          missions={maintenance}
          statusMap={statusMap}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Research */}
      {research.length > 0 && (
        <TaskGroup
          title="Research"
          subtitle="Intake without execution pressure"
          color={kindConfig.research.color}
          missions={research}
          statusMap={statusMap}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Strategic Review */}
      {review.length > 0 && (
        <TaskGroup
          title="Strategic Review"
          subtitle="Close the week. Set next week's core asset."
          color={kindConfig["strategic-review"].color}
          missions={review}
          statusMap={statusMap}
          onStatusChange={handleStatusChange}
        />
      )}

      {plan.missions.length === 0 && (
        <p className="text-sm text-muted italic">
          Sustainable pause. No scheduled work today — authority compounds even on rest days.
        </p>
      )}
    </section>
  );
}

// ─── Core Authority Asset Banner ──────────────────────────────

function CoreAssetBanner({
  mission,
  status,
  onStatusChange,
}: {
  mission: PlannedMission;
  status: MissionStatus;
  onStatusChange: (id: string, status: MissionStatus, mission?: PlannedMission) => void;
}) {
  const s = statusConfig[status];

  function cycleStatus() {
    const idx = statusCycle.indexOf(status);
    const next = statusCycle[(idx + 1) % statusCycle.length];
    onStatusChange(mission.id, next, mission);
  }

  return (
    <div
      className="relative rounded-xl border-2 p-5 flex flex-col gap-3"
      style={{
        borderColor: kindConfig["core-authority"].color + "60",
        background: `linear-gradient(135deg, ${kindConfig["core-authority"].color}10 0%, transparent 60%)`,
        opacity: status === "completed" ? 0.7 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: kindConfig["core-authority"].color }}
          >
            ◆ Core Authority Asset · This week&apos;s anchor
          </p>
          <h3
            className={`text-lg font-bold leading-tight ${
              status === "completed" ? "line-through text-muted" : "text-foreground-bright"
            }`}
          >
            {mission.title}
          </h3>
          <p className="text-sm text-foreground/70 mt-2 leading-relaxed">{mission.objective}</p>
        </div>
        <span
          className="shrink-0 text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider"
          style={{
            color: loadTierConfig.heavy.color,
            backgroundColor: loadTierConfig.heavy.bg,
          }}
        >
          Heavy
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 text-xs">
        <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
          {mission.theme.name}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {mission.channel}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {mission.category}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {mission.contentAngle}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {mission.estimatedTime}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 text-xs">
        <ScorePill label="Strategic" value={mission.priority.strategicPriority} />
        <ScorePill label="Impact" value={mission.priority.authorityImpact} />
        <ScorePill label="Semantic" value={mission.priority.semanticValue} />
        <ScorePill label="Overall" value={mission.priority.overall} highlight />
      </div>

      <button
        onClick={cycleStatus}
        className="self-start text-xs font-medium px-3 py-1.5 rounded-full cursor-pointer transition-colors"
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

// ─── Task Group (reinforcement / maintenance / research) ──────

function TaskGroup({
  title,
  subtitle,
  color,
  missions,
  statusMap,
  onStatusChange,
}: {
  title: string;
  subtitle: string;
  color: string;
  missions: PlannedMission[];
  statusMap: Record<string, MissionStatus>;
  onStatusChange: (id: string, status: MissionStatus, mission?: PlannedMission) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-3">
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color }}
        >
          {title}
        </span>
        <span className="text-xs text-muted">{subtitle}</span>
        <span className="ml-auto text-xs text-muted">{missions.length}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {missions.map((m) => (
          <ReinforcementCard
            key={m.id}
            mission={m}
            status={statusMap[m.id] ?? "pending"}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
}

function ReinforcementCard({
  mission,
  status,
  onStatusChange,
}: {
  mission: PlannedMission;
  status: MissionStatus;
  onStatusChange: (id: string, status: MissionStatus, mission?: PlannedMission) => void;
}) {
  const s = statusConfig[status];
  const tier = loadTierConfig[mission.loadTier];

  function cycleStatus() {
    const idx = statusCycle.indexOf(status);
    const next = statusCycle[(idx + 1) % statusCycle.length];
    onStatusChange(mission.id, next, mission);
  }

  return (
    <div
      className={`rounded-lg border bg-card-bg/60 p-3.5 flex flex-col gap-2.5 transition-opacity ${
        status === "completed" ? "opacity-60" : ""
      }`}
      style={{ borderColor: s.border }}
    >
      <div className="flex items-start gap-2">
        <span
          className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
          style={{ color: tier.color, backgroundColor: tier.bg }}
          title="Cognitive load tier"
        >
          {tier.label}
        </span>
        <h3
          className={`text-sm font-semibold leading-snug flex-1 ${
            status === "completed" ? "line-through text-muted" : "text-foreground-bright"
          }`}
        >
          {mission.title}
        </h3>
      </div>

      {mission.executionPrompt && (
        <p className="text-xs text-muted leading-relaxed italic">
          {mission.executionPrompt}
        </p>
      )}

      <div className="flex flex-wrap gap-1 text-[11px]">
        <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
          {mission.theme.name}
        </span>
        <span className="px-1.5 py-0.5 rounded bg-background/80 text-muted border border-card-border">
          {mission.channel}
        </span>
        <span className="px-1.5 py-0.5 rounded bg-background/80 text-muted border border-card-border">
          {mission.estimatedTime}
        </span>
      </div>

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

// ─── Helpers ──────────────────────────────────────────────────

function LoadCount({ label, value, tier }: { label: string; value: number; tier: LoadTier }) {
  const config = loadTierConfig[tier];
  return (
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded"
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      {value} {label}
    </span>
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
