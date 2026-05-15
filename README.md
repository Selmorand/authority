# sig:nal — Authority OS

A semantic authority reinforcement system for consultancies focused on AI visibility, Generative Engine Optimisation (GEO), and technical SEO.

Not a marketing dashboard. Not a content factory. An operational system that schedules **one heavy core authority asset per week**, surrounds it with light reinforcement across LinkedIn, Reddit, communities, YouTube, and entity platforms, and tracks the compounding effect that determines whether AI systems cite you.

## The Operating Philosophy

Authority compounds through **repetition, corroboration, consistency, and participation** — not through volume of original publishing. The platform enforces this structurally:

- **Monday** — one heavy Core Authority Asset (long-form article, case study, audit, or research report) + an AI-rendered caption clip teasing the week's theme. Long-form video is *not* a core-asset option — the week's single video lives on Thursday.
- **Tuesday** — LinkedIn reinforcement (insight post, carousel, peer commentary, optional caption clip).
- **Wednesday** — community contribution (Reddit, Umbraco forums, Stack Overflow, dev.to — educational and non-promotional).
- **Thursday** — face-to-camera founder video. This is the *only* video produced by hand; the AI clip generator is intentionally not active on Thursdays.
- **Friday** — entity reinforcement + internal-site work + weekly strategic review + caption clip for the weekend Metricool queue.
- **Saturday + Sunday** — no original production. The system auto-renders one short caption clip per day for Metricool to schedule across socials.
- **Monthly** — auto-generated reinforcement report covering entity consistency, external profile audit, corroboration review, semantic drift, authority balance, and AI visibility.

**AI caption-clip generator.** Every day except Thursday produces one short vertical caption-clip video (15–25 s, 1080×1920) automatically. The mission executor picks a template based on the week's core asset theme and rotates through committed background images by date. Each clip is rendered via [JSON2Video](https://json2video.com) and ready to copy into Metricool for cross-platform distribution. Templates live as JSON files in `data/videoTemplates/`; backgrounds live in `public/backgrounds/`.

The weekly cognitive-load budget is **1 heavy + 2 medium + 8 light + 1 research + 1 review**. The mission generator cannot exceed it.

## What's Tracked

- **Semantic coverage** across 13 authority themes — 8 in the AI-readiness cluster (AI Readiness, GEO, Umbraco AI, Entity Trust, Structured Data, Machine-Readable Websites, Technical SEO for AI, AI Search Visibility) plus 5 broader themes added to widen the content surface (Umbraco Craft, Founder POV & Industry Critique, AI in Business Workflow, Enterprise Architecture & Integration, Original Research & Audit Data). Day-strategy weights surface the broader themes preferentially so the system isn't AI-readiness-monocultured.
- **AI citation rate** across ChatGPT and Claude using the 42-query target set in `data/aiVisibilityQueries.ts` (extendable to Perplexity and Google AI Overview).
- **Entity confidence** across Knowledge Panel, Wikidata, Crunchbase, GitHub, directories.
- **External corroboration** across citations, mentions, guest articles, podcasts, backlinks, partnerships, directories.
- **Cognitive load sustainability** — the week's heavy/medium/light mix vs the budget.
- **Drift indicators** — over-focus, under-focus, declining consistency, fragmented messaging.
- **Per-platform weekly snapshots** — followers, impressions, engagement, posts across 9 platforms (LinkedIn, X, Facebook, Instagram, TikTok, YouTube, Reddit, Discord, Blog) with 12-week trend sparklines.

## Documentation

- **[MANUAL.md](./MANUAL.md)** — the full operational manual (14 sections covering daily workflow, dashboard guide, mission categories, monthly reinforcement, concepts, and failure patterns).
- **[strategic-audit.html](./strategic-audit.html)** — the strategic execution coverage audit that motivated the 1→many refactor.

## Stack

