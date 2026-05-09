"use client";

import { useState, useMemo } from "react";
import { themes } from "@/data/themes";
import { amplificationTemplates, calculateDensityMetrics } from "@/lib/authorityAmplifier";
import type { AmplifiedOutput, DilutionWarning, AssetType } from "@/lib/authorityAmplifier";

const formatColors: Record<string, string> = {
  "linkedin-authority": "#38bdf8",
  "founder-insight": "#ec4899",
  "technical-explainer": "#a855f7",
  "youtube-talking-points": "#f59e0b",
  "case-study-snippet": "#22c55e",
  "semantic-reinforcement": "#38bdf8",
  "geo-reinforcement": "#22c55e",
  "executive-summary": "#6b7280",
};

const severityColors: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#6b7280",
};

export default function AmplificationDashboard() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [assetType, setAssetType] = useState<AssetType>("article");
  const [themeId, setThemeId] = useState("ai-readiness");
  const [insights, setInsights] = useState("");
  const [outputs, setOutputs] = useState<AmplifiedOutput[]>([]);
  const [warnings, setWarnings] = useState<DilutionWarning[]>([]);
  const [scores, setScores] = useState<{ semantic: number; density: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const density = useMemo(() => calculateDensityMetrics(), []);

  async function handleAmplify(useAI: boolean) {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/amplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          type: assetType,
          theme: themeId,
          keyInsights: insights.split("\n").filter((l) => l.trim()),
          useAI,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Amplification failed");
        return;
      }
      setOutputs(data.outputs);
      setWarnings(data.warnings);
      setScores({ semantic: data.semanticScore, density: data.densityScore });
    } catch {
      setError("Failed to connect to amplification service");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            Authority Amplification Engine
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Transform one authority asset into multiple strategic outputs
          </p>
        </div>
        {scores && (
          <div className="flex gap-3">
            <ScoreBox label="Semantic" value={scores.semantic} />
            <ScoreBox label="Density" value={scores.density} />
          </div>
        )}
      </div>

      {/* Input form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Authority asset title..."
            className="px-4 py-2.5 rounded-lg bg-background-raised border border-card-border-subtle text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/30"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your article, case study, research finding, or audit insight..."
            rows={5}
            className="px-4 py-2.5 rounded-lg bg-background-raised border border-card-border-subtle text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/30 resize-none"
          />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value as AssetType)}
              className="flex-1 px-3 py-2.5 rounded-lg bg-background-raised border border-card-border-subtle text-sm text-foreground focus:outline-none focus:border-accent/30"
            >
              <option value="article">Article</option>
              <option value="case-study">Case Study</option>
              <option value="research-insight">Research Insight</option>
              <option value="audit-finding">Audit Finding</option>
              <option value="strategic-observation">Strategic Observation</option>
            </select>
            <select
              value={themeId}
              onChange={(e) => setThemeId(e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-lg bg-background-raised border border-card-border-subtle text-sm text-foreground focus:outline-none focus:border-accent/30"
            >
              {themes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <textarea
            value={insights}
            onChange={(e) => setInsights(e.target.value)}
            placeholder="Key insights (one per line)..."
            rows={3}
            className="px-4 py-2.5 rounded-lg bg-background-raised border border-card-border-subtle text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/30 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleAmplify(false)}
              disabled={loading || !title.trim() || !content.trim()}
              className="flex-1 px-4 py-2.5 rounded-lg bg-background-raised border border-card-border-subtle text-sm text-foreground font-medium cursor-pointer transition-colors hover:border-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "..." : "Amplify (Local)"}
            </button>
            <button
              onClick={() => handleAmplify(true)}
              disabled={loading || !title.trim() || !content.trim()}
              className="flex-1 px-4 py-2.5 rounded-lg bg-accent/90 text-background text-sm font-medium cursor-pointer transition-colors hover:bg-accent-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Amplifying..." : "Amplify (AI)"}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-1.5">
          {warnings.map((w, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg border px-3 py-2 text-xs"
              style={{ borderColor: `${severityColors[w.severity]}15`, backgroundColor: `${severityColors[w.severity]}04` }}
            >
              <span style={{ color: severityColors[w.severity] }} className="shrink-0 font-bold">!</span>
              <span className="text-foreground/70">{w.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Amplified outputs */}
      {outputs.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Amplified Outputs ({outputs.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {outputs.map((o, i) => (
              <OutputCard key={i} output={o} />
            ))}
          </div>
        </div>
      )}

      {/* Authority density */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          Authority Density
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <DensityStat label="Semantic Reinforcement" value={density.semanticReinforcement} />
          <DensityStat label="Amplification Depth" value={density.amplificationDepth} />
          <DensityStat label="Messaging Cohesion" value={density.messagingCohesion} />
        </div>
      </div>

      {/* Templates */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          Amplification Templates
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {amplificationTemplates.map((t) => (
            <span
              key={t.id}
              className="text-xs px-2 py-0.5 rounded-full bg-background-raised border border-card-border-subtle text-muted"
              title={t.structure}
            >
              {t.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function OutputCard({ output }: { output: AmplifiedOutput }) {
  const [expanded, setExpanded] = useState(false);
  const color = formatColors[output.format] ?? "#6b7280";

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="text-left rounded-lg bg-background-raised border border-card-border-subtle px-4 py-3 flex flex-col gap-2 cursor-pointer transition-colors hover:border-card-border"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-xs font-medium px-1.5 py-0.5 rounded-full border"
          style={{ color, borderColor: `${color}25`, backgroundColor: `${color}08` }}
        >
          {output.platform}
        </span>
        <span className="text-xs text-muted">{output.estimatedTime}</span>
      </div>
      <p className="text-xs text-foreground-bright font-medium leading-snug">
        {output.title}
      </p>
      <p className="text-xs text-muted">{output.authorityAngle}</p>
      {expanded && (
        <div className="mt-1 pt-2 border-t border-card-border-subtle">
          <p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-wrap">
            {output.content}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {output.semanticKeywords.map((kw) => (
              <span
                key={kw}
                className="text-xs px-1.5 py-0.5 rounded bg-accent/8 text-accent/60"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </button>
  );
}

function ScoreBox({ label, value }: { label: string; value: number }) {
  const color = value >= 7 ? "#22c55e" : value >= 5 ? "#38bdf8" : "#f59e0b";
  return (
    <div className="text-center">
      <p className="text-lg font-bold" style={{ color }}>{value}/10</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function DensityStat({ label, value }: { label: string; value: number }) {
  const color = value >= 7 ? "#22c55e" : value >= 5 ? "#38bdf8" : "#f59e0b";
  return (
    <div className="rounded-lg bg-background-raised border border-card-border-subtle px-3 py-2.5 text-center">
      <p className="text-lg font-bold" style={{ color }}>{value}/10</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
