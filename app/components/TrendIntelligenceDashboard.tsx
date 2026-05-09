"use client";

import { useMemo, useState } from "react";
import { generateTrendReport } from "@/lib/semanticTrendClustering";
import type {
  SemanticCluster,
  NarrativeMomentum,
  WhitespaceOpportunity,
  SaturationIndicator,
  TermFrequency,
} from "@/lib/semanticTrendClustering";

const momentumColors: Record<string, string> = {
  rising: "#22c55e",
  stable: "#38bdf8",
  emerging: "#f59e0b",
  declining: "#6b7280",
};

const gapColors: Record<string, string> = {
  wide: "#22c55e",
  moderate: "#f59e0b",
  narrow: "#6b7280",
};

const saturationColors: Record<string, string> = {
  oversaturated: "#ef4444",
  competitive: "#f59e0b",
  moderate: "#38bdf8",
  open: "#22c55e",
};

const oppTypeLabels: Record<string, { label: string; color: string }> = {
  dominate: { label: "Dominate", color: "#22c55e" },
  expand: { label: "Expand", color: "#38bdf8" },
  enter: { label: "Enter", color: "#f59e0b" },
  monitor: { label: "Monitor", color: "#6b7280" },
};

type ActiveTab = "clusters" | "narratives" | "whitespace" | "saturation" | "terminology";

