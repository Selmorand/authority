# sig:nal — Authority OS

A semantic authority reinforcement system for consultancies focused on AI visibility, Generative Engine Optimisation (GEO), and technical SEO.

Not a marketing dashboard. Not a content factory. An operational system that schedules **one heavy core authority asset per week**, surrounds it with light reinforcement across LinkedIn, Reddit, communities, YouTube, and entity platforms, and tracks the compounding effect that determines whether AI systems cite you.

## The Operating Philosophy

Authority compounds through **repetition, corroboration, consistency, and participation** — not through volume of original publishing. The platform enforces this structurally:

- **Monday** — one heavy Core Authority Asset (long-form article, case study, audit, YouTube explainer, or research report).
- **Tuesday** — LinkedIn reinforcement (insight post, carousel, peer commentary).
- **Wednesday** — community contribution (Reddit, Umbraco forums, Stack Overflow, dev.to — educational and non-promotional).
- **Thursday** — video reinforcement (YouTube clips and 2-minute founder commentary, no full-scale production).
- **Friday** — entity reinforcement + internal-site work + weekly strategic review.
- **Monthly** — auto-generated reinforcement report covering entity consistency, external profile audit, corroboration review, semantic drift, authority balance, and AI visibility.

The weekly cognitive-load budget is **1 heavy + 2 medium + 8 light + 1 research + 1 review**. The mission generator cannot exceed it.

## What's Tracked

- **Semantic coverage** across 8 authority themes (AI Readiness, GEO, Umbraco AI, Entity Trust, Structured Data, Machine-Readable Websites, Technical SEO for AI, AI Search Visibility)
- **AI citation rate** across ChatGPT, Perplexity, Google AI Overview (and pluggable for Claude)
- **Entity confidence** across Knowledge Panel, Wikidata, Crunchbase, GitHub, directories
- **External corroboration** across citations, mentions, guest articles, podcasts, backlinks, partnerships, directories
- **Cognitive load sustainability** — the week's heavy/medium/light mix vs the budget
- **Drift indicators** — over-focus, under-focus, declining consistency, fragmented messaging

## Documentation

- **[MANUAL.md](./MANUAL.md)** — the full operational manual (14 sections covering daily workflow, dashboard guide, mission categories, monthly reinforcement, concepts, and failure patterns).
- **[strategic-audit.html](./strategic-audit.html)** — the strategic execution coverage audit that motivated the 1→many refactor.

## Stack

- Next.js (App Router)
- Prisma + PostgreSQL
- Tailwind CSS
- OpenAI SDK for mission generation and amplification

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
OPENAI_API_KEY=sk-...            # Required for AI mission generation and amplification
DATABASE_URL=postgres://...      # PostgreSQL connection
```

### Common commands

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run db:push      # Apply Prisma schema
npm run db:seed      # Seed data
npm run db:reset     # Reset and re-seed
```

## Key Source Locations

- `lib/cognitiveLoad.ts` — heavy / medium / light scoring + weekly budget
- `data/missionChannels.ts` — open mission category registry (30+ categories across 10 channels)
- `data/reinforcementTopics.ts` — light/medium task templates with execution prompts
- `lib/generateDailyPlan.ts` — daily plan generator implementing the 1→many model
- `lib/monthlyReinforcement.ts` — monthly assessment + report generator
- `lib/scheduleAuthorityMissions.ts` — weekly recurring cycles
- `lib/scheduler.ts` — cron jobs (daily briefing, Friday review, monthly 1st + 15th)
- `lib/prompts.ts` — AI prompts enforcing the reinforcement philosophy
- `app/components/GeneratedDailyPlan.tsx` — daily UI with Core Asset banner + grouped task sections

## License

Internal — Interon.
