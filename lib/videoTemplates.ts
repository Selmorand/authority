// ─── Video Template Loader ───────────────────────────────────
// Reads JSON template files from data/videoTemplates/, substitutes
// {{placeholder}} tokens with caller-provided variables, and produces
// a J2VMovieSpec ready to submit to JSON2Video.
//
// Templates can include a `$when: "varName"` meta-property on any
// element — the element is dropped from the output if that variable
// is empty/undefined. Used for optional bg-image, optional headline,
// etc.
//
// Each template defines a single sceneTemplate. The loader iterates
// the caller's `lines` array and emits one scene per line.

import { promises as fs } from "node:fs";
import path from "node:path";
import type { J2VMovieSpec } from "./json2video";

const TEMPLATE_DIR = path.join(process.cwd(), "data", "videoTemplates");

export interface TemplateSummary {
  id: string;
  name: string;
  description: string;
  orientation: "portrait" | "square" | "landscape";
  width: number;
  height: number;
}

interface RawTemplate {
  id: string;
  name: string;
  description: string;
  orientation: "portrait" | "square" | "landscape";
  width: number;
  height: number;
  movie?: Record<string, unknown>;
  defaults?: Record<string, unknown>;
  sceneTemplate: {
    duration: unknown;
    "background-color"?: unknown;
    elements: TemplateElement[];
  };
}

interface TemplateElement {
  $when?: string;
  [key: string]: unknown;
}

export interface RenderVariables {
  lines: string[];
  headline?: string;
  backgroundColor?: string;
  backgroundImageUrl?: string;
  textColor?: string;
  headlineColor?: string;
  // Optional base seconds-per-line override. Actual per-scene duration
  // scales with line length for readability.
  baseDurationSeconds?: number;
  // When set, an end-card scene is appended showing the logo (positioned
  // at upper third of the frame) and an optional tagline below.
  brandLogoUrl?: string;
  brandTagline?: string;
  // ─── Media upgrades ─────────────────────────────────────
  // Public URL to an MP4 loop used as a per-scene animated
  // background. Plays under the dim overlay, just like
  // backgroundImageUrl. When both are provided, the video wins.
  videoBackgroundUrl?: string;
  // Public URL to an MP3 background music track. Rendered as a
  // movie-level audio element so it plays across all scenes
  // (including the end-card). volume 0.15-0.25 keeps it
  // comfortably under a voiceover.
  musicUrl?: string;
  musicVolume?: number;
  // When voiceEnabled is true, every content scene gets a voice
  // element speaking that scene's `line`. Scene minimum duration
  // is bumped so TTS isn't cut off. voiceModel + voiceName are
  // forwarded to JSON2Video's voice provider routing.
  voiceEnabled?: boolean;
  voiceName?: string;
  voiceModel?: string;
}

// ─── Filesystem ──────────────────────────────────────────────

export async function listTemplates(): Promise<TemplateSummary[]> {
  let files: string[] = [];
  try {
    files = await fs.readdir(TEMPLATE_DIR);
  } catch {
    return [];
  }
  const summaries: TemplateSummary[] = [];
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    try {
      const raw = await fs.readFile(path.join(TEMPLATE_DIR, f), "utf8");
      const t = JSON.parse(raw) as RawTemplate;
      summaries.push({
        id: t.id,
        name: t.name,
        description: t.description,
        orientation: t.orientation,
        width: t.width,
        height: t.height,
      });
    } catch {
      // skip malformed templates
    }
  }
  return summaries;
}

export async function loadTemplate(id: string): Promise<RawTemplate> {
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, "");
  if (safe !== id || safe.length === 0) {
    throw new Error(`Invalid template id: ${id}`);
  }
  const filepath = path.join(TEMPLATE_DIR, `${safe}.json`);
  const raw = await fs.readFile(filepath, "utf8");
  return JSON.parse(raw) as RawTemplate;
}

// ─── Substitution + duration scaling ─────────────────────────

function substitute(value: unknown, vars: Record<string, unknown>): unknown {
  if (typeof value === "string") {
    // Whole-string placeholder (e.g. "{{duration}}") preserves the
    // underlying type (number, object) when the resolved value isn't
    // a string. Inline placeholders ("hello {{name}}") always
    // produce a string.
    const whole = value.match(/^\{\{(\w+)\}\}$/);
    if (whole) {
      const v = vars[whole[1]];
      return v === undefined ? "" : v;
    }
    return value.replace(/\{\{(\w+)\}\}/g, (_, name) => {
      const v = vars[name];
      return v === undefined || v === null ? "" : String(v);
    });
  }
  if (Array.isArray(value)) {
    return value.map((v) => substitute(v, vars));
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = substitute(v, vars);
    }
    return result;
  }
  return value;
}

