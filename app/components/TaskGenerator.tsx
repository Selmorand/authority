"use client";

import { useCallback, useEffect, useState } from "react";

interface Mission {
  id: string;
  date: string;
  title: string;
  pillar: string | null;
  taskType: string | null;
  platform: string;
  effortLevel: string | null;
  postType: string | null;
  estimatedTime: string;
  objective: string;
  contentAngle: string | null;
  draftContent: string | null;
  draftFormat: string | null;
  publishStatus: string;
  publishedUrl: string | null;
  publishTarget: string | null;
  howToPublish: string | null;
  imagePrompt: string | null;
  firstComment: string | null;
  createdAt: string;
}

interface MissionsResponse {
  success: boolean;
  missions: Mission[];
  error?: string;
}

interface GenerateResponse {
  success: boolean;
  missions: Mission[];
  saved?: number;
  filtered?: number;
  error?: string;
}

const pillarLabels: Record<string, string> = {
  "website-health": "Website Health",
  "ai-visibility-geo": "AI Visibility / GEO",
  "agentic-automation": "Agentic Automation",
  "business-systems": "Business Systems",
  "trust-security-risk": "Trust / Security / Risk",
  "practical-ai-owners": "Practical AI for Owners",
  "digital-authority": "Digital Authority",
  "behind-the-scenes": "Behind the Scenes",
};

