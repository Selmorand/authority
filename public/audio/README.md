# Background Music Tracks for Caption Videos

Drop royalty-free MP3 tracks here to use them as background music in JSON2Video caption-clip renders. They become public at:

```
https://YOUR-DOMAIN/audio/your-track.mp3
```

## Requirements

| Property | Recommended |
|---|---|
| Format | MP3, AAC, or M4A (MP3 most compatible) |
| Duration | 30–60 seconds minimum (loops longer than the video) |
| Bitrate | 128–192 kbps (smaller files render faster) |
| File size | Under 3 MB ideally; max 10 MB |
| Loudness | Mastered to -16 LUFS or lower so it sits under voiceover |

JSON2Video will loop the track to fill the video duration automatically — including the brand end-card.

## Naming convention

Use kebab-case descriptive names:

- `calm-piano-soft.mp3`
- `uplifting-strings-warm.mp3`
- `driving-electronic-beat.mp3`
- `cinematic-pad-dark.mp3`

## Sources for free, fully-licensed music

All of the following allow commercial use under CC0 or equivalent royalty-free licences. Download the MP3, drop it in this folder, register it in `data/videoMediaPresets.ts`:

- [Pixabay Music](https://pixabay.com/music/) — large free archive, CC0 equivalent
- [Mixkit Music](https://mixkit.co/free-stock-music/) — curated, CC0, direct MP3 downloads
- [Uppbeat](https://uppbeat.io/) — free tier with attribution; better tier without
- [Free Music Archive](https://freemusicarchive.org/) — search by CC0 licence

Avoid: YouTube Music Library tracks (license restricted to YouTube), Spotify rips, anything by a named artist unless explicitly CC0.

## Volume guidance

When used with voiceover, **the renderer mixes music at the volume set in the UI** (default 20%). For music-only clips bump to 40–60%. The `volume` field on a preset entry lets you set a per-track default so loud tracks don't blow out when picked.

## Registering a new track

After dropping the file, open `data/videoMediaPresets.ts` and add an entry to `musicPresets`:

```ts
{ id: "calm-piano", label: "Calm — piano", url: "/audio/calm-piano-soft.mp3", volume: 0.2, mood: "calm" },
```

`id` must be unique. `mood` is free-text but the type union limits it to: `calm` | `uplifting` | `driving` | `cinematic` | `neutral`.

## Why commit instead of relying on public URLs?

Same reason as backgrounds: third-party CDN URLs can change, return 403, or get rate-limited. Local files in `public/audio/` are deterministic — they'll always be at the same URL, always render, always exist as long as the repo does.