- Next.js 16 (App Router)
- Prisma 7 + PostgreSQL (Railway-hosted; `prisma db push` runs on start)
- Tailwind CSS
- **Anthropic SDK** (`claude-sonnet-4-6` with `web_search_20250305`) — mission execution, caption-line extraction, citation checks
- **OpenAI SDK** (Responses API + `web_search_preview`) — AI-visibility citation checks
- **Tavily REST API** — community target URL discovery (Reddit threads, Stack Overflow questions, Umbraco forum questions)
- **JSON2Video REST API** — caption-clip video rendering via JSON template files in `data/videoTemplates/`

## Setup

```bash
npm install
npx prisma db push        # Provision schema
npm run db:seed           # Populate seed data
npm run dev               # Start dev server at http://localhost:3000
```

### Environment variables

Create `.env.local`:

```
DATABASE_URL=postgres://...          # PostgreSQL connection (required)
ANTHROPIC_API_KEY=sk-ant-...         # Required for Execute-with-AI + AI citation checks
OPENAI_API_KEY=sk-...                # Required for AI mission generator + visibility checks
TAVILY_API_KEY=tvly-...              # Required for community-task target URL discovery
JSON2VIDEO_API_KEY=...               # Required for daily caption-clip auto-rendering
APP_PUBLIC_URL=https://...           # Optional; needed locally to use committed backgrounds in renders
```

System Status panel reports the health of every external service. Missing keys degrade specific features but do not block the platform.

### Common commands

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run db:push      # Apply Prisma schema
npm run db:seed      # Seed data
npm run db:reset     # Reset and re-seed
```

## Key Source Locations

**Planner + cognitive load**
- `lib/cognitiveLoad.ts` — heavy / medium / light scoring + weekly budget
- `lib/generateDailyPlan.ts` — daily plan generator (1→many model + theme weighting + Option D: 1 video/week)
- `lib/monthlyReinforcement.ts` — monthly assessment + report generator
- `lib/scheduleAuthorityMissions.ts` — weekly recurring cycles
- `lib/scheduler.ts` — cron jobs (daily briefing, Friday review, monthly 1st + 15th)

**Content data**
- `data/themes.ts` — 13 authority themes (8 AI-readiness cluster + 5 broader)
- `data/topicIdeas.ts` — heavy core-asset topic library
- `data/reinforcementTopics.ts` — light/medium task templates with execution prompts
- `data/missionChannels.ts` — open mission category registry (30+ categories across 10 channels)
- `data/aiVisibilityQueries.ts` — 42-query target set for AI citation tracking

**Mission execution + AI integrations**
- `lib/missionExecutor.ts` — turns a planned task into a finished deliverable via Claude; routes video-caption tasks through the template system
- `lib/missionTargetSearch.ts` — per-category Tavily search strategy + URL-pattern constraints
- `lib/tavilySearch.ts` — Tavily REST client
- `lib/aiVisibilityRunner.ts` — runs the 42-query citation check across ChatGPT + Claude
- `lib/prompts.ts` — AI prompts enforcing the reinforcement philosophy

**Video caption-clip system**
- `lib/json2video.ts` — JSON2Video REST client (submit, status, polling)
- `lib/videoTemplates.ts` — JSON template loader with placeholder substitution, line splitting on `||`, scene-index variables
- `data/videoTemplates/*.json` — 9 caption-clip templates (caption-stack, stat-reveal, quote-block, question-answer, numbered-list, before-after, hook-reveal, term-definition, bold-statement)
- `data/videoBackgroundPresets.ts` — registry of background images with date-keyed rotation helper
- `public/backgrounds/` — committed background image files (PNG/JPG) used by the daily rotation

**UI**
- `app/components/GeneratedDailyPlan.tsx` — daily UI with Core Asset banner + grouped task sections + date picker
- `app/components/VideoRenderPanel.tsx` — manual test panel (template + background + orientation + line content)
- `app/components/MeasurementDashboard.tsx` — weekly platform snapshot intake + 12-week trends
- `app/components/AIVisibilityTracker.tsx` — citation-rate dashboard across ChatGPT + Claude

## License

Internal — Interon.