function evaluateWhen(elem: TemplateElement, vars: Record<string, unknown>): boolean {
  if (!elem.$when) return true;
  let key = elem.$when;
  let negate = false;
  if (key.startsWith("!")) {
    negate = true;
    key = key.slice(1);
  }
  const v = vars[key];
  let truthy = !(v === undefined || v === null || v === false);
  if (typeof v === "string" && v.trim() === "") truthy = false;
  return negate ? !truthy : truthy;
}

function durationFor(line: string, baseSec: number, withVoice: boolean): number {
  // When TTS is on, give scenes more room so the voice isn't clipped.
  // Spoken-word pacing sits around 14 chars/sec for clear delivery.
  const charBonus = Math.max(0, line.length - 24) * (withVoice ? 0.07 : 0.05);
  const min = withVoice ? 3.5 : 2.5;
  const max = withVoice ? 9.0 : 6.0;
  return Math.max(min, Math.min(max, baseSec + charBonus));
}

// ─── End card ────────────────────────────────────────────────
// Identical brand end-card appended to every render so all 9 templates
// close with the same logo + tagline frame. Logo center sits at y = h/3
// (upper third — the user explicitly does NOT want it middle).

const LOGO_ASPECT = 1063 / 591; // width / height of InteronWhiteLogo.png

function buildEndCardScene(
  logoUrl: string,
  width: number,
  height: number,
  tagline: string
): { duration: number; "background-color": unknown; elements: unknown[] } {
  const logoW = Math.min(720, Math.floor(width * 0.67));
  const logoH = Math.floor(logoW / LOGO_ASPECT);
  const logoX = Math.floor((width - logoW) / 2);
  // Center logo at one-third from the top of the frame.
  const targetCenterY = Math.floor(height / 3);
  const logoY = targetCenterY - Math.floor(logoH / 2);

  const duration = 2.5;
  const elements: Record<string, unknown>[] = [
    {
      type: "image",
      src: logoUrl,
      position: "custom",
      x: logoX,
      y: logoY,
      width: logoW,
      height: logoH,
      duration,
      "fade-in": 0.4,
      "fade-out": 0.35,
    },
  ];

  if (tagline && tagline.trim().length > 0) {
    elements.push({
      type: "text",
      text: tagline,
      position: "custom",
      x: 65,
      y: logoY + logoH + 40,
      width: width - 130,
      height: 80,
      duration,
      "fade-in": 0.6,
      "fade-out": 0.35,
      settings: {
        "font-size": "44px",
        "font-color": "#A5F3D4",
        "font-family": "Inter",
        "font-weight": "500",
        "text-align": "center",
        "vertical-position": "center",
        "text-shadow": "0 2px 8px rgba(0,0,0,0.75)",
      },
    });
  }

  return {
    duration,
    "background-color": "#0F1216",
    elements,
  };
}

// ─── Render ──────────────────────────────────────────────────

