"use client";

import { useState } from "react";
import { themes } from "@/data/themes";
import type { AIMission, TopicExpansion } from "@/lib/aiMissionGenerator";

type TabView = "missions" | "expand";

export default function AIMissionPanel() {
  const [tab, setTab] = useState<TabView>("missions");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mission generation state
  const [missions, setMissions] = useState<AIMission[]>([]);
  const [filtered, setFiltered] = useState(0);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  // Topic expansion state
  const [expandInput, setExpandInput] = useState("");
  const [expandTheme, setExpandTheme] = useState("");
  const [expansions, setExpansions] = useState<TopicExpansion[]>([]);

  async function handleGenerateMissions() {
    setLoading(true);
    setError(null);
    try {
      const dayName = new Date().toLocaleDateString("en-GB", {
        weekday: "long",
      });
      const res = await fetch("/api/ai/generate-missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          focusThemes:
            selectedThemes.length > 0 ? selectedThemes : undefined,
          dayOfWeek: dayName,
          count: 5,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Generation failed");
        return;
      }
      setMissions(data.data);
      setFiltered(data.filtered);
    } catch {
      setError("Failed to connect to AI service");
    } finally {
      setLoading(false);
    }
  }

  async function handleExpandTopic() {
    if (!expandInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/expand-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: expandInput.trim(),
          themeId: expandTheme || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Expansion failed");
        return;
      }
      setExpansions(data.data);
    } catch {
      setError("Failed to connect to AI service");
    } finally {
      setLoading(false);
    }
  }

  function toggleTheme(id: string) {
    setSelectedThemes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            AI Strategic Assistant
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Powered by OpenAI &middot; Controlled prompt engineering
          </p>
        </div>
        <div className="flex gap-1.5">
          <TabButton
            label="Generate Missions"
            active={tab === "missions"}
            onClick={() => setTab("missions")}
          />
          <TabButton
            label="Expand Topic"
            active={tab === "expand"}
            onClick={() => setTab("expand")}
          />
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Tab: Generate Missions */}
      {tab === "missions" && (
        <div className="flex flex-col gap-4">
          {/* Theme filter */}
          <div>
            <p className="text-xs text-muted mb-2">
              Focus themes (optional — leave empty for balanced coverage):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggleTheme(t.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                    selectedThemes.includes(t.id)
                      ? "bg-accent/15 text-accent border-accent/30"
                      : "bg-background/50 text-muted border-card-border hover:text-foreground"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerateMissions}
            disabled={loading}
            className="self-start px-5 py-2.5 rounded-lg bg-accent/90 text-background text-sm font-medium cursor-pointer transition-colors hover:bg-accent-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Generating..." : "Generate Strategic Missions"}
          </button>

          {/* Results */}
          {missions.length > 0 && (
            <div className="space-y-3">
              {filtered > 0 && (
                <p className="text-xs text-muted">
                  {filtered} suggestion{filtered > 1 ? "s" : ""} filtered by
                  quality validation
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {missions.map((m, i) => (
                  <AIMissionCard key={i} mission={m} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Expand Topic */}
      {tab === "expand" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={expandInput}
              onChange={(e) => setExpandInput(e.target.value)}
              placeholder="Enter a topic to expand..."
              className="flex-1 px-4 py-2.5 rounded-lg bg-background/60 border border-card-border text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/40"
            />
            <select
              value={expandTheme}
              onChange={(e) => setExpandTheme(e.target.value)}
              className="px-3 py-2.5 rounded-lg bg-background/60 border border-card-border text-sm text-foreground focus:outline-none focus:border-accent/40"
            >
              <option value="">Any theme</option>
              {themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleExpandTopic}
              disabled={loading || !expandInput.trim()}
              className="px-5 py-2.5 rounded-lg bg-accent/90 text-background text-sm font-medium cursor-pointer transition-colors hover:bg-accent-glow disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? "Expanding..." : "Expand Topic"}
            </button>
          </div>

          {/* Expansion results */}
          {expansions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {expansions.map((e, i) => (
                <ExpansionCard key={i} expansion={e} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function TabButton({
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
      className={`text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
        active
          ? "bg-accent/15 text-accent border-accent/30"
          : "bg-background/50 text-muted border-card-border hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function AIMissionCard({ mission }: { mission: AIMission }) {
  const priorityColor =
    mission.strategicPriority >= 7
      ? "#22c55e"
      : mission.strategicPriority >= 5
        ? "#f59e0b"
        : "#94a3b8";

  return (
    <div className="rounded-lg border border-card-border/60 bg-background/40 p-4 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground-bright leading-snug">
          {mission.title}
        </h3>
        <span
          className="shrink-0 text-xs font-bold px-1.5 py-0.5 rounded"
          style={{
            color: priorityColor,
            backgroundColor: `${priorityColor}15`,
          }}
        >
          {mission.strategicPriority}/10
        </span>
      </div>

      <p className="text-xs text-muted leading-relaxed">{mission.objective}</p>

      <p className="text-xs text-foreground/60 leading-relaxed">
        {mission.semanticGoal}
      </p>

      <div className="flex flex-wrap gap-1.5 text-xs mt-auto">
        <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
          {mission.theme}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {mission.platform}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {mission.contentAngle}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {mission.estimatedTime}
        </span>
        <span
          className="px-2 py-0.5 rounded-full border"
          style={{
            color:
              mission.authorityImpact >= 7
                ? "#22c55e"
                : mission.authorityImpact >= 5
                  ? "#f59e0b"
                  : "#94a3b8",
            borderColor: `${mission.authorityImpact >= 7 ? "#22c55e" : mission.authorityImpact >= 5 ? "#f59e0b" : "#94a3b8"}30`,
            backgroundColor: `${mission.authorityImpact >= 7 ? "#22c55e" : mission.authorityImpact >= 5 ? "#f59e0b" : "#94a3b8"}10`,
          }}
        >
          impact {mission.authorityImpact}/10
        </span>
      </div>
    </div>
  );
}

function ExpansionCard({ expansion }: { expansion: TopicExpansion }) {
  return (
    <div className="rounded-lg border border-card-border/60 bg-background/40 p-4 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
          {expansion.angle}
        </span>
        <span className="text-xs text-muted">{expansion.estimatedTime}</span>
      </div>

      <h3 className="text-sm font-semibold text-foreground-bright leading-snug">
        {expansion.title}
      </h3>

      <p className="text-xs text-muted leading-relaxed">
        {expansion.keyPoint}
      </p>

      <div className="flex items-center gap-2 text-xs mt-auto">
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {expansion.platform}
        </span>
        <span className="text-foreground/50">{expansion.authoritySignal}</span>
      </div>
    </div>
  );
}
