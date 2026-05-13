"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

// ─── Platform config ──────────────────────────────────────────

const PLATFORMS = [
  { id: "linkedin",  label: "LinkedIn",  color: "#0a66c2" },
  { id: "x",         label: "X",         color: "#e2e8f0" },
  { id: "facebook",  label: "Facebook",  color: "#1877f2" },
  { id: "instagram", label: "Instagram", color: "#e1306c" },
  { id: "tiktok",    label: "TikTok",    color: "#69c9d0" },
  { id: "youtube",   label: "YouTube",   color: "#ff0000" },
  { id: "reddit",    label: "Reddit",    color: "#ff4500" },
  { id: "discord",   label: "Discord",   color: "#5865f2" },
  { id: "blog",      label: "Blog",      color: "#22c55e" },
] as const;

type PlatformId = (typeof PLATFORMS)[number]["id"];

interface PlatformRow {
  followers: string;
  impressions: string;
  engagement: string;
  postsCount: string;
}

interface AuthorityRow {
  brandedSearchVolume: string;
  externalMentions: string;
  backlinks: string;
  aiCitationOpportunities: string;
  semanticThemesCovered: string;
  founderVisibilityScore: string;
  entityConsistencyScore: string;
}

interface PlatformSnapshot {
  date: string;
  platform: string;
  followers: number | null;
  impressions: number | null;
  engagement: number | null;
  postsCount: number | null;
}

interface AuthoritySnapshot {
  date: string;
  brandedSearchVolume: number;
  externalMentions: number;
  backlinks: number;
  aiCitationOpportunities: number;
  semanticThemesCovered: number;
  founderVisibilityScore: number;
  entityConsistencyScore: number;
}

// ─── Helpers ──────────────────────────────────────────────────

function mondayOf(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const offset = (day + 6) % 7;
  d.setDate(d.getDate() - offset);
  return d.toISOString().split("T")[0];
}

function emptyPlatformRow(): PlatformRow {
  return { followers: "", impressions: "", engagement: "", postsCount: "" };
}

function emptyPlatformValues(): Record<PlatformId, PlatformRow> {
  return PLATFORMS.reduce((acc, p) => {
    acc[p.id] = emptyPlatformRow();
    return acc;
  }, {} as Record<PlatformId, PlatformRow>);
}

function emptyAuthority(): AuthorityRow {
  return {
    brandedSearchVolume: "",
    externalMentions: "",
    backlinks: "",
    aiCitationOpportunities: "",
    semanticThemesCovered: "",
    founderVisibilityScore: "",
    entityConsistencyScore: "",
  };
}

// ─── Component ────────────────────────────────────────────────

