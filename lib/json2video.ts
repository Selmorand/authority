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

    if (!data.success || !data.project) {
      return {
        success: false,
        error: data.message || "JSON2Video accepted but returned no project id",
      };
    }

    return { success: true, project: data.project, timestamp: data.timestamp };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
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

// ─── Template helpers ──────────────────────────────────────
// Build common JSON2Video movie specs without making the caller
// learn the full JSON schema.

export interface CaptionClipOptions {
  // The text shown as caption sequence — split into 1-line slides.
  lines: string[];
  // Background hex color, used when no background image is set.
  backgroundColor?: string;
  // Optional full-frame background image URL. Must be publicly reachable
  // by JSON2Video's servers. When set, a 60%-opacity dark overlay sits
  // between the image and the text so white captions stay readable.
  backgroundImageUrl?: string;
  // Base seconds per caption line. Actual duration scales with text length.
  // Default 3.2s.
  secondsPerLine?: number;
  // Vertical 9:16 by default (Shorts/Reels/IG/TikTok).
  orientation?: "portrait" | "landscape" | "square";
  // Optional small brand stamp shown at the bottom of every scene.
  headline?: string;
  // Body text color, default white.
  textColor?: string;
  // Headline text color, default Interon accent green.
  headlineColor?: string;
  // Fade-in / fade-out per scene in seconds. Default 0.35.
  fadeSeconds?: number;
}

/**
 * Build a captioned-text-overlay clip — vertical short by default.
 * Each line gets its own scene; the whole clip plays through in
 * order. Designed for mobile vertical surfaces: big bold caption,
 * smaller persistent headline, fade-in/out on every caption.
 */
export function buildCaptionClip(opts: CaptionClipOptions): J2VMovieSpec {
  const bg = opts.backgroundColor ?? "#0F1216";
  const textColor = opts.textColor ?? "#FFFFFF";
  const headlineColor = opts.headlineColor ?? "#A5F3D4";
  const baseSec = Math.max(2.0, opts.secondsPerLine ?? 3.2);
  const fade = Math.max(0, Math.min(1.0, opts.fadeSeconds ?? 0.35));
  const orientation = opts.orientation ?? "portrait";
  const { width, height } =
    orientation === "landscape" ? { width: 1920, height: 1080 } :
    orientation === "square" ? { width: 1080, height: 1080 } :
    { width: 1080, height: 1920 };

  // Font sizes tuned for mobile vertical reading.
  const bodyFontPx =
    orientation === "portrait" ? 96 :
    orientation === "square"   ? 84 :
                                 72;
  const headlineFontPx = orientation === "portrait" ? 36 : 30;

  // Per-line duration scales with character count.
  const durationFor = (line: string): number => {
    const charBonus = Math.max(0, line.length - 24) * 0.05;
    return Math.max(2.5, Math.min(6.0, baseSec + charBonus));
  };

  // Layout regions (portrait 1080x1920 reference; scaled for other orientations)
  // Body sits in the vertical middle band. Headline stamp at the bottom.
  const safeMarginX = Math.round(width * 0.06);
  const bodyWidth = width - 2 * safeMarginX;
  const bodyHeight = Math.round(height * 0.5);                 // 50% of height
  const bodyY = Math.round((height - bodyHeight) / 2);          // vertically centred
  const headlineHeight = 80;
  const headlineY = height - headlineHeight - Math.round(height * 0.06);
  const headlineWidth = width - 2 * safeMarginX;

  const scenes: J2VScene[] = opts.lines.map((line) => {
    const sceneDuration = durationFor(line);
    const elements: J2VElement[] = [];

    // 1. Background image (if provided) — first so everything else stacks on top.
    if (opts.backgroundImageUrl) {
      elements.push({
        type: "image",
        src: opts.backgroundImageUrl,
        position: "custom",
        x: 0,
        y: 0,
        width,
        height,
        duration: sceneDuration,
      });
      // 2. Dark overlay for text legibility — a near-opaque rect via text
      //    element trick (text with background-color filling the frame).
      elements.push({
        type: "text",
        text: " ",
        position: "custom",
        x: 0,
        y: 0,
        width,
        height,
        duration: sceneDuration,
        settings: {
          "background-color": "rgba(15,18,22,0.55)",
        },
      });
    }

    // 3. Body caption — bold, big, centred in upper-middle band.
    elements.push({
      type: "text",
      text: line,
      position: "custom",
      x: safeMarginX,
      y: bodyY,
      width: bodyWidth,
      height: bodyHeight,
      "fade-in": fade,
      "fade-out": fade,
      settings: {
        "font-family": "Inter",
        "font-size": `${bodyFontPx}px`,
        "font-weight": "700",
        "font-color": textColor,
        "text-align": "center",
        "vertical-position": "center",
      },
    });

    // 4. Brand stamp at the bottom — small, accent colour, won't overlap body.
    if (opts.headline) {
      elements.push({
        type: "text",
        text: opts.headline,
        position: "custom",
        x: safeMarginX,
        y: headlineY,
        width: headlineWidth,
        height: headlineHeight,
        "fade-in": fade,
        "fade-out": fade,
        settings: {
          "font-family": "Inter",
          "font-size": `${headlineFontPx}px`,
          "font-weight": "600",
          "font-color": headlineColor,
          "text-align": "center",
          "vertical-position": "center",
        },
      });
    }

    return {
      duration: sceneDuration,
      "background-color": bg,
      elements,
    };
  });

  return {
    scenes,
    width,
    height,
    quality: "high",
    cache: true,
  };
}
