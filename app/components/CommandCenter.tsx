"use client";

import { useState, useEffect } from "react";
import type { ExecutiveBriefing } from "@/lib/generateExecutiveBriefing";
import { generateExecutiveBriefing } from "@/lib/generateExecutiveBriefing";

const momentumColors: Record<string, { color: string; label: string }> = {
  accelerating: { color: "#22c55e", label: "Accelerating" },
  steady: { color: "#38bdf8", label: "Steady" },
  decelerating: { color: "#f59e0b", label: "Decelerating" },
};

export default function CommandCenter() {
  // Start with client-side seed data, then upgrade to live DB data
  const [briefing, setBriefing] = useState<ExecutiveBriefing>(() => generateExecutiveBriefing());

  useEffect(() => {
    fetch("/api/briefing/live")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setBriefing(data.briefing);
      })
      .catch(() => {});
  }, []);

  const momentum = momentumColors[briefing.momentumDirection];

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            Strategic Command Center
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Executive authority intelligence overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: momentum.color }}
          />
          <span
            className="text-xs font-medium"
            style={{ color: momentum.color }}
          >
            Momentum: {momentum.label}
          </span>
        </div>
      </div>

      {/* Top-line scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ScoreCard
          label="Authority Health"
          value={`${briefing.authorityHealthScore}/10`}
          color={briefing.authorityHealthScore >= 7 ? "#22c55e" : briefing.authorityHealthScore >= 5 ? "#38bdf8" : "#f59e0b"}
        />
        <ScoreCard
          label="Execution Consistency"
          value={`${briefing.executionConsistencyScore}/10`}
          color={briefing.executionConsistencyScore >= 7 ? "#22c55e" : "#38bdf8"}
        />
        <ScoreCard
          label="AI Visibility"
          value={`${briefing.aiVisibilityRate}%`}
          color={briefing.aiVisibilityRate >= 60 ? "#22c55e" : briefing.aiVisibilityRate >= 40 ? "#38bdf8" : "#f59e0b"}
        />
        <ScoreCard
          label="Semantic Coverage"
          value={`${briefing.semanticCoverage}/8`}
          color={briefing.semanticCoverage >= 7 ? "#22c55e" : briefing.semanticCoverage >= 5 ? "#38bdf8" : "#f59e0b"}
        />
      </div>

      {/* What matters most */}
      <div className="rounded-lg bg-accent/5 border border-accent/15 px-4 py-3.5">
        <p className="text-xs font-medium text-accent uppercase tracking-wider mb-1.5">
          What Matters Most This Week
        </p>
        <p className="text-sm text-foreground-bright leading-relaxed">
          {briefing.whatMattersmost}
        </p>
      </div>

      {/* Two-column key intel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Highest leverage */}
        <div className="rounded-lg bg-green-500/4 border border-green-500/12 px-4 py-3">
          <p className="text-xs font-medium text-green-400 uppercase tracking-wider mb-1">
            Highest-Leverage Opportunity
          </p>
          <p className="text-xs text-foreground/90 leading-relaxed">
            {briefing.highestLeverageOpportunity}
          </p>
        </div>

        {/* Biggest risk */}
        <div className="rounded-lg bg-red-500/4 border border-red-500/12 px-4 py-3">
          <p className="text-xs font-medium text-red-400 uppercase tracking-wider mb-1">
            Biggest Strategic Risk
          </p>
          <p className="text-xs text-foreground/90 leading-relaxed">
            {briefing.biggestStrategicRisk}
          </p>
        </div>
      </div>

      {/* Themes status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Themes Strengthening
          </h3>
          <div className="space-y-1">
            {briefing.themesStrengthening.length > 0 ? (
              briefing.themesStrengthening.map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-2 text-xs text-foreground bg-green-500/4 border border-green-500/10 rounded-lg px-3 py-1.5"
                >
                  <span className="text-green-400 font-bold text-xs">^</span>
                  {t}
                </div>
              ))
            ) : (
              <p className="text-xs text-muted">All themes stable</p>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Areas Losing Momentum
          </h3>
          <div className="space-y-1">
            {briefing.areasLosingMomentum.length > 0 ? (
              briefing.areasLosingMomentum.map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-2 text-xs text-foreground bg-yellow-500/4 border border-yellow-500/10 rounded-lg px-3 py-1.5"
                >
                  <span className="text-yellow-400 font-bold text-xs">v</span>
                  {t}
                </div>
              ))
            ) : (
              <p className="text-xs text-muted">No themes losing momentum</p>
            )}
          </div>
        </div>
      </div>

      {/* Recommended focus */}
      <div className="rounded-lg bg-background-raised border border-card-border-subtle px-4 py-3">
        <p className="text-xs font-medium text-accent uppercase tracking-wider mb-1">
          Recommended Strategic Focus
        </p>
        <p className="text-xs text-foreground/90 leading-relaxed">
          {briefing.recommendedFocus}
        </p>
      </div>

      {/* Narrative positions */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          Category Ownership
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {briefing.narrativePositions.map((n) => {
            const strengthColors: Record<string, string> = {
              dominant: "#22c55e",
              strong: "#38bdf8",
              developing: "#f59e0b",
              weak: "#6b7280",
              absent: "#ef4444",
            };
            const color = strengthColors[n.strength];
            return (
              <div
                key={n.theme}
                className="rounded-lg bg-background-raised border border-card-border-subtle px-3 py-2"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground font-medium truncate">
                    {n.theme}
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{ color }}
                  >
                    {n.categoryOwnership}%
                  </span>
                </div>
                <div className="h-1 rounded-full bg-background overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${n.categoryOwnership}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span
                    className="text-xs"
                    style={{ color }}
                  >
                    {n.strength}
                  </span>
                  <span className="text-xs text-muted">
                    {n.trend === "growing" ? "^" : n.trend === "declining" ? "v" : "="}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ScoreCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg bg-background-raised border border-card-border-subtle px-3 py-3 text-center">
      <p className="text-xl font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-xs text-muted mt-0.5">{label}</p>
    </div>
  );
}
