"use client";

import { useCallback, useEffect, useState } from "react";

interface CommentTarget {
  id: string;
  platform: string;
  source: string;
  url: string;
  postTitle: string | null;
  postSnippet: string | null;
  postAuthor: string | null;
  postMetric: string | null;
  pillar: string | null;
  topicKeyword: string | null;
  draftComment: string | null;
  status: string;
  postedAt: string | null;
  discoveredAt: string;
}

interface ListResponse {
  success: boolean;
  targets: CommentTarget[];
  error?: string;
}

interface DiscoverResponse {
  success: boolean;
  saved?: number;
  skipped?: number;
  reddit?: { available: boolean; error?: string };
  youtube?: { available: boolean; error?: string };
  error?: string;
}

const platformLabels: Record<string, string> = {
  reddit: "Reddit",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  tiktok: "TikTok",
  discord: "Discord",
};

const platformColors: Record<string, string> = {
  reddit: "#ff4500",
  youtube: "#ff0000",
  linkedin: "#0a66c2",
  facebook: "#1877f2",
  tiktok: "#000000",
  discord: "#5865f2",
};

export default function CommentRadar() {
  const [targets, setTargets] = useState<CommentTarget[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/comment-radar?status=${statusFilter}`);
      const data = (await res.json()) as ListResponse;
      if (data.success) setTargets(data.targets);
      else {
        setTargets([]);
        setError(data.error ?? "Failed to load");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDiscover = useCallback(async () => {
    setDiscovering(true);
    setStatus("Scanning Reddit + YouTube… this can take 30-90 seconds.");
    setError(null);
    try {
      const res = await fetch("/api/comment-radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "discover" }),
      });
      const data = (await res.json()) as DiscoverResponse;
      if (!data.success) {
        setError(data.error ?? "Discovery failed");
        setStatus(null);
        return;
      }
      const parts: string[] = [];
      parts.push(`Saved ${data.saved ?? 0} new targets`);
      if (data.skipped) parts.push(`skipped ${data.skipped} (duplicates or off-topic)`);
      if (data.reddit && !data.reddit.available) parts.push(`Reddit: ${data.reddit.error ?? "unavailable"}`);
      if (data.youtube && !data.youtube.available) parts.push(`YouTube: ${data.youtube.error ?? "unavailable"}`);
      setStatus(parts.join(" · "));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Discovery failed");
      setStatus(null);
    } finally {
      setDiscovering(false);
    }
  }, [load]);

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            Comment Radar
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Posts worth replying to across 6 platforms. Reddit + YouTube auto-discovered;
            paste URLs for the rest. Every row arrives with a draft comment ready to copy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-background-raised border border-card-border-subtle rounded-md px-2 py-1.5 text-foreground cursor-pointer"
          >
            <option value="pending">Pending</option>
            <option value="posted">Posted</option>
            <option value="ignored">Ignored</option>
            <option value="all">All</option>
          </select>
          <button
            onClick={handleDiscover}
            disabled={discovering}
            className="text-xs px-3 py-1.5 rounded-lg bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {discovering ? "Scanning…" : "Scan Reddit + YouTube"}
          </button>
        </div>
      </div>

      <ManualAddForm onAdded={load} />

      {status && !error && (
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 text-xs text-accent/80">
          {status}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-400 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {loading && targets.length === 0 ? (
        <p className="text-xs text-muted">Loading…</p>
      ) : targets.length === 0 ? (
        <p className="text-xs text-muted leading-relaxed bg-background-raised border border-card-border-subtle rounded-lg px-3 py-3">
          No {statusFilter} comment targets. Click <em>Scan Reddit + YouTube</em> to surface
          discussions worth replying to, or paste a URL above for any platform.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {targets.map((t) => (
            <TargetCard key={t.id} target={t} onChange={load} />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Manual add form ────────────────────────────────────────

function ManualAddForm({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState("linkedin");
  const [url, setUrl] = useState("");
  const [snippet, setSnippet] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!url) {
      setErr("URL is required");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/comment-radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "manual",
          platform,
          url,
          postSnippet: snippet || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setErr(data.error ?? "Failed to add");
        return;
      }
      setUrl("");
      setSnippet("");
      setOpen(false);
      onAdded();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-card-border-subtle bg-background-raised/50">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 text-xs text-left text-foreground/80 hover:text-foreground-bright cursor-pointer flex items-center justify-between"
      >
        <span>{open ? "▼" : "▶"} Paste a URL from LinkedIn / Facebook / TikTok / Discord</span>
        <span className="text-muted">{open ? "Cancel" : "Add manually"}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="text-xs bg-background border border-card-border-subtle rounded-md px-2 py-1.5 text-foreground cursor-pointer"
            >
              <option value="linkedin">LinkedIn</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
              <option value="discord">Discord</option>
              <option value="reddit">Reddit</option>
              <option value="youtube">YouTube</option>
            </select>
            <input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 text-xs bg-background border border-card-border-subtle rounded-md px-2 py-1.5 text-foreground"
            />
          </div>
          <textarea
            placeholder="(optional) Paste the post text so the AI has context"
            value={snippet}
            onChange={(e) => setSnippet(e.target.value)}
            className="min-h-[60px] text-xs bg-background border border-card-border-subtle rounded-md px-2 py-1.5 text-foreground resize-y"
          />
          {err && <p className="text-xs text-red-400">{err}</p>}
          <button
            onClick={submit}
            disabled={busy}
            className="self-end text-xs px-3 py-1.5 rounded bg-accent/15 border border-accent/30 text-accent hover:bg-accent/25 disabled:opacity-40 cursor-pointer"
          >
            {busy ? "Drafting comment…" : "Draft comment for this post"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Target card ────────────────────────────────────────────

function TargetCard({ target, onChange }: { target: CommentTarget; onChange: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(target.draftComment ?? "");

  useEffect(() => {
    setDraft(target.draftComment ?? "");
  }, [target.draftComment]);

  const platformLabel = platformLabels[target.platform] ?? target.platform;
  const platformColor = platformColors[target.platform] ?? "#94a3b8";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(target.draftComment ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const setStatus = async (next: string) => {
    setBusy(next);
    try {
      await fetch("/api/comment-radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", id: target.id, status: next }),
      });
      onChange();
    } finally {
      setBusy(null);
    }
  };

  const regenerate = async () => {
    setBusy("regen");
    try {
      await fetch("/api/comment-radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "regenerate", id: target.id }),
      });
      onChange();
    } finally {
      setBusy(null);
    }
  };

  const saveEdit = async () => {
    setBusy("save");
    try {
      await fetch("/api/comment-radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", id: target.id, draftComment: draft }),
      });
      setEditing(false);
      onChange();
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    setBusy("delete");
    try {
      await fetch("/api/comment-radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: target.id }),
      });
      onChange();
    } finally {
      setBusy(null);
    }
  };

  const copyAndOpen = async () => {
    await copy();
    window.open(target.url, "_blank", "noopener,noreferrer");
  };

  const isPosted = target.status === "posted";
  const isIgnored = target.status === "ignored";

  return (
    <div
      className={`rounded-lg border border-card-border-subtle bg-background-raised transition-opacity ${
        isPosted || isIgnored ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-card-border-subtle/60">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded uppercase tracking-wider"
              style={{ backgroundColor: `${platformColor}15`, color: platformColor }}
            >
              {platformLabel}
            </span>
            {target.pillar && (
              <span className="text-xs text-muted uppercase tracking-wider">
                {target.pillar}
              </span>
            )}
            {target.topicKeyword && (
              <span className="text-xs text-muted">· {target.topicKeyword}</span>
            )}
            {isPosted && (
              <span className="text-xs text-green-400 font-medium">posted ✓</span>
            )}
            {isIgnored && <span className="text-xs text-muted">ignored</span>}
          </div>
          <h3 className="text-sm font-medium text-foreground-bright leading-snug">
            {target.postTitle ?? target.url}
          </h3>
          {target.postAuthor && (
            <p className="text-xs text-muted mt-0.5">
              {target.postAuthor}
              {target.postMetric && <span> · {target.postMetric}</span>}
            </p>
          )}
          {target.postSnippet && (
            <p className="text-xs text-foreground/70 mt-1.5 leading-relaxed line-clamp-3">
              {target.postSnippet}
            </p>
          )}
          <a
            href={target.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:text-accent/80 mt-2 inline-block break-all"
          >
            {target.url}
          </a>
        </div>
      </div>

      {target.draftComment && (
        <div className="px-4 py-3">
          {editing ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full min-h-[120px] text-xs font-mono bg-background border border-card-border rounded-md px-3 py-2 text-foreground leading-relaxed resize-y"
            />
          ) : (
            <div className="rounded-md border border-accent/15 bg-accent/5 px-3 py-2.5">
              <p className="text-xs font-medium text-accent/80 uppercase tracking-wider mb-1">
                Draft comment
              </p>
              <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {target.draftComment}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap px-4 py-2.5 border-t border-card-border-subtle/60 bg-background/30">
        {!editing ? (
          <>
            <button
              onClick={copy}
              disabled={!target.draftComment}
              className="text-xs px-2.5 py-1 rounded border border-card-border-subtle bg-background-raised hover:bg-card-bg text-foreground disabled:opacity-40 cursor-pointer"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
            <button
              onClick={copyAndOpen}
              disabled={!target.draftComment}
              className="text-xs px-2.5 py-1 rounded border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 disabled:opacity-40 cursor-pointer"
            >
              Copy + Open post
            </button>
            <button
              onClick={() => setEditing(true)}
              disabled={!target.draftComment}
              className="text-xs px-2.5 py-1 rounded border border-card-border-subtle bg-background-raised hover:bg-card-bg text-foreground disabled:opacity-40 cursor-pointer"
            >
              Edit
            </button>
            <button
              onClick={regenerate}
              disabled={busy !== null}
              className="text-xs px-2.5 py-1 rounded border border-card-border-subtle bg-background-raised hover:bg-card-bg text-foreground disabled:opacity-40 cursor-pointer"
            >
              {busy === "regen" ? "Regenerating…" : "Regenerate"}
            </button>
            <div className="flex-1" />
            {!isPosted && (
              <button
                onClick={() => setStatus("posted")}
                disabled={busy !== null}
                className="text-xs px-3 py-1 rounded bg-green-500/15 border border-green-500/40 text-green-400 hover:bg-green-500/25 disabled:opacity-40 cursor-pointer"
              >
                {busy === "posted" ? "Saving…" : "Mark posted"}
              </button>
            )}
            {!isIgnored && !isPosted && (
              <button
                onClick={() => setStatus("ignored")}
                disabled={busy !== null}
                className="text-xs px-2.5 py-1 rounded border border-card-border-subtle bg-background-raised hover:bg-card-bg text-muted disabled:opacity-40 cursor-pointer"
              >
                Ignore
              </button>
            )}
            {(isPosted || isIgnored) && (
              <button
                onClick={() => setStatus("pending")}
                disabled={busy !== null}
                className="text-xs px-2.5 py-1 rounded border border-card-border-subtle bg-background-raised hover:bg-card-bg text-muted disabled:opacity-40 cursor-pointer"
              >
                Reopen
              </button>
            )}
            <button
              onClick={remove}
              disabled={busy !== null}
              className="text-xs px-2.5 py-1 rounded border border-card-border-subtle bg-background-raised hover:bg-red-500/10 text-muted hover:text-red-400 disabled:opacity-40 cursor-pointer"
            >
              Delete
            </button>
          </>
        ) : (
          <>
            <button
              onClick={saveEdit}
              disabled={busy !== null}
              className="text-xs px-3 py-1 rounded bg-accent/15 border border-accent/30 text-accent hover:bg-accent/25 cursor-pointer"
            >
              {busy === "save" ? "Saving…" : "Save edits"}
            </button>
            <button
              onClick={() => {
                setDraft(target.draftComment ?? "");
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
