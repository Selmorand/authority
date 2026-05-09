"use client";

import { useState } from "react";
import { getScoredSignals } from "@/lib/opportunityEngine";
import type { ScoredSignal } from "@/lib/opportunityEngine";
import { themes } from "@/data/themes";

const alertLabels: Record<string, { label: string; color: string }> = {
  "high-priority-opportunity": { label: "Opportunity", color: "#22c55e" },
  "authority-gap-warning": { label: "Authority Gap", color: "#f59e0b" },
  "emerging-trend": { label: "Emerging", color: "#3b82f6" },
  "competitor-movement": { label: "Competitor", color: "#ef4444" },
  "topic-saturation-risk": { label: "Saturation Risk", color: "#94a3b8" },
};

const urgencyColors: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#94a3b8",
};

export default function ResearchIntelligence() {
  const [filter, setFilter] = useState<string>("all");
  const scored = getScoredSignals();

  const filtered =
    filter === "all"
      ? scored
      : scored.filter((s) => s.signal.alertType === filter);

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white tracking-wide uppercase">
            Research Intelligence
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {scored.length} signals tracked &middot;{" "}
            {scored.filter((s) => s.signal.urgency === "high").length} high
            priority
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        <FilterBtn label="All" active={filter === "all"} onClick={() => setFilter("all")} />
        {Object.entries(alertLabels).map(([key, { label }]) => (
          <FilterBtn
            key={key}
            label={label}
            active={filter === key}
            onClick={() => setFilter(key)}
          />
        ))}
      </div>

      {/* Signals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
        {filtered.map((s) => (
          <SignalCard key={s.signal.id} scored={s} />
        ))}
      </div>
    </section>
  );
}

function FilterBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[11px] px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
        active
          ? "bg-accent/15 text-accent border-accent/30"
          : "bg-background/50 text-muted border-card-border hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function SignalCard({ scored }: { scored: ScoredSignal }) {
  const [expanded, setExpanded] = useState(false);
  const { signal, score } = scored;
  const alert = alertLabels[signal.alertType];
  const relatedThemeNames = signal.relatedThemes
    .map((id) => themes.find((t) => t.id === id)?.name)
    .filter(Boolean);

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="text-left rounded-lg border border-card-border/60 bg-background/40 p-4 flex flex-col gap-2.5 cursor-pointer transition-colors hover:border-card-border"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-white leading-snug flex-1">
          {signal.title}
        </h3>
        <span
          className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded"
          style={{
            color: alert.color,
            backgroundColor: `${alert.color}15`,
          }}
        >
          {score.overall}/10
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 text-[10px]">
        <span
          className="px-2 py-0.5 rounded-full border"
          style={{
            color: alert.color,
            borderColor: `${alert.color}30`,
            backgroundColor: `${alert.color}10`,
          }}
        >
          {alert.label}
        </span>
        <span
          className="px-2 py-0.5 rounded-full border"
          style={{
            color: urgencyColors[signal.urgency],
            borderColor: `${urgencyColors[signal.urgency]}30`,
            backgroundColor: `${urgencyColors[signal.urgency]}10`,
          }}
        >
          {signal.urgency} urgency
        </span>
        {relatedThemeNames.slice(0, 2).map((name) => (
          <span
            key={name}
            className="px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20"
          >
            {name}
          </span>
        ))}
      </div>

      {/* Summary */}
      <p
        className={`text-xs text-muted leading-relaxed ${
          expanded ? "" : "line-clamp-2"
        }`}
      >
        {signal.insightSummary}
      </p>

      {/* Expanded: scores + actions */}
      {expanded && (
        <div className="space-y-3 mt-1">
          <div className="grid grid-cols-5 gap-1.5 text-[10px]">
            <ScorePill label="Authority" value={score.authorityPotential} />
            <ScorePill label="Semantic" value={score.semanticRelevance} />
            <ScorePill label="Timing" value={score.marketTiming} />
            <ScorePill label="Technical" value={score.technicalAlignment} />
            <ScorePill label="Competitive" value={score.competitiveOpportunity} />
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1.5">
              Suggested Actions
            </p>
            <ul className="space-y-1">
              {signal.suggestedActions.map((action, i) => (
                <li
                  key={i}
                  className="text-xs text-foreground/70 flex items-start gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-accent shrink-0 mt-1.5" />
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </button>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  const color = value >= 7 ? "#22c55e" : value >= 5 ? "#f59e0b" : "#94a3b8";
  return (
    <div className="text-center rounded px-1 py-1 bg-background/40 border border-card-border/30">
      <p className="font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-muted">{label}</p>
    </div>
  );
}
