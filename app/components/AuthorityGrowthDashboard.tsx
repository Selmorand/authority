"use client";

import { useMemo } from "react";
import { generateHealthReport, getGrowthTimeline } from "@/lib/authorityHealth";
import { externalCorroborations } from "@/data/authorityMetrics";
import type { MomentumMetric, HealthIndicator } from "@/lib/authorityHealth";

const statusColors: Record<string, string> = {
  strong: "#22c55e",
  moderate: "#38bdf8",
  weak: "#f59e0b",
  warning: "#ef4444",
};

const trendSymbols: Record<string, { symbol: string; color: string }> = {
  up: { symbol: "^", color: "#22c55e" },
  stable: { symbol: "=", color: "#6b7280" },
  down: { symbol: "v", color: "#ef4444" },
};

export default function AuthorityGrowthDashboard() {
  const report = useMemo(() => generateHealthReport(), []);
  const timeline = useMemo(() => getGrowthTimeline(), []);

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            Authority Growth
          </h2>
          <p className="text-xs text-muted mt-0.5">
            8-week authority trajectory &middot; AI visibility{" "}
            {report.aiVisibilityRate}%
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground-bright">
              {report.overallScore}/10
            </p>
            <p className="text-[10px] text-muted">Overall Health</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">
              {report.aiVisibilityRate}%
            </p>
            <p className="text-[10px] text-muted">AI Visibility</p>
          </div>
        </div>
      </div>

      {/* Health indicators grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {report.healthIndicators.map((h) => (
          <HealthCard key={h.area} indicator={h} />
        ))}
      </div>

      {/* Growth timeline (text-based sparkline) */}
      <div>
        <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3">
          8-Week Growth Timeline
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(timeline.metrics).map(([name, values]) => (
            <TimelineRow key={name} name={name} values={values} dates={timeline.dates} />
          ))}
        </div>
      </div>

      {/* Momentum */}
      <div>
        <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
          Authority Momentum
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {report.momentum.map((m) => (
            <MomentumCard key={m.metric} metric={m} />
          ))}
        </div>
      </div>

      {/* External corroboration */}
      <div>
        <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
          External Corroboration ({externalCorroborations.length} signals)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {externalCorroborations
            .sort((a, b) => b.authorityImpact - a.authorityImpact)
            .slice(0, 6)
            .map((c) => {
              const typeColors: Record<string, string> = {
                citation: "#22c55e",
                mention: "#38bdf8",
                "guest-article": "#a855f7",
                podcast: "#f59e0b",
                backlink: "#22c55e",
                directory: "#6b7280",
                partnership: "#ec4899",
              };
              const color = typeColors[c.type] ?? "#6b7280";
              return (
                <div
                  key={c.id}
                  className="flex items-start gap-3 bg-background-raised border border-card-border-subtle rounded-lg px-3 py-2.5"
                >
                  <span
                    className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5"
                    style={{ color, backgroundColor: `${color}12` }}
                  >
                    {c.authorityImpact}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-foreground/90 leading-snug">
                      {c.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted">
                      <span>{c.source}</span>
                      <span
                        className="px-1.5 py-0.5 rounded-full border"
                        style={{
                          color,
                          borderColor: `${color}25`,
                          backgroundColor: `${color}08`,
                        }}
                      >
                        {c.type}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}

function HealthCard({ indicator }: { indicator: HealthIndicator }) {
  const color = statusColors[indicator.status];
  const trend = trendSymbols[indicator.trend];

  return (
    <div
      className="rounded-lg border px-3 py-2.5"
      style={{
        borderColor: `${color}20`,
        backgroundColor: `${color}05`,
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-muted">{indicator.area}</span>
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold" style={{ color }}>
            {indicator.score}
          </span>
          <span
            className="text-[10px] font-bold"
            style={{ color: trend.color }}
          >
            {trend.symbol}
          </span>
        </div>
      </div>
      <p className="text-[10px] text-muted/80 leading-relaxed">
        {indicator.description}
      </p>
    </div>
  );
}

function MomentumCard({ metric }: { metric: MomentumMetric }) {
  const trend = trendSymbols[metric.direction];
  return (
    <div className="bg-background-raised border border-card-border-subtle rounded-lg px-3 py-2 text-center">
      <p className="text-lg font-bold text-foreground-bright">
        {metric.current.toLocaleString()}
      </p>
      <p className="text-[10px] text-muted">{metric.metric}</p>
      <p className="text-[10px] font-medium mt-0.5" style={{ color: trend.color }}>
        {metric.change >= 0 ? "+" : ""}
        {metric.change} ({metric.changePercent}%)
      </p>
    </div>
  );
}

function TimelineRow({
  name,
  values,
  dates,
}: {
  name: string;
  values: number[];
  dates: string[];
}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return (
    <div className="bg-background-raised border border-card-border-subtle rounded-lg px-3 py-2.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-foreground font-medium">{name}</span>
        <span className="text-xs text-foreground-bright font-bold">
          {values[values.length - 1]}
        </span>
      </div>
      <div className="flex items-end gap-1 h-6">
        {values.map((v, i) => {
          const height = Math.max(4, ((v - min) / range) * 24);
          const isLast = i === values.length - 1;
          return (
            <div
              key={i}
              className="flex-1 rounded-sm transition-all"
              style={{
                height: `${height}px`,
                backgroundColor: isLast ? "#38bdf8" : "#282d35",
              }}
              title={`${new Date(dates[i]).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}: ${v}`}
            />
          );
        })}
      </div>
    </div>
  );
}