export default function TrendIntelligenceDashboard() {
  const report = useMemo(() => generateTrendReport(), []);
  const [tab, setTab] = useState<ActiveTab>("clusters");

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            Semantic Trend Intelligence
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {report.clusters.length} clusters &middot;{" "}
            {report.terminology.length} terms tracked &middot;{" "}
            {report.whitespace.length} whitespace opportunities
          </p>
        </div>
      </div>

      {/* Key insights */}
      {report.insights.length > 0 && (
        <div className="space-y-1.5">
          {report.insights.map((insight, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg bg-accent/4 border border-accent/10 px-3.5 py-2.5 text-[11px]"
            >
              <span className="text-accent shrink-0 font-mono font-bold">i</span>
              <span className="text-foreground/80 leading-relaxed">{insight}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5">
        <TabBtn label={`Clusters (${report.clusters.length})`} active={tab === "clusters"} onClick={() => setTab("clusters")} />
        <TabBtn label={`Narratives (${report.narratives.length})`} active={tab === "narratives"} onClick={() => setTab("narratives")} />
        <TabBtn label={`Whitespace (${report.whitespace.length})`} active={tab === "whitespace"} onClick={() => setTab("whitespace")} />
        <TabBtn label={`Saturation (${report.saturation.length})`} active={tab === "saturation"} onClick={() => setTab("saturation")} />
        <TabBtn label={`Terminology (${report.terminology.filter((t) => t.isAuthority).length})`} active={tab === "terminology"} onClick={() => setTab("terminology")} />
      </div>

      {/* Clusters */}
      {tab === "clusters" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.clusters.map((c) => (
            <ClusterCard key={c.id} cluster={c} />
          ))}
        </div>
      )}

      {/* Narratives */}
      {tab === "narratives" && (
        <div className="space-y-3">
          {report.narratives.map((n, i) => (
            <NarrativeCard key={i} narrative={n} />
          ))}
        </div>
      )}

      {/* Whitespace */}
      {tab === "whitespace" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.whitespace.map((w, i) => (
            <WhitespaceCard key={i} opportunity={w} />
          ))}
        </div>
      )}

      {/* Saturation */}
      {tab === "saturation" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {report.saturation.map((s, i) => (
            <SaturationCard key={i} indicator={s} />
          ))}
        </div>
      )}

      {/* Terminology */}
      {tab === "terminology" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {report.terminology
            .filter((t) => t.isAuthority)
            .map((t, i) => (
              <TermCard key={i} term={t} />
            ))}
        </div>
      )}
    </section>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-[11px] px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
        active ? "bg-accent/15 text-accent border-accent/30" : "bg-background/50 text-muted border-card-border hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function ClusterCard({ cluster }: { cluster: SemanticCluster }) {
  const color = momentumColors[cluster.momentum];
  return (
    <div className="rounded-lg bg-background-raised border border-card-border-subtle px-4 py-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-foreground-bright font-semibold">{cluster.label}</span>
        <span className="text-[10px] font-medium" style={{ color }}>
          {cluster.momentum} ({cluster.frequency})
        </span>
      </div>
      <p className="text-[10px] text-muted">{cluster.description}</p>
      <div className="flex flex-wrap gap-1">
        {cluster.terms.slice(0, 6).map((t) => (
          <span
            key={t}
            className="text-[9px] px-1.5 py-0.5 rounded bg-background border border-card-border-subtle text-muted/80"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function NarrativeCard({ narrative }: { narrative: NarrativeMomentum }) {
  const opp = oppTypeLabels[narrative.opportunityType];
  const dirColor = momentumColors[narrative.direction] ?? "#6b7280";

  return (
    <div className="rounded-lg bg-background-raised border border-card-border-subtle px-4 py-3 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-foreground-bright font-semibold leading-snug flex-1">
          {narrative.narrative}
        </p>
        <div className="flex gap-1.5 shrink-0">
          <span className="text-[9px] font-bold" style={{ color: dirColor }}>
            {narrative.strength}/10
          </span>
          <span
            className="text-[9px] font-medium px-1.5 py-0.5 rounded-full border"
            style={{ color: opp.color, borderColor: `${opp.color}25`, backgroundColor: `${opp.color}08` }}
          >
            {opp.label}
          </span>
        </div>
      </div>
      <div className="space-y-0.5">
        {narrative.evidence.map((e, i) => (
          <p key={i} className="text-[10px] text-muted flex items-start gap-1.5">
            <span className="text-accent/40 shrink-0">-</span> {e}
          </p>
        ))}
      </div>
    </div>
  );
}

function WhitespaceCard({ opportunity }: { opportunity: WhitespaceOpportunity }) {
  const gapColor = gapColors[opportunity.competitiveGap];
  return (
    <div className="rounded-lg bg-background-raised border border-card-border-subtle px-4 py-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span
          className="text-[9px] font-medium px-1.5 py-0.5 rounded-full border"
          style={{ color: gapColor, borderColor: `${gapColor}25`, backgroundColor: `${gapColor}08` }}
        >
          {opportunity.competitiveGap} gap
        </span>
        <span className="text-[9px] text-muted">{opportunity.urgency} urgency</span>
      </div>
      <p className="text-xs text-foreground-bright font-medium">{opportunity.area}</p>
      <p className="text-[10px] text-muted leading-relaxed">{opportunity.description}</p>
      <div className="flex items-start gap-1.5 text-[10px] text-foreground/60 bg-background/40 rounded px-2.5 py-1.5">
        <span className="text-accent shrink-0">-&gt;</span>
        <span>{opportunity.suggestedAction}</span>
      </div>
    </div>
  );
}

function SaturationCard({ indicator }: { indicator: SaturationIndicator }) {
  const color = saturationColors[indicator.saturationLevel];
  return (
    <div className="rounded-lg bg-background-raised border border-card-border-subtle px-3 py-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-foreground-bright font-medium truncate">
          {indicator.term}
        </span>
        <span className="text-[9px] font-medium" style={{ color }}>
          {indicator.saturationLevel}
        </span>
      </div>
      <p className="text-[9px] text-muted leading-relaxed">{indicator.differentiation}</p>
    </div>
  );
}

function TermCard({ term }: { term: TermFrequency }) {
  const color = momentumColors[term.momentum];
  return (
    <div className="rounded-lg bg-background-raised border border-card-border-subtle px-3 py-2">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[10px] text-foreground-bright font-medium truncate">
          {term.term}
        </span>
        <span className="text-[9px] font-bold" style={{ color }}>
          {term.count}
        </span>
      </div>
      <span className="text-[9px]" style={{ color }}>{term.momentum}</span>
    </div>
  );
}
