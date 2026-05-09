"use client";

import { useMemo } from "react";
import { generateExecutiveBriefing } from "@/lib/generateExecutiveBriefing";
import type { StrategicRisk } from "@/lib/generateExecutiveBriefing";

const severityConfig: Record<string, { color: string; label: string }> = {
  critical: { color: "#ef4444", label: "Critical" },
  high: { color: "#f59e0b", label: "High" },
  medium: { color: "#38bdf8", label: "Medium" },
  low: { color: "#6b7280", label: "Low" },
};

const categoryLabels: Record<string, string> = {
  "semantic-drift": "Semantic Drift",
  "messaging-dilution": "Messaging Dilution",
  "theme-inconsistency": "Theme Inconsistency",
  "founder-visibility": "Founder Visibility",
  "execution-decline": "Execution Decline",
  saturation: "Saturation",
  "corroboration-gap": "Corroboration Gap",
};

export default function StrategicRiskPanel() {
  const briefing = useMemo(() => generateExecutiveBriefing(), []);

  return (
    <section className="rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
          Strategic Risks
        </h2>
        <span className="text-xs text-muted">
          {briefing.strategicRisks.length} detected
        </span>
      </div>

      <div className="space-y-2">
        {briefing.strategicRisks.map((risk, i) => (
          <RiskCard key={i} risk={risk} />
        ))}
        {briefing.strategicRisks.length === 0 && (
          <p className="text-xs text-muted py-2">
            No strategic risks detected — maintain current cadence
          </p>
        )}
      </div>
    </section>
  );
}

function RiskCard({ risk }: { risk: StrategicRisk }) {
  const sev = severityConfig[risk.severity];
  const catLabel = categoryLabels[risk.category] ?? risk.category;

  return (
    <div
      className="rounded-lg border px-3.5 py-3 flex flex-col gap-2"
      style={{
        borderColor: `${sev.color}18`,
        backgroundColor: `${sev.color}04`,
      }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: sev.color }}
        >
          {sev.label}
        </span>
        <span className="text-xs text-muted px-1.5 py-0.5 rounded bg-background-raised border border-card-border-subtle">
          {catLabel}
        </span>
      </div>
      <p className="text-xs text-foreground/90 font-medium leading-snug">
        {risk.risk}
      </p>
      <p className="text-xs text-muted leading-relaxed">
        {risk.mitigation}
      </p>
    </div>
  );
}
