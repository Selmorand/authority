# Background Images for Caption Videos

Drop background images here to use them in JSON2Video caption-clip renders. They become public at:

```
https://YOUR-DOMAIN/backgrounds/your-image.png
```

## Requirements

| Property | Recommended |
|---|---|
| Format | PNG, JPG, or WebP |
| Dimensions | 1080 × 1920 (portrait) for Shorts/Reels/X video |
| File size | Under 2 MB ideally; max 10 MB |
| Brightness | Dark / muted — the templates render WHITE text on top |
| Composition | Avoid busy text-heavy zones in the middle third (where the caption sits) and bottom strip (where the brand stamp sits) |

The templates already apply a 55–65% dark overlay between the image and the captions, so a moderately bright image is still usable.

## Naming convention

Use kebab-case descriptive names — they appear in URLs:

- `splatter-orange.png`
- `gradient-cyan-dark.jpg`
- `mesh-abstract-1.png`
- `circuit-pattern-dark.png`

## Why commit instead of upload?

The Video Render panel's file upload writes to `public/uploads/`, which is **ephemeral on Railway** — files there are wiped on every deploy. Images you commit here in `public/backgrounds/` are persistent: same path, same render, every time.

## Sources for free public-domain backgrounds

- [Unsplash](https://unsplash.com/s/photos/dark-abstract) — search "dark abstract", "dark gradient", "noise texture"
- [Pexels](https://www.pexels.com/search/dark%20background/) — same filters available
- [PixaBay](https://pixabay.com/images/search/dark%20background/) — large free archive

Or design your own in Figma, Canva, Photopea — all free, all export PNG at 1080×1920.

## Using in a render

Once committed and deployed, paste the URL into the **Background image** URL field in the Video Render panel:

```
https://YOUR-DOMAIN/backgrounds/splatter-orange.png
```

Or hardcode it as the default background for a specific template by editing the template's JSON file in `data/videoTemplates/`.
