"use client";

import { useMemo, useState, useEffect } from "react";
import {
  scheduleDayMissions,
  generateReminders,
} from "@/lib/scheduleAuthorityMissions";
import type {
  ExecutionStats,
  CadenceMetric,
  ExecutionGap,
  DriftIndicator,
} from "@/lib/executionTracker";

const frequencyColors: Record<string, string> = {
  high: "#22c55e",
  moderate: "#38bdf8",
  low: "#f59e0b",
  inactive: "#ef4444",
};

const driftTypeLabels: Record<string, string> = {
  "over-focus": "Over-Focus",
  "under-focus": "Under-Focus",
  "declining-consistency": "Declining Consistency",
  "semantic-imbalance": "Semantic Imbalance",
  "insufficient-founder-visibility": "Low Founder Visibility",
};

const severityColors: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#6b7280",
};

export default function ExecutionDashboard() {
  const today = new Date().toISOString().split("T")[0];
  const schedule = useMemo(() => scheduleDayMissions(today), [today]);
  const reminders = useMemo(() => generateReminders(today), [today]);

  const [stats, setStats] = useState<ExecutionStats | null>(null);
  const [cadence, setCadence] = useState<CadenceMetric[]>([]);
  const [gaps, setGaps] = useState<ExecutionGap[]>([]);
  const [drift, setDrift] = useState<DriftIndicator[]>([]);
  const [todayCompleted, setTodayCompleted] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);

  useEffect(() => {
    fetch("/api/execution-stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setCadence(data.cadence);
          setGaps(data.gaps);
          setDrift(data.drift);
          setTodayCompleted(data.todayCompleted);
          setTodayTotal(data.todayTotal);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-5">
      <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
        Execution Operations
      </h2>

      {/* Consistency stats */}
      <div className="grid grid-cols-4 gap-2">
        <StatBox
          label="Consistency"
          value={stats ? `${stats.consistencyScore}/10` : "—"}
          highlight={stats ? stats.consistencyScore >= 7 : false}
        />
        <StatBox label="Current Streak" value={stats ? `${stats.currentStreak}d` : "—"} />
        <StatBox label="Weekly Rate" value={stats ? `${stats.weeklyRate}/wk` : "—"} />
        <StatBox
          label="Today"
          value={`${todayCompleted}/${todayTotal}`}
          highlight={todayTotal > 0 && todayCompleted === todayTotal}
        />
      </div>

      {/* Today's reminders */}
      {reminders.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Reminders
          </h3>
          <div className="space-y-1.5">
            {reminders.map((r, i) => {
              const urgColor =
                r.urgency === "immediate"
                  ? "#ef4444"
                  : r.urgency === "today"
                    ? "#f59e0b"
                    : "#6b7280";
              return (
                <div
                  key={i}
                  className="rounded-lg border px-3 py-2"
                  style={{
                    borderColor: `${urgColor}20`,
                    backgroundColor: `${urgColor}05`,
                  }}
                >
                  <p className="text-xs font-medium text-foreground-bright">
                    {r.title}
                  </p>
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">
                    {r.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Theme cadence */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          Theme Cadence
        </h3>
        {cadence.length === 0 ? (
          <p className="text-xs text-muted leading-relaxed bg-background-raised border border-card-border-subtle rounded-lg px-3 py-3">
            No activity yet. Cadence will start tracking once the first task is completed.
          </p>
        ) : (
          <div className="space-y-1.5">
            {cadence.slice(0, 6).map((c) => (
              <div
                key={c.theme}
                className="flex items-center justify-between bg-background-raised border border-card-border-subtle rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: frequencyColors[c.frequency],
                    }}
                  />
                  <span className="text-xs text-foreground">{c.theme}</span>
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: frequencyColors[c.frequency] }}
                >
                  {c.frequency === "inactive"
                    ? `${c.daysSinceActivity}d ago`
                    : c.frequency}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drift indicators */}
      {drift.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Drift Detection
          </h3>
          <div className="space-y-1.5">
            {drift.slice(0, 4).map((d, i) => (
              <div
                key={i}
                className="rounded-lg border px-3 py-2"
                style={{
                  borderColor: `${severityColors[d.severity]}15`,
                  backgroundColor: `${severityColors[d.severity]}05`,
                }}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{ color: severityColors[d.severity] }}
                  >
                    {driftTypeLabels[d.type]}
                  </span>
                  <span className="text-xs text-foreground-bright font-medium">
                    {d.area}
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {d.correction}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution gaps */}
      {gaps.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Execution Gaps
          </h3>
          <div className="space-y-1.5">
            {gaps.slice(0, 3).map((g, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs bg-background-raised border border-card-border-subtle rounded-lg px-3 py-2"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0 mt-1"
                  style={{ backgroundColor: severityColors[g.severity] }}
                />
                <div>
                  <span className="text-foreground font-medium">{g.area}</span>
                  <p className="text-xs text-muted mt-0.5">
                    {g.suggestion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function StatBox({
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
      className={`rounded-lg px-3 py-2.5 text-center border ${
        highlight
          ? "bg-accent/5 border-accent/15"
          : "bg-background-raised border-card-border-subtle"
      }`}
    >
      <p
        className={`text-lg font-bold ${
          highlight ? "text-accent" : "text-foreground-bright"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-muted mt-0.5">{label}</p>
    </div>
  );
}
