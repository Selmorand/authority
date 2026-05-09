"use client";

import { useMemo } from "react";
import { generateVisibilityReport } from "@/lib/aiVisibilityMonitor";
import type {
  VisibilitySignal,
  EntityAnalysis,
  SemanticIssue,
  VisibilityRecommendation,
} from "@/lib/aiVisibilityMonitor";

const strengthColors: Record<string, string> = {
  strong: "#22c55e",
  moderate: "#38bdf8",
  weak: "#f59e0b",
  absent: "#ef4444",
};

const trendSymbols: Record<string, { s: string; c: string }> = {
  improving: { s: "^", c: "#22c55e" },
  stable: { s: "=", c: "#6b7280" },
  declining: { s: "v", c: "#ef4444" },
};

const entityStatusColors: Record<string, string> = {
  consistent: "#22c55e",
  partial: "#38bdf8",
  fragmented: "#f59e0b",
  absent: "#ef4444",
  weak: "#f59e0b",
};

const recTypeColors: Record<string, string> = {
  semantic: "#38bdf8",
  authority: "#22c55e",
  discoverability: "#a855f7",
  consistency: "#f59e0b",
  entity: "#ec4899",
};

export default function AIDiscoverabilityDashboard() {
  const report = useMemo(() => generateVisibilityReport(), []);

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            AI Discoverability Intelligence
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Semantic authority signals &middot; Entity confidence &middot; Discoverability analysis
          </p>
        </div>
        <div className="flex gap-3">
          <ScoreBox label="Discoverability" value={report.discoverabilityScore} />
          <ScoreBox label="Entity Confidence" value={report.entityConfidenceScore} />
          <ScoreBox label="Semantic Health" value={report.semanticConsistency.overallScore} />
        </div>
      </div>

      {/* Visibility signals */}
      <div>
        <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
          AI Visibility Signals
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {report.visibilitySignals.map((s) => {
            const color = strengthColors[s.strength];
            const trend = trendSymbols[s.trend];
            return (
              <div
                key={s.theme}
                className="rounded-lg border px-3 py-2.5"
                style={{ borderColor: `${color}20`, backgroundColor: `${color}04` }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-foreground font-medium truncate">
                    {s.theme}
                  </span>
                  <span className="text-[9px] font-bold" style={{ color: trend.c }}>
                    {trend.s}
                  </span>
                </div>
                <span
                  className="text-[10px] font-medium"
                  style={{ color }}
                >
                  {s.strength}
                </span>
                <p className="text-[9px] text-muted mt-1 line-clamp-2">
                  {s.evidence}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Entity reinforcement */}
      <div>
        <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
          Entity Confidence Indicators
        </h3>
        <div className="space-y-2">
          {report.entityAnalysis.map((e) => {
            const color = entityStatusColors[e.status];
            return (
              <div
                key={e.area}
                className="rounded-lg bg-background-raised border border-card-border-subtle px-3.5 py-2.5"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-foreground-bright font-medium">
                    {e.area}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border"
                      style={{ color, borderColor: `${color}25`, backgroundColor: `${color}08` }}
                    >
                      {e.status}
                    </span>
                    <span className="text-[10px] font-bold" style={{ color }}>
                      {e.score}/10
                    </span>
                  </div>
                </div>
                {e.gaps.length > 0 && (
                  <div className="space-y-0.5 mt-1.5">
                    {e.gaps.slice(0, 2).map((g, i) => (
                      <p key={i} className="text-[10px] text-yellow-400/80 flex items-start gap-1.5">
                        <span className="shrink-0">!</span> {g}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Semantic consistency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
            Semantic Issues
          </h3>
          {report.semanticConsistency.issues.length > 0 ? (
            <div className="space-y-1.5">
              {report.semanticConsistency.issues.map((issue, i) => {
                const sevColor = issue.severity === "high" ? "#ef4444" : issue.severity === "medium" ? "#f59e0b" : "#6b7280";
                return (
                  <div
                    key={i}
                    className="rounded-lg border px-3 py-2"
                    style={{ borderColor: `${sevColor}15`, backgroundColor: `${sevColor}04` }}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-medium uppercase" style={{ color: sevColor }}>
                        {issue.severity}
                      </span>
                      <span className="text-[10px] text-foreground font-medium">{issue.area}</span>
                    </div>
                    <p className="text-[10px] text-muted">{issue.correction}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted">No semantic issues detected</p>
          )}
        </div>
        <div>
          <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
            Semantic Strengths
          </h3>
          <div className="space-y-1.5">
            {report.semanticConsistency.strengths.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-[11px] text-foreground/80 bg-green-500/4 border border-green-500/10 rounded-lg px-3 py-2"
              >
                <span className="text-green-400 shrink-0">+</span>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
          Visibility Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {report.recommendations.slice(0, 6).map((r, i) => {
            const color = recTypeColors[r.type] ?? "#6b7280";
            return (
              <div
                key={i}
                className="rounded-lg bg-background-raised border border-card-border-subtle px-3.5 py-2.5"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{ color, backgroundColor: `${color}12` }}
                  >
                    {r.priority}
                  </span>
                  <span
                    className="text-[9px] font-medium px-1.5 py-0.5 rounded-full border"
                    style={{ color, borderColor: `${color}20`, backgroundColor: `${color}06` }}
                  >
                    {r.type}
                  </span>
                </div>
                <p className="text-xs text-foreground-bright font-medium">
                  {r.title}
                </p>
                <p className="text-[10px] text-muted mt-0.5 leading-relaxed">
                  {r.rationale}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ScoreBox({ label, value }: { label: string; value: number }) {
  const color = value >= 7 ? "#22c55e" : value >= 5 ? "#38bdf8" : "#f59e0b";
  return (
    <div className="text-center">
      <p className="text-lg font-bold" style={{ color }}>
        {value}/10
      </p>
      <p className="text-[9px] text-muted">{label}</p>
    </div>
  );
}
