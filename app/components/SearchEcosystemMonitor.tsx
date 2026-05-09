"use client";

import { ecosystemDevelopments, geoTerminology } from "@/data/searchEcosystem";

const impactColors: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#6b7280",
};

const areaLabels: Record<string, { label: string; color: string }> = {
  "google-ai": { label: "Google AI", color: "#38bdf8" },
  openai: { label: "OpenAI", color: "#22c55e" },
  anthropic: { label: "Anthropic", color: "#a855f7" },
  "bing-ai": { label: "Bing AI", color: "#38bdf8" },
  "geo-adoption": { label: "GEO Adoption", color: "#f59e0b" },
  "semantic-search": { label: "Semantic Search", color: "#ec4899" },
  "entity-seo": { label: "Entity SEO", color: "#22c55e" },
  "structured-data": { label: "Structured Data", color: "#38bdf8" },
};

const freqColors: Record<string, { color: string; label: string }> = {
  rising: { color: "#22c55e", label: "Rising" },
  stable: { color: "#38bdf8", label: "Stable" },
  emerging: { color: "#f59e0b", label: "Emerging" },
  declining: { color: "#6b7280", label: "Declining" },
};

export default function SearchEcosystemMonitor() {
  const highImpact = ecosystemDevelopments.filter((d) => d.impact === "high");

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            Search Ecosystem Monitor
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {ecosystemDevelopments.length} developments tracked &middot;{" "}
            {highImpact.length} high impact
          </p>
        </div>
      </div>

      {/* GEO terminology evolution */}
      <div>
        <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
          GEO Terminology Evolution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {geoTerminology.map((t) => {
            const freq = freqColors[t.frequency];
            return (
              <div
                key={t.term}
                className="rounded-lg bg-background-raised border border-card-border-subtle px-3 py-2"
              >
                <p className="text-[11px] text-foreground-bright font-medium leading-snug">
                  {t.term}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: freq.color }}
                  />
                  <span
                    className="text-[9px] font-medium"
                    style={{ color: freq.color }}
                  >
                    {freq.label}
                  </span>
                </div>
                <p className="text-[9px] text-muted mt-1">
                  {t.platforms.slice(0, 2).join(", ")}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ecosystem developments */}
      <div>
        <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
          Ecosystem Developments
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ecosystemDevelopments.map((d) => {
            const area = areaLabels[d.area] ?? { label: d.area, color: "#6b7280" };
            const impact = impactColors[d.impact];
            return (
              <div
                key={d.id}
                className="rounded-lg bg-background-raised border border-card-border-subtle px-4 py-3 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[9px] font-medium px-1.5 py-0.5 rounded-full border"
                    style={{
                      color: area.color,
                      borderColor: `${area.color}25`,
                      backgroundColor: `${area.color}08`,
                    }}
                  >
                    {area.label}
                  </span>
                  <span
                    className="text-[9px] font-medium px-1.5 py-0.5 rounded-full border"
                    style={{
                      color: impact,
                      borderColor: `${impact}25`,
                      backgroundColor: `${impact}08`,
                    }}
                  >
                    {d.impact} impact
                  </span>
                  <span className="text-[9px] text-muted ml-auto">
                    {new Date(d.dateObserved).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <p className="text-xs text-foreground-bright font-medium leading-snug">
                  {d.title}
                </p>
                <p className="text-[11px] text-muted leading-relaxed">
                  {d.summary}
                </p>
                <div className="rounded bg-accent/5 border border-accent/10 px-2.5 py-1.5">
                  <p className="text-[10px] text-accent/80 leading-relaxed">
                    <span className="font-medium text-accent">Interon:</span>{" "}
                    {d.interonImplication}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