const statusColors: Record<string, string> = {
  idea: "#94a3b8",
  draft: "#38bdf8",
  approved: "#22c55e",
  scheduled: "#a855f7",
  published: "#22c55e",
};

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export default function TaskGenerator() {
  // Initialize to empty string on the server so SSR + first client render
  // produce identical HTML; then set the real "today" inside useEffect.
  const [date, setDate] = useState<string>("");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!date) setDate(todayStr());
  }, [date]);

  const loadMissions = useCallback(async (forDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/missions?date=${forDate}`);
      const data: MissionsResponse = await res.json();
      if (data.success) {
        setMissions(data.missions);
      } else {
        setMissions([]);
        setError(
          data.error
            ? `Couldn't load tasks for ${forDate}: ${data.error}`
            : `Couldn't load tasks for ${forDate} (HTTP ${res.status}).`
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load missions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (date) void loadMissions(date);
  }, [date, loadMissions]);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setError(null);
    setLastStatus("Sending request to /api/missions/generate…");
    try {
      const recentTitles = missions.map((m) => m.title);
      const startedAt = Date.now();
      const res = await fetch("/api/missions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, count: 5, recentTitles }),
      });
      const elapsed = Math.round((Date.now() - startedAt) / 1000);
      setLastStatus(`HTTP ${res.status} after ${elapsed}s — parsing response…`);

      let data: GenerateResponse;
      try {
        data = (await res.json()) as GenerateResponse;
      } catch (parseErr) {
        const text = await res.text().catch(() => "(no body)");
        setError(
          `Server returned HTTP ${res.status} with non-JSON body: ${text.slice(0, 200)}`
        );
        setLastStatus(null);
        return;
      }

      if (!res.ok || !data.success) {
        setError(
          data.error ??
            `Server returned HTTP ${res.status} (success=${String(data.success)})`
        );
        setLastStatus(null);
        return;
      }

      setLastStatus(
        `Generated ${data.missions?.length ?? 0} tasks` +
          (typeof data.saved === "number"
            ? ` · saved ${data.saved} · filtered ${data.filtered ?? 0}`
            : "")
      );
      await loadMissions(date);
    } catch (e) {
      setError(
        e instanceof Error
          ? `Network/client error: ${e.message}`
          : "Generation failed (unknown error)"
      );
      setLastStatus(null);
    } finally {
      setGenerating(false);
    }
  }, [date, missions, loadMissions]);

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            Tasks &amp; Drafts
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Generate, review, approve. Drafts arrive ready to copy and post.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-xs bg-background-raised border border-card-border-subtle rounded-md px-2 py-1.5 text-foreground"
          />
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="text-xs px-3 py-1.5 rounded-lg bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {generating ? "Generating drafts…" : "Generate today's tasks"}
          </button>
        </div>
      </div>

      {lastStatus && !error && (
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 text-xs text-accent/80">
          {lastStatus}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-400 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {loading && missions.length === 0 ? (
        <p className="text-xs text-muted">Loading…</p>
      ) : missions.length === 0 ? (
        <p className="text-xs text-muted leading-relaxed bg-background-raised border border-card-border-subtle rounded-lg px-3 py-3">
          No tasks for {date}. Click <em>Generate today&apos;s tasks</em> to have
          Claude draft a set of pillar-balanced tasks for the day. Each task
          arrives with its full deliverable already written.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {missions.map((m) => (
            <MissionCard key={m.id} mission={m} onChange={() => loadMissions(date)} />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Card ────────────────────────────────────────────────────

function MissionCard({
  mission,
  onChange,
}: {
  mission: Mission;
  onChange: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>(mission.draftContent ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDraft(mission.draftContent ?? "");
  }, [mission.draftContent]);

  const pillarLabel =
    (mission.pillar && pillarLabels[mission.pillar]) ?? mission.pillar ?? "—";
  const statusColor = statusColors[mission.publishStatus] ?? "#94a3b8";

  const handleRegenerate = async () => {
    setBusy("regenerating");
    try {
      const res = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "regenerate-draft", id: mission.id }),
      });
      const data = await res.json();
      if (data.success) onChange();
    } finally {
      setBusy(null);
    }
  };

  const handleSaveEdit = async () => {
    setBusy("saving");
    try {
      await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-draft",
          id: mission.id,
          draftContent: draft,
        }),
      });
      setEditing(false);
      onChange();
    } finally {
      setBusy(null);
    }
  };

  const handleApprove = async () => {
    setBusy("approving");
    try {
      await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-draft",
          id: mission.id,
          publishStatus: "approved",
        }),
      });
      onChange();
    } finally {
      setBusy(null);
    }
  };

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const copyTo = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // clipboard rejected — fall through silently
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mission.draftContent ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard rejected — fall through silently
    }
  };

  return (
    <div className="rounded-lg border border-card-border-subtle bg-background-raised">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-card-border-subtle/60">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${statusColor}15`,
                color: statusColor,
              }}
            >
              {mission.publishStatus}
            </span>
            <span className="text-xs text-muted uppercase tracking-wider">
              {pillarLabel}
            </span>
            <span className="text-xs text-muted">|</span>
            <span className="text-xs text-foreground/70">{mission.taskType ?? mission.platform}</span>
            <span className="text-xs text-muted">|</span>
            <span className="text-xs text-muted">{mission.estimatedTime}</span>
          </div>
          <h3 className="text-sm font-medium text-foreground-bright leading-snug">
            {mission.title}
          </h3>
          {mission.contentAngle && (
            <p className="text-xs text-muted mt-0.5">{mission.contentAngle}</p>
          )}
          {/* Publish target + playbook — the "where + how" answer */}
          {(mission.publishTarget || mission.howToPublish) && (
            <div className="mt-2.5 rounded-md border border-accent/20 bg-accent/5 px-2.5 py-2">
              {mission.publishTarget && (
                <p className="text-xs text-accent/90 font-medium">
                  <span className="text-muted font-normal">Publish to:</span>{" "}
                  {mission.publishTarget}
                </p>
              )}
              {mission.howToPublish && (
                <p className="text-xs text-foreground/80 mt-1 leading-relaxed">
                  <span className="text-muted">How:</span> {mission.howToPublish}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Draft body */}
      {mission.draftContent && (
        <div className="px-4 py-3">
          {editing ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full min-h-[200px] text-xs font-mono bg-background border border-card-border rounded-md px-3 py-2 text-foreground leading-relaxed resize-y"
            />
          ) : (
            <div
              className={`text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap font-mono ${
                expanded ? "" : "max-h-32 overflow-hidden relative"
              }`}
            >
              {mission.draftContent}
              {!expanded && mission.draftContent.length > 300 && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background-raised to-transparent pointer-events-none" />
              )}
            </div>
          )}
          {!editing && mission.draftContent.length > 300 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-accent mt-2 hover:text-accent/80 cursor-pointer"
            >
              {expanded ? "Show less" : "Show full draft"}
            </button>
          )}
        </div>
      )}

      {/* Image prompt */}
      {mission.imagePrompt && (
        <div className="px-4 pb-3">
          <div className="rounded-md border border-purple-500/20 bg-purple-500/5 px-3 py-2.5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-purple-400 uppercase tracking-wider">
                Image prompt
              </p>
              <button
                onClick={() => copyTo(mission.imagePrompt ?? "", "image")}
                className="text-xs px-2 py-0.5 rounded border border-card-border-subtle bg-background-raised hover:bg-card-bg text-foreground cursor-pointer"
              >
                {copiedField === "image" ? "Copied ✓" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-foreground/85 leading-relaxed">
              {mission.imagePrompt}
            </p>
          </div>
        </div>
      )}

      {/* First comment (LinkedIn) */}
      {mission.firstComment && (
        <div className="px-4 pb-3">
          <div className="rounded-md border border-blue-500/25 bg-blue-500/5 px-3 py-2.5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-blue-400 uppercase tracking-wider">
                First comment (post this immediately after the body)
              </p>
              <button
                onClick={() => copyTo(mission.firstComment ?? "", "firstComment")}
                className="text-xs px-2 py-0.5 rounded border border-card-border-subtle bg-background-raised hover:bg-card-bg text-foreground cursor-pointer"
              >
                {copiedField === "firstComment" ? "Copied ✓" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-foreground/85 leading-relaxed whitespace-pre-wrap">
              {mission.firstComment}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap px-4 py-2.5 border-t border-card-border-subtle/60 bg-background/30">
        {!editing ? (
          <>
            <button
              onClick={handleCopy}
              disabled={!mission.draftContent}
              className="text-xs px-2.5 py-1 rounded border border-card-border-subtle bg-background-raised hover:bg-card-bg text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
            <button
              onClick={() => setEditing(true)}
              disabled={!mission.draftContent}
              className="text-xs px-2.5 py-1 rounded border border-card-border-subtle bg-background-raised hover:bg-card-bg text-foreground disabled:opacity-40 cursor-pointer"
            >
              Edit
            </button>
            <button
              onClick={handleRegenerate}
              disabled={busy !== null}
              className="text-xs px-2.5 py-1 rounded border border-card-border-subtle bg-background-raised hover:bg-card-bg text-foreground disabled:opacity-40 cursor-pointer"
            >
              {busy === "regenerating" ? "Regenerating…" : "Regenerate"}
            </button>
            <div className="flex-1" />
            {mission.publishStatus !== "approved" && (
              <button
                onClick={handleApprove}
                disabled={busy !== null || !mission.draftContent}
                className="text-xs px-3 py-1 rounded bg-green-500/15 border border-green-500/40 text-green-400 hover:bg-green-500/25 disabled:opacity-40 cursor-pointer"
              >
                {busy === "approving" ? "Approving…" : "Approve"}
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={handleSaveEdit}
              disabled={busy !== null}
              className="text-xs px-3 py-1 rounded bg-accent/15 border border-accent/30 text-accent hover:bg-accent/25 cursor-pointer"
            >
              {busy === "saving" ? "Saving…" : "Save edits"}
            </button>
            <button
              onClick={() => {
                setDraft(mission.draftContent ?? "");
                setEditing(false);
              }}
              className="text-xs px-3 py-1 rounded border border-card-border-subtle bg-background-raised hover:bg-card-bg text-foreground cursor-pointer"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
