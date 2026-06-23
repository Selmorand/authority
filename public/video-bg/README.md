# Animated Video Backgrounds for Caption Videos

Drop short MP4 loops here to use them as animated backgrounds in JSON2Video caption-clip renders. They become public at:

```
https://YOUR-DOMAIN/video-bg/your-loop.mp4
```

## Requirements

| Property | Recommended |
|---|---|
| Format | MP4 (H.264, AAC) — most reliable for JSON2Video |
| Dimensions | 1080 × 1920 portrait — matches all 9 caption templates |
| Duration | 10–30 seconds (JSON2Video loops to fill scene duration) |
| Frame rate | 24–30 fps |
| Bitrate | Under 5 Mbps; aim for files under 8 MB |
| Audio | **Strip it** — the template mutes the video track anyway |
| Brightness | Dark / desaturated — the 55–65% overlay keeps captions readable |

## Naming convention

Use kebab-case descriptive names:

- `tech-grid-slow.mp4`
- `abstract-pan-blue.mp4`
- `circuit-flow.mp4`
- `architectural-pan-dark.mp4`

## Sources for free CC0 video loops

- [Pexels Videos](https://www.pexels.com/videos/) — large free archive, CC0
- [Mixkit Free Stock Video](https://mixkit.co/free-stock-video/) — curated, CC0, direct MP4 downloads
- [Coverr](https://coverr.co/) — backgrounds-focused free library
- [Pixabay Videos](https://pixabay.com/videos/) — free with no attribution required

## How JSON2Video uses the loop

The loop element is set with `loop: true, mute: true`. JSON2Video re-encodes it to fit the scene duration:

- If scene = 4s and loop = 10s, the renderer cuts at 4s.
- If scene = 8s and loop = 5s, the renderer plays it 1.6× (loop + partial replay).
- Audio in the loop is stripped — background music comes from the **Background music** track, not the video.

## When video overrides image

When both a video background and a static image background are set in the render panel, **the video wins**. The image is dropped entirely from the scene. The 55–65% dark overlay still applies on top of the video so captions stay legible.

## Registering a new loop

After dropping the file, open `data/videoMediaPresets.ts` and add an entry to `videoBackgroundLoops`:

```ts
{ id: "tech-grid", label: "Tech grid (slow)", url: "/video-bg/tech-grid-slow.mp4", orientation: "portrait", loop: true },
```

## Why commit instead of using external URLs?

Same reason as audio/backgrounds: third-party video CDNs change URLs, throttle requests, or 403. JSON2Video charges per render whether or not the source URL is reachable. Local files in `public/video-bg/` cost nothing to keep around and render deterministically.
