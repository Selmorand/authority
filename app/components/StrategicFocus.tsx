import { themes } from "@/data/themes";
import { topicIdeas } from "@/data/topicIdeas";
import { contentAngles } from "@/data/contentAngles";

export default function StrategicFocus() {
  const coreThemes = themes.filter((t) => t.authorityLevel === "core");
  const highImpactTopics = topicIdeas.filter(
    (t) => t.authorityImpact === "high"
  );

  // Aggregate keyword count across all themes
  const totalKeywords = themes.reduce(
    (sum, t) => sum + t.keywords.length,
    0
  );

  // Count topics per platform
  const platformCounts = topicIdeas.reduce(
    (acc, t) => {
      acc[t.platform] = (acc[t.platform] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <section className="rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-5">
      <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
        Strategic Focus
      </h2>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Strategic Themes" value={String(themes.length)} />
        <StatBox label="Topic Ideas" value={String(topicIdeas.length)} />
        <StatBox label="High-Impact Topics" value={String(highImpactTopics.length)} />
        <StatBox label="Target Keywords" value={String(totalKeywords)} />
      </div>

      {/* Core pillars */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          Core Authority Pillars
        </h3>
        <div className="space-y-1.5">
          {coreThemes.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 text-sm text-foreground bg-background/40 border border-card-border/40 rounded-lg px-3 py-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
              {t.name}
            </div>
          ))}
        </div>
      </div>

      {/* Platform distribution */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          Content by Platform
        </h3>
        <div className="space-y-2">
          {Object.entries(platformCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([platform, count]) => (
              <div key={platform} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-foreground">{platform}</span>
                  <span className="text-muted">{count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-background/80 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent-glow to-accent"
                    style={{
                      width: `${(count / topicIdeas.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Content angles */}
      <div>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          Content Angles
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {contentAngles.map((a) => (
            <span
              key={a.id}
              className="text-xs px-2 py-0.5 rounded-full bg-background/50 text-muted border border-card-border/60"
            >
              {a.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background/50 border border-card-border/60 rounded-lg px-3 py-2.5 text-center">
      <p className="text-xl font-bold text-foreground-bright">{value}</p>
      <p className="text-xs text-muted mt-0.5">{label}</p>
    </div>
  );
}
