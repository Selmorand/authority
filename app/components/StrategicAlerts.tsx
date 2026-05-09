import { getScoredSignals } from "@/lib/opportunityEngine";

const alertConfig: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  "high-priority-opportunity": {
    label: "High Priority Opportunity",
    color: "#22c55e",
    icon: ">>",
  },
  "authority-gap-warning": {
    label: "Authority Gap Warning",
    color: "#f59e0b",
    icon: "!!",
  },
  "emerging-trend": {
    label: "Emerging Trend",
    color: "#3b82f6",
    icon: "~>",
  },
  "competitor-movement": {
    label: "Competitor Movement",
    color: "#ef4444",
    icon: "<>",
  },
  "topic-saturation-risk": {
    label: "Topic Saturation Risk",
    color: "#94a3b8",
    icon: "==",
  },
};

export default function StrategicAlerts() {
  const scored = getScoredSignals();
  const topAlerts = scored
    .filter((s) => s.signal.urgency === "high" || s.score.overall >= 8)
    .slice(0, 5);

  return (
    <section className="rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-4">
      <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
        Strategic Alerts
      </h2>

      <div className="space-y-2.5">
        {topAlerts.map(({ signal, score }) => {
          const cfg = alertConfig[signal.alertType];
          return (
            <div
              key={signal.id}
              className="rounded-lg border px-3.5 py-3 flex flex-col gap-1.5"
              style={{
                borderColor: `${cfg.color}25`,
                backgroundColor: `${cfg.color}05`,
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-mono font-bold"
                  style={{ color: cfg.color }}
                >
                  {cfg.icon}
                </span>
                <span
                  className="text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: cfg.color }}
                >
                  {cfg.label}
                </span>
                <span className="text-[10px] text-muted ml-auto">
                  {score.overall}/10
                </span>
              </div>
              <p className="text-xs text-foreground/90 leading-snug font-medium">
                {signal.title}
              </p>
              <p className="text-[11px] text-muted leading-relaxed line-clamp-2">
                {signal.insightSummary}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
