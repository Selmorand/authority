"use client";

import { useState } from "react";
import type {
  StrategicBriefing as BriefingType,
  KeyFinding,
  SemanticShift,
  EmergingNarrative,
  AuthorityGap,
} from "@/lib/aiResearchSummarizer";

const urgencyColors: Record<string, string> = {
  immediate: "#ef4444",
  "this-week": "#f59e0b",
  "this-month": "#3b82f6",
};

const directionColors: Record<string, { color: string; label: string }> = {
  emerging: { color: "#22c55e", label: "Emerging" },
  evolving: { color: "#3b82f6", label: "Evolving" },
  declining: { color: "#94a3b8", label: "Declining" },
  contested: { color: "#f59e0b", label: "Contested" },
};

export default function StrategicBriefing() {
  const [briefing, setBriefing] = useState<BriefingType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "findings" | "semantic" | "narratives" | "gaps"
  >("findings");

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/strategic-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liveSignals: [] }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Briefing generation failed");
        return;
      }
      setBriefing(data.briefing);
    } catch {
      setError("Failed to connect to AI service");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            Weekly Strategic Briefing
          </h2>
          <p className="text-xs text-muted mt-0.5">
            AI-powered strategic interpretation of research signals
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="self-start sm:self-auto px-5 py-2.5 rounded-lg bg-accent/90 text-background text-sm font-medium cursor-pointer transition-colors hover:bg-accent-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Analyzing Signals..." : "Generate Briefing"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Briefing content */}
      {briefing && (
        <>
          {/* Weekly priority */}
          <div className="rounded-lg bg-accent/5 border border-accent/15 px-4 py-3">
            <p className="text-[11px] font-medium text-accent uppercase tracking-wider mb-1">
              #1 Priority This Week
            </p>
            <p className="text-sm text-foreground-bright font-medium leading-relaxed">
              {briefing.weeklyPriority}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5">
            <TabBtn
              label={`Key Findings (${briefing.keyFindings.length})`}
              active={activeTab === "findings"}
              onClick={() => setActiveTab("findings")}
            />
            <TabBtn
              label={`Semantic Shifts (${briefing.semanticShifts.length})`}
              active={activeTab === "semantic"}
              onClick={() => setActiveTab("semantic")}
            />
            <TabBtn
              label={`Narratives (${briefing.emergingNarratives.length})`}
              active={activeTab === "narratives"}
              onClick={() => setActiveTab("narratives")}
            />
            <TabBtn
              label={`Authority Gaps (${briefing.authorityGaps.length})`}
              active={activeTab === "gaps"}
              onClick={() => setActiveTab("gaps")}
            />
          </div>

          {/* Tab content */}
          {activeTab === "findings" && (
            <div className="space-y-3">
              {briefing.keyFindings.map((f, i) => (
                <FindingCard key={i} finding={f} />
              ))}
            </div>
          )}

          {activeTab === "semantic" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {briefing.semanticShifts.map((s, i) => (
                <ShiftCard key={i} shift={s} />
              ))}
            </div>
          )}

          {activeTab === "narratives" && (
            <div className="space-y-3">
              {briefing.emergingNarratives.map((n, i) => (
                <NarrativeCard key={i} narrative={n} />
              ))}
            </div>
          )}

          {activeTab === "gaps" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {briefing.authorityGaps.map((g, i) => (
                <GapCard key={i} gap={g} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!briefing && !loading && !error && (
        <div className="rounded-lg bg-background/40 border border-card-border/40 px-6 py-10 text-center">
          <p className="text-sm text-muted">
            Click &quot;Generate Briefing&quot; to create an AI-powered
            strategic intelligence briefing from current research signals.
          </p>
        </div>
      )}
    </section>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function TabBtn({
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

function FindingCard({ finding }: { finding: KeyFinding }) {
  const urgColor = urgencyColors[finding.urgency] ?? "#94a3b8";

  return (
    <div className="rounded-lg border border-card-border/60 bg-background/40 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-foreground-bright leading-snug flex-1">
          {finding.finding}
        </p>
        <span
          className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border"
          style={{
            color: urgColor,
            borderColor: `${urgColor}30`,
            backgroundColor: `${urgColor}10`,
          }}
        >
          {finding.urgency}
        </span>
      </div>

      <InsightRow label="Why It Matters" value={finding.whyItMatters} />
      <InsightRow
        label="Authority Opportunity"
        value={finding.authorityOpportunity}
      />
      <InsightRow label="Suggested Response" value={finding.suggestedResponse} />
      <InsightRow
        label="Content Opportunity"
        value={finding.contentOpportunity}
      />
      <InsightRow label="Founder Insight" value={finding.founderInsight} />
      <InsightRow
        label="Competitive Angle"
        value={finding.competitiveAngle}
      />

      {finding.relevantThemes.length > 0 && (
        <div className="flex flex-wrap gap-1 text-[10px]">
          {finding.relevantThemes.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium text-muted uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-xs text-foreground/80 leading-relaxed">{value}</p>
    </div>
  );
}

function ShiftCard({ shift }: { shift: SemanticShift }) {
  const dir = directionColors[shift.direction] ?? directionColors.emerging;

  return (
    <div className="rounded-lg border border-card-border/60 bg-background/40 p-4 flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-foreground-bright">{shift.term}</span>
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
          style={{
            color: dir.color,
            borderColor: `${dir.color}30`,
            backgroundColor: `${dir.color}10`,
          }}
        >
          {dir.label}
        </span>
      </div>
      <p className="text-xs text-muted leading-relaxed">
        {shift.currentUsage}
      </p>
      <InsightRow
        label="Strategic Implication"
        value={shift.strategicImplication}
      />
      <InsightRow label="Suggested Action" value={shift.suggestedAction} />
    </div>
  );
}

function NarrativeCard({ narrative }: { narrative: EmergingNarrative }) {
  return (
    <div className="rounded-lg border border-card-border/60 bg-background/40 p-4 flex flex-col gap-3">
      <p className="text-sm font-semibold text-foreground-bright leading-snug">
        {narrative.narrative}
      </p>
      <InsightRow label="Evidence" value={narrative.evidence} />
      <InsightRow label="Market Concern" value={narrative.marketConcern} />
      <InsightRow label="Interon Angle" value={narrative.interonAngle} />
      <InsightRow
        label="Content Strategy"
        value={narrative.contentStrategy}
      />
      <InsightRow
        label="Competitor Blind Spot"
        value={narrative.competitorBlindSpot}
      />
    </div>
  );
}

function GapCard({ gap }: { gap: AuthorityGap }) {
  return (
    <div className="rounded-lg border border-card-border/60 bg-background/40 p-4 flex flex-col gap-2.5">
      <p className="text-sm font-semibold text-foreground-bright leading-snug">
        {gap.gap}
      </p>
      <InsightRow label="Evidence" value={gap.evidence} />
      <InsightRow label="Opportunity Size" value={gap.opportunitySize} />
    </div>
  );
}