export default function MeasurementDashboard() {
  const [weekDate, setWeekDate] = useState<string>(() => mondayOf());
  // User edits keyed by date — survives across date toggles within a session.
  const [platformEdits, setPlatformEdits] = useState<
    Record<string, Partial<Record<PlatformId, PlatformRow>>>
  >({});
  const [authorityEdits, setAuthorityEdits] = useState<Record<string, Partial<AuthorityRow>>>({});
  const [platformHistory, setPlatformHistory] = useState<PlatformSnapshot[]>([]);
  const [authorityHistory, setAuthorityHistory] = useState<AuthoritySnapshot[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>("");

  // ── Load history (12 weeks) — async IIFE in effect ─────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [pRes, aRes] = await Promise.all([
          fetch("/api/measurement/platforms?weeks=12"),
          fetch("/api/measurement/authority?weeks=12"),
        ]);
        const pData = await pRes.json();
        const aData = await aRes.json();
        if (cancelled) return;
        if (pData.success) setPlatformHistory(pData.snapshots ?? []);
        if (aData.success) setAuthorityHistory(aData.snapshots ?? []);
      } catch {
        // soft-fail — empty state is fine
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // ── Derived: values shown in form = history(date) merged with edits ──
  const platformValues = useMemo<Record<PlatformId, PlatformRow>>(() => {
    const base = emptyPlatformValues();
    for (const row of platformHistory) {
      if (row.date === weekDate && PLATFORMS.some((p) => p.id === row.platform)) {
        base[row.platform as PlatformId] = {
          followers: row.followers != null ? String(row.followers) : "",
          impressions: row.impressions != null ? String(row.impressions) : "",
          engagement: row.engagement != null ? String(row.engagement) : "",
          postsCount: row.postsCount != null ? String(row.postsCount) : "",
        };
      }
    }
    const editsForDate = platformEdits[weekDate] ?? {};
    for (const p of PLATFORMS) {
      const e = editsForDate[p.id];
      if (e) base[p.id] = { ...base[p.id], ...e };
    }
    return base;
  }, [weekDate, platformHistory, platformEdits]);

  const authorityValues = useMemo<AuthorityRow>(() => {
    const a = authorityHistory.find((s) => s.date === weekDate);
    const base: AuthorityRow = a
      ? {
          brandedSearchVolume: String(a.brandedSearchVolume ?? ""),
          externalMentions: String(a.externalMentions ?? ""),
          backlinks: String(a.backlinks ?? ""),
          aiCitationOpportunities: String(a.aiCitationOpportunities ?? ""),
          semanticThemesCovered: String(a.semanticThemesCovered ?? ""),
          founderVisibilityScore: String(a.founderVisibilityScore ?? ""),
          entityConsistencyScore: String(a.entityConsistencyScore ?? ""),
        }
      : emptyAuthority();
    return { ...base, ...(authorityEdits[weekDate] ?? {}) };
  }, [weekDate, authorityHistory, authorityEdits]);

  const setPlatformValue = useCallback(
    (platform: PlatformId, next: PlatformRow) => {
      setPlatformEdits((prev) => ({
        ...prev,
        [weekDate]: { ...(prev[weekDate] ?? {}), [platform]: next },
      }));
    },
    [weekDate]
  );

  const setAuthorityValue = useCallback(
    (patch: Partial<AuthorityRow>) => {
      setAuthorityEdits((prev) => ({
        ...prev,
        [weekDate]: { ...(prev[weekDate] ?? {}), ...patch },
      }));
    },
    [weekDate]
  );

  // ── Save ───────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveMessage("");

    const platformPayload = PLATFORMS
      .map((p) => {
        const v = platformValues[p.id];
        if (!v) return null;
        const hasAny =
          v.followers || v.impressions || v.engagement || v.postsCount;
        if (!hasAny) return null;
        return {
          date: weekDate,
          platform: p.id,
          followers: v.followers === "" ? null : Number(v.followers),
          impressions: v.impressions === "" ? null : Number(v.impressions),
          engagement: v.engagement === "" ? null : Number(v.engagement),
          postsCount: v.postsCount === "" ? null : Number(v.postsCount),
        };
      })
      .filter((x) => x !== null);

    const authorityPayload = {
      date: weekDate,
      brandedSearchVolume: numOr(authorityValues.brandedSearchVolume),
      externalMentions: numOr(authorityValues.externalMentions),
      backlinks: numOr(authorityValues.backlinks),
      aiCitationOpportunities: numOr(authorityValues.aiCitationOpportunities),
      semanticThemesCovered: numOr(authorityValues.semanticThemesCovered),
      founderVisibilityScore: numOr(authorityValues.founderVisibilityScore),
      entityConsistencyScore: numOr(authorityValues.entityConsistencyScore),
    };

    try {
      const results = await Promise.all([
        platformPayload.length > 0
          ? fetch("/api/measurement/platforms", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ snapshots: platformPayload }),
            }).then((r) => r.json())
          : Promise.resolve({ success: true }),
        fetch("/api/measurement/authority", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(authorityPayload),
        }).then((r) => r.json()),
      ]);
      const ok = results.every((r) => r.success);
      setSaveMessage(ok ? "Saved" : "Save partially failed");
      // Clear local edits for this week — fresh load will reflect persisted state.
      setPlatformEdits((prev) => {
        const next = { ...prev };
        delete next[weekDate];
        return next;
      });
      setAuthorityEdits((prev) => {
        const next = { ...prev };
        delete next[weekDate];
        return next;
      });
      setReloadKey((k) => k + 1);
    } catch {
      setSaveMessage("Save failed");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 2500);
    }
  }, [authorityValues, platformValues, weekDate]);

  // ── Sparkline series (per platform, followers) ──────────────
  const followersByPlatform = useMemo(() => {
    const map: Record<string, { date: string; value: number }[]> = {};
    for (const p of PLATFORMS) map[p.id] = [];
    const sorted = [...platformHistory].sort((a, b) => a.date.localeCompare(b.date));
    for (const row of sorted) {
      if (!map[row.platform]) continue;
      if (row.followers != null) {
        map[row.platform].push({ date: row.date, value: row.followers });
      }
    }
    return map;
  }, [platformHistory]);

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            Measurement
          </h2>
          <p className="text-sm text-muted mt-0.5">
            Weekly snapshots of channel reach and authority signals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted">Week of</label>
          <input
            type="date"
            value={weekDate}
            onChange={(e) => setWeekDate(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-card-border bg-background/50 text-foreground"
          />
          <button
            onClick={() => setWeekDate(mondayOf())}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-accent/30 bg-accent/10 text-accent cursor-pointer transition-colors"
          >
            This week
          </button>
        </div>
      </div>

      {/* Per-platform input table */}
      <div className="rounded-lg border border-card-border bg-background/40">
        <div className="grid grid-cols-[110px_1fr_1fr_1fr_80px] gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted border-b border-card-border/50">
          <span>Platform</span>
          <span>Followers</span>
          <span>Impressions</span>
          <span>Engagement</span>
          <span>Posts</span>
        </div>
        {PLATFORMS.map((p) => (
          <PlatformInputRow
            key={p.id}
            label={p.label}
            color={p.color}
            value={platformValues[p.id]}
            onChange={(next) => setPlatformValue(p.id, next)}
          />
        ))}
      </div>

      {/* Cross-platform authority metrics */}
      <div className="rounded-lg border border-card-border bg-background/40 p-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2.5">
          Cross-platform authority
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          <AuthorityField
            label="Branded search"
            value={authorityValues.brandedSearchVolume}
            onChange={(v) => setAuthorityValue({ brandedSearchVolume: v })}
            hint="Monthly searches for 'Interon'"
          />
          <AuthorityField
            label="External mentions"
            value={authorityValues.externalMentions}
            onChange={(v) => setAuthorityValue({ externalMentions: v })}
            hint="Press / podcast / cited mentions this week"
          />
          <AuthorityField
            label="Backlinks"
            value={authorityValues.backlinks}
            onChange={(v) => setAuthorityValue({ backlinks: v })}
            hint="Total referring domains"
          />
          <AuthorityField
            label="AI citation ops"
            value={authorityValues.aiCitationOpportunities}
            onChange={(v) => setAuthorityValue({ aiCitationOpportunities: v })}
            hint="Queries you should be cited for"
          />
          <AuthorityField
            label="Themes covered"
            value={authorityValues.semanticThemesCovered}
            onChange={(v) => setAuthorityValue({ semanticThemesCovered: v })}
            hint="Distinct themes touched this week"
          />
          <AuthorityField
            label="Founder visibility"
            value={authorityValues.founderVisibilityScore}
            onChange={(v) => setAuthorityValue({ founderVisibilityScore: v })}
            hint="0–10 subjective score"
          />
          <AuthorityField
            label="Entity consistency"
            value={authorityValues.entityConsistencyScore}
            onChange={(v) => setAuthorityValue({ entityConsistencyScore: v })}
            hint="0–10 sameAs / bio drift"
          />
        </div>
      </div>

      {/* Save row */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs font-semibold px-4 py-2 rounded-full cursor-pointer transition-colors border bg-accent/15 text-accent border-accent/30 hover:bg-accent/25 disabled:cursor-wait"
        >
          {saving ? "Saving…" : "Save week"}
        </button>
        {saveMessage && (
          <span className="text-xs text-muted">{saveMessage}</span>
        )}
      </div>

      {/* Trends */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
          12-week followers trend
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {PLATFORMS.map((p) => {
            const series = followersByPlatform[p.id] ?? [];
            const last = series[series.length - 1]?.value;
            const prev = series[series.length - 2]?.value;
            const delta = last != null && prev != null ? last - prev : null;
            return (
              <div
                key={p.id}
                className="rounded-md border border-card-border bg-background/40 px-3 py-2.5 flex items-center justify-between gap-3"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: p.color }}>
                    {p.label}
                  </span>
                  <span className="text-sm font-semibold text-foreground-bright">
                    {last != null ? formatNumber(last) : "—"}
                  </span>
                  {delta != null && (
                    <span
                      className="text-[10px]"
                      style={{ color: delta > 0 ? "#22c55e" : delta < 0 ? "#ef4444" : "#94a3b8" }}
                    >
                      {delta > 0 ? "+" : ""}
                      {formatNumber(delta)} vs prev
                    </span>
                  )}
                </div>
                <Sparkline values={series.map((s) => s.value)} color={p.color} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Subcomponents ────────────────────────────────────────────

function PlatformInputRow({
  label,
  color,
  value,
  onChange,
}: {
  label: string;
  color: string;
  value: PlatformRow;
  onChange: (next: PlatformRow) => void;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr_1fr_1fr_80px] gap-2 px-3 py-1.5 items-center border-b border-card-border/30 last:border-b-0">
      <span
        className="text-xs font-semibold tracking-wide truncate"
        style={{ color }}
      >
        {label}
      </span>
      <NumberInput
        value={value.followers}
        onChange={(v) => onChange({ ...value, followers: v })}
      />
      <NumberInput
        value={value.impressions}
        onChange={(v) => onChange({ ...value, impressions: v })}
      />
      <NumberInput
        value={value.engagement}
        onChange={(v) => onChange({ ...value, engagement: v })}
      />
      <NumberInput
        value={value.postsCount}
        onChange={(v) => onChange({ ...value, postsCount: v })}
      />
    </div>
  );
}

function NumberInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-xs px-2 py-1 rounded border border-card-border bg-background/60 text-foreground focus:border-accent/50 focus:outline-none"
      placeholder="—"
      min={0}
    />
  );
}

function AuthorityField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted">
        {label}
      </span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs px-2 py-1 rounded border border-card-border bg-background/60 text-foreground focus:border-accent/50 focus:outline-none"
        placeholder="—"
        min={0}
      />
      {hint && <span className="text-[10px] text-muted italic">{hint}</span>}
    </label>
  );
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) {
    return (
      <span className="text-[10px] text-muted italic shrink-0">
        {values.length === 1 ? "1 point" : "no data"}
      </span>
    );
  }
  const width = 90;
  const height = 24;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      width={width}
      height={height}
      className="shrink-0"
      role="img"
      aria-label="trend"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
    </svg>
  );
}

// ─── Utils ────────────────────────────────────────────────────

function numOr(v: string): number {
  if (v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (abs >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return n.toLocaleString();
}
