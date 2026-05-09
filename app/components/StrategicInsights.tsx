"use client";

import { useMemo } from "react";
import {
  generateDailyPlan,
  getTodayDateStr,
} from "@/lib/generateDailyPlan";

export default function StrategicInsights() {
  const plan = useMemo(() => generateDailyPlan(getTodayDateStr()), []);

  const themeNames = plan.focusThemes.map((t) => t.name);
  const avgPriority =
    plan.missions.length > 0
      ? Math.round(
          plan.missions.reduce((s, m) => s + m.priority.overall, 0) /
            plan.missions.length
        )
      : 0;
  const highImpact = plan.missions.filter(
    (m) => m.priority.authorityImpact >= 7
  ).length;

  return (
    <section className="rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-5">
      <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
        Strategic Insights
      </h2>

      {/* Why today matters */}
      <div className="space-y-3">
        <InsightBlock
          label="Why Today's Plan Matters"
          content={`Today's missions reinforce ${themeNames.slice(0, 3).join(", ")}${themeNames.length > 3 ? ` and ${themeNames.length - 3} more themes` : ""}. This builds compounding authority across interconnected topics that AI systems use to evaluate source credibility.`}
        />

        <InsightBlock
          label="Authority Signals Being Reinforced"
          content={plan.reinforcedSignals.join(" · ")}
          isTags
        />

        <InsightBlock
          label="Semantic Themes Strengthened"
          content={`By covering ${themeNames.join(" and ")}, today's work creates semantic density across your core authority areas. Each piece reinforces entity recognition and topical depth that LLMs weigh when selecting citation sources.`}
        />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <MiniStat label="Avg Priority" value={`${avgPriority}/10`} />
        <MiniStat label="High Impact" value={`${highImpact}`} />
        <MiniStat label="Themes Active" value={`${themeNames.length}`} />
      </div>

      {/* Focus themes breakdown */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          Theme Goals in Focus
        </h3>
        <div className="space-y-2">
          {plan.focusThemes.map((t) => (
            <div
              key={t.id}
              className="rounded-lg bg-background/40 border border-card-border/40 px-3 py-2.5"
            >
              <p className="text-xs font-medium text-foreground-bright">{t.name}</p>
              <p className="text-xs text-muted mt-0.5 leading-relaxed">
                {t.strategicGoal}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InsightBlock({
  label,
  content,
  isTags,
}: {
  label: string;
  content: string;
  isTags?: boolean;
}) {
  return (
    <div className="rounded-lg bg-background/40 border border-card-border/40 px-4 py-3">
      <p className="text-xs font-medium text-accent uppercase tracking-wider mb-1.5">
        {label}
      </p>
      {isTags ? (
        <div className="flex flex-wrap gap-1.5">
          {content.split(" · ").map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-accent/8 text-foreground/70 border border-card-border/40"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-foreground/70 leading-relaxed">{content}</p>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background/50 border border-card-border/60 rounded-lg px-3 py-2 text-center">
      <p className="text-lg font-bold text-foreground-bright">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
