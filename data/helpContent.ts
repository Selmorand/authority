export interface HelpEntry {
  id: string;
  title: string;
  keywords: string[];
  category: string;
  summary: string;
  details: string;
}

export const helpContent: HelpEntry[] = [
  // ─── DAILY OPERATIONS ────────────────────────────────────────
  {
    id: "morning-briefing",
    title: "Morning Briefing",
    keywords: ["morning", "briefing", "daily", "greeting", "reminders", "execution flow", "momentum", "overdue", "scheduled operations", "anchor"],
    category: "Daily Operations",
    summary: "Your daily authority briefing — anchors the day to the week's core asset and surfaces reminders.",
    details: `The Morning Briefing is your daily command overview, calibrated to the 1→many reinforcement model:

- **Greeting**: Each weekday has a distinct role. Monday anchors the week with the Core Authority Asset; Tue–Fri reinforce it across LinkedIn, communities, YouTube, and entity platforms.
- **Task Stats**: How many tasks today, total estimated time, cognitive load mix (heavy / medium / light)
- **Health Scores**: Authority Health (1-10), Consistency Streak, AI Visibility (% of AI queries citing your content)
- **Momentum Status**: Calibrated to sustainability — strong cadence is "protect it", not "produce more"
- **Execution Flow**: The recommended order (Core Asset → reinforcement → research → review)
- **Reminders**: Up to 5 priority items including the anchor for the day, mid-week community participation prompts, and Friday's close-the-loop reminder
- **Focus Themes**: Which themes are active today
- **Semantic Reinforcement**: How today's work strengthens your topical authority
- **Overdue Areas**: Themes that need urgent attention
- **Top Opportunity**: The single highest-value action for today
- **Scheduled Operations**: Automated jobs (Morning Briefing, Weekly Review, Cadence Check, Research Refresh, Monthly Reinforcement Report on the 1st, Mid-Month Entity Sweep on the 15th)`
  },
  {
    id: "generated-daily-plan",
    title: "Generated Daily Plan",
    keywords: ["daily plan", "missions", "core authority asset", "reinforcement", "maintenance", "research", "strategic review", "load tier", "heavy", "medium", "light", "execution prompt", "status"],
    category: "Daily Operations",
    summary: "Your daily mission plan grouped by task kind — Core Asset, Reinforcement, Maintenance, Research, Review.",
    details: `The Generated Daily Plan implements the 1→many operational model. Tasks are grouped by kind, not just listed:

- **Day Strategy**: Explains today's role (Mon = Core Asset, Tue = LinkedIn, Wed = Community, Thu = Video, Fri = Entity + Review)
- **Load Mix**: Coloured counters showing how many Heavy / Medium / Light tasks the day contains
- **Date Navigation**: Prev / Today / Next buttons
- **Core Authority Asset Banner** (Monday only by default): the week's anchor, full-width, distinct purple border. This is the one heavy publication that the rest of the week reinforces.
- **Reinforcement Section**: light/medium tasks that compound the week's core — LinkedIn posts, Reddit answers, community contributions, YouTube clips, founder snippets
- **Maintenance Section** (typically Friday): entity updates, schema refinement, internal linking, author bio sync, terminology passes
- **Research Section**: weekly intelligence intake
- **Strategic Review Section** (Friday): closes the loop and sets next week's core asset

Every task card carries a **Load Tier badge** (Heavy / Medium / Light) so the cost of each task is visible at a glance. Reinforcement task cards include an **Execution Prompt** telling you exactly what to do (e.g. "Find an honest question about generative engine optimisation on r/SEO from the last 14 days. Write a substantive, non-promotional answer 200–400 words").

Click the status button on any card to cycle Pending → In Progress → Completed.`
  },
  {
    id: "one-to-many-model",
    title: "1→Many Reinforcement Model",
    keywords: ["1+many", "1 to many", "operational model", "core asset", "reinforcement", "philosophy", "cadence", "weekly contract", "cognitive load budget"],
    category: "Daily Operations",
    summary: "The platform's defining principle: one heavy core asset per week, surrounded by light reinforcement.",
    details: `The platform operates on a strict weekly contract designed for sustainable authority compounding:

**1 Core Authority Asset** (heavy, Monday) — long-form article, case study, audit, YouTube explainer, or research report.

**3–5 Reinforcement Tasks** (light/medium, Tue–Fri):
- Tuesday: LinkedIn insight + carousel + peer commentary derived from Monday's core
- Wednesday: Reddit / community contribution (educational, non-promotional)
- Thursday: YouTube clip or 2-minute founder commentary (no full-scale production)
- Friday: entity reinforcement + internal-site work

**1 Research Session** (Friday) — intake without execution pressure.

**1 Strategic Review** (Friday) — close-the-loop reflection and next-week planning.

**Why this works:** Authority compounds through repetition, corroboration, and participation — not through original publishing volume. A single Monday core asset amplified across LinkedIn, Reddit, YouTube, and entity platforms produces ~7 distinct authority signals across 4 channels every week, sustainably, for months.

**Weekly cognitive load budget:** 1 heavy + 2 medium + 8 light + 1 research + 1 review. The mission generator hard-limits batches to one heavy category per request — over-production is structurally prevented.`
  },
  {
    id: "cognitive-load",
    title: "Cognitive Load Tiers",
    keywords: ["cognitive load", "heavy", "medium", "light", "load tier", "burden", "sustainability", "budget"],
    category: "Daily Operations",
    summary: "Every task is classified as Heavy, Medium, or Light to keep the week sustainable.",
    details: `Cognitive Load Tiers prevent the platform from becoming a content treadmill. Tasks are scored across writing effort, preparation effort, research effort, production effort, and time required, then classified:

- **Heavy** (red badge) — long-form article, case study, audit, long YouTube explainer, research report. **Max 1 per week.** This is the weekly Core Authority Asset.
- **Medium** (orange badge) — LinkedIn carousels, founder commentary videos, audit-walkthrough clips. Sustainable in moderation. **Max 2 per week.**
- **Light** (green badge) — LinkedIn insights, LinkedIn commentary, Reddit answers, community contributions, YouTube clips, founder snippets, entity updates, schema refinement, internal-linking passes. **The default mode of weekly work.**

The daily plan UI displays the tier of every task and counters showing the day's mix. If you see a Heavy task on a non-Monday, something has gone wrong with planning.`
  },
  {
    id: "execution-dashboard",
    title: "Execution Dashboard",
    keywords: ["execution", "consistency", "streak", "drift", "cadence", "gaps", "tracking", "weekly rate"],
    category: "Daily Operations",
    summary: "Real-time execution tracking with drift detection and consistency analytics.",
    details: `The Execution Dashboard monitors your execution quality:

- **Consistency Score** (1-10): How reliably you're completing missions on schedule
- **Current Streak**: Consecutive days meeting execution targets
- **Weekly Rate**: Average missions completed per week
- **Reminders**: Today's tasks with urgency levels (immediate, today, upcoming)
- **Theme Cadence**: Shows how frequently you're working on each theme:
  - High: Multiple times per week
  - Moderate: 1-2 times per week
  - Low: Less than once per week
  - Inactive: More than 14 days since last activity
- **Drift Detection**: Alerts when you're deviating from your strategy:
  - Over-focus: Spending too much time on one theme
  - Under-focus: Neglecting a theme
  - Declining Consistency: Completion rate dropping
  - Semantic Imbalance: Uneven topic coverage
- **Execution Gaps**: Missing areas with specific suggestions to fix them`
  },
  {
    id: "todays-missions",
    title: "Today's Missions",
    keywords: ["today", "missions", "cards", "status"],
    category: "Daily Operations",
    summary: "Simple card view of today's tasks with status tracking.",
    details: `Today's Missions shows a clean grid of your tasks for the current day. Each card displays the task title, topic, category, authority focus, time estimate, objective, and priority level. Click the status button on each card to mark it as Pending, In Progress, or Completed. Completed tasks become semi-transparent. For the full grouped view with Core Asset banner and load tier badges, use the Generated Daily Plan panel.`
  },
  {
    id: "strategic-insights",
    title: "Strategic Insights",
    keywords: ["strategic insights", "why today", "authority signals", "semantic density", "theme goals"],
    category: "Daily Operations",
    summary: "Daily strategic context explaining why today's plan matters.",
    details: `Strategic Insights provides context for your daily plan:

- **Why Today's Plan Matters**: Explains which themes are being reinforced and why
- **Authority Signals Being Reinforced**: The specific semantic keywords and entity mentions being strengthened today
- **Semantic Themes Strengthened**: How today's work increases your topical density
- **Key Stats**: Average priority score, number of high-impact missions (authority impact 7+), and active themes count
- **Theme Goals in Focus**: For each active theme today, shows the strategic goal you're working toward`
  },

  // ─── STRATEGIC INTELLIGENCE ──────────────────────────────────
  {
    id: "command-center",
    title: "Command Center",
    keywords: ["command center", "authority health", "execution consistency", "ai visibility", "semantic coverage", "momentum", "category ownership", "narrative positions", "what matters most", "highest leverage", "biggest risk"],
    category: "Strategic Intelligence",
    summary: "Executive authority intelligence overview with health scores and strategic priorities.",
    details: `The Command Center is your executive dashboard showing overall authority health:

- **4 Key Scores**:
  - Authority Health (1-10): Overall credibility and positioning strength
  - Execution Consistency (1-10): How well you're sticking to the plan
  - AI Visibility (%): Percentage of AI queries that cite your content
  - Semantic Coverage (1-8): How many of your 8 themes have strong coverage
- **Momentum**: Directional trend — accelerating (green), steady (blue), or decelerating (orange)
- **What Matters Most This Week**: The single most important focus area
- **Highest-Leverage Opportunity**: The action that will have the biggest authority impact
- **Biggest Strategic Risk**: The main threat to your authority positioning
- **Themes Strengthening**: Themes gaining momentum (shown with ^ in green)
- **Areas Losing Momentum**: Themes declining (shown with v in yellow)
- **Category Ownership**: Grid showing your % ownership in each of 8 theme categories, with strength levels (dominant, strong, developing, weak, absent) and trend direction`
  },
  {
    id: "copilot-dashboard",
    title: "Copilot Dashboard",
    keywords: ["copilot", "guidance", "recommendation", "warning", "opportunity", "reinforcement", "focus shift", "focus adjustments", "momentum analysis", "strategic outlook"],
    category: "Strategic Intelligence",
    summary: "AI-powered strategic guidance with filtered recommendations and focus adjustments.",
    details: `The Copilot Dashboard provides AI-generated strategic guidance:

- **Overall Assessment**: High-level summary of your current position
- **Top Priority**: The single most important action right now
- **Momentum Analysis**: Execution trend and semantic trend with growing/weakening areas
- **Strategic Outlook**: Forward-looking assessment
- **Guidance Cards** (filterable by type):
  - Recommendation: Strategic advice for improvement
  - Warning: Risks to address
  - Opportunity: High-value actions to take
  - Reinforcement: Areas to strengthen further
  - Focus Shift: Suggestions to reallocate effort
  Each card shows priority (critical/high/medium/advisory), confidence score (1-10), rationale, and suggested action
- **Focus Adjustments**: For each theme, whether to increase, maintain, or decrease effort, with reasoning`
  },
  {
    id: "strategic-risk-panel",
    title: "Strategic Risk Panel",
    keywords: ["risk", "risks", "strategic risk", "semantic drift", "messaging dilution", "saturation", "corroboration gap", "mitigation"],
    category: "Strategic Intelligence",
    summary: "Strategic risks identified with severity levels and mitigation strategies.",
    details: `The Strategic Risk Panel shows threats to your authority positioning:

- **Risk Categories**:
  - Semantic Drift: Your messaging is becoming inconsistent or unclear
  - Messaging Dilution: Authority signals weakening due to inconsistent communication
  - Theme Inconsistency: Switching themes too frequently or unevenly
  - Founder Visibility: Personal brand visibility declining
  - Execution Decline: Mission completion rate dropping
  - Saturation: Market becoming oversaturated with your topic
  - Corroboration Gap: Not enough external sources citing or backing up your claims
- **Severity Levels**: Critical (red), High (orange), Medium (blue), Low (gray)
- Each risk shows the risk statement and a specific mitigation strategy`
  },
  {
    id: "opportunity-intelligence",
    title: "Opportunity Intelligence",
    keywords: ["opportunity", "opportunities", "leverage", "timeframe", "weekly recommendations"],
    category: "Strategic Intelligence",
    summary: "High-value strategic opportunities and weekly action recommendations.",
    details: `Opportunity Intelligence highlights where to focus for maximum impact:

- **High-Value Opportunities** (top 5):
  - Opportunity statement
  - Leverage level: High (green), Medium (blue), Low (gray) — the magnitude of authority impact
  - Timeframe: Immediate (red), This Week (orange), This Month (gray)
  - Rationale explaining why this matters
  - Suggested action to take
- **Weekly Recommendations**:
  - Focus: Adjust strategic focus
  - Execution: Improve delivery
  - Content: Create specific content
  - Semantic: Strengthen semantic signals
  - Expansion: Move into new areas
  Each has a priority level (high/medium/low)`
  },
  {
    id: "strategic-reflection",
    title: "Strategic Reflection",
    keywords: ["reflection", "learning", "saturated", "underutilized", "adaptive", "lessons"],
    category: "Strategic Intelligence",
    summary: "Analysis of learning, theme performance, and adaptive strategy recommendations.",
    details: `Strategic Reflection analyzes your execution history to find patterns:

- **What We Are Learning**: Strategic lessons from your completed missions and outcomes
- **Themes Gaining Authority**: Themes showing growth trends (marked with ^)
- **Areas Becoming Saturated**: Themes at risk of overuse (marked with =)
- **Underutilized Opportunities**: Themes not getting enough attention (marked with !)
- **Adaptive Recommendations**: Specific suggestions to adjust your strategy based on what's working and what isn't`
  },

  // ─── RESEARCH & TRENDS ──────────────────────────────────────
  {
    id: "live-research-feed",
    title: "Live Research Feed",
    keywords: ["research", "signals", "scan", "sources", "high value", "relevance", "opportunity type", "live feed"],
    category: "Research & Trends",
    summary: "Live research signals from curated sources with relevance scoring.",
    details: `The Live Research Feed scans external sources for relevant intelligence:

- **Scan Button**: Click "Scan Research Sources" to fetch the latest signals
- **Stats**: Sources scanned, failed sources, duplicates filtered, high-value signal count
- **Filters**: All, High Value, or by specific theme
- **Signal Cards** show:
  - Title (clickable link to source)
  - Relevance Score (1-10): Green (7+), Orange (5-6), Gray (<5)
  - Summary excerpt
  - Opportunity Type:
    - High Priority: Urgent, directly impacts positioning
    - Semantic Convergence: Aligned with your themes
    - Geo Opportunity: Geographic relevance
    - Umbraco: Product-specific signal
    - Entity: Related to entity recognition
    - General Intelligence: Background information
  - Matched themes and keywords`
  },
  {
    id: "strategic-briefing",
    title: "Strategic Briefing",
    keywords: ["strategic briefing", "ai briefing", "key findings", "semantic shifts", "narratives", "authority gaps", "urgency"],
    category: "Research & Trends",
    summary: "AI-powered interpretation of research signals with findings, shifts, and gaps.",
    details: `The Strategic Briefing uses AI to interpret research signals:

- **Generate Button**: Click to generate an AI-powered analysis
- **Weekly Priority**: The most important insight this week
- **4 Tabs**:
  - **Key Findings**: Important research insights with urgency (immediate/this-week/this-month), why it matters, authority opportunity, suggested response, content opportunity, founder insight, and competitive angle
  - **Semantic Shifts**: Changes in how industry terms are used — direction (emerging/evolving/declining/contested), current usage, strategic implication, and suggested action
  - **Narratives**: New stories gaining traction — evidence, market concern, your company's angle, content strategy, and competitor blind spots
  - **Authority Gaps**: Areas where competitors have visibility but you don't — evidence, opportunity size, and how to fill the gap`
  },
  {
    id: "research-intelligence",
    title: "Research Intelligence",
    keywords: ["research intelligence", "scored signals", "authority potential", "semantic relevance", "market timing", "technical alignment", "competitive opportunity"],
    category: "Research & Trends",
    summary: "Scored research signals with multi-dimensional analysis across 5 factors.",
    details: `Research Intelligence provides deep scoring of each signal across 5 dimensions:

- **Filters**: All, Opportunity, Authority Gap, Emerging, Competitor, Saturation Risk
- **Signal Cards** (click to expand):
  - Alert type and urgency level
  - Overall score (1-10)
  - Matched themes
  - **Expanded view shows 5 score components** (each 1-10):
    - Authority Potential: How much this could improve your positioning
    - Semantic Relevance: How well it aligns with your core themes
    - Market Timing: How urgent/timely (1=old news, 10=breaking)
    - Technical Alignment: How well it fits your capabilities
    - Competitive Opportunity: Advantage vs competitors if you act
  - Suggested actions list`
  },
  {
    id: "trend-intelligence",
    title: "Trend Intelligence Dashboard",
    keywords: ["trends", "clusters", "semantic clusters", "narratives", "whitespace", "saturation", "terminology", "momentum"],
    category: "Research & Trends",
    summary: "Semantic trend clustering, whitespace opportunities, and market saturation analysis.",
    details: `The Trend Intelligence Dashboard analyzes market trends across 5 views:

- **Clusters**: Groups of related terms/concepts gaining attention, with momentum (rising/stable/emerging/declining) and frequency
- **Narratives**: Stories gaining traction with strength scores (1-10) and opportunity type (dominate/expand/enter/monitor)
- **Whitespace**: Topic areas with low competition but market demand. Shows competitive gap (wide/moderate/narrow) and suggested actions
- **Saturation**: How crowded each topic is:
  - Oversaturated (red): Too many competitors
  - Competitive (orange): Active competition
  - Moderate (blue): Some room
  - Open (green): Low competition
  Each shows a differentiation strategy
- **Terminology**: Authority terms with frequency counts and momentum direction`
  },
  {
    id: "search-ecosystem",
    title: "Search Ecosystem Monitor",
    keywords: ["search ecosystem", "geo terminology", "ecosystem developments", "google ai", "openai", "anthropic", "bing", "structured data", "interon implication"],
    category: "Research & Trends",
    summary: "Search engine and AI ecosystem developments with company-specific implications.",
    details: `The Search Ecosystem Monitor tracks changes in search and AI platforms:

- **GEO Terminology Evolution**: Geographic Entity Optimization terms with frequency trends (rising/stable/emerging/declining) and which platforms use them
- **Ecosystem Developments**: Major changes from Google AI, OpenAI, Anthropic, Bing, and others
  - Impact level (high/medium/low)
  - Summary of the development
  - **Interon Implication**: How this specific change affects your authority strategy — this is the most actionable part`
  },
  {
    id: "intelligence-summary",
    title: "Intelligence Summary",
    keywords: ["intelligence summary", "weekly summary", "signals tracked", "competitor gaps", "recommended actions"],
    category: "Research & Trends",
    summary: "Weekly intelligence summary with action recommendations.",
    details: `The Intelligence Summary gives you a weekly overview:

- **Signals Tracked**: Total research intelligence monitored
- **High Priority**: Urgent signals requiring attention
- **What Matters This Week**: Top themes with signal counts
- **Topics Gaining Momentum**: Subjects growing in relevance
- **Authority Opportunities**: Chances to strengthen your positioning
- **Areas Competitors Are Ignoring**: Gaps you can fill
- **Recommended Actions**: Specific tasks with type (article, LinkedIn, research, case study, founder authority), impact score (1-10), and rationale`
  },

  // ─── AUTHORITY & VISIBILITY ──────────────────────────────────
  {
    id: "authority-growth",
    title: "Authority Growth Dashboard",
    keywords: ["authority growth", "health score", "ai visibility rate", "health indicators", "8-week", "growth timeline", "momentum", "external corroboration", "corroborations"],
    category: "Authority & Visibility",
    summary: "8-week authority growth trajectory with health metrics and external validation.",
    details: `The Authority Growth Dashboard tracks your authority over time:

- **Overall Health Score** (1-10): Composite authority score
- **AI Visibility Rate** (%): How often AI systems cite your content
- **Health Indicators**: Specific metrics like search visibility, content depth, topical coverage — each with a score, trend (up/stable/down), and description
- **8-Week Growth Timeline**: Visual bar charts showing how each metric has changed over 8 weeks. Hover on bars to see specific dates and values
- **Authority Momentum**: Current values with change amounts and percentages for key metrics (citations, backlinks, mentions, etc.)
- **External Corroboration**: Top 6 third-party validations — citations, mentions, guest articles, podcasts, backlinks, directory listings, and partnerships that support your authority claims`
  },
  {
    id: "entity-visibility",
    title: "Entity Visibility Tracker",
    keywords: ["entity visibility", "ai citation", "citation rate", "corroboration score", "platform visibility", "theme visibility", "chatgpt", "perplexity", "google ai overview"],
    category: "Authority & Visibility",
    summary: "AI citation tracking across ChatGPT, Perplexity, and Google AI Overview.",
    details: `The Entity Visibility Tracker monitors how AI platforms reference you:

- **AI Citation Rate** (%): Percentage of tested queries that cite your content
- **Queries Cited**: X out of Y queries returned citations (e.g., "4/12")
- **Corroboration Score** (1-10): Credibility based on external verification
- **Platform Visibility**: Citation rates per platform (ChatGPT, Perplexity, Google AI Overview) with progress bars
- **Theme AI Visibility**: For each theme, shows:
  - Strength level: Dominant (strong presence), Growing (increasing), Emerging (new), Invisible (not detected)
  - Citation rate percentage
  - Average position when cited
- **AI Citation Checks**: Individual query results showing which queries were cited, on which platform, and at what position`
  },
  {
    id: "ai-discoverability",
    title: "AI Discoverability Dashboard",
    keywords: ["discoverability", "entity confidence", "semantic health", "semantic consistency", "visibility signals", "entity analysis", "semantic issues"],
    category: "Authority & Visibility",
    summary: "AI semantic authority analysis with discoverability, entity confidence, and health scores.",
    details: `The AI Discoverability Dashboard analyzes how discoverable you are to AI systems:

- **3 Key Scores** (each 1-10):
  - Discoverability: How easily AI systems find your content
  - Entity Confidence: How clearly AI recognizes your entity/brand
  - Semantic Health: Alignment and consistency of your semantic signals
- **AI Visibility Signals**: Per-theme strength (strong/moderate/weak/absent) with trend direction and evidence
- **Entity Confidence Indicators**: Shows if your entity is consistent, partial, fragmented, or absent across different areas, with specific gaps identified
- **Semantic Issues & Strengths**: Problems to fix (by severity) and strengths to maintain
- **Visibility Recommendations**: Prioritized actions (high/medium/low) categorized as semantic, authority, discoverability, consistency, or entity improvements`
  },
  {
    id: "knowledge-graph",
    title: "Authority Knowledge Graph",
    keywords: ["knowledge graph", "graph", "nodes", "edges", "clusters", "connections", "interactive", "visualization"],
    category: "Authority & Visibility",
    summary: "Interactive visualization of your authority concept clusters and connections.",
    details: `The Authority Knowledge Graph is an interactive visual map of your authority structure:

- **Interactive Graph**: Drag nodes to reposition, scroll to zoom (0.5x-1.5x)
- **Nodes**: Represent authority concepts, sized by strength (1-10)
- **Edges**: Connections between concepts — animated if strong, with varying opacity
- **5 Clusters** (color-coded):
  - AI Visibility: How you appear in AI systems
  - Geographic (GEO): Location-based authority
  - Technical: Technical expertise areas
  - Founder: Personal brand elements
  - Semantic: Topic/content authority
- **Click a Node** to see its details: strength score, description, authority level, and cluster
- **Strategic Insights**:
  - Weak connections: Under-reinforced links between clusters
  - Isolated nodes: Concepts with insufficient connections
  - Overlap opportunities: Where clusters can be linked`
  },
  {
    id: "authority-learning",
    title: "Authority Learning",
    keywords: ["learning", "growth indicators", "high-impact themes", "best performing", "semantic strengths", "patterns"],
    category: "Authority & Visibility",
    summary: "Strategic learning from content performance and memory analysis.",
    details: `Authority Learning shows what's working in your strategy:

- **Growth Indicators**: Tracked metrics with trend direction (topics covered, themes deepened, etc.)
- **High-Impact Themes** (top 5): Themes showing the strongest authority growth, with entry count and average impact score
- **Best-Performing Categories**: Which content categories have the highest average impact
- **Semantic Strengths**: Tag cloud of demonstrated expertise areas
- **Repeating Patterns**: Successful content structures or approaches that keep working, with recommendations to replicate them`
  },

  // ─── AI TOOLS ────────────────────────────────────────────────
  {
    id: "ai-mission-panel",
    title: "AI Mission Panel",
    keywords: ["ai missions", "generate missions", "expand topic", "mission generation", "topic expansion", "ai suggestions", "1+many", "heavy limit"],
    category: "AI Tools",
    summary: "AI-powered mission generation — hard-limited to one heavy category per batch.",
    details: `The AI Mission Panel has two modes:

**Generate Missions**:
- Select one or more themes to focus on
- Click "Generate Strategic Missions" to get AI-suggested tasks
- Each suggestion shows: title, objective, semantic goal, theme, platform, content angle, time estimate, strategic priority (1-10), and authority impact (1-10)
- **The 1→many contract is enforced**: at most ONE heavy / core category per batch, regardless of how many tasks you request. If you ask for 5, the default mix is roughly 1 core + 3 reinforcement + 1 maintenance. Validator filters out over-budget heavy suggestions.

**Expand Topic**:
- Enter any topic and optionally select a theme
- Click "Expand Topic" to get reinforcement angles (not more original publications)
- Returns 5 reinforcement angles: LinkedIn insight, LinkedIn carousel, Reddit answer, YouTube clip, founder snippet
- Each angle shows: angle name, title, key point, platform, authority signal, and time estimate

**When to use**: Once per week when planning next Monday's core asset, or once per month for refreshing the reinforcement task pool. Not a daily tool — the deterministic daily planner handles routine.`
  },
  {
    id: "amplification-dashboard",
    title: "Amplification Dashboard",
    keywords: ["amplification", "amplify", "content", "repurpose", "semantic score", "density", "formats", "platforms", "authority angle", "reinforcement loop", "core asset"],
    category: "AI Tools",
    summary: "The reinforcement loop in action — turns one Monday core asset into the week's reinforcement plan.",
    details: `The Amplification Dashboard is the operational hub of the 1→many model. Run it on Monday's published Core Authority Asset; the rest of the week implements its outputs.

- **Input**: Title, content, asset type (article / case-study / research-insight / audit-finding / strategic-observation), theme, and optional key insights
- **Two Modes**: "Amplify (Local)" for instant deterministic results, "Amplify (AI)" for AI-powered generation
- **6 Outputs** per source asset:
  - LinkedIn Authority Post — implements Tuesday's LinkedIn Insight reinforcement
  - Founder Insight — implements Tuesday's founder snippet
  - Technical Explainer — supplementary blog reinforcement
  - YouTube Talking Points — implements Thursday's YouTube clip / commentary
  - GEO Reinforcement — repackages for AI citation
  - Executive Summary — for sales / pitch use
- **Quality Metrics**:
  - Semantic Score (1-10): topic consistency across versions
  - Density Score (1-10): depth of coverage
  - Semantic Reinforcement: repeated topic coverage across formats
  - Amplification Depth: distinct variations
  - Messaging Cohesion: consistency of core message
- **Warnings**: dilution alerts when source content is too thin or messaging fragments

**Best practice**: Run on Monday immediately after publishing the core asset. Use the outputs to seed Tue–Fri reinforcement tasks.`
  },
  {
    id: "monthly-reinforcement-report",
    title: "Monthly Reinforcement Report",
    keywords: ["monthly", "monthly report", "entity consistency", "external profile audit", "corroboration", "semantic drift", "authority balance", "ai visibility review", "mid-month sweep"],
    category: "AI Tools",
    summary: "Auto-generated monthly assessment covering six reinforcement areas.",
    details: `A scheduler job runs on the 1st of each month generating a Monthly Reinforcement Report. A mid-month sweep refreshes it on the 15th. The report assesses six areas:

1. **Entity Consistency Review** — Knowledge Panel, Wikidata, Crunchbase, LinkedIn Company. Healthy / watch / action-needed.
2. **External Profile Audit** — coverage breadth across corroboration types.
3. **Corroboration Review** — corroboration events in the last 30 days. If low: pitch one podcast + one guest article + one directory addition this month.
4. **Semantic Drift Review** — detects theme distribution skew. If skewed: schedule a semantic-terminology sweep.
5. **Authority Balance Review** — flags any core theme with zero activity. Recommends promoting it to next month's Monday core.
6. **AI Visibility Review** — citation-opportunity delta. If flat or declining: run a fresh citation check across ChatGPT, Perplexity, Google AI Overview, Claude.

Each finding produces a recommended task with estimated time and priority. Treat the report as the strategic instrument for choosing Monday core assets over the coming month.`
  },
  {
    id: "multi-model-intelligence",
    title: "Multi-Model Intelligence",
    keywords: ["multi-model", "ai models", "consensus", "contradictions", "blind spots", "confidence", "synthesis"],
    category: "AI Tools",
    summary: "Compare strategic insights across multiple AI models for balanced analysis.",
    details: `Multi-Model Intelligence runs your research signals through multiple AI models to find consensus and disagreements:

- **Run Analysis**: Click to analyze your current research context across available models
- **Overall Confidence** (1-10): How certain the combined analysis is
- **5 Tabs**:
  - **Synthesis**: What all models agree on, highest-confidence actions, biggest risks, and where opinions differ
  - **Model Views**: Individual model outputs with confidence scores, key insights, opportunities, warnings, and recommended actions
  - **Consensus**: Points of agreement with confidence scores and which models agree
  - **Contradictions**: Where models disagree — shows each model's position and the implication
  - **Blind Spots**: Gaps all models miss — severity, area affected, evidence, and suggested action

This helps avoid bias by cross-referencing multiple AI perspectives.`
  },

  // ─── OPERATIONS & REPORTS ────────────────────────────────────
  {
    id: "authority-calendar",
    title: "Authority Calendar",
    keywords: ["calendar", "weekly", "schedule", "time blocks", "morning", "midday", "afternoon", "recurring cycles", "core asset", "reinforcement"],
    category: "Operations & Reports",
    summary: "Weekly schedule built around one core asset (Mon) and reinforcement (Tue–Fri).",
    details: `The Authority Calendar shows the week's 1→many cadence at a glance:

- **Weekly View**: 5-column grid (Monday to Friday)
- **Time Blocks**: Each day split into Morning, Midday, Afternoon. Core assets and heavy reinforcement go in Morning. Research and strategic review go in Afternoon.
- **Recurring Cycles**:
  - Monday — Core Authority Asset (the week's anchor)
  - Tuesday — LinkedIn Reinforcement
  - Wednesday — Community Contribution
  - Thursday — Video Reinforcement
  - Friday — Entity Reinforcement & Strategic Review
- **Daily Stats**: Task count and estimated minutes per day
- **Week Navigation**: Prev / This Week / Next buttons
- **Theme Distribution**: Shows how the week's work is distributed across the 8 authority themes
- **Common mistake**: Over-scheduling. The weekly budget is 1 heavy + 2 medium + 8 light + 1 research + 1 review. Resist adding more heavy work — the planner will not generate it, but manual additions can break the model.`
  },
  {
    id: "weekly-mission-view",
    title: "Weekly Mission View",
    keywords: ["weekly", "planner", "week 1", "week 2", "mission planner"],
    category: "Operations & Reports",
    summary: "Weekly mission planner with day columns and status indicators.",
    details: `The Weekly Mission Planner shows missions organized by day across a full work week:

- **Week Selector**: Toggle between Week 1 and Week 2
- **5 Day Columns**: Monday through Friday
- **Per Mission**: Status dot (gray=pending, orange=in progress, green=completed), title, time estimate, and priority indicator
- Use this for a quick overview of your weekly workload and progress`
  },
  {
    id: "theme-overview",
    title: "Theme Overview",
    keywords: ["themes", "theme overview", "strategic goal", "core", "supporting", "emerging", "authority level", "keywords"],
    category: "Operations & Reports",
    summary: "Strategic themes overview with hierarchy, goals, and relationships.",
    details: `The Theme Overview shows all your authority themes:

- **Authority Levels**:
  - Core (green): Primary authority pillars — your strongest focus areas
  - Supporting (blue): Secondary themes that reinforce core themes
  - Emerging (purple): New areas you're developing authority in
- **Theme Cards** (click to expand):
  - Theme name and authority level
  - Description
  - Topic count and keyword count
  - **Expanded**: Strategic goal and related themes
- Themes are the foundation of your authority strategy — everything else (missions, research, metrics) ties back to these themes`
  },
  {
    id: "suggested-topics",
    title: "Suggested Topics",
    keywords: ["suggested topics", "topic ideas", "content ideas", "format", "difficulty", "authority impact"],
    category: "Operations & Reports",
    summary: "Content topic ideas filtered by theme and platform with difficulty ratings.",
    details: `Suggested Topics provides a library of content ideas:

- **Filters**: Filter by theme and/or platform
- **Each Topic Shows**:
  - Title and semantic goal (what topical depth or entity strength it addresses)
  - Theme and platform tags
  - Format (article, video, LinkedIn post, etc.)
  - Difficulty: Beginner, Intermediate, or Advanced
  - Time estimate
  - Authority Impact: High (green), Medium (orange), or Low (gray)
- Use this when you need inspiration for what to write or publish next`
  },
  {
    id: "reporting-dashboard",
    title: "Reporting Dashboard",
    keywords: ["reports", "reporting", "export", "pdf", "executive briefing", "authority momentum", "ai visibility review", "semantic positioning", "strategic risk summary", "client audit"],
    category: "Operations & Reports",
    summary: "Generate and export strategic reports in multiple formats.",
    details: `The Reporting Dashboard generates professional reports:

- **6 Report Types**:
  - Executive Briefing: High-level authority overview
  - Authority Momentum: Growth trends and trajectory
  - AI Visibility Review: AI citation and discovery analysis
  - Semantic Positioning: Topic authority assessment
  - Strategic Risk Summary: Threats and mitigations
  - Client Audit Export: White-label report for client review
- **Report Sections**: Text, metrics (pill-style boxes), lists, warnings (red), and opportunities (green)
- **Export PDF**: Download as a branded PDF with sig:nal headers, footers, and pagination
- **Report History**: View up to 5 previously generated reports`
  },
  {
    id: "system-status",
    title: "System Status",
    keywords: ["system", "status", "health", "backup", "components", "uptime", "database"],
    category: "Operations & Reports",
    summary: "System health monitoring with component status and database backup.",
    details: `System Status monitors the health of all system components:

- **Overall Status**: Healthy (green), Degraded (yellow), or Error (red)
- **Uptime**: How long the system has been running
- **Component Grid**: Individual component health (API, Database, Cache, etc.) with status messages
- **Backup Button**: Click "Backup Database" to create a database snapshot
- **Warnings**: Any system-level issues that need attention`
  },
  {
    id: "manual-viewer",
    title: "Manual",
    keywords: ["manual", "guide", "help", "documentation", "reference", "how to", "instructions"],
    category: "Operations & Reports",
    summary: "Comprehensive operational manual and strategy reference guide.",
    details: `The Manual is your full reference guide to the system. It's loaded from the MANUAL.md file and rendered with formatted headings, lists, code blocks, and tables. Use the search box at the top to filter sections by keyword — it searches both section titles and content.`
  },

  // ─── KEY CONCEPTS ────────────────────────────────────────────
  {
    id: "concept-semantic-authority",
    title: "Semantic Authority",
    keywords: ["semantic authority", "topical authority", "semantic", "topical depth", "semantic density"],
    category: "Key Concepts",
    summary: "Building deep expertise in specific topics so AI and search engines recognize you as an authority.",
    details: `Semantic Authority is about creating topical density — covering a subject so thoroughly and consistently that AI systems and search engines recognize you as an expert in that area. It's not about individual pieces of content, but the cumulative depth across your entire content portfolio. The more you publish quality content around a theme's keywords and subtopics, the stronger your semantic authority becomes.`
  },
  {
    id: "concept-entity-authority",
    title: "Entity Authority",
    keywords: ["entity", "entity authority", "entity confidence", "entity recognition", "brand recognition"],
    category: "Key Concepts",
    summary: "How clearly and consistently AI systems recognize your brand as a distinct entity.",
    details: `Entity Authority measures how well AI systems can identify and describe your brand/organization. A strong entity has consistent information across the web — same name, description, services, and expertise everywhere. A weak entity has fragmented or contradictory information. The Entity Confidence score (1-10) tells you how clearly AI sees you. Improve it by ensuring consistent messaging across all platforms.`
  },
  {
    id: "concept-ai-visibility",
    title: "AI Visibility",
    keywords: ["ai visibility", "ai citations", "cited", "ai overview", "chatgpt visibility", "perplexity"],
    category: "Key Concepts",
    summary: "How often AI systems like ChatGPT, Perplexity, and Google AI Overview cite your content.",
    details: `AI Visibility measures whether AI-powered search and assistants reference your content when users ask relevant questions. The AI Visibility Rate (%) is the percentage of tested queries where your content was cited. Platforms tracked include ChatGPT, Perplexity, and Google AI Overview. Higher AI visibility means more organic discovery and authority reinforcement.`
  },
  {
    id: "concept-corroboration",
    title: "External Corroboration",
    keywords: ["corroboration", "external validation", "mentions", "citations", "backlinks", "partnerships", "guest articles", "podcasts"],
    category: "Key Concepts",
    summary: "Third-party validations that strengthen your authority claims.",
    details: `External Corroboration is when other sources validate your authority — mentions in articles, citations in research, guest articles you've written, podcast appearances, backlinks, directory listings, and partnerships. AI systems weigh corroboration heavily when deciding who to cite. The more independent sources reference you, the higher your corroboration score and the more likely AI will cite you.`
  },
  {
    id: "concept-drift",
    title: "Drift Detection",
    keywords: ["drift", "over-focus", "under-focus", "imbalance", "consistency decline"],
    category: "Key Concepts",
    summary: "Alerts when your execution deviates from your strategic plan.",
    details: `Drift Detection monitors whether your actual execution matches your strategy:

- **Over-focus**: Spending too much time on one theme at the expense of others
- **Under-focus**: Neglecting a theme that needs attention
- **Declining Consistency**: Your completion rate is dropping
- **Semantic Imbalance**: Uneven topic coverage creating gaps in your authority

When drift is detected, the system provides specific correction suggestions.`
  },
  {
    id: "concept-themes",
    title: "Themes",
    keywords: ["themes", "focus themes", "core theme", "supporting theme", "emerging theme", "theme cadence"],
    category: "Key Concepts",
    summary: "The strategic topics that form the pillars of your authority positioning.",
    details: `Themes are the foundational topics of your authority strategy. Everything in the system — missions, research, metrics, visibility — connects back to themes.

- **Core Themes**: Your primary authority pillars. These should get the most attention and content
- **Supporting Themes**: Secondary topics that reinforce your core themes
- **Emerging Themes**: New areas you're developing authority in

Theme Cadence tracks how often you're working on each theme. Ideally, core themes should be "high" cadence, supporting themes "moderate", and emerging themes at least "low" — never "inactive" for too long.`
  },
  {
    id: "concept-missions",
    title: "Missions & Task Kinds",
    keywords: ["missions", "tasks", "pending", "in progress", "completed", "priority", "execution order", "task kind", "core authority asset", "reinforcement", "maintenance", "research"],
    category: "Key Concepts",
    summary: "Tasks come in five kinds — Core Asset, Reinforcement, Maintenance, Research, Strategic Review.",
    details: `Tasks are your authority-building work units. Each task has:

- **Task Kind** — determines its role in the 1→many model:
  - **Core Authority Asset** — the one heavy weekly anchor (Monday)
  - **Reinforcement** — light/medium amplification + community participation (Tue–Thu)
  - **Maintenance** — entity / schema / internal-site upkeep (Friday)
  - **Research** — weekly intelligence intake (Friday)
  - **Strategic Review** — close-the-loop reflection (Friday)
- **Load Tier**: Heavy (red), Medium (orange), Light (green) — cognitive cost
- **Status**: Pending → In Progress → Completed
- **Theme**: Which authority theme it supports
- **Channel**: Where the work happens (Blog / LinkedIn / YouTube / Reddit / Community / Internal Site / Entity Platforms / Podcast / Conference / Internal)
- **Execution Prompt** (reinforcement tasks): the literal instruction — "Find an honest question about GEO on r/SEO, write a 200–400 word non-promotional answer"
- **Priority Scores**: Strategic, Impact, Semantic, Reinforcement Value, Overall (each 1-10)

Consistent completion builds your Consistency Streak and improves Execution Consistency.`
  },
  {
    id: "concept-channels",
    title: "Channels",
    keywords: ["channels", "blog", "linkedin", "youtube", "reddit", "community", "internal site", "entity platforms", "podcast", "conference"],
    category: "Key Concepts",
    summary: "The 10 surfaces where authority work happens.",
    details: `The platform routes work across 10 channels, not just blog + LinkedIn:

- **Blog** — long-form authority (Interon site or guest publication)
- **LinkedIn** — founder + brand reinforcement
- **YouTube** — long-form explainers, clips, founder commentary
- **Reddit** — educational community contribution
- **Industry Communities** — Umbraco forums, Stack Overflow, dev.to, Discord, Slack
- **Internal Site** — Interon.co.za authority surface (internal linking, schema, service pages, author bios)
- **Entity Platforms** — Wikidata, Crunchbase, GitHub, Knowledge Panel, directories
- **Podcasts** — founder voice on external shows
- **Conferences** — speaker pipeline
- **Strategic Ops** — research and review work

The weekly cadence forces channel diversity: Tuesday is LinkedIn, Wednesday is Reddit/Community, Thursday is YouTube, Friday is Entity Platforms + Internal Site. Channel rotation matters as much as theme rotation.`
  },
  {
    id: "concept-scores",
    title: "Scores & Metrics",
    keywords: ["scores", "metrics", "1-10", "health", "consistency", "coverage", "ratings"],
    category: "Key Concepts",
    summary: "Understanding the scoring system used throughout the application.",
    details: `The system uses several scoring scales:

- **1-10 Scores**: Authority Health, Execution Consistency, Semantic Coverage, Priority, Impact, Confidence, etc.
  - 8-10: Excellent/Strong
  - 6-7: Good/Moderate
  - 4-5: Fair/Developing
  - 1-3: Weak/Needs attention
- **Percentages**: AI Visibility Rate, citation rates
- **Trends**: Shown with arrows — up (green, improving), stable (blue, maintaining), down (orange/red, declining)
- **Status Colors**: Green = positive/strong, Blue = neutral/moderate, Orange = warning, Red = critical/risk, Purple = emerging/special, Gray = low/inactive`
  }
];
