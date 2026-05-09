"use client";

import { useState } from "react";
import { themes } from "@/data/themes";
import type { LiveSignal } from "@/lib/fetchResearchSignals";

const opportunityLabels: Record<string, { label: string; color: string }> = {
  "high-priority-opportunity": { label: "High Priority", color: "#22c55e" },
  "semantic-convergence": { label: "Semantic Convergence", color: "#a855f7" },
  "geo-opportunity": { label: "GEO Opportunity", color: "#3b82f6" },
  "umbraco-opportunity": { label: "Umbraco", color: "#f59e0b" },
  "entity-opportunity": { label: "Entity", color: "#ec4899" },
  "general-intelligence": { label: "Intelligence", color: "#94a3b8" },
};

export default function LiveResearchFeed() {
  const [signals, setSignals] = useState<LiveSignal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    sourcesFetched: number;
    sourcesFailed: number;
    totalFiltered: number;
  } | null>(null);
  const [filter, setFilter] = useState<string>("all");

  async function fetchSignals() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/research/signals");
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Fetch failed");
        return;
      }
      setSignals(data.signals);
      setMeta({
        sourcesFetched: data.sourcesFetched,
        sourcesFailed: data.sourcesFailed,
        totalFiltered: data.totalFiltered,
      });
    } catch {
      setError("Failed to fetch research signals");
    } finally {
      setLoading(false);
    }
  }

  const filtered =
    filter === "all"
      ? signals
      : filter === "high-value"
        ? signals.filter((s) => s.isHighValue)
        : signals.filter((s) => s.matchedThemes.includes(filter));

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            Live Research Feed
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {signals.length > 0
              ? `${signals.length} signals from ${meta?.sourcesFetched ?? 0} sources`
              : "Fetch live authority intelligence from curated sources"}
          </p>
        </div>
        <button
          onClick={fetchSignals}
          disabled={loading}
          className="self-start sm:self-auto px-5 py-2.5 rounded-lg bg-accent/90 text-background text-sm font-medium cursor-pointer transition-colors hover:bg-accent-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Scanning Sources..." : "Scan Research Sources"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Meta stats */}
      {meta && (
        <div className="flex gap-4 text-xs text-muted">
          <span>{meta.sourcesFetched} sources scanned</span>
          {meta.sourcesFailed > 0 && (
            <span className="text-yellow-500">
              {meta.sourcesFailed} failed
            </span>
          )}
          {meta.totalFiltered > 0 && (
            <span>{meta.totalFiltered} duplicates filtered</span>
          )}
          <span>
            {signals.filter((s) => s.isHighValue).length} high-value signals
          </span>
        </div>
      )}

      {/* Filters */}
      {signals.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <FilterBtn
            label="All"
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <FilterBtn
            label="High Value"
            active={filter === "high-value"}
            onClick={() => setFilter("high-value")}
          />
          {themes.map((t) => {
            const count = signals.filter((s) =>
              s.matchedThemes.includes(t.id)
            ).length;
            if (count === 0) return null;
            return (
              <FilterBtn
                key={t.id}
                label={`${t.name} (${count})`}
                active={filter === t.id}
                onClick={() => setFilter(t.id)}
              />
            );
          })}
        </div>
      )}

      {/* Signals */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
          {filtered.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {signals.length === 0 && !loading && !error && (
        <div className="rounded-lg bg-background/40 border border-card-border/40 px-6 py-10 text-center">
          <p className="text-sm text-muted">
            Click &quot;Scan Research Sources&quot; to fetch live intelligence
            from curated RSS feeds and community sources.
          </p>
        </div>
      )}
    </section>
  );
}

function FilterBtn({
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

function SignalCard({ signal }: { signal: LiveSignal }) {
  const opp =
    opportunityLabels[signal.opportunityType] ?? opportunityLabels["general-intelligence"];
  const themeNames = signal.matchedThemes
    .map((id) => themes.find((t) => t.id === id)?.name)
    .filter(Boolean);
  const publishDate = new Date(signal.publishedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  return (
    <div
      className={`rounded-lg border bg-background/40 p-4 flex flex-col gap-2.5 ${
        signal.isHighValue
          ? "border-accent/30"
          : "border-card-border/60"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <a
          href={signal.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-foreground-bright leading-snug hover:text-accent transition-colors flex-1"
        >
          {signal.title}
        </a>
        <span
          className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded"
          style={{
            color:
              signal.relevanceScore >= 7
                ? "#22c55e"
                : signal.relevanceScore >= 5
                  ? "#f59e0b"
                  : "#94a3b8",
            backgroundColor: `${signal.relevanceScore >= 7 ? "#22c55e" : signal.relevanceScore >= 5 ? "#f59e0b" : "#94a3b8"}15`,
          }}
        >
          {signal.relevanceScore}/10
        </span>
      </div>

      {/* Summary */}
      {signal.summary && (
        <p className="text-xs text-muted leading-relaxed line-clamp-2">
          {signal.summary}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 text-[10px]">
        <span
          className="px-2 py-0.5 rounded-full border"
          style={{
            color: opp.color,
            borderColor: `${opp.color}30`,
            backgroundColor: `${opp.color}10`,
          }}
        >
          {opp.label}
        </span>
        {themeNames.slice(0, 3).map((name) => (
          <span
            key={name}
            className="px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20"
          >
            {name}
          </span>
        ))}
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {signal.source}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {publishDate}
        </span>
      </div>

      {/* Matched keywords */}
      {signal.matchedKeywords.length > 0 && (
        <div className="flex flex-wrap gap-1 text-[9px]">
          {signal.matchedKeywords.slice(0, 5).map((kw) => (
            <span
              key={kw}
              className="px-1.5 py-0.5 rounded bg-background/60 text-muted/70 border border-card-border/30"
            >
              {kw}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
