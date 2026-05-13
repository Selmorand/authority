"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { aiVisibilityQueries } from "@/data/aiVisibilityQueries";
import type { QueryCategory } from "@/data/aiVisibilityQueries";

// ─── Types ────────────────────────────────────────────────────

interface EngineResult {
  cited: boolean;
  position: number | null;
  matchedBy: string | null;
  citations: string[];
  responseExcerpt: string | null;
  date: string;
  runId: string;
}

interface QueryRow {
  queryId: string;
  query: string;
  perEngine: Record<string, EngineResult>;
}

interface LatestResponse {
  success: boolean;
  results: QueryRow[];
  lastRunAt: string | null;
}

interface RunSummary {
  runId: string;
  totalChecks: number;
  citedCount: number;
  perEngine: Record<string, { cited: number; total: number }>;
}

const ENGINES = [
  { id: "openai", label: "ChatGPT" },
  { id: "anthropic", label: "Claude" },
] as const;

const CATEGORY_LABELS: Record<QueryCategory, string> = {
  "category-claim": "Category",
  service: "Service",
  "founder-entity": "Entity",
  "geo-service": "Geo",
  comparative: "Comparative",
};

const CATEGORY_COLORS: Record<QueryCategory, string> = {
  "category-claim": "#a855f7",
  service: "#38bdf8",
  "founder-entity": "#22c55e",
  "geo-service": "#f59e0b",
  comparative: "#ec4899",
};

// ─── Component ────────────────────────────────────────────────

