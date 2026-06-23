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

// All `voice` values are the stable ElevenLabs voice IDs for the
// original 2023 "default" preset voices. We use IDs (not names)
// because ElevenLabs has renamed/deprecated the names in their
// consumer UI — there are now many "Bella" voices in the
// community library, and "Antoni" / "Domi" aren't surfaced at all —
// but the IDs still resolve via the API and JSON2Video's integration.

export const voicePresets: VoicePreset[] = [
  {
    id: "josh-natural",
    label: "Josh — natural male (US)",
    voice: "TxGEqnHWrfWFTfGW9XjX",
    model: "elevenlabs",
    note: "Neutral, professional. Default for Interon content.",
  },
  {
    id: "rachel-calm",
    label: "Rachel — calm female (US)",
    voice: "21m00Tcm4TlvDq8ikWAM",
    model: "elevenlabs",
    note: "Even, measured. Best for technical or educational pillars.",
  },
  {
    id: "antoni-warm",
    label: "Antoni — warm male (US)",
    voice: "ErXwobaYiN019PkySvjV",
    model: "elevenlabs",
    note: "Approachable, authoritative. Works for founder-POV content.",
  },
  {
    id: "adam-deep",
    label: "Adam — deep male (US)",
    voice: "pNInz6obpgDQGcFmaJgB",
    model: "elevenlabs",
    note: "Lower register, narrator feel. Best for bold-statement pieces.",
  },
  {
    id: "bella-bright",
    label: "Bella — bright female (US)",
    voice: "EXAVITQu4vr4xnSDxMaL",
    model: "elevenlabs",
    note: "Energetic, conversational. Best for hook-reveal style clips.",
  },
  {
    id: "domi-confident",
    label: "Domi — confident female (US)",
    voice: "AZnzlk1XvdvUeBnXmlld",
    model: "elevenlabs",
    note: "Strong, declarative. Pairs with stat-reveal and bold-statement.",
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
