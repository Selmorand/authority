"use client";

import { useState, useEffect } from "react";
import { generateExecutiveBriefingFromMemory } from "@/lib/generateExecutiveBriefing";
import type { ExecutiveBriefing, StrategicOpportunity, WeeklyRecommendation } from "@/lib/generateExecutiveBriefing";

const leverageColors: Record<string, string> = {
  high: "#22c55e",
  medium: "#38bdf8",
  low: "#6b7280",
};

const timeframeLabels: Record<string, { color: string }> = {
  immediate: { color: "#ef4444" },
  "this-week": { color: "#f59e0b" },
  "this-month": { color: "#6b7280" },
};

const recTypeColors: Record<string, string> = {
  focus: "#38bdf8",
  execution: "#22c55e",
  content: "#a855f7",
  semantic: "#f59e0b",
  expansion: "#ec4899",
};

export default function OpportunityIntelligence() {
  const [briefing, setBriefing] = useState<ExecutiveBriefing>(() => generateExecutiveBriefingFromMemory([]));

  useEffect(() => {
    fetch("/api/briefing/live")
      .then((r) => r.json())
      .then((data) => { if (data.success) setBriefing(data.briefing); })
      .catch(() => {});
  }, []);

  return (
    <section className="rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-5">
      <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
        Opportunity Intelligence
      </h2>

      {/* Opportunities */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          High-Value Opportunities
        </h3>
        <div className="space-y-2">
          {briefing.opportunities.slice(0, 5).map((opp, i) => (
            <OppCard key={i} opp={opp} />
          ))}
        </div>
      </div>

      {/* Weekly recommendations */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          Weekly Recommendations
        </h3>
        <div className="space-y-1.5">
          {briefing.weeklyRecommendations.map((rec, i) => (
            <RecCard key={i} rec={rec} />
          ))}
        </div>
      </div>
    </section>
  );
}

function OppCard({ opp }: { opp: StrategicOpportunity }) {
  const levColor = leverageColors[opp.leverage];
  const tfColor = timeframeLabels[opp.timeframe]?.color ?? "#6b7280";

  return (
    <div className="rounded-lg bg-background-raised border border-card-border-subtle px-3.5 py-3 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-foreground-bright font-medium leading-snug flex-1">
          {opp.opportunity}
        </p>
        <div className="flex gap-1 shrink-0">
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded-full border"
            style={{
              color: levColor,
              borderColor: `${levColor}25`,
              backgroundColor: `${levColor}08`,
            }}
          >
            {opp.leverage}
          </span>
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded-full border"
            style={{
              color: tfColor,
              borderColor: `${tfColor}25`,
              backgroundColor: `${tfColor}08`,
            }}
          >
            {opp.timeframe}
          </span>
        </div>
      </div>
      <p className="text-xs text-muted leading-relaxed">{opp.rationale}</p>
      <div className="flex items-start gap-2 text-xs text-foreground/70">
        <span className="text-accent shrink-0">-&gt;</span>
        <span>{opp.suggestedAction}</span>
      </div>
    </div>
  );
}

function RecCard({ rec }: { rec: WeeklyRecommendation }) {
  const color = recTypeColors[rec.type] ?? "#6b7280";

  return (
    <div className="flex items-start gap-3 bg-background-raised border border-card-border-subtle rounded-lg px-3 py-2.5">
      <span
        className="shrink-0 text-xs font-bold px-1.5 py-0.5 rounded mt-0.5"
        style={{ color, backgroundColor: `${color}12` }}
      >
        {rec.priority}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-foreground/90 leading-relaxed">
          {rec.recommendation}
        </p>
        <div className="flex gap-2 mt-1 text-xs text-muted">
          <span>{rec.area}</span>
          <span
            className="px-1.5 py-0.5 rounded-full border"
            style={{
              color,
              borderColor: `${color}20`,
              backgroundColor: `${color}06`,
            }}
          >
            {rec.type}
          </span>
        </div>
      </div>
    </div>
  );
}