export async function renderTemplate(
  templateId: string,
  vars: RenderVariables
): Promise<J2VMovieSpec> {
  const template = await loadTemplate(templateId);
  const defaults = (template.defaults ?? {}) as Record<string, unknown>;

  const baseSec =
    vars.baseDurationSeconds ??
    (typeof defaults.duration === "number" ? (defaults.duration as number) : 4);

  const sceneCount = vars.lines.length;
  const voiceEnabled = Boolean(vars.voiceEnabled && vars.voiceName);

  const scenes = vars.lines.map((line, index) => {
    // When voiceover is on, JSON2Video's scene duration = -1 makes
    // the scene auto-extend to contain its longest element — which
    // is the voice element. The on-screen caption + bg also get -1
    // (via {{duration}} substitution) so they stretch with it.
    // This guarantees the speech never gets clipped regardless of
    // voice/pace/line-length.
    //
    // Without voice, we fall back to the char-length heuristic so
    // scenes still pace reasonably.
    const sceneDuration = voiceEnabled ? -1 : durationFor(line, baseSec, false);

    // Split lines on "||" so templates can carry two pieces of text per scene
    // (e.g. Stat Reveal: "87%||of audited sites"). When no delimiter is present,
    // linePart1 = whole line and linePart2 = "".
    const parts = line.split("||").map((s) => s.trim());
    const linePart1 = parts[0] ?? line;
    const linePart2 = parts.length > 1 ? parts.slice(1).join(" ") : "";

    const isFirst = index === 0;
    const isLast = index === sceneCount - 1;

    // Video and image backgrounds are mutually exclusive — the video
    // wins because it carries motion. We zero the image var when a
    // video is set so the $when gate on the image element drops it.
    const videoBg = vars.videoBackgroundUrl?.trim() || "";
    const imageBg = videoBg ? "" : (vars.backgroundImageUrl?.trim() || "");
    const hasMediaBackground = Boolean(videoBg || imageBg);

    const scopedVars: Record<string, unknown> = {
      ...defaults,
      ...stripUndefined({
        backgroundColor: vars.backgroundColor,
        backgroundImageUrl: imageBg || undefined,
        videoBackgroundUrl: videoBg || undefined,
        hasMediaBackground: hasMediaBackground || undefined,
        textColor: vars.textColor,
        headlineColor: vars.headlineColor,
        headline: vars.headline,
        voiceName: vars.voiceName,
        voiceModel: vars.voiceModel ?? "elevenlabs",
        // voiceText drives the $when gate on each scene's voice
        // element. We strip the `||` delimiter that some templates
        // use to split a line into two parts (e.g. stat-reveal,
        // before-after) — the speaker should read the parts as a
        // natural sentence with a brief pause between them.
        voiceText: voiceEnabled ? line.split("||").map((s) => s.trim()).filter(Boolean).join(". ") : "",
      }),
      line,
      linePart1,
      linePart2,
      lineIndex: index + 1,
      sceneCount,
      isFirst,
      isLast,
      duration: sceneDuration,
    };

    const elements = (template.sceneTemplate.elements ?? [])
      .filter((e) => evaluateWhen(e, scopedVars))
      .map((e) => {
        const { $when: _omit, ...rest } = e;
        void _omit;
        return substitute(rest, scopedVars);
      });

    return {
      duration: sceneDuration,
      "background-color": substitute(
        template.sceneTemplate["background-color"] ?? scopedVars.backgroundColor,
        scopedVars
      ),
      elements,
    };
  });

  // Append consistent brand end-card if the caller provided a logo URL.
  const allScenes = [...scenes];
  if (vars.brandLogoUrl) {
    allScenes.push(
      buildEndCardScene(
        vars.brandLogoUrl,
        template.width,
        template.height,
        vars.brandTagline ?? "interon.co.za"
      )
    );
  }

  // ─── Movie-level elements ──────────────────────────────────
  // JSON2Video supports an `elements` array at the top of the
  // movie spec — these play across all scenes. We promote four
  // things to this level:
  //
  //   1. Background media (video OR image, mutually exclusive).
  //      Living at movie level means a single zoom runs from scene
  //      1 through to the end-card without resetting per scene —
  //      the Ken Burns feel George asked for.
  //   2. Dim overlay — sits between the bg and the captions so
  //      white text stays legible.
  //   3. Background music — fades in/out across the whole movie
  //      including the end-card.
  //
  // Voice elements stay per-scene (anchored to their caption).
  const movieElements: Record<string, unknown>[] = [];

  const videoBg = vars.videoBackgroundUrl?.trim();
  const imageBg = vars.backgroundImageUrl?.trim();
  // Video wins over image when both are set (videos already carry motion).
  if (videoBg) {
    movieElements.push({
      type: "video",
      src: videoBg,
      position: "custom",
      x: 0,
      y: 0,
      width: template.width,
      height: template.height,
      // duration -2 = match parent container (the whole movie).
      // loop -1 = repeat indefinitely so a short clip fills a long movie.
      duration: -2,
      loop: -1,
      mute: true,
    });
  } else if (imageBg) {
    movieElements.push({
      type: "image",
      src: imageBg,
      position: "custom",
      x: 0,
      y: 0,
      width: template.width,
      height: template.height,
      duration: -1,
      zoom: 3,
    });
  }

  if (videoBg || imageBg) {
    movieElements.push({
      type: "text",
      text: " ",
      position: "custom",
      x: 0,
      y: 0,
      width: template.width,
      height: template.height,
      duration: -1,
      settings: {
        "background-color": "rgba(15,18,22,0.6)",
      },
    });
  }

  if (vars.musicUrl && vars.musicUrl.trim().length > 0) {
    movieElements.push({
      type: "audio",
      src: vars.musicUrl,
      volume: typeof vars.musicVolume === "number" ? vars.musicVolume : 0.2,
      start: 0,
      // loop -1 = repeat indefinitely. duration -2 = match the whole
      // movie length so the track fills voice-driven runtimes that
      // we can't compute at render-template time.
      loop: -1,
      duration: -2,
      "fade-in": 0.8,
      "fade-out": 1.2,
    });
  }

  const spec: J2VMovieSpec = {
    ...(template.movie ?? {}),
    width: template.width,
    height: template.height,
    scenes: allScenes as J2VMovieSpec["scenes"],
    ...(movieElements.length > 0 ? { elements: movieElements } : {}),
  };
  return spec;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}
