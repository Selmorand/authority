import TodaysMissions from "./components/TodaysMissions";
import WeeklyMissionView from "./components/WeeklyMissionView";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="border-b border-card-border bg-card-bg/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Interon Authority OS
          </h1>
          <p className="text-sm text-muted mt-0.5">
            AI Visibility & Authority Execution System
          </p>
        </div>
      </header>

      {/* Dashboard Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {/* Mission Engine — spans full width */}
          <TodaysMissions />
          <WeeklyMissionView />

          {/* Supporting Dashboard Cards */}
          <ContentPipeline />
          <ResearchVault />
          <CaseStudyVault />
          <AuthorityMetrics />
        </div>
      </main>
    </div>
  );
}

/* ─── Shared Card Wrapper ─────────────────────────────────── */

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-4">
      <h2 className="text-base font-semibold text-white tracking-wide uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ─── Content Pipeline ────────────────────────────────────── */

function PipelineColumn({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: string;
}) {
  return (
    <div className="flex-1 min-w-0">
      <h3
        className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
        style={{ color }}
      >
        <span
          className="w-2 h-2 rounded-full inline-block"
          style={{ backgroundColor: color }}
        />
        {title}
        <span className="text-muted ml-auto">{items.length}</span>
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="text-sm text-foreground bg-background/50 border border-card-border/60 rounded-lg px-3 py-2"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContentPipeline() {
  return (
    <Card title="Content Pipeline">
      <div className="flex flex-col sm:flex-row gap-5">
        <PipelineColumn
          title="Ideas"
          color="#f59e0b"
          items={[
            "Schema markup for AI crawlers",
            "Umbraco vs WordPress for AI readiness",
            "GEO ranking factors deep dive",
          ]}
        />
        <PipelineColumn
          title="Drafting"
          color="#3b82f6"
          items={[
            "Machine-readable website checklist",
            "AI visibility audit framework",
          ]}
        />
        <PipelineColumn
          title="Published"
          color="#22c55e"
          items={[
            "Why AI can't read your website",
            "Technical SEO in the age of LLMs",
          ]}
        />
      </div>
    </Card>
  );
}

/* ─── Research Vault ──────────────────────────────────────── */

function ResearchVault() {
  const topics = [
    "Google SGE impact on organic traffic",
    "Structured data best practices 2026",
    "LLM citation patterns and source preferences",
    "Umbraco 14+ headless API capabilities",
    "Competitor analysis: AI-first SEO agencies",
    "Machine-readable content specifications",
  ];

  return (
    <Card title="Research Vault">
      <ul className="space-y-2">
        {topics.map((t) => (
          <li
            key={t}
            className="flex items-center gap-3 text-sm text-foreground bg-background/50 border border-card-border/60 rounded-lg px-4 py-2.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
            {t}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ─── Case Study Vault ────────────────────────────────────── */

function CaseStudyVault() {
  const studies = [
    {
      title: "Umbraco AI Readiness Transformation",
      status: "In Progress",
      statusColor: "#3b82f6",
    },
    {
      title: "GEO Strategy for B2B SaaS Client",
      status: "Draft",
      statusColor: "#f59e0b",
    },
    {
      title: "Technical SEO Overhaul: 3x Organic Growth",
      status: "Published",
      statusColor: "#22c55e",
    },
    {
      title: "Machine-Readable Website Migration",
      status: "Research",
      statusColor: "#a855f7",
    },
  ];

  return (
    <Card title="Case Study Vault">
      <ul className="space-y-2">
        {studies.map((s) => (
          <li
            key={s.title}
            className="flex items-center justify-between gap-3 bg-background/50 border border-card-border/60 rounded-lg px-4 py-3"
          >
            <span className="text-sm text-foreground">{s.title}</span>
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap"
              style={{
                color: s.statusColor,
                borderColor: `${s.statusColor}40`,
                backgroundColor: `${s.statusColor}15`,
              }}
            >
              {s.status}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ─── Authority Metrics ───────────────────────────────────── */

function MetricCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) {
  const isPositive = change.startsWith("+");
  return (
    <div className="bg-background/50 border border-card-border/60 rounded-lg px-4 py-3 text-center">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
      <p
        className={`text-xs mt-1 font-medium ${isPositive ? "text-green-400" : "text-muted"}`}
      >
        {change}
      </p>
    </div>
  );
}

function AuthorityMetrics() {
  const metrics = [
    { label: "LinkedIn Followers", value: "2,847", change: "+124 this month" },
    { label: "Published Articles", value: "18", change: "+3 this month" },
    { label: "Case Studies", value: "4", change: "+1 this month" },
    { label: "External Mentions", value: "12", change: "+5 this month" },
  ];

  return (
    <Card title="Authority Metrics">
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>
    </Card>
  );
}
