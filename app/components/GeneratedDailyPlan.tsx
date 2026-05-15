"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  generateDailyPlan,
  getTodayDateStr,
} from "@/lib/generateDailyPlan";
import type { PlannedMission } from "@/lib/generateDailyPlan";
import type { LoadTier, TaskKind } from "@/lib/cognitiveLoad";

type MissionStatus = "pending" | "in-progress" | "completed";

interface AlternateTarget {
  url: string;
  why: string;
}

interface DraftRecord {
  content: string;
  model?: string;
  updatedAt?: string;
  targetUrl?: string | null;
  alternates?: AlternateTarget[];
  videoUrl?: string | null;
  videoProject?: string | null;
}

const statusConfig: Record<
  MissionStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  pending: {
    label: "Pending",
    color: "#94a3b8",
    bg: "#94a3b815",
    border: "#94a3b830",
  },
  "in-progress": {
    label: "In Progress",
    color: "#f59e0b",
    bg: "#f59e0b15",
    border: "#f59e0b30",
  },
  completed: {
    label: "Completed",
    color: "#22c55e",
    bg: "#22c55e15",
    border: "#22c55e30",
  },
};

const loadTierConfig: Record<LoadTier, { label: string; color: string; bg: string }> = {
  heavy: { label: "Heavy", color: "#ef4444", bg: "#ef444415" },
  medium: { label: "Medium", color: "#f59e0b", bg: "#f59e0b15" },
  light: { label: "Light", color: "#22c55e", bg: "#22c55e15" },
};

const kindConfig: Record<TaskKind, { label: string; color: string }> = {
  "core-authority": { label: "Core Authority Asset", color: "#a855f7" },
  reinforcement: { label: "Reinforcement", color: "#38bdf8" },
  research: { label: "Research", color: "#94a3b8" },
  maintenance: { label: "Maintenance", color: "#f59e0b" },
  "strategic-review": { label: "Strategic Review", color: "#ec4899" },
};

const statusCycle: MissionStatus[] = ["pending", "in-progress", "completed"];

// Stable draft key independent of ephemeral mission ids.
function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
function draftKeyFor(mission: PlannedMission, date: string): string | null {
  if (mission.reinforcementTopic) return `${date}-${mission.reinforcementTopic.id}`;
  if (mission.isCoreAsset && mission.topic) return `${date}-core-${slug(mission.topic.title)}`;
  return null;
}