export default function AIVisibilityTracker() {
  const [results, setResults] = useState<QueryRow[]>([]);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<"high" | "all" | null>(null);
  const [runMessage, setRunMessage] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<QueryCategory | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/ai-visibility/latest");
      const data: LatestResponse = await res.json();
      if (data.success) {
        setResults(data.results ?? []);
        setLastRunAt(data.lastRunAt ?? null);
      }
    } catch {
      // soft fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await load();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const handleRun = useCallback(
    async (scope: "high" | "all") => {
      setRunning(scope);
      const scopeQueryCount = scope === "high"
        ? aiVisibilityQueries.filter((q) => q.priority === "high").length
        : aiVisibilityQueries.length;
      setRunMessage(
        `Running ${scopeQueryCount} queries × 2 engines — this can take 1–5 minutes. Results save as they complete.`
      );

      try {
        const res = await fetch("/api/ai-visibility/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            engines: ["openai", "anthropic"],
            priority: scope,
          }),
        });
        const data = await res.json();
        if (data.success) {
          const summary = data as RunSummary;
          setRunMessage(
            `Done. ${summary.citedCount}/${summary.totalChecks} cited overall (ChatGPT ${summary.perEngine.openai?.cited ?? 0}/${summary.perEngine.openai?.total ?? 0}, Claude ${summary.perEngine.anthropic?.cited ?? 0}/${summary.perEngine.anthropic?.total ?? 0}).`
          );
        } else {
          setRunMessage(`Run failed: ${data.error ?? "unknown error"}`);
        }
        await load();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Network error";
        setRunMessage(`Run failed: ${msg}. Partial results may have been saved.`);
        await load();
      } finally {
        setRunning(null);
      }
    },
    [load]
  );

  // ── Aggregate stats ─────────────────────────────────────────
  const stats = useMemo(() => {
    const per: Record<string, { cited: number; total: number }> = {};
    for (const e of ENGINES) per[e.id] = { cited: 0, total: 0 };
    for (const r of results) {
      for (const e of ENGINES) {
        const er = r.perEngine[e.id];
        if (er) {
          per[e.id].total += 1;
          if (er.cited) per[e.id].cited += 1;
        }
      }
    }
    return per;
  }, [results]);

  // ── Per-category aggregate ──────────────────────────────────
  const perCategory = useMemo(() => {
    const map: Record<QueryCategory, { cited: number; total: number }> = {
      "category-claim": { cited: 0, total: 0 },
      service: { cited: 0, total: 0 },
      "founder-entity": { cited: 0, total: 0 },
      "geo-service": { cited: 0, total: 0 },
      comparative: { cited: 0, total: 0 },
    };
    for (const r of results) {
      const def = aiVisibilityQueries.find((q) => q.id === r.queryId);
      if (!def) continue;
      const anyCited = ENGINES.some((e) => r.perEngine[e.id]?.cited);
      map[def.category].total += 1;
      if (anyCited) map[def.category].cited += 1;
    }
    return map;
  }, [results]);

  // ── Filtered + ordered display rows (drives the list) ───────
  const displayRows = useMemo(() => {
    const byCategory = aiVisibilityQueries.filter(
      (q) => filterCategory === "all" || q.category === filterCategory
    );
    const byId: Record<string, QueryRow | undefined> = {};
    for (const r of results) byId[r.queryId] = r;
    return byCategory.map((q) => ({
      def: q,
      row: byId[q.id],
    }));
  }, [results, filterCategory]);

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            AI-Visibility Tracker
          </h2>
          <p className="text-sm text-muted mt-0.5">
            {lastRunAt
              ? `Last run ${formatRelative(lastRunAt)} · ${aiVisibilityQueries.length} target queries`
              : `${aiVisibilityQueries.length} target queries · no runs yet`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleRun("high")}
            disabled={running !== null}
            className="text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-colors border bg-accent/15 text-accent border-accent/30 hover:bg-accent/25 disabled:cursor-wait"
          >
            {running === "high" ? "Running…" : "Run high-priority"}
          </button>
          <button
            onClick={() => handleRun("all")}
            disabled={running !== null}
            className="text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-colors border bg-background/60 text-foreground border-card-border hover:bg-background disabled:cursor-wait"
          >
            {running === "all" ? "Running…" : "Run all 42"}
          </button>
        </div>
      </div>

      {runMessage && (
        <div className="rounded-md border border-accent/20 bg-accent/5 px-3 py-2 text-xs text-foreground/80">
          {runMessage}
        </div>
      )}

      {/* Overall stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {ENGINES.map((e) => {
          const s = stats[e.id];
          const rate = s.total > 0 ? Math.round((s.cited / s.total) * 100) : 0;
          return (
            <div
              key={e.id}
              className="rounded-md border border-card-border bg-background/40 px-3 py-2.5"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                {e.label}
              </p>
              <p className="text-2xl font-bold text-foreground-bright mt-0.5">
                {s.cited}
                <span className="text-base text-muted font-normal"> / {s.total}</span>
              </p>
              <p
                className="text-xs"
                style={{
                  color: rate >= 30 ? "#22c55e" : rate >= 10 ? "#f59e0b" : "#ef4444",
                }}
              >
                {rate}% citation rate
              </p>
            </div>
          );
        })}
      </div>

      {/* Per-category breakdown */}
      <div className="rounded-md border border-card-border bg-background/40 px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">
          Per-category citation rate
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(perCategory) as QueryCategory[]).map((cat) => {
            const v = perCategory[cat];
            return (
              <button
                key={cat}
                onClick={() =>
                  setFilterCategory((f) => (f === cat ? "all" : cat))
                }
                className={`text-[11px] px-2 py-1 rounded-full border cursor-pointer transition-colors ${
                  filterCategory === cat
                    ? "bg-accent/15 text-accent border-accent/30"
                    : "bg-background/60 text-foreground border-card-border hover:bg-background"
                }`}
              >
                <span style={{ color: CATEGORY_COLORS[cat] }}>{CATEGORY_LABELS[cat]}</span>
                <span className="ml-1 text-muted">
                  {v.cited}/{v.total}
                </span>
              </button>
            );
          })}
          {filterCategory !== "all" && (
            <button
              onClick={() => setFilterCategory("all")}
              className="text-[11px] px-2 py-1 rounded-full border border-card-border text-muted hover:text-foreground cursor-pointer"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Results list */}
      <div className="flex flex-col gap-1.5">
        {loading && results.length === 0 ? (
          <p className="text-sm text-muted italic">Loading…</p>
        ) : displayRows.length === 0 ? (
          <p className="text-sm text-muted italic">No queries match this filter.</p>
        ) : (
          displayRows.map(({ def, row }) => (
            <QueryRowItem
              key={def.id}
              query={def.query}
              category={def.category}
              priority={def.priority}
              row={row}
              expanded={expanded === def.id}
              onToggle={() =>
                setExpanded((prev) => (prev === def.id ? null : def.id))
              }
            />
          ))
        )}
      </div>
    </section>
  );
}

