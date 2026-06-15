"use client";

import { useState } from "react";

// Daily Operations
import MorningBriefing from "./components/MorningBriefing";
import TaskGenerator from "./components/TaskGenerator";
import GeneratedDailyPlan from "./components/GeneratedDailyPlan";
import ExecutionDashboard from "./components/ExecutionDashboard";

// Strategic Intelligence
import CommandCenter from "./components/CommandCenter";
import CopilotDashboard from "./components/CopilotDashboard";
import StrategicRiskPanel from "./components/StrategicRiskPanel";
import OpportunityIntelligence from "./components/OpportunityIntelligence";

// Research & Trends
import LiveResearchFeed from "./components/LiveResearchFeed";
import StrategicBriefing from "./components/StrategicBriefing";
import ResearchIntelligence from "./components/ResearchIntelligence";
import TrendIntelligenceDashboard from "./components/TrendIntelligenceDashboard";
import SearchEcosystemMonitor from "./components/SearchEcosystemMonitor";

// Authority & Visibility
import AuthorityGrowthDashboard from "./components/AuthorityGrowthDashboard";
import EntityVisibilityTracker from "./components/EntityVisibilityTracker";
import AIDiscoverabilityDashboard from "./components/AIDiscoverabilityDashboard";
import AuthorityKnowledgeGraph from "./components/AuthorityKnowledgeGraph";
import AuthorityLearning from "./components/AuthorityLearning";
import StrategicReflection from "./components/StrategicReflection";

// AI Tools
import AIMissionPanel from "./components/AIMissionPanel";
import AmplificationDashboard from "./components/AmplificationDashboard";
import MultiModelIntelligence from "./components/MultiModelIntelligence";
import VideoRenderPanel from "./components/VideoRenderPanel";

// Operations
import AuthorityCalendar from "./components/AuthorityCalendar";
import ThemeOverview from "./components/ThemeOverview";
import SuggestedTopics from "./components/SuggestedTopics";
import ReportingDashboard from "./components/ReportingDashboard";
import SystemStatus from "./components/SystemStatus";
import ManualViewer from "./components/ManualViewer";
import HelpPanel from "./components/HelpPanel";

// Measurement
import MeasurementDashboard from "./components/MeasurementDashboard";
import AIVisibilityTracker from "./components/AIVisibilityTracker";

type View = "daily" | "strategy" | "research" | "authority" | "measurement" | "tools" | "operations" | "manual";

const views: { id: View; label: string; shortLabel: string }[] = [
  { id: "daily", label: "Daily Operations", shortLabel: "Daily" },
  { id: "strategy", label: "Strategic Intelligence", shortLabel: "Strategy" },
  { id: "research", label: "Research & Trends", shortLabel: "Research" },
  { id: "authority", label: "Authority & Visibility", shortLabel: "Authority" },
  { id: "measurement", label: "Measurement", shortLabel: "Measure" },
  { id: "tools", label: "AI Tools", shortLabel: "Tools" },
  { id: "operations", label: "Operations & Reports", shortLabel: "Ops" },
  { id: "manual", label: "Manual", shortLabel: "Manual" },
];

export default function Home() {
  const [activeView, setActiveView] = useState<View>("daily");

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="border-b border-card-border-subtle bg-background-raised/90 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground-bright">
                sig:nal
              </h1>
              <p className="text-xs text-muted tracking-wide uppercase hidden sm:block">
                Your authority signal.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="hidden sm:inline">System Active</span>
            </div>
          </div>
          {/* Navigation */}
          <nav className="flex gap-1 pb-2 overflow-x-auto">
            {views.map((v) => (
              <button
                key={v.id}
                onClick={() => setActiveView(v.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-colors whitespace-nowrap ${
                  activeView === v.id
                    ? "bg-accent/15 text-accent border-accent/30"
                    : "bg-transparent text-muted border-transparent hover:text-foreground hover:border-card-border-subtle"
                }`}
              >
                <span className="hidden sm:inline">{v.label}</span>
                <span className="sm:hidden">{v.shortLabel}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {activeView === "daily" && <DailyView />}
          {activeView === "strategy" && <StrategyView />}
          {activeView === "research" && <ResearchView />}
          {activeView === "authority" && <AuthorityView />}
          {activeView === "measurement" && <MeasurementView />}
          {activeView === "tools" && <ToolsView />}
          {activeView === "operations" && <OperationsView />}
          {activeView === "manual" && <ManualView />}
        </div>
      </main>
      <HelpPanel />
    </div>
  );
}

/* ─── Views ───────────────────────────────────────────────────
   Each view shows a focused set of components.
   The daily view is what you see every morning.
   Other views are accessed when needed.
──────────────────────────────────────────────────────────────── */

function DailyView() {
  return (
    <>
      <TaskGenerator />
      <MorningBriefing />
      <GeneratedDailyPlan />
      <ExecutionDashboard />
    </>
  );
}

function StrategyView() {
  return (
    <>
      <CommandCenter />
      <CopilotDashboard />
      <StrategicRiskPanel />
      <OpportunityIntelligence />
    </>
  );
}

function ResearchView() {
  return (
    <>
      <LiveResearchFeed />
      <StrategicBriefing />
      <ResearchIntelligence />
      <TrendIntelligenceDashboard />
      <SearchEcosystemMonitor />
    </>
  );
}

function AuthorityView() {
  return (
    <>
      <AuthorityGrowthDashboard />
      <EntityVisibilityTracker />
      <AIDiscoverabilityDashboard />
      <AuthorityKnowledgeGraph />
      <AuthorityLearning />
      <StrategicReflection />
    </>
  );
}

function MeasurementView() {
  return (
    <>
      <MeasurementDashboard />
      <AIVisibilityTracker />
    </>
  );
}

function ToolsView() {
  return (
    <>
      <AIMissionPanel />
      <VideoRenderPanel />
      <AmplificationDashboard />
      <MultiModelIntelligence />
    </>
  );
}

function ManualView() {
  return <ManualViewer />;
}

function OperationsView() {
  return (
    <>
      <AuthorityCalendar />
      <ThemeOverview />
      <SuggestedTopics />
      <ReportingDashboard />
      <SystemStatus />
    </>
  );
}
