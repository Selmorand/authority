"use client";

import { useMemo } from "react";
import { generateHealthReport } from "@/lib/authorityHealth";
import { aiVisibilityChecks } from "@/data/authorityMetrics";
import type { ThemeVisibility } from "@/lib/authorityHealth";

const strengthColors: Record<string, { color: string; label: string }> = {
  dominant: { color: "#22c55e", label: "Dominant" },
  growing: { color: "#38bdf8", label: "Growing" },
  emerging: { color: "#f59e0b", label: "Emerging" },
  invisible: { color: "#ef4444", label: "Invisible" },
};

export default function EntityVisibilityTracker() {
  const report = useMemo(() => generateHealthReport(), []);

  const citedCount = aiVisibilityChecks.filter((c) => c.cited).length;
  const totalChecks = aiVisibilityChecks.length;
  const platformCounts: Record<string, { cited: number; total: number }> = {};

  for (const check of aiVisibilityChecks) {
    if (!platformCounts[check.platform]) {
      platformCounts[check.platform] = { cited: 0, total: 0 };
    }
    platformCounts[check.platform].total++;
    if (check.cited) platformCounts[check.platform].cited++;
  }

  return (
    <section className="rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-5">
      <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
        Entity & AI Visibility
      </h2>

      {/* Key stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-background-raised border border-card-border-subtle rounded-lg px-3 py-2.5 text-center">
          <p className="text-xl font-bold text-accent">{report.aiVisibilityRate}%</p>
          <p className="text-xs text-muted">AI Citation Rate</p>
        </div>
        <div className="bg-background-raised border border-card-border-subtle rounded-lg px-3 py-2.5 text-center">
          <p className="text-xl font-bold text-foreground-bright">
            {citedCount}/{totalChecks}
          </p>
          <p className="text-xs text-muted">Queries Cited</p>
        </div>
        <div className="bg-background-raised border border-card-border-subtle rounded-lg px-3 py-2.5 text-center">
          <p className="text-xl font-bold text-foreground-bright">
            {report.corroborationScore}/10
          </p>
          <p className="text-xs text-muted">Corroboration</p>
        </div>
      </div>

      {/* Platform visibility */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          Platform Visibility
        </h3>
        <div className="space-y-2">
          {Object.entries(platformCounts).map(([platform, counts]) => {
            const rate = Math.round((counts.cited / counts.total) * 100);
            return (
              <div key={platform} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-foreground">{platform}</span>
                  <span className="text-muted">
                    {counts.cited}/{counts.total} ({rate}%)
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-background overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent-glow to-accent transition-all"
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Theme visibility */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          Theme AI Visibility
        </h3>
        <div className="space-y-1.5">
          {report.themeVisibility.map((tv) => (
            <ThemeVisibilityRow key={tv.theme} visibility={tv} />
          ))}
        </div>
      </div>

      {/* Recent AI visibility checks */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          AI Citation Checks
        </h3>
        <div className="space-y-1.5">
          {aiVisibilityChecks.map((check) => (
            <div
              key={check.id}
              className={`flex items-center justify-between bg-background-raised border rounded-lg px-3 py-2 text-xs ${
                check.cited
                  ? "border-green-500/15"
                  : "border-card-border-subtle"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    check.cited ? "bg-green-500" : "bg-red-500/50"
                  }`}
                />
                <span className="text-foreground/80 truncate">
                  &ldquo;{check.query}&rdquo;
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-xs text-muted">{check.platform}</span>
                {check.cited && check.position && (
                  <span className="text-xs font-medium text-green-400">
                    #{check.position}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ThemeVisibilityRow({ visibility }: { visibility: ThemeVisibility }) {
  const cfg = strengthColors[visibility.strength];

  return (
    <div className="flex items-center justify-between bg-background-raised border border-card-border-subtle rounded-lg px-3 py-2">
      <div className="flex items-center gap-2">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: cfg.color }}
        />
        <span className="text-xs text-foreground">{visibility.theme}</span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        {visibility.avgPosition && (
          <span className="text-muted">avg #{visibility.avgPosition}</span>
        )}
        <span className="text-muted">{visibility.citationRate}%</span>
        <span
          className="font-medium px-1.5 py-0.5 rounded-full border"
          style={{
            color: cfg.color,
            borderColor: `${cfg.color}25`,
            backgroundColor: `${cfg.color}08`,
          }}
        >
          {cfg.label}
        </span>
      </div>
    </div>
  );
}