// ─── Per-query row ────────────────────────────────────────────

function QueryRowItem({
  query,
  category,
  priority,
  row,
  expanded,
  onToggle,
}: {
  query: string;
  category: QueryCategory;
  priority: "high" | "medium" | "low";
  row: QueryRow | undefined;
  expanded: boolean;
  onToggle: () => void;
}) {
  const anyCited = row ? ENGINES.some((e) => row.perEngine[e.id]?.cited) : false;
  const noData = !row;

  return (
    <div
      className="rounded-md border bg-background/40"
      style={{
        borderColor: noData
          ? "rgba(148, 163, 184, 0.2)"
          : anyCited
            ? "rgba(34, 197, 94, 0.3)"
            : "rgba(239, 68, 68, 0.25)",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full text-left px-3 py-2 flex items-center gap-2.5 cursor-pointer hover:bg-background/30"
      >
        <span
          className="shrink-0 text-base"
          aria-label={noData ? "not yet checked" : anyCited ? "cited" : "not cited"}
        >
          {noData ? "•" : anyCited ? "✓" : "✗"}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-foreground-bright leading-snug truncate">
            {query}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: CATEGORY_COLORS[category] }}
            >
              {CATEGORY_LABELS[category]}
            </span>
            {priority === "high" && (
              <span className="text-[10px] text-accent">★ high</span>
            )}
            {ENGINES.map((e) => {
              const er = row?.perEngine[e.id];
              return (
                <span
                  key={e.id}
                  className="text-[10px]"
                  style={{
                    color: er?.cited
                      ? "#22c55e"
                      : er
                        ? "#ef4444"
                        : "#94a3b8",
                  }}
                >
                  {e.label}{" "}
                  {er
                    ? er.cited
                      ? er.position != null
                        ? `✓ #${er.position}`
                        : "✓"
                      : "✗"
                    : "—"}
                </span>
              );
            })}
          </div>
        </div>
        <span className="text-[10px] text-muted shrink-0">
          {expanded ? "▴" : "▾"}
        </span>
      </button>

      {expanded && row && (
        <div className="border-t border-card-border/50 px-3 py-2.5 flex flex-col gap-3">
          {ENGINES.map((e) => {
            const er = row.perEngine[e.id];
            if (!er) {
              return (
                <div key={e.id}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    {e.label}
                  </p>
                  <p className="text-xs text-muted italic">Not yet checked.</p>
                </div>
              );
            }
            return (
              <div key={e.id} className="flex flex-col gap-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  {e.label}
                  <span className="ml-2 text-foreground/60">
                    {er.cited
                      ? er.matchedBy === "url"
                        ? "matched by URL"
                        : er.matchedBy === "text"
                          ? "matched by text mention"
                          : "matched by URL + text"
                      : "not cited"}
                  </span>
                </p>
                {er.citations.length > 0 && (
                  <ul className="flex flex-col gap-0.5 pl-1">
                    {er.citations.slice(0, 8).map((u, i) => (
                      <li key={i} className="text-[11px] truncate">
                        <a
                          href={u}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`underline hover:no-underline ${
                            /interon\.co\.za/i.test(u)
                              ? "text-green-400"
                              : "text-muted"
                          }`}
                        >
                          {u}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {er.responseExcerpt && (
                  <p className="text-[11px] text-muted italic leading-snug mt-1">
                    “{er.responseExcerpt}…”
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.floor((now - then) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString();
}
