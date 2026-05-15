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
