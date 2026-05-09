import {
  getWeeklySummary,
  generateRecommendations,
} from "@/lib/opportunityEngine";

const typeConfig: Record<string, { label: string; color: string }> = {
  article: { label: "Article", color: "#3b82f6" },
  linkedin: { label: "LinkedIn", color: "#22c55e" },
  research: { label: "Research", color: "#a855f7" },
  "case-study": { label: "Case Study", color: "#f59e0b" },
  "founder-authority": { label: "Founder", color: "#ec4899" },
};

export default function IntelligenceSummary() {
  const summary = getWeeklySummary();

  return (
    <section className="rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-5">
      <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
        Intelligence Summary
      </h2>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-2">
        <MiniStat label="Signals Tracked" value={String(summary.totalSignals)} />
        <MiniStat
          label="High Priority"
          value={String(summary.highPriorityCount)}
          highlight
        />
      </div>

      {/* What matters this week */}
      <SummaryBlock title="What Matters This Week">
        <div className="space-y-1.5">
          {summary.topThemes.map((t) => (
            <div
              key={t.name}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-foreground">{t.name}</span>
              <span className="text-muted">
                {t.count} signal{t.count > 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>
      </SummaryBlock>

      {/* Topics gaining momentum */}
      <SummaryBlock title="Topics Gaining Momentum">
        <ul className="space-y-1.5">
          {summary.gainingMomentum.map((t) => (
            <li key={t} className="text-xs text-foreground/80 flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-green-500 shrink-0 mt-1.5" />
              {t}
            </li>
          ))}
        </ul>
      </SummaryBlock>

      {/* Authority opportunities */}
      <SummaryBlock title="Authority Opportunities">
        <ul className="space-y-1.5">
          {summary.authorityOpportunities.map((t) => (
            <li key={t} className="text-xs text-foreground/80 flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-accent shrink-0 mt-1.5" />
              {t}
            </li>
          ))}
        </ul>
      </SummaryBlock>

      {/* Areas competitors are ignoring */}
      <SummaryBlock title="Areas Competitors Are Ignoring">
        <ul className="space-y-1.5">
          {summary.competitorGaps.map((t) => (
            <li key={t} className="text-xs text-foreground/80 flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-yellow-500 shrink-0 mt-1.5" />
              {t}
            </li>
          ))}
        </ul>
      </SummaryBlock>

      {/* Top recommendations */}
      <SummaryBlock title="Recommended Actions">
        <div className="space-y-2">
          {summary.topRecommendations.map((r, i) => {
            const cfg = typeConfig[r.type] ?? {
              label: r.type,
              color: "#94a3b8",
            };
            return (
              <div
                key={i}
                className="rounded-lg bg-background/40 border border-card-border/30 px-3 py-2"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-medium px-1.5 py-0.5 rounded-full border"
                    style={{
                      color: cfg.color,
                      borderColor: `${cfg.color}30`,
                      backgroundColor: `${cfg.color}10`,
                    }}
                  >
                    {cfg.label}
                  </span>
                  <span className="text-xs text-muted ml-auto">
                    impact {r.authorityImpact}/10
                  </span>
                </div>
                <p className="text-xs text-foreground/90 font-medium">
                  {r.title}
                </p>
                <p className="text-xs text-muted mt-0.5 leading-relaxed">
                  {r.rationale}
                </p>
              </div>
            );
          })}
        </div>
      </SummaryBlock>
    </section>
  );
}

function SummaryBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function MiniStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg px-3 py-2 text-center border ${
        highlight
          ? "bg-red-500/5 border-red-500/20"
          : "bg-background/50 border-card-border/60"
      }`}
    >
      <p
        className={`text-lg font-bold ${
          highlight ? "text-red-400" : "text-foreground-bright"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
