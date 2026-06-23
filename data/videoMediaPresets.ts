// ─── Video Media Presets ─────────────────────────────────────
// Music tracks, animated/video backgrounds, and voiceover voices
// the VideoRenderPanel exposes alongside the existing static
// background presets in `videoBackgroundPresets.ts`.
//
// HOW TO ADD ASSETS
// ─────────────────
// Music: drop royalty-free MP3s into `public/audio/`, then add
//   an entry to `musicPresets` below pointing at `/audio/<file>`.
//   Public URLs (Pixabay, Mixkit, etc.) also work — but commit
//   the file when you want long-term stability.
//
// Video backgrounds: drop short MP4 loops (10–30s, vertical
//   1080×1920) into `public/video-bg/`, then add an entry to
//   `videoBackgroundPresets` below.
//
// Voices: no file commit needed. JSON2Video forwards the
//   `voice` value to ElevenLabs. The names below are confirmed
//   ElevenLabs preset voices. To add custom voices, paste the
//   ElevenLabs voice ID into the `voice` field.
//
// Daily mission auto-renders DO NOT pull from these presets
// yet — that wiring stays scoped to the manual panel until we
// see real renders look good.

export interface MusicPreset {
  id: string;
  label: string;
  url: string;
  /** 0.0–1.0. Multiplied by JSON2Video's volume system. 0.15–0.25
   *  is right for under-voiceover; 0.4–0.6 for music-only clips. */
  volume?: number;
  /** Free-text tag for grouping in the picker. */
  mood?: "calm" | "uplifting" | "driving" | "cinematic" | "neutral";
}

export interface VideoBackgroundPreset {
  id: string;
  label: string;
  url: string;
  orientation: "portrait" | "landscape" | "square";
  /** When true, JSON2Video loops the clip to fill scene duration. */
  loop?: boolean;
}

export interface VoicePreset {
  id: string;
  label: string;
  /** Value passed to JSON2Video's `voice` field. For ElevenLabs
   *  presets this is the friendly name; for custom voices it's
   *  the 20-char ElevenLabs voice ID. */
  voice: string;
  /** Provider model JSON2Video routes to. */
  model: "elevenlabs" | "azure" | "openai";
  /** A short style note shown in the picker. */
  note: string;
}

// ─── Music ──────────────────────────────────────────────────
// Empty by default — populate with your own once tracks are
// dropped into /public/audio/. The structure exists so the UI
// can render "No music yet" gracefully.

export const musicPresets: MusicPreset[] = [
  // Example entries (uncomment after adding the files to
  // /public/audio/):
  // { id: "calm-1",     label: "Calm — soft pad",      url: "/audio/calm-soft-pad.mp3",    volume: 0.2, mood: "calm" },
  // { id: "uplift-1",   label: "Uplifting — strings",  url: "/audio/uplift-strings.mp3",   volume: 0.25, mood: "uplifting" },
  // { id: "drive-1",    label: "Driving — beat",       url: "/audio/drive-beat.mp3",       volume: 0.2, mood: "driving" },
];

// ─── Animated / video backgrounds ───────────────────────────
// Empty by default — populate after dropping short MP4 loops
// into /public/video-bg/.

export const videoBackgroundLoops: VideoBackgroundPreset[] = [
  // Example entries (uncomment after adding files):
  // { id: "tech-grid",    label: "Tech grid (slow)",  url: "/video-bg/tech-grid.mp4",    orientation: "portrait", loop: true },
  // { id: "abstract-pan", label: "Abstract pan",      url: "/video-bg/abstract-pan.mp4", orientation: "portrait", loop: true },
];

// ─── Voiceover voices ──────────────────────────────────────
// ElevenLabs preset voices that JSON2Video routes by name. No
// file uploads or env vars required. Costs ~$0.10–0.30 per
// rendered video minute on JSON2Video's standard pricing.

// Voice IDs are the stable ElevenLabs identifiers — names in the
// ElevenLabs library get renamed/aliased over time, so we always
// route by ID and use the label field for the human-readable name.
// First entry is the default selection in the render panel.

export const voicePresets: VoicePreset[] = [
  {
    id: "thaddeus",
    label: "Thaddeus",
    voice: "gVh6lddROTbOaOz9AAnY",
    model: "elevenlabs",
    note: "Default. Edit this note once you've heard him on a real render.",
  },
  {
    id: "john",
    label: "John",
    voice: "xUwWtrwxKYQAFNPrH25f",
    model: "elevenlabs",
    note: "Edit this note once you've heard him on a real render.",
  },
  {
    id: "edward",
    label: "Edward",
    voice: "goT3UYdM9bhm0n2lmKQx",
    model: "elevenlabs",
    note: "Edit this note once you've heard him on a real render.",
  },
  {
    id: "inanna",
    label: "Inanna",
    voice: "tQ4MEZFJOzsahSEEZtHK",
    model: "elevenlabs",
    note: "Edit this note once you've heard her on a real render.",
  },
  {
    id: "clara",
    label: "Clara",
    voice: "YC9NjC58jpXEqLpIxUeA",
    model: "elevenlabs",
    note: "Edit this note once you've heard her on a real render.",
  },
];

// ─── Lookup helpers ─────────────────────────────────────────

export function findMusic(id: string): MusicPreset | undefined {
  return musicPresets.find((m) => m.id === id);
}

export function findVideoBackground(id: string): VideoBackgroundPreset | undefined {
  return videoBackgroundLoops.find((v) => v.id === id);
}

export function findVoice(id: string): VoicePreset | undefined {
  return voicePresets.find((v) => v.id === id);
}
