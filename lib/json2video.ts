// ─── JSON2Video Client ───────────────────────────────────────
// Minimal client for JSON2Video's REST API. Used to render
// caption-overlay video clips from core asset content as part
// of the 1→many reinforcement model (one written asset →
// multiple short video derivatives).
//
// Docs: https://json2video.com/docs/v2/api-reference/api-endpoints/movies

const J2V_BASE = "https://api.json2video.com/v2";

// JSON2Video schema notes:
//   * Field names are HYPHENATED (background-color, font-family, ...).
//   * CSS-style properties live in a nested `settings` object on
//     text elements (font-size is a CSS string like "96px", not 96).
//   * Top-level element properties include position, x/y, duration,
//     fade-in, fade-out, width, height, start, and type-specific
//     fields (text, src, voice).

export interface J2VTextSettings {
  "font-family"?: string;
  "font-size"?: string;       // CSS string, e.g. "96px"
  "font-weight"?: string;     // "400" | "700" | ...
  "font-color"?: string;
  "background-color"?: string;
  "text-align"?: "left" | "center" | "right";
  // Allow other CSS properties through
  [key: string]: unknown;
}

export interface J2VElement {
  type: "text" | "image" | "video" | "audio" | "subtitles" | "voice" | "html" | "component";
  // Position
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center-center" | "custom";
  "vertical-position"?: "top" | "center" | "bottom";
  "horizontal-position"?: "left" | "center" | "right";
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  // Timing
  start?: number;
  duration?: number;
  "fade-in"?: number;
  "fade-out"?: number;
  // Text-specific
  text?: string;
  settings?: J2VTextSettings;
  // Media-specific
  src?: string;
  // Voice-specific (ElevenLabs etc.)
  voice?: string;
  model?: string;
  // Allow extension without ceremony
  [key: string]: unknown;
}

export interface J2VScene {
  duration?: number;
  "background-color"?: string;
  elements: J2VElement[];
  [key: string]: unknown;
}

export interface J2VMovieSpec {
  scenes: J2VScene[];
  resolution?: "sd" | "hd" | "full-hd";
  width?: number;
  height?: number;
  quality?: "low" | "medium" | "high";
  cache?: boolean;
  [key: string]: unknown;
}

export interface J2VSubmitResponse {
  success: boolean;
  project?: string;
  timestamp?: string;
  error?: string;
}

export interface J2VStatusResponse {
  success: boolean;
  project?: string;
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

function getKey(): string | null {
  const k = process.env.JSON2VIDEO_API_KEY;
  return k && k.length > 0 ? k : null;
}

// ─── Submit a movie ─────────────────────────────────────────

export async function submitMovie(spec: J2VMovieSpec): Promise<J2VSubmitResponse> {
  const apiKey = getKey();
  if (!apiKey) {
    return { success: false, error: "JSON2VIDEO_API_KEY is not configured" };
  }

  // Log the spec so Railway logs show what we sent (truncated to keep
  // logs sane). Useful when JSON2Video silently drops elements.
  try {
    const summary = JSON.stringify(spec).slice(0, 4000);
    console.log("[json2video] submit spec:", summary);
  } catch {
    // best-effort logging
  }

  try {
    const response = await fetch(`${J2V_BASE}/movies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(spec),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("[json2video] submit failed:", response.status, text);
      return {
        success: false,
        error: `JSON2Video ${response.status}: ${text || response.statusText}`,
      };
    }

    const data = (await response.json()) as {
      success?: boolean;
      project?: string;
      timestamp?: string;
      message?: string;
    };

    console.log("[json2video] submit response:", JSON.stringify(data));

    if (!data.success || !data.project) {
      return {
        success: false,
        error: data.message || "JSON2Video accepted but returned no project id",
      };
    }

    return { success: true, project: data.project, timestamp: data.timestamp };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[json2video] submit threw:", message);
    return { success: false, error: message };
  }
}

// ─── Check render status ────────────────────────────────────

export async function getMovieStatus(project: string): Promise<J2VStatusResponse> {
  const apiKey = getKey();
  if (!apiKey) {
    return { success: false, status: "unknown", error: "JSON2VIDEO_API_KEY is not configured" };
  }

  try {
    const response = await fetch(
      `${J2V_BASE}/movies?project=${encodeURIComponent(project)}`,
      {
        method: "GET",
        headers: { "x-api-key": apiKey },
      }
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return {
        success: false,
        status: "unknown",
        error: `JSON2Video ${response.status}: ${text || response.statusText}`,
      };
    }

    const data = (await response.json()) as {
      success?: boolean;
      project?: string;
      movie?: {
        status?: string;
        url?: string;
        duration?: number;
        width?: number;
        height?: number;
        size?: number;
        message?: string;
      };
      message?: string;
    };

    const rawStatus = (data.movie?.status ?? "unknown").toLowerCase();
    const status: J2VStatusResponse["status"] =
      rawStatus === "done" ? "done" :
      rawStatus === "running" ? "running" :
      rawStatus === "queued" ? "queued" :
      rawStatus === "error" ? "error" :
      "unknown";

    if (status === "done" || status === "error") {
      console.log("[json2video] status final:", JSON.stringify(data));
    }

    return {
      success: data.success !== false,
      project: data.project,
      status,
      movie: data.movie
        ? {
            url: data.movie.url,
            duration: data.movie.duration,
            width: data.movie.width,
            height: data.movie.height,
            size: data.movie.size,
          }
        : undefined,
      message: data.movie?.message ?? data.message,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[json2video] status threw:", message);
    return { success: false, status: "unknown", error: message };
  }
}

// ─── Poll until done or timeout ────────────────────────────

export async function pollUntilDone(
  project: string,
  opts: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<J2VStatusResponse> {
  const interval = opts.intervalMs ?? 4000;
  const timeout = opts.timeoutMs ?? 180_000; // 3 min default
  const started = Date.now();

  while (Date.now() - started < timeout) {
    const s = await getMovieStatus(project);
    if (s.status === "done" || s.status === "error") return s;
    if (!s.success) return s;
    await new Promise((r) => setTimeout(r, interval));
  }

  return {
    success: false,
    status: "unknown",
    error: `Render timed out after ${Math.round(timeout / 1000)}s`,
  };
}

// Caption-clip rendering is now handled by the template loader in
// lib/videoTemplates.ts (driven by JSON files in data/videoTemplates/).
// The previous hand-rolled buildCaptionClip() helper has been removed —
// see git history if you need the reference implementation.
