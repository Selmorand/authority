"use client";

import { useState } from "react";
import { topicIdeas } from "@/data/topicIdeas";
import { themes } from "@/data/themes";
import type { TopicIdea } from "@/data/topicIdeas";

const impactColors: Record<string, string> = {
  high: "#22c55e",
  medium: "#f59e0b",
  low: "#94a3b8",
};

const difficultyLabels: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default function SuggestedTopics() {
  const [activeTheme, setActiveTheme] = useState<string>("all");
  const [activePlatform, setActivePlatform] = useState<string>("all");

  const platforms = [...new Set(topicIdeas.map((t) => t.platform))];

  const filtered = topicIdeas.filter((t) => {
    if (activeTheme !== "all" && t.theme !== activeTheme) return false;
    if (activePlatform !== "all" && t.platform !== activePlatform) return false;
    return true;
  });

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-base font-semibold text-white tracking-wide uppercase">
          Suggested Topics
        </h2>
        <span className="text-xs text-muted">{filtered.length} topics</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap gap-1.5">
          <FilterButton
            label="All Themes"
            active={activeTheme === "all"}
            onClick={() => setActiveTheme("all")}
          />
          {themes.map((t) => (
            <FilterButton
              key={t.id}
              label={t.name}
              active={activeTheme === t.id}
              onClick={() => setActiveTheme(t.id)}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterButton
            label="All Platforms"
            active={activePlatform === "all"}
            onClick={() => setActivePlatform("all")}
          />
          {platforms.map((p) => (
            <FilterButton
              key={p}
              label={p}
              active={activePlatform === p}
              onClick={() => setActivePlatform(p)}
            />
          ))}
        </div>
      </div>

      {/* Topic list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
        {filtered.map((topic, i) => (
          <TopicCard key={i} topic={topic} />
        ))}
      </div>
    </section>
  );
}

function FilterButton({
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

function TopicCard({ topic }: { topic: TopicIdea }) {
  const themeName =
    themes.find((t) => t.id === topic.theme)?.name ?? topic.theme;

  return (
    <div className="rounded-lg border border-card-border/60 bg-background/40 p-3.5 flex flex-col gap-2">
      <h3 className="text-sm font-medium text-white leading-snug">
        {topic.title}
      </h3>

      <p className="text-xs text-muted leading-relaxed">
        {topic.semanticGoal}
      </p>

      <div className="flex flex-wrap gap-1.5 text-[10px] mt-auto">
        <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
          {themeName}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {topic.platform}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {topic.format}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {difficultyLabels[topic.difficulty]}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {topic.estimatedTime}
        </span>
        <span
          className="px-2 py-0.5 rounded-full border"
          style={{
            color: impactColors[topic.authorityImpact],
            borderColor: `${impactColors[topic.authorityImpact]}30`,
            backgroundColor: `${impactColors[topic.authorityImpact]}10`,
          }}
        >
          {topic.authorityImpact} impact
        </span>
      </div>
    </div>
  );
}
