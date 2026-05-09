"use client";

import { analyzeMemory } from "@/lib/analyzeStrategicMemory";

const trendIcons: Record<string, { symbol: string; color: string }> = {
  growing: { symbol: "^", color: "#22c55e" },
  stable: { symbol: "=", color: "#f59e0b" },
  declining: { symbol: "v", color: "#ef4444" },
  up: { symbol: "^", color: "#22c55e" },
};

export default function AuthorityLearning() {
  const analysis = analyzeMemory();

  return (
    <section className="rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-5">
      <h2 className="text-base font-semibold text-white tracking-wide uppercase">
        Authority Learning
      </h2>

      {/* Growth indicators */}
      <div className="grid grid-cols-2 gap-2">
        {analysis.growthIndicators.map((g) => {
          const t = trendIcons[g.trend] ?? trendIcons.stable;
          return (
            <div
              key={g.label}
              className="bg-background/50 border border-card-border/60 rounded-lg px-3 py-2.5 text-center"
            >
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-lg font-bold text-white">{g.value}</span>
                <span
                  className="text-xs font-bold"
                  style={{ color: t.color }}
                >
                  {t.symbol}
                </span>
              </div>
              <p className="text-[10px] text-muted mt-0.5">{g.label}</p>
            </div>
          );
        })}
      </div>

      {/* High-impact themes */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          High-Impact Themes
        </h3>
        <div className="space-y-1.5">
          {analysis.themePerformance.slice(0, 5).map((tp) => {
            const trend = trendIcons[tp.trend] ?? trendIcons.stable;
            return (
              <div
                key={tp.themeId}
                className="flex items-center justify-between bg-background/40 border border-card-border/40 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: trend.color }}
                  >
                    {trend.symbol}
                  </span>
                  <span className="text-xs text-foreground">
                    {tp.themeName}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted">
                  <span>{tp.totalEntries} entries</span>
                  <span>impact {tp.avgAuthorityImpact}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* High-impact categories */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          Best-Performing Categories
        </h3>
        <div className="space-y-1.5">
          {analysis.highImpactCategories.map((c) => (
            <div
              key={c.category}
              className="flex items-center justify-between text-xs bg-background/40 border border-card-border/40 rounded-lg px-3 py-2"
            >
              <span className="text-foreground">{c.category}</span>
              <span className="text-muted">avg impact {c.avgImpact}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Semantic strengths */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          Semantic Strengths
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {analysis.semanticStrengths.map((s) => (
            <span
              key={s}
              className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Content patterns */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          Repeating Patterns
        </h3>
        <div className="space-y-2">
          {analysis.contentPatterns.slice(0, 3).map((p, i) => (
            <div
              key={i}
              className="rounded-lg bg-background/40 border border-card-border/40 px-3 py-2.5"
            >
              <p className="text-xs text-foreground font-medium">
                {p.pattern}
              </p>
              <p className="text-[11px] text-muted mt-1 leading-relaxed">
                {p.recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