export default function GeneratedDailyPlan() {
  const [dateStr, setDateStr] = useState(getTodayDateStr);
  const plan = useMemo(() => generateDailyPlan(dateStr), [dateStr]);
  const [statusMap, setStatusMap] = useState<Record<string, MissionStatus>>({});
  const [draftMap, setDraftMap] = useState<Record<string, DraftRecord>>({});
  const [executing, setExecuting] = useState<Record<string, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/mission-progress?date=${dateStr}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStatusMap(data.statusMap);
        else setStatusMap({});
      })
      .catch(() => setStatusMap({}));
  }, [dateStr]);

  useEffect(() => {
    // draftKey embeds the date so executing/errorMap entries are naturally
    // namespaced — no need to reset them when the date changes.
    fetch(`/api/missions/draft?date=${dateStr}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setDraftMap(data.drafts ?? {});
        else setDraftMap({});
      })
      .catch(() => setDraftMap({}));
  }, [dateStr]);

  const handleStatusChange = useCallback(
    (id: string, newStatus: MissionStatus, mission?: PlannedMission) => {
      setStatusMap((prev) => ({ ...prev, [id]: newStatus }));
      const payload: Record<string, unknown> = { id, date: dateStr, status: newStatus };
      if (newStatus === "completed" && mission) {
        payload.mission = {
          title: mission.title,
          category: mission.category,
          platform: mission.platform,
          objective: mission.objective,
          contentAngle: mission.contentAngle,
          themeId: mission.theme.id,
          authorityImpact: Math.round(mission.priority.authorityImpact),
          semanticValue: Math.round(mission.priority.semanticValue),
        };
      }
      fetch("/api/mission-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },
    [dateStr]
  );

  const handleExecute = useCallback(
    async (mission: PlannedMission) => {
      const key = draftKeyFor(mission, dateStr);
      if (!key) return;

      setExecuting((prev) => ({ ...prev, [key]: true }));
      setErrorMap((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });

      try {
        const res = await fetch("/api/missions/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            draftKey: key,
            date: dateStr,
            mission: {
              title: mission.title,
              channel: mission.channel,
              category: mission.category,
              categoryId: mission.categoryDef?.id,
              reinforcementTopicId: mission.reinforcementTopic?.id,
              platform: mission.platform,
              theme: mission.theme.name,
              contentAngle: mission.contentAngle,
              semanticGoal: mission.semanticGoal,
              estimatedTime: mission.estimatedTime,
              objective: mission.objective,
              loadTier: mission.loadTier,
              taskKind: mission.taskKind,
              isCoreAsset: mission.isCoreAsset,
              executionPrompt: mission.executionPrompt,
              requiresCoreAsset:
                mission.reinforcementTopic?.requiresCoreAsset ?? false,
            },
          }),
        });
        const data = await res.json();
        if (data.success && data.content) {
          setDraftMap((prev) => ({
            ...prev,
            [key]: {
              content: data.content,
              model: data.model,
              updatedAt: new Date().toISOString(),
              targetUrl: data.targetUrl ?? null,
              alternates: Array.isArray(data.alternates) ? data.alternates : [],
              videoUrl: data.videoUrl ?? null,
              videoProject: data.videoProject ?? null,
            },
          }));
        } else {
          setErrorMap((prev) => ({
            ...prev,
            [key]: data.error ?? "Generation failed",
          }));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Network error";
        setErrorMap((prev) => ({ ...prev, [key]: message }));
      } finally {
        setExecuting((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    },
    [dateStr]
  );

  const handleClearDraft = useCallback(
    async (mission: PlannedMission) => {
      const key = draftKeyFor(mission, dateStr);
      if (!key) return;
      setDraftMap((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      await fetch(`/api/missions/draft?draftKey=${encodeURIComponent(key)}`, {
        method: "DELETE",
      });
    },
    [dateStr]
  );

  const dayLabel = new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const totalTime = plan.cognitiveLoad.totalMinutes;

  function shiftDate(days: number) {
    const d = new Date(dateStr + "T00:00:00");
    d.setDate(d.getDate() + days);
    setDateStr(d.toISOString().split("T")[0]);
  }

  // Group missions by kind for the new visual hierarchy
  const reinforcement = plan.missions.filter((m) => m.taskKind === "reinforcement");
  const maintenance = plan.missions.filter((m) => m.taskKind === "maintenance");
  const research = plan.missions.filter((m) => m.taskKind === "research");
  const review = plan.missions.filter((m) => m.taskKind === "strategic-review");

  const cardProps = {
    dateStr,
    statusMap,
    draftMap,
    executing,
    errorMap,
    onStatusChange: handleStatusChange,
    onExecute: handleExecute,
    onClearDraft: handleClearDraft,
  };

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            Daily Mission Plan
          </h2>
          <p className="text-sm text-muted mt-0.5">{dayLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 items-center">
            <button
              onClick={() => shiftDate(-1)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-card-border bg-background/50 text-muted hover:text-foreground cursor-pointer transition-colors"
            >
              Prev
            </button>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => {
                if (e.target.value) setDateStr(e.target.value);
              }}
              className="text-xs px-2 py-1.5 rounded-lg border border-card-border bg-background/50 text-foreground cursor-pointer focus:outline-none focus:border-accent/60"
              title="Jump to date"
            />
            <button
              onClick={() => setDateStr(getTodayDateStr())}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-accent/30 bg-accent/10 text-accent cursor-pointer transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => shiftDate(1)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-card-border bg-background/50 text-muted hover:text-foreground cursor-pointer transition-colors"
            >
              Next
            </button>
          </div>
          <div className="flex gap-3 text-xs text-muted">
            <span>{plan.missions.length} tasks</span>
            <span>{totalTime} min</span>
          </div>
        </div>
      </div>

      {/* Day strategy */}
      <div className="rounded-lg bg-accent/5 border border-accent/15 px-4 py-3">
        <p className="text-xs font-medium text-accent uppercase tracking-wider mb-1">
          {plan.dayName} Strategy
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {plan.dayStrategy}
        </p>
        <div className="flex gap-3 mt-3 text-xs">
          <LoadCount label="Heavy" value={plan.cognitiveLoad.heavy} tier="heavy" />
          <LoadCount label="Medium" value={plan.cognitiveLoad.medium} tier="medium" />
          <LoadCount label="Light" value={plan.cognitiveLoad.light} tier="light" />
        </div>
      </div>

      {/* Core Authority Asset — distinct banner */}
      {plan.coreAsset && (
        <CoreAssetBanner mission={plan.coreAsset} {...cardProps} />
      )}

      {/* Reinforcement Tasks */}
      {reinforcement.length > 0 && (
        <TaskGroup
          title="Reinforcement"
          subtitle="Light/medium tasks that compound the week's core asset"
          color={kindConfig.reinforcement.color}
          missions={reinforcement}
          {...cardProps}
        />
      )}

      {/* Maintenance Tasks */}
      {maintenance.length > 0 && (
        <TaskGroup
          title="Maintenance"
          subtitle="Internal site, entity, and corroboration upkeep"
          color={kindConfig.maintenance.color}
          missions={maintenance}
          {...cardProps}
        />
      )}

      {/* Research */}
      {research.length > 0 && (
        <TaskGroup
          title="Research"
          subtitle="Intake without execution pressure"
          color={kindConfig.research.color}
          missions={research}
          {...cardProps}
        />
      )}

      {/* Strategic Review */}
      {review.length > 0 && (
        <TaskGroup
          title="Strategic Review"
          subtitle="Close the week. Set next week's core asset."
          color={kindConfig["strategic-review"].color}
          missions={review}
          {...cardProps}
        />
      )}

      {plan.missions.length === 0 && (
        <p className="text-sm text-muted italic">
          Sustainable pause. No scheduled work today — authority compounds even on rest days.
        </p>
      )}
    </section>
  );
}

// ─── Shared card props ────────────────────────────────────────

interface CardSharedProps {
  dateStr: string;
  statusMap: Record<string, MissionStatus>;
  draftMap: Record<string, DraftRecord>;
  executing: Record<string, boolean>;
  errorMap: Record<string, string>;
  onStatusChange: (id: string, status: MissionStatus, mission?: PlannedMission) => void;
  onExecute: (mission: PlannedMission) => void;
  onClearDraft: (mission: PlannedMission) => void;
}

// ─── Core Authority Asset Banner ──────────────────────────────

function CoreAssetBanner({
  mission,
  dateStr,
  statusMap,
  draftMap,
  executing,
  errorMap,
  onStatusChange,
  onExecute,
  onClearDraft,
}: CardSharedProps & { mission: PlannedMission }) {
  const status = statusMap[mission.id] ?? "pending";
  const s = statusConfig[status];
  const key = draftKeyFor(mission, dateStr);
  const draft = key ? draftMap[key] : undefined;
  const isExecuting = key ? !!executing[key] : false;
  const error = key ? errorMap[key] : undefined;
  const canExecute = !!key;

  function cycleStatus() {
    const idx = statusCycle.indexOf(status);
    const next = statusCycle[(idx + 1) % statusCycle.length];
    onStatusChange(mission.id, next, mission);
  }

  return (
    <div
      className="relative rounded-xl border-2 p-5 flex flex-col gap-3"
      style={{
        borderColor: kindConfig["core-authority"].color + "60",
        background: `linear-gradient(135deg, ${kindConfig["core-authority"].color}10 0%, transparent 60%)`,
        opacity: status === "completed" ? 0.7 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: kindConfig["core-authority"].color }}
          >
            ◆ Core Authority Asset · This week&apos;s anchor
          </p>
          <h3
            className={`text-lg font-bold leading-tight ${
              status === "completed" ? "line-through text-muted" : "text-foreground-bright"
            }`}
          >
            {mission.title}
          </h3>
          <p className="text-sm text-foreground/70 mt-2 leading-relaxed">{mission.objective}</p>
        </div>
        <span
          className="shrink-0 text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider"
          style={{
            color: loadTierConfig.heavy.color,
            backgroundColor: loadTierConfig.heavy.bg,
          }}
        >
          Heavy
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 text-xs">
        <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
          {mission.theme.name}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {mission.channel}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {mission.category}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {mission.contentAngle}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background/80 text-muted border border-card-border">
          {mission.estimatedTime}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 text-xs">
        <ScorePill label="Strategic" value={mission.priority.strategicPriority} />
        <ScorePill label="Impact" value={mission.priority.authorityImpact} />
        <ScorePill label="Semantic" value={mission.priority.semanticValue} />
        <ScorePill label="Overall" value={mission.priority.overall} highlight />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={cycleStatus}
          className="text-xs font-medium px-3 py-1.5 rounded-full cursor-pointer transition-colors"
          style={{
            color: s.color,
            backgroundColor: s.bg,
            borderWidth: 1,
            borderColor: s.border,
          }}
        >
          {s.label}
        </button>
        {canExecute && (
          <ExecuteButton
            isExecuting={isExecuting}
            hasDraft={!!draft}
            onExecute={() => onExecute(mission)}
            big
          />
        )}
      </div>

      {(draft || error) && (
        <DraftPanel
          draft={draft}
          error={error}
          onRegenerate={() => onExecute(mission)}
          onClear={() => onClearDraft(mission)}
          isExecuting={isExecuting}
        />
      )}
    </div>
  );
}

// ─── Task Group (reinforcement / maintenance / research) ──────

function TaskGroup({
  title,
  subtitle,
  color,
  missions,
  ...shared
}: CardSharedProps & {
  title: string;
  subtitle: string;
  color: string;
  missions: PlannedMission[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-3">
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color }}
        >
          {title}
        </span>
        <span className="text-xs text-muted">{subtitle}</span>
        <span className="ml-auto text-xs text-muted">{missions.length}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {missions.map((m) => (
          <ReinforcementCard key={m.id} mission={m} {...shared} />
        ))}
      </div>
    </div>
  );
}

function ReinforcementCard({
  mission,
  dateStr,
  statusMap,
  draftMap,
  executing,
  errorMap,
  onStatusChange,
  onExecute,
  onClearDraft,
}: CardSharedProps & { mission: PlannedMission }) {
  const status = statusMap[mission.id] ?? "pending";
  const s = statusConfig[status];
  const tier = loadTierConfig[mission.loadTier];
  const key = draftKeyFor(mission, dateStr);
  const draft = key ? draftMap[key] : undefined;
  const isExecuting = key ? !!executing[key] : false;
  const error = key ? errorMap[key] : undefined;
  const canExecute = !!key;

  function cycleStatus() {
    const idx = statusCycle.indexOf(status);
    const next = statusCycle[(idx + 1) % statusCycle.length];
    onStatusChange(mission.id, next, mission);
  }

  return (
    <div
      className={`rounded-lg border bg-card-bg/60 p-3.5 flex flex-col gap-2.5 transition-opacity ${
        status === "completed" ? "opacity-60" : ""
      }`}
      style={{ borderColor: s.border }}
    >
      <div className="flex items-start gap-2">
        <span
          className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
          style={{ color: tier.color, backgroundColor: tier.bg }}
          title="Cognitive load tier"
        >
          {tier.label}
        </span>
        <h3
          className={`text-sm font-semibold leading-snug flex-1 ${
            status === "completed" ? "line-through text-muted" : "text-foreground-bright"
          }`}
        >
          {mission.title}
        </h3>
      </div>

      {mission.executionPrompt && (
        <p className="text-xs text-muted leading-relaxed italic">
          {mission.executionPrompt}
        </p>
      )}

      <div className="flex flex-wrap gap-1 text-[11px]">
        <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
          {mission.theme.name}
        </span>
        <span className="px-1.5 py-0.5 rounded bg-background/80 text-muted border border-card-border">
          {mission.channel}
        </span>
        <span className="px-1.5 py-0.5 rounded bg-background/80 text-muted border border-card-border">
          {mission.estimatedTime}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={cycleStatus}
          className="text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors"
          style={{
            color: s.color,
            backgroundColor: s.bg,
            borderWidth: 1,
            borderColor: s.border,
          }}
        >
          {s.label}
        </button>
        {canExecute && (
          <ExecuteButton
            isExecuting={isExecuting}
            hasDraft={!!draft}
            onExecute={() => onExecute(mission)}
          />
        )}
      </div>

      {(draft || error) && (
        <DraftPanel
          draft={draft}
          error={error}
          onRegenerate={() => onExecute(mission)}
          onClear={() => onClearDraft(mission)}
          isExecuting={isExecuting}
        />
      )}
    </div>
  );
}

// ─── Execute button ───────────────────────────────────────────

function ExecuteButton({
  isExecuting,
  hasDraft,
  onExecute,
  big,
}: {
  isExecuting: boolean;
  hasDraft: boolean;
  onExecute: () => void;
  big?: boolean;
}) {
  const label = isExecuting
    ? "Generating…"
    : hasDraft
      ? "↻ Regenerate"
      : "✨ Execute with AI";

  const sizeClass = big
    ? "text-xs px-3 py-1.5"
    : "text-[11px] px-2.5 py-1";

  return (
    <button
      onClick={onExecute}
      disabled={isExecuting}
      className={`${sizeClass} font-semibold rounded-full cursor-pointer transition-colors border ${
        isExecuting
          ? "bg-accent/5 text-muted border-card-border cursor-wait"
          : "bg-accent/15 text-accent border-accent/30 hover:bg-accent/25"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Draft result panel ───────────────────────────────────────

function DraftPanel({
  draft,
  error,
  isExecuting,
  onRegenerate,
  onClear,
}: {
  draft?: DraftRecord;
  error?: string;
  isExecuting: boolean;
  onRegenerate: () => void;
  onClear: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!draft?.content) return;
    try {
      await navigator.clipboard.writeText(draft.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore — non-secure context, etc.
    }
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-400">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">Generation failed</span>
          <button
            onClick={onRegenerate}
            disabled={isExecuting}
            className="text-[11px] underline hover:no-underline cursor-pointer disabled:cursor-wait"
          >
            Retry
          </button>
        </div>
        <p className="mt-1 opacity-80">{error}</p>
      </div>
    );
  }

  if (!draft) return null;

  const hasTarget = !!draft.targetUrl;
  const alternates = draft.alternates ?? [];
  const hasVideo = !!draft.videoUrl;
  const videoPending = !draft.videoUrl && !!draft.videoProject;

  return (
    <div className="rounded-md border border-accent/20 bg-background/60 flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-card-border/50">
        <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
          Draft
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={copy}
            className="text-[11px] px-2 py-0.5 rounded border border-card-border text-muted hover:text-foreground cursor-pointer"
          >
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={onRegenerate}
            disabled={isExecuting}
            className="text-[11px] px-2 py-0.5 rounded border border-card-border text-muted hover:text-foreground cursor-pointer disabled:cursor-wait"
            title="Regenerate"
          >
            {isExecuting ? "…" : "↻"}
          </button>
          <button
            onClick={onClear}
            className="text-[11px] px-2 py-0.5 rounded border border-card-border text-muted hover:text-foreground cursor-pointer"
            title="Discard draft"
          >
            ✕
          </button>
        </div>
      </div>

      {hasTarget && (
        <div className="px-3 py-2.5 border-b border-card-border/50 bg-accent/5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">
            📍 Post here
          </p>
          <a
            href={draft.targetUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent underline break-all hover:no-underline"
          >
            {draft.targetUrl}
          </a>
          {alternates.length > 0 && (
            <details className="mt-2">
              <summary className="text-[11px] text-muted cursor-pointer hover:text-foreground">
                Alternates ({alternates.length})
              </summary>
              <ul className="mt-1.5 flex flex-col gap-1">
                {alternates.map((a, i) => (
                  <li key={i} className="text-[11px] text-muted leading-snug">
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent/80 underline break-all hover:no-underline"
                    >
                      {a.url}
                    </a>
                    {a.why && <span className="text-muted"> — {a.why}</span>}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {hasVideo && (
        <div className="px-3 py-2.5 border-b border-card-border/50 bg-accent/5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1.5">
            🎬 Rendered video
          </p>
          <video
            src={draft.videoUrl ?? ""}
            controls
            className="w-full max-w-sm rounded border border-card-border bg-black"
          />
          <a
            href={draft.videoUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-block text-[11px] text-accent underline break-all hover:no-underline"
          >
            {draft.videoUrl}
          </a>
        </div>
      )}

      {videoPending && (
        <div className="px-3 py-2.5 border-b border-card-border/50 bg-accent/5 text-[11px] text-muted">
          🎬 Video render in progress
          {draft.videoProject && (
            <span className="font-mono ml-1">({draft.videoProject})</span>
          )}
          . Regenerate in ~1 min if the player doesn&apos;t appear.
        </div>
      )}

      <pre className="text-xs text-foreground/85 whitespace-pre-wrap break-words leading-relaxed px-3 py-2.5 font-sans max-h-72 overflow-y-auto">
        {draft.content}
      </pre>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

function LoadCount({ label, value, tier }: { label: string; value: number; tier: LoadTier }) {
  const config = loadTierConfig[tier];
  return (
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded"
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      {value} {label}
    </span>
  );
}

function ScorePill({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  const color =
    value >= 7 ? "#22c55e" : value >= 5 ? "#f59e0b" : "#94a3b8";

  return (
    <div
      className={`text-center rounded px-1 py-1 ${
        highlight
          ? "bg-accent/10 border border-accent/20"
          : "bg-background/40 border border-card-border/30"
      }`}
    >
      <p className="font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-muted">{label}</p>
    </div>
  );
}
