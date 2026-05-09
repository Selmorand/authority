"use client";

import { useMemo, useState } from "react";
import { generateCopilotReport } from "@/lib/authorityCopilot";
import type {
  CopilotGuidance,
  MomentumAnalysis,
  FocusAdjustment,
  GuidanceType,
  GuidancePriority,
} from "@/lib/authorityCopilot";

const priorityColors: Record<GuidancePriority, string> = {
  critical: "#ef4444",
  high: "#f59e0b",
  medium: "#38bdf8",
  advisory: "#6b7280",
};

const typeConfig: Record<GuidanceType, { label: string; color: string; icon: string }> = {
  recommendation: { label: "Recommendation", color: "#38bdf8", icon: "->" },
  warning: { label: "Warning", color: "#f59e0b", icon: "!!" },
  opportunity: { label: "Opportunity", color: "#22c55e", icon: ">>" },
  reinforcement: { label: "Reinforcement", color: "#a855f7", icon: "++" },
  "focus-shift": { label: "Focus Shift", color: "#ec4899", icon: "<>" },
};

const momentumColors: Record<string, { color: string; label: string }> = {
  accelerating: { color: "#22c55e", label: "Accelerating" },
  steady: { color: "#38bdf8", label: "Steady" },
  decelerating: { color: "#f59e0b", label: "Decelerating" },
  stalled: { color: "#ef4444", label: "Stalled" },
};

const shiftColors: Record<string, string> = {
  increase: "#22c55e",
  maintain: "#38bdf8",
  decrease: "#f59e0b",
};

export default function CopilotDashboard() {
  const report = useMemo(() => generateCopilotReport(), []);
  const momentum = momentumColors[report.momentumAnalysis.direction];
  const [filter, setFilter] = useState<GuidanceType | "all">("all");

  const filtered = filter === "all"
    ? report.guidanceItems
    : report.guidanceItems.filter((g) => g.type === filter);

  const criticalCount = report.guidanceItems.filter((g) => g.priority === "critical").length;
  const highCount = report.guidanceItems.filter((g) => g.priority === "high").length;

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            Authority Co-Pilot
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {report.guidanceItems.length} guidance items &middot;{" "}
            {criticalCount > 0 ? `${criticalCount} critical` : `${highCount} high priority`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: momentum.color }}
          />
          <span className="text-xs font-medium" style={{ color: momentum.color }}>
            {momentum.label}
          </span>
        </div>
      </div>

      {/* Overall assessment */}
      <div className="rounded-lg bg-background-raised border border-card-border-subtle px-4 py-3">
        <p className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1">
          Assessment
        </p>
        <p className="text-xs text-foreground/90 font-mono">{report.overallAssessment}</p>
      </div>

      {/* Top priority */}
      <div className="rounded-lg bg-accent/5 border border-accent/15 px-4 py-3">
        <p className="text-[10px] font-medium text-accent uppercase tracking-wider mb-1">
          Top Priority
        </p>
        <p className="text-sm text-foreground-bright font-medium leading-relaxed">
          {report.topPriority}
        </p>
      </div>

      {/* Momentum + Outlook */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg bg-background-raised border border-card-border-subtle px-4 py-3">
          <p className="text-[10px] font-medium text-muted uppercase tracking-wider mb-2">
            Momentum Analysis
          </p>
          <div className="space-y-1.5 text-[11px]">
            <p className="text-foreground/80">{report.momentumAnalysis.executionTrend}</p>
            <p className="text-foreground/80">{report.momentumAnalysis.semanticTrend}</p>
            {report.momentumAnalysis.growingClusters.length > 0 && (
              <p className="text-green-400/80">
                Growing: {report.momentumAnalysis.growingClusters.join(", ")}
              </p>
            )}
            {report.momentumAnalysis.weakeningAreas.length > 0 && (
              <p className="text-yellow-400/80">
                Weakening: {report.momentumAnalysis.weakeningAreas.join(", ")}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-background-raised border border-card-border-subtle px-4 py-3">
          <p className="text-[10px] font-medium text-muted uppercase tracking-wider mb-2">
            Strategic Outlook
          </p>
          <p className="text-[11px] text-foreground/80 leading-relaxed">
            {report.strategicOutlook}
          </p>
        </div>
      </div>

      {/* Guidance filters */}
      <div className="flex flex-wrap gap-1.5">
        <FilterBtn label="All" active={filter === "all"} onClick={() => setFilter("all")} />
        {Object.entries(typeConfig).map(([key, cfg]) => {
          const count = report.guidanceItems.filter((g) => g.type === key).length;
          if (count === 0) return null;
          return (
            <FilterBtn
              key={key}
              label={`${cfg.label} (${count})`}
              active={filter === key}
              onClick={() => setFilter(key as GuidanceType)}
            />
          );
        })}
      </div>

      {/* Guidance items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((g) => (
          <GuidanceCard key={g.id} guidance={g} />
        ))}
      </div>

      {/* Focus adjustments */}
      <div>
        <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
          Focus Adjustments
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {report.focusAdjustments
            .filter((f) => f.suggestedShift !== "maintain")
            .map((f) => (
              <FocusCard key={f.theme} adjustment={f} />
            ))}
          {report.focusAdjustments.filter((f) => f.suggestedShift !== "maintain").length === 0 && (
            <p className="col-span-4 text-xs text-muted py-2">
              All themes are balanced — no adjustments needed
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-[11px] px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
        active ? "bg-accent/15 text-accent border-accent/30" : "bg-background/50 text-muted border-card-border hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function GuidanceCard({ guidance }: { guidance: CopilotGuidance }) {
  const tc = typeConfig[guidance.type];
  const pc = priorityColors[guidance.priority];

  return (
    <div
      className="rounded-lg border bg-background-raised px-4 py-3 flex flex-col gap-2"
      style={{ borderColor: `${pc}18` }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[9px] font-mono font-bold" style={{ color: tc.color }}>
          {tc.icon}
        </span>
        <span
          className="text-[9px] font-medium uppercase tracking-wider"
          style={{ color: pc }}
        >
          {guidance.priority}
        </span>
        <span
          className="text-[9px] px-1.5 py-0.5 rounded-full border"
          style={{ color: tc.color, borderColor: `${tc.color}20`, backgroundColor: `${tc.color}06` }}
        >
          {tc.label}
        </span>
        <span className="text-[9px] text-muted ml-auto">
          conf. {guidance.confidence}/10
        </span>
      </div>
      <p className="text-xs text-foreground-bright font-medium leading-snug">
        {guidance.title}
      </p>
      <p className="text-[11px] text-muted leading-relaxed">{guidance.rationale}</p>
      <div className="flex items-start gap-1.5 text-[11px] text-foreground/70 bg-background/40 rounded px-2.5 py-1.5">
        <span className="text-accent shrink-0">-&gt;</span>
        <span>{guidance.suggestedAction}</span>
      </div>
    </div>
  );
}

function FocusCard({ adjustment }: { adjustment: FocusAdjustment }) {
  const color = shiftColors[adjustment.suggestedShift];
  const arrow = adjustment.suggestedShift === "increase" ? "^" : adjustment.suggestedShift === "decrease" ? "v" : "=";

  return (
    <div className="rounded-lg bg-background-raised border border-card-border-subtle px-3 py-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-foreground font-medium truncate">
          {adjustment.theme}
        </span>
        <span className="text-[10px] font-bold" style={{ color }}>
          {arrow}
        </span>
      </div>
      <p className="text-[9px] text-muted leading-relaxed">{adjustment.reason}</p>
    </div>
  );
}
