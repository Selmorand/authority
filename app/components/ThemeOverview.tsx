"use client";

import { useState } from "react";
import { themes, getRelatedThemes } from "@/data/themes";
import { getTopicsByTheme } from "@/data/topicIdeas";
import type { Theme } from "@/data/themes";

const authorityColors: Record<string, { color: string; label: string }> = {
  core: { color: "#22c55e", label: "Core" },
  supporting: { color: "#3b82f6", label: "Supporting" },
  emerging: { color: "#a855f7", label: "Emerging" },
};

export default function ThemeOverview() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white tracking-wide uppercase">
          Strategic Themes
        </h2>
        <div className="flex gap-3 text-[10px] text-muted">
          {Object.entries(authorityColors).map(([key, { color, label }]) => (
            <span key={key} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isExpanded={expanded === theme.id}
            onToggle={() =>
              setExpanded(expanded === theme.id ? null : theme.id)
            }
          />
        ))}
      </div>
    </section>
  );
}

function ThemeCard({
  theme,
  isExpanded,
  onToggle,
}: {
  theme: Theme;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const level = authorityColors[theme.authorityLevel];
  const topicCount = getTopicsByTheme(theme.id).length;
  const related = getRelatedThemes(theme.id);

  return (
    <button
      onClick={onToggle}
      className={`text-left rounded-lg border p-3.5 flex flex-col gap-2 transition-all cursor-pointer ${
        isExpanded
          ? "border-accent/40 bg-accent/5"
          : "border-card-border/60 bg-background/40 hover:border-card-border"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-white leading-snug">
          {theme.name}
        </h3>
        <span
          className="shrink-0 w-2 h-2 rounded-full mt-1"
          style={{ backgroundColor: level.color }}
        />
      </div>

      <p className="text-xs text-muted leading-relaxed line-clamp-2">
        {theme.description}
      </p>

      <div className="flex items-center gap-2 text-[10px] text-muted mt-auto">
        <span>{topicCount} topics</span>
        <span className="text-card-border">|</span>
        <span>{theme.keywords.length} keywords</span>
      </div>

      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-card-border/40 space-y-2">
          <p className="text-[11px] text-foreground/70 leading-relaxed">
            {theme.strategicGoal}
          </p>
          <div className="flex flex-wrap gap-1">
            {related.map((r) => (
              <span
                key={r.id}
                className="text-[10px] px-1.5 py-0.5 rounded bg-card-bg border border-card-border/40 text-muted"
              >
                {r.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </button>
  );
}
