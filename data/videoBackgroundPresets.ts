// ─── Video Background Presets ────────────────────────────────
// Public, JSON2Video-reachable URLs the VideoRenderPanel exposes as
// one-click test backgrounds.
//
// Daily auto-rotation (Mon/Tue/Wed/Fri/Sat/Sun caption-clip tasks)
// uses ONLY entries with `inRotation: true`. Picsum entries below
// are kept as manual test options but excluded from the rotation —
// drop your committed backgrounds into /public/backgrounds/ and
// register them in the "Committed" group with `inRotation: true`
// to populate the daily rotation pool.

export interface BackgroundPreset {
  id: string;
  label: string;
  url: string;
  group: "Stock test" | "Committed";
  // If true, the mission executor includes this preset in the daily
  // rotation when auto-rendering caption clips. Set false on entries
  // that exist purely for one-off manual testing.
  inRotation?: boolean;
}

export const backgroundPresets: BackgroundPreset[] = [
  // Stock test presets — Picsum returns a stable image per seed,
  // grayscale + blur softens them so white captions stay legible.
  // inRotation: true so the daily mission executor will cycle through
  // them when auto-rendering Tue/Wed caption clips.
  {
    id: "picsum-grid",
    label: "Soft grid",
    url: "https://picsum.photos/seed/interon-grid/1080/1920?grayscale&blur=2",
    group: "Stock test",
    inRotation: false,
  },
  {
    id: "picsum-flow",
    label: "Smooth flow",
    url: "https://picsum.photos/seed/interon-flow/1080/1920?grayscale&blur=3",
    group: "Stock test",
    inRotation: false,
  },
  {
    id: "picsum-mesh",
    label: "Mesh",
    url: "https://picsum.photos/seed/interon-mesh/1080/1920?grayscale&blur=2",
    group: "Stock test",
    inRotation: false,
  },
  {
    id: "picsum-noise",
    label: "Soft noise",
    url: "https://picsum.photos/seed/interon-noise/1080/1920?grayscale&blur=4",
    group: "Stock test",
    inRotation: false,
  },

  // Committed presets — actual files in /public/backgrounds/.
  // 12 designs, all included in the daily rotation pool.
  { id: "bg-1",  label: "Design 1",  url: "/backgrounds/1.png",  group: "Committed", inRotation: true },
  { id: "bg-2",  label: "Design 2",  url: "/backgrounds/2.png",  group: "Committed", inRotation: true },
  { id: "bg-3",  label: "Design 3",  url: "/backgrounds/3.png",  group: "Committed", inRotation: true },
  { id: "bg-4",  label: "Design 4",  url: "/backgrounds/4.png",  group: "Committed", inRotation: true },
  { id: "bg-5",  label: "Design 5",  url: "/backgrounds/5.png",  group: "Committed", inRotation: true },
  { id: "bg-6",  label: "Design 6",  url: "/backgrounds/6.png",  group: "Committed", inRotation: true },
  { id: "bg-7",  label: "Design 7",  url: "/backgrounds/7.png",  group: "Committed", inRotation: true },
  { id: "bg-8",  label: "Design 8",  url: "/backgrounds/8.png",  group: "Committed", inRotation: true },
  { id: "bg-9",  label: "Design 9",  url: "/backgrounds/9.png",  group: "Committed", inRotation: true },
  { id: "bg-10", label: "Design 10", url: "/backgrounds/10.png", group: "Committed", inRotation: true },
  { id: "bg-11", label: "Design 11", url: "/backgrounds/11.png", group: "Committed", inRotation: true },
  { id: "bg-12", label: "Design 12", url: "/backgrounds/12.png", group: "Committed", inRotation: true },
  { id: "bg-13", label: "Design 13", url: "/backgrounds/13.png", group: "Committed", inRotation: true },
  { id: "bg-14", label: "Design 14", url: "/backgrounds/14.png", group: "Committed", inRotation: true },
  { id: "bg-15", label: "Design 15", url: "/backgrounds/15.png", group: "Committed", inRotation: true },
  { id: "bg-16", label: "Design 16", url: "/backgrounds/16.png", group: "Committed", inRotation: true },
  { id: "bg-17", label: "Design 17", url: "/backgrounds/17.png", group: "Committed", inRotation: true },
  { id: "bg-18", label: "Design 18", url: "/backgrounds/18.png", group: "Committed", inRotation: true },
  { id: "bg-19", label: "Design 19", url: "/backgrounds/19.png", group: "Committed", inRotation: true },
  { id: "bg-20", label: "Design 20", url: "/backgrounds/20.png", group: "Committed", inRotation: true },
  { id: "bg-21", label: "Design 21", url: "/backgrounds/21.png", group: "Committed", inRotation: true },
  { id: "bg-22", label: "Design 22", url: "/backgrounds/22.png", group: "Committed", inRotation: true },
  { id: "bg-23", label: "Design 23", url: "/backgrounds/23.png", group: "Committed", inRotation: true },
  { id: "bg-24", label: "Design 24", url: "/backgrounds/24.png", group: "Committed", inRotation: true },
  { id: "bg-25", label: "Design 25", url: "/backgrounds/25.png", group: "Committed", inRotation: true },
  { id: "bg-26", label: "Design 26", url: "/backgrounds/26.png", group: "Committed", inRotation: true },
  { id: "bg-27", label: "Design 27", url: "/backgrounds/27.png", group: "Committed", inRotation: true },
  { id: "bg-28", label: "Design 28", url: "/backgrounds/28.png", group: "Committed", inRotation: true },
  { id: "bg-29", label: "Design 29", url: "/backgrounds/29.png", group: "Committed", inRotation: true },
  { id: "bg-30", label: "Design 30", url: "/backgrounds/30.png", group: "Committed", inRotation: true },
  { id: "bg-31", label: "Design 31", url: "/backgrounds/31.png", group: "Committed", inRotation: true },
  { id: "bg-32", label: "Design 32", url: "/backgrounds/32.png", group: "Committed", inRotation: true },
  { id: "bg-33", label: "Design 33", url: "/backgrounds/33.png", group: "Committed", inRotation: true },
  { id: "bg-34", label: "Design 34", url: "/backgrounds/34.png", group: "Committed", inRotation: true },
  { id: "bg-35", label: "Design 35", url: "/backgrounds/35.png", group: "Committed", inRotation: true },
  { id: "bg-36", label: "Design 36", url: "/backgrounds/36.png", group: "Committed", inRotation: true },
  { id: "bg-37", label: "Design 37", url: "/backgrounds/37.png", group: "Committed", inRotation: true },
  { id: "bg-38", label: "Design 38", url: "/backgrounds/38.png", group: "Committed", inRotation: true },
  { id: "bg-39", label: "Design 39", url: "/backgrounds/39.png", group: "Committed", inRotation: true },
  { id: "bg-40", label: "Design 40", url: "/backgrounds/40.png", group: "Committed", inRotation: true },
  { id: "bg-41", label: "Design 41", url: "/backgrounds/41.png", group: "Committed", inRotation: true },
  { id: "bg-42", label: "Design 42", url: "/backgrounds/42.png", group: "Committed", inRotation: true },
  { id: "bg-43", label: "Design 43", url: "/backgrounds/43.png", group: "Committed", inRotation: true },
  { id: "bg-44", label: "Design 44", url: "/backgrounds/44.png", group: "Committed", inRotation: true },
];

// ─── Rotation helpers ────────────────────────────────────────

/** All presets eligible for daily auto-rotation. */
export function rotationPool(): BackgroundPreset[] {
  return backgroundPresets.filter((p) => p.inRotation);
}

/** Convert a YYYY-MM-DD date string to a sortable integer. */
function dateSeed(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return 0;
  return y * 10000 + m * 100 + d;
}

/**
 * Pick a background for the given date — deterministic, so the same
 * (date, salt) pair always yields the same background. The salt lets
 * two tasks on the same day pick different backgrounds (e.g. by
 * passing the mission's category id or topic id).
 *
 * Returns undefined when the rotation pool is empty (caller should
 * fall back to solid backgroundColor).
 */
export function pickBackgroundForDate(
  dateStr: string,
  salt: string = ""
): BackgroundPreset | undefined {
  const pool = rotationPool();
  if (pool.length === 0) return undefined;
  const saltHash = Array.from(salt).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const seed = dateSeed(dateStr) + saltHash;
  return pool[seed % pool.length];
}
