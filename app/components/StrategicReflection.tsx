"use client";

import { analyzeMemory } from "@/lib/analyzeStrategicMemory";

export default function StrategicReflection() {
  const analysis = analyzeMemory();

  return (
    <section className="rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-5">
      <h2 className="text-base font-semibold text-white tracking-wide uppercase">
        Strategic Reflection
      </h2>

      {/* What we are learning */}
      <ReflectionBlock title="What We Are Learning">
        <div className="space-y-2">
          {analysis.strategicLessons.slice(0, 4).map((l, i) => (
            <div
              key={i}
              className="rounded-lg bg-background/40 border border-card-border/40 px-3 py-2.5"
            >
              <p className="text-xs text-foreground leading-relaxed">
                {l.lesson}
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted">
                <span>{l.theme}</span>
                <span className="text-card-border">|</span>
                <span>impact {l.impact}/10</span>
              </div>
            </div>
          ))}
        </div>
      </ReflectionBlock>

      {/* Themes gaining authority */}
      <ReflectionBlock title="Themes Gaining Authority">
        <div className="space-y-1.5">
          {analysis.themePerformance
            .filter((t) => t.trend === "growing")
            .map((t) => (
              <div
                key={t.themeId}
                className="flex items-center gap-2 text-xs text-foreground bg-green-500/5 border border-green-500/15 rounded-lg px-3 py-2"
              >
                <span className="text-green-400 font-bold text-[10px]">
                  ^
                </span>
                <span>{t.themeName}</span>
                <span className="text-muted ml-auto">
                  {t.avgAuthorityImpact}/10
                </span>
              </div>
            ))}
          {analysis.themePerformance.filter((t) => t.trend === "growing")
            .length === 0 && (
            <p className="text-xs text-muted">
              All themes currently stable — maintain consistent output
            </p>
          )}
        </div>
      </ReflectionBlock>

      {/* Areas becoming saturated */}
      <ReflectionBlock title="Areas Becoming Saturated">
        {analysis.overusedThemes.length > 0 ? (
          <div className="space-y-1.5">
            {analysis.overusedThemes.map((t) => (
              <div
                key={t}
                className="flex items-center gap-2 text-xs text-foreground bg-yellow-500/5 border border-yellow-500/15 rounded-lg px-3 py-2"
              >
                <span className="text-yellow-400 font-bold text-[10px]">
                  =
                </span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted">
            No theme saturation detected — coverage is balanced
          </p>
        )}
      </ReflectionBlock>

      {/* Underutilized opportunities */}
      <ReflectionBlock title="Underutilized Opportunities">
        {analysis.underusedThemes.length > 0 ? (
          <div className="space-y-1.5">
            {analysis.underusedThemes.map((t) => (
              <div
                key={t}
                className="flex items-center gap-2 text-xs text-foreground bg-accent/5 border border-accent/15 rounded-lg px-3 py-2"
              >
                <span className="text-accent font-bold text-[10px]">!</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted">
            All themes have adequate coverage
          </p>
        )}
      </ReflectionBlock>

      {/* Adaptive suggestions */}
      <ReflectionBlock title="Adaptive Recommendations">
        <div className="space-y-1.5">
          {analysis.adaptiveSuggestions.map((s, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-xs text-foreground/80 bg-background/40 border border-card-border/40 rounded-lg px-3 py-2.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1" />
              <span className="leading-relaxed">{s}</span>
            </div>
          ))}
        </div>
      </ReflectionBlock>
    </section>
  );
}

function ReflectionBlock({
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
      {children}
    </div>
  );
}
