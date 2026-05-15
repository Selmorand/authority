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

function durationFor(line: string, baseSec: number): number {
  const charBonus = Math.max(0, line.length - 24) * 0.05;
  return Math.max(2.5, Math.min(6.0, baseSec + charBonus));
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

  const scenes = vars.lines.map((line, index) => {
    const sceneDuration = durationFor(line, baseSec);

    // Split lines on "||" so templates can carry two pieces of text per scene
    // (e.g. Stat Reveal: "87%||of audited sites"). When no delimiter is present,
    // linePart1 = whole line and linePart2 = "".
    const parts = line.split("||").map((s) => s.trim());
    const linePart1 = parts[0] ?? line;
    const linePart2 = parts.length > 1 ? parts.slice(1).join(" ") : "";

    const isFirst = index === 0;
    const isLast = index === sceneCount - 1;

    const scopedVars: Record<string, unknown> = {
      ...defaults,
      ...stripUndefined({
        backgroundColor: vars.backgroundColor,
        backgroundImageUrl: vars.backgroundImageUrl,
        textColor: vars.textColor,
        headlineColor: vars.headlineColor,
        headline: vars.headline,
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

  const spec: J2VMovieSpec = {
    ...(template.movie ?? {}),
    width: template.width,
    height: template.height,
    scenes: scenes as J2VMovieSpec["scenes"],
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
