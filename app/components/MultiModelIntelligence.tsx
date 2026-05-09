"use client";

import { useState } from "react";
import { modelRegistry } from "@/lib/multiModelAnalysis";
import type {
  MultiModelAnalysis,
  ModelInsight,
  ConsensusItem,
  Contradiction,
  BlindSpot,
} from "@/lib/multiModelAnalysis";

const severityColors: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#6b7280",
};

export default function MultiModelIntelligence() {
  const [analysis, setAnalysis] = useState<MultiModelAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "models" | "consensus" | "contradictions" | "blindspots" | "synthesis"
  >("synthesis");

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/multi-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Analysis failed");
        return;
      }
      setAnalysis(data.analysis);
    } catch {
      setError("Failed to connect to intelligence service");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            Multi-Model Strategic Intelligence
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Compare insights across AI models to reduce strategic blind spots
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="self-start sm:self-auto px-5 py-2.5 rounded-lg bg-accent/90 text-background text-sm font-medium cursor-pointer transition-colors hover:bg-accent-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Analyzing..." : "Run Multi-Model Analysis"}
        </button>
      </div>

      {/* Model registry */}
      <div className="flex flex-wrap gap-2">
        {modelRegistry.map((m) => (
          <div
            key={m.id}
            className={`flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-lg border ${
              m.available
                ? "border-accent/20 bg-accent/5 text-accent"
                : "border-card-border bg-background/40 text-muted"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                m.available ? "bg-accent" : "bg-muted/50"
              }`}
            />
            {m.name}
            {!m.available && (
              <span className="text-[9px] text-muted/60">coming soon</span>
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Analysis results */}
      {analysis && (
        <>
          {/* Overall confidence */}
          <div className="flex items-center gap-4 rounded-lg bg-background-raised border border-card-border-subtle px-4 py-3">
            <div>
              <p className="text-[10px] text-muted uppercase tracking-wider">
                Overall Confidence
              </p>
              <p className="text-2xl font-bold text-foreground-bright">
                {analysis.overallConfidence}/10
              </p>
            </div>
            <div className="flex-1 h-2 rounded-full bg-background overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-glow to-accent transition-all"
                style={{ width: `${analysis.overallConfidence * 10}%` }}
              />
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted uppercase tracking-wider">
                Models Active
              </p>
              <p className="text-lg font-bold text-foreground-bright">
                {analysis.modelInsights.length}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 flex-wrap">
            <TabBtn
              label="Synthesis"
              active={activeTab === "synthesis"}
              onClick={() => setActiveTab("synthesis")}
            />
            <TabBtn
              label={`Model Views (${analysis.modelInsights.length})`}
              active={activeTab === "models"}
              onClick={() => setActiveTab("models")}
            />
            <TabBtn
              label={`Consensus (${analysis.consensus.length})`}
              active={activeTab === "consensus"}
              onClick={() => setActiveTab("consensus")}
            />
            <TabBtn
              label={`Contradictions (${analysis.contradictions.length})`}
              active={activeTab === "contradictions"}
              onClick={() => setActiveTab("contradictions")}
            />
            <TabBtn
              label={`Blind Spots (${analysis.blindSpots.length})`}
              active={activeTab === "blindspots"}
              onClick={() => setActiveTab("blindspots")}
            />
          </div>

          {/* Synthesis */}
          {activeTab === "synthesis" && (
            <div className="space-y-4">
              <SynthesisBlock title="What All Models Agree On">
                {analysis.consensus
                  .filter((c) => c.type === "consensus")
                  .slice(0, 4)
                  .map((c, i) => (
                    <ConsensusRow key={i} item={c} />
                  ))}
              </SynthesisBlock>

              <SynthesisBlock title="Highest-Confidence Actions">
                {analysis.highConfidenceActions.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs text-foreground/80 bg-background/40 border border-card-border-subtle rounded-lg px-3 py-2.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1" />
                    {a}
                  </div>
                ))}
              </SynthesisBlock>

              <SynthesisBlock title="Biggest Authority Risks">
                {analysis.blindSpots
                  .filter((b) => b.severity === "high")
                  .slice(0, 3)
                  .map((b, i) => (
                    <BlindSpotRow key={i} spot={b} />
                  ))}
              </SynthesisBlock>

              <SynthesisBlock title="Where Opinions Differ">
                {analysis.contradictions.length > 0 ? (
                  analysis.contradictions.slice(0, 3).map((c, i) => (
                    <ContradictionRow key={i} item={c} />
                  ))
                ) : (
                  <p className="text-xs text-muted">
                    No significant contradictions detected — models are aligned
                  </p>
                )}
              </SynthesisBlock>
            </div>
          )}

          {/* Model Views */}
          {activeTab === "models" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.modelInsights.map((insight) => (
                <ModelCard key={insight.modelId} insight={insight} />
              ))}
            </div>
          )}

          {/* Consensus */}
          {activeTab === "consensus" && (
            <div className="space-y-2">
              {analysis.consensus.map((c, i) => (
                <ConsensusRow key={i} item={c} />
              ))}
            </div>
          )}

          {/* Contradictions */}
          {activeTab === "contradictions" && (
            <div className="space-y-3">
              {analysis.contradictions.length > 0 ? (
                analysis.contradictions.map((c, i) => (
                  <ContradictionRow key={i} item={c} />
                ))
              ) : (
                <p className="text-sm text-muted py-4 text-center">
                  No contradictions detected between models
                </p>
              )}
            </div>
          )}

          {/* Blind Spots */}
          {activeTab === "blindspots" && (
            <div className="space-y-2">
              {analysis.blindSpots.map((b, i) => (
                <BlindSpotRow key={i} spot={b} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!analysis && !loading && !error && (
        <div className="rounded-lg bg-background-raised border border-card-border-subtle px-6 py-10 text-center">
          <p className="text-sm text-muted">
            Run multi-model analysis to compare strategic insights across
            AI models and detect consensus patterns, contradictions, and
            blind spots.
          </p>
        </div>
      )}
    </section>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function TabBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[11px] px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
        active
          ? "bg-accent/15 text-accent border-accent/30"
          : "bg-background/50 text-muted border-card-border hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function SynthesisBlock({
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
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function ModelCard({ insight }: { insight: ModelInsight }) {
  const confColor =
    insight.confidenceLevel >= 7
      ? "#22c55e"
      : insight.confidenceLevel >= 4
        ? "#f59e0b"
        : "#ef4444";

  return (
    <div className="rounded-lg border border-card-border bg-background-raised p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-sm font-semibold text-foreground-bright">
            {insight.modelName}
          </span>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded"
          style={{
            color: confColor,
            backgroundColor: `${confColor}15`,
          }}
        >
          confidence {insight.confidenceLevel}/10
        </span>
      </div>

      {insight.keyInsights.length > 0 && (
        <div>
          <p className="text-[10px] text-muted uppercase tracking-wider mb-1">
            Key Insights
          </p>
          <ul className="space-y-1">
            {insight.keyInsights.map((i, idx) => (
              <li
                key={idx}
                className="text-xs text-foreground/80 flex items-start gap-2"
              >
                <span className="w-1 h-1 rounded-full bg-accent shrink-0 mt-1.5" />
                {i}
              </li>
            ))}
          </ul>
        </div>
      )}

      {insight.opportunities.length > 0 && (
        <div>
          <p className="text-[10px] text-muted uppercase tracking-wider mb-1">
            Opportunities
          </p>
          <ul className="space-y-1">
            {insight.opportunities.map((o, idx) => (
              <li
                key={idx}
                className="text-xs text-foreground/80 flex items-start gap-2"
              >
                <span className="w-1 h-1 rounded-full bg-green-500 shrink-0 mt-1.5" />
                {o}
              </li>
            ))}
          </ul>
        </div>
      )}

      {insight.warnings.length > 0 && (
        <div>
          <p className="text-[10px] text-muted uppercase tracking-wider mb-1">
            Warnings
          </p>
          <ul className="space-y-1">
            {insight.warnings.map((w, idx) => (
              <li
                key={idx}
                className="text-xs text-foreground/80 flex items-start gap-2"
              >
                <span className="w-1 h-1 rounded-full bg-yellow-500 shrink-0 mt-1.5" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {insight.recommendedActions.length > 0 && (
        <div>
          <p className="text-[10px] text-muted uppercase tracking-wider mb-1">
            Recommended Actions
          </p>
          <ul className="space-y-1">
            {insight.recommendedActions.map((a, idx) => (
              <li
                key={idx}
                className="text-xs text-foreground/80 flex items-start gap-2"
              >
                <span className="w-1 h-1 rounded-full bg-accent shrink-0 mt-1.5" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ConsensusRow({ item }: { item: ConsensusItem }) {
  const typeColors: Record<string, string> = {
    consensus: "#38bdf8",
    opportunity: "#22c55e",
    warning: "#f59e0b",
  };
  const color = typeColors[item.type] ?? "#6b7280";

  return (
    <div className="flex items-start gap-3 bg-background-raised border border-card-border-subtle rounded-lg px-3 py-2.5">
      <span
        className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5"
        style={{
          color,
          backgroundColor: `${color}12`,
        }}
      >
        {item.confidenceScore}/10
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground/90 leading-relaxed">
          {item.insight}
        </p>
        <p className="text-[10px] text-muted mt-1">
          {item.models.join(" + ")} &middot; {item.type}
        </p>
      </div>
    </div>
  );
}

function ContradictionRow({ item }: { item: Contradiction }) {
  return (
    <div className="rounded-lg border border-yellow-500/15 bg-yellow-500/3 px-4 py-3 space-y-2">
      <p className="text-xs font-medium text-foreground-bright">
        {item.topic}
      </p>
      {item.positions.map((p, i) => (
        <div key={i} className="flex items-start gap-2 text-xs">
          <span className="text-[10px] font-medium text-muted shrink-0 min-w-[80px]">
            {p.model}:
          </span>
          <span className="text-foreground/70">{p.position}</span>
        </div>
      ))}
      <p className="text-[11px] text-muted italic">{item.implication}</p>
    </div>
  );
}

function BlindSpotRow({ spot }: { spot: BlindSpot }) {
  const color = severityColors[spot.severity];

  return (
    <div
      className="rounded-lg border px-3 py-2.5"
      style={{
        borderColor: `${color}20`,
        backgroundColor: `${color}05`,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className="text-[10px] font-medium uppercase tracking-wider"
          style={{ color }}
        >
          {spot.severity}
        </span>
        <span className="text-xs font-medium text-foreground-bright">
          {spot.area}
        </span>
      </div>
      <p className="text-[11px] text-muted leading-relaxed">{spot.evidence}</p>
      <p className="text-[11px] text-foreground/60 mt-1">
        {spot.suggestedAction}
      </p>
    </div>
  );
}
