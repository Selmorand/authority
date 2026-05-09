"use client";

import { useState } from "react";
import type { Mission, MissionStatus } from "@/data/missions";

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

const priorityColors: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#3b82f6",
};

const statusCycle: MissionStatus[] = ["pending", "in-progress", "completed"];

export default function MissionCard({ mission }: { mission: Mission }) {
  const [status, setStatus] = useState<MissionStatus>(mission.status);
  const s = statusConfig[status];

  function cycleStatus() {
    const idx = statusCycle.indexOf(status);
    setStatus(statusCycle[(idx + 1) % statusCycle.length]);
  }

  return (
    <div
      className={`rounded-lg border bg-card-bg/60 p-4 flex flex-col gap-3 transition-opacity ${
        status === "completed" ? "opacity-60" : ""
      }`}
      style={{ borderColor: s.border }}
    >
      {/* Top row: title + priority */}
      <div className="flex items-start justify-between gap-3">
        <h3
          className={`text-sm font-semibold leading-snug ${
            status === "completed"
              ? "line-through text-muted"
              : "text-white"
          }`}
        >
          {mission.title}
        </h3>
        <span
          className="shrink-0 w-2 h-2 rounded-full mt-1.5"
          title={`${mission.priority} priority`}
          style={{ backgroundColor: priorityColors[mission.priority] }}
        />
      </div>

      {/* Topic */}
      <p className="text-xs text-muted">{mission.topic}</p>

      {/* Meta row */}
      <div className="flex flex-wrap gap-2 text-[11px]">
        <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
          {mission.category}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {mission.authorityFocus}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {mission.estimatedTime}
        </span>
      </div>

      {/* Objective */}
      <p className="text-xs text-foreground/70 leading-relaxed">
        {mission.objective}
      </p>

      {/* Status toggle */}
      <button
        onClick={cycleStatus}
        className="self-start text-[11px] font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors"
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
