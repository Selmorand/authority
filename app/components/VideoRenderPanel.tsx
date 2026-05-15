"use client";

import { useEffect, useRef, useState } from "react";
import { backgroundPresets } from "@/data/videoBackgroundPresets";

type Orientation = "portrait" | "landscape" | "square";

interface RenderStatus {
  success: boolean;
  status: "queued" | "running" | "done" | "error" | "unknown";
  movie?: {
    url?: string;
    duration?: number;
    width?: number;
    height?: number;
    size?: number;
  };
  message?: string;
  error?: string;
}

interface TemplateSummary {
  id: string;
  name: string;
  description: string;
  orientation: "portrait" | "square" | "landscape";
  width: number;
  height: number;
}

export default function VideoRenderPanel() {
  const [headline, setHeadline] = useState("Interon — AI Readiness");
  const [linesText, setLinesText] = useState(
    "Most websites are invisible to AI.\nSchema markup is not optional.\nEntity confidence is the new ranking signal.\nWe audited 300 sites.\nMost score below 40."
  );
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [secondsPerLine, setSecondsPerLine] = useState(4);
  const [backgroundUrl, setBackgroundUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [templateId, setTemplateId] = useState<string>("caption-stack");
  const [submitting, setSubmitting] = useState(false);
  const [project, setProject] = useState<string | null>(null);
  const [status, setStatus] = useState<RenderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/video/templates");
        const data = (await res.json()) as {
          success: boolean;
          templates: TemplateSummary[];
        };
        if (!cancelled && data.success) {
          setTemplates(data.templates);
          // If the current templateId isn't in the list, fall back to the first.
          if (data.templates.length > 0 && !data.templates.some((t) => t.id === templateId)) {
            setTemplateId(data.templates[0].id);
          }
        }
      } catch {
        // Non-fatal — UI just won't show templates.
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function pollOnce(p: string) {
    try {
      const res = await fetch(`/api/video/render?project=${encodeURIComponent(p)}`);
      const data = (await res.json()) as RenderStatus;
      setStatus(data);
      if (data.status === "done" || data.status === "error") return;
      pollTimer.current = setTimeout(() => pollOnce(p), 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Polling failed";
      setError(msg);
    }
  }

  async function handleUpload(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/video/upload", { method: "POST", body: form });
      const data = (await res.json()) as { success: boolean; url?: string; error?: string };
      if (!data.success || !data.url) {
        setUploadError(data.error ?? "Upload failed");
        return;
      }
      setBackgroundUrl(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleRender() {
    setError(null);
    setStatus(null);
    setProject(null);
    setSubmitting(true);
    if (pollTimer.current) clearTimeout(pollTimer.current);

    try {
      const lines = linesText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length === 0) {
        setError("Enter at least one caption line.");
        setSubmitting(false);
        return;
      }

      const res = await fetch("/api/video/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "caption-clip",
          templateId,
          lines,
          headline: headline.trim() || undefined,
          orientation,
          secondsPerLine,
          backgroundImageUrl: backgroundUrl.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        success: boolean;
        project?: string;
        error?: string;
      };

      if (!data.success || !data.project) {
        setError(data.error ?? "Render submission failed");
        setSubmitting(false);
        return;
      }

      setProject(data.project);
      setStatus({ success: true, status: "queued" });
      pollOnce(data.project);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Render failed");
    } finally {
      setSubmitting(false);
    }
  }

  const isWorking =
    submitting ||
    (status !== null && (status.status === "queued" || status.status === "running"));

  return (
    <div className="rounded-2xl bg-background-raised border border-card-border-subtle p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-tight">
            Video Auto-Render
          </h2>
          <p className="text-xs text-muted mt-1">
            JSON2Video caption-clip generator. Paste lines from a core asset → get a short MP4.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="text-xs text-muted uppercase tracking-wide">Template</span>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="mt-1 w-full bg-background border border-card-border-subtle rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent/60"
          >
            {templates.length === 0 && (
              <option value="caption-stack">Caption Stack (default)</option>
            )}
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.width}×{t.height}
              </option>
            ))}
          </select>
          {templates.find((t) => t.id === templateId)?.description && (
            <p className="mt-1 text-[11px] text-muted leading-snug">
              {templates.find((t) => t.id === templateId)?.description}
            </p>
          )}
        </label>

        <label className="block">
          <span className="text-xs text-muted uppercase tracking-wide">Headline (small text, bottom)</span>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="mt-1 w-full bg-background border border-card-border-subtle rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent/60"
            placeholder="Optional headline"
          />
        </label>

        <label className="block">
          <span className="text-xs text-muted uppercase tracking-wide">
            Caption lines (one per scene, max 12)
          </span>
          <textarea
            value={linesText}
            onChange={(e) => setLinesText(e.target.value)}
            rows={6}
            className="mt-1 w-full bg-background border border-card-border-subtle rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent/60 resize-y"
          />
        </label>

        <div className="space-y-2 p-3 rounded-lg border border-card-border-subtle bg-background">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted uppercase tracking-wide">Background image</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
              }}
              className="text-xs text-muted file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-accent/15 file:text-accent file:cursor-pointer cursor-pointer"
            />
          </div>

          {backgroundPresets.length > 0 && (
            <div className="space-y-2 pt-1">
              {/* "None" + grouped thumbnails */}
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setBackgroundUrl("")}
                  className={`flex-shrink-0 w-12 h-16 rounded border-2 cursor-pointer transition-colors flex items-center justify-center text-[10px] ${
                    backgroundUrl === ""
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-card-border-subtle bg-background-raised text-muted hover:border-accent/50"
                  }`}
                  title="No background image (solid colour only)"
                >
                  None
                </button>
              </div>

              {(["Committed", "Stock test"] as const).map((groupName) => {
                const groupItems = backgroundPresets.filter((p) => p.group === groupName);
                if (groupItems.length === 0) return null;
                return (
                  <div key={groupName} className="space-y-1">
                    <div className="text-[10px] uppercase tracking-wide text-muted">
                      {groupName}
                      {groupName === "Committed" && (
                        <span className="ml-1 text-foreground/40">
                          ({groupItems.filter((p) => p.inRotation).length} in rotation)
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {groupItems.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setBackgroundUrl(p.url)}
                          className={`relative w-12 h-16 rounded border-2 cursor-pointer overflow-hidden transition-colors ${
                            backgroundUrl === p.url
                              ? "border-accent"
                              : "border-card-border-subtle hover:border-accent/50"
                          }`}
                          title={`${p.label} — ${p.url}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.url}
                            alt={p.label}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                          />
                          {p.inRotation && (
                            <span
                              className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-accent shadow"
                              title="In daily rotation"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <input
            type="text"
            value={backgroundUrl}
            onChange={(e) => setBackgroundUrl(e.target.value)}
            placeholder="…or paste a public image URL"
            className="w-full bg-background-raised border border-card-border-subtle rounded px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent/60"
          />
          {uploading && <div className="text-xs text-muted">Uploading…</div>}
          {uploadError && (
            <div className="text-xs text-red-300">{uploadError}</div>
          )}
          {backgroundUrl && !uploading && !uploadError && (
            <div className="flex items-start gap-2 pt-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={backgroundUrl}
                alt="Background preview"
                className="w-20 h-20 object-cover rounded border border-card-border-subtle bg-black"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-muted break-all">{backgroundUrl}</div>
                <button
                  onClick={() => setBackgroundUrl("")}
                  className="text-[11px] text-accent underline hover:no-underline cursor-pointer mt-1"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
          <div className="text-[10px] text-muted leading-snug pt-1">
            ⚠️ Local-dev uploads aren&apos;t reachable by JSON2Video. To use uploaded
            files in a real render, deploy to Railway or paste a public URL above.
            For permanent backgrounds, commit images to <span className="font-mono">public/backgrounds/</span>.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-muted uppercase tracking-wide">Orientation</span>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as Orientation)}
              className="mt-1 w-full bg-background border border-card-border-subtle rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent/60"
            >
              <option value="portrait">Portrait 9:16 (Shorts/Reels/X)</option>
              <option value="square">Square 1:1 (LinkedIn/IG feed)</option>
              <option value="landscape">Landscape 16:9 (YouTube)</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-muted uppercase tracking-wide">Seconds per line</span>
            <input
              type="number"
              min={2}
              max={8}
              value={secondsPerLine}
              onChange={(e) => setSecondsPerLine(Number(e.target.value))}
              className="mt-1 w-full bg-background border border-card-border-subtle rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent/60"
            />
          </label>
        </div>

        <button
          onClick={handleRender}
          disabled={isWorking}
          className="text-sm px-4 py-2 rounded-lg bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isWorking ? "Rendering…" : "Render Video"}
        </button>
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-300 bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {project && (
        <div className="mt-5 space-y-3">
          <div className="text-xs text-muted">
            Project: <span className="font-mono">{project}</span>
            {status?.status && (
              <span className="ml-2 px-2 py-0.5 rounded bg-card-border-subtle text-foreground">
                {status.status}
              </span>
            )}
          </div>

          {status?.status === "done" && status.movie?.url && (
            <div className="space-y-2">
              <video
                src={status.movie.url}
                controls
                className="w-full max-w-md rounded-lg border border-card-border-subtle bg-black"
              />
              <a
                href={status.movie.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs text-accent hover:underline break-all"
              >
                {status.movie.url}
              </a>
              {(status.movie.duration || status.movie.size) && (
                <div className="text-xs text-muted">
                  {status.movie.duration ? `${status.movie.duration.toFixed(1)}s` : ""}
                  {status.movie.duration && status.movie.size ? " · " : ""}
                  {status.movie.size
                    ? `${Math.round(status.movie.size / 1024)} KB`
                    : ""}
                </div>
              )}
            </div>
          )}

          {status?.status === "error" && (
            <div className="text-sm text-red-300 bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2">
              {status.message ?? status.error ?? "Render failed"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
