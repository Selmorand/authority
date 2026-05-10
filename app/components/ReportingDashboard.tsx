"use client";

import { useState, useCallback } from "react";
import { jsPDF } from "jspdf";
import { generateReport, getReportHistory } from "@/lib/generateStrategicReport";
import type { StrategicReport, ReportType, ReportSection } from "@/lib/generateStrategicReport";

const reportTypes: { type: ReportType; label: string; description: string }[] = [
  { type: "executive-briefing", label: "Executive Briefing", description: "Weekly authority intelligence overview" },
  { type: "authority-momentum", label: "Authority Momentum", description: "Growth trajectory and health analysis" },
  { type: "ai-visibility", label: "AI Visibility Review", description: "Discoverability and citation analysis" },
  { type: "semantic-positioning", label: "Semantic Positioning", description: "Trend clustering and density report" },
  { type: "strategic-risk", label: "Strategic Risk Summary", description: "Risks, drift, and mitigation priorities" },
  { type: "client-audit", label: "Client Audit Export", description: "Client-facing authority assessment" },
];

const sectionTypeColors: Record<string, string> = {
  text: "#38bdf8",
  metrics: "#22c55e",
  list: "#6b7280",
  warning: "#ef4444",
  opportunity: "#22c55e",
};

export default function ReportingDashboard() {
  const [report, setReport] = useState<StrategicReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(getReportHistory());

  function handleGenerate(type: ReportType) {
    setLoading(true);
    setTimeout(() => {
      const r = generateReport(type);
      setReport(r);
      setHistory(getReportHistory());
      setLoading(false);
    }, 100);
  }

  const handleExportPDF = useCallback(() => {
    if (!report) return;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 25;

    // Header
    doc.setFillColor(17, 19, 21);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(232, 234, 237);
    doc.setFontSize(18);
    doc.text(report.title, margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(report.subtitle, margin, y);
    y += 6;
    doc.text(`Generated: ${new Date(report.generatedAt).toLocaleString("en-GB")}`, margin, y);
    y += 15;

    // Sections
    doc.setTextColor(33, 33, 33);
    for (const section of report.sections) {
      // Check page break
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      // Section title
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(section.title, margin, y);
      y += 7;

      // Section content
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      const lines = doc.splitTextToSize(section.content, contentWidth);
      for (const line of lines) {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += 4.5;
      }
      y += 6;
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `sig:nal — ${report.title} — Page ${i}/${pageCount}`,
        margin,
        290
      );
    }

    doc.save(`signal-${report.type}-${new Date().toISOString().split("T")[0]}.pdf`);
  }, [report]);

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            Strategic Reporting
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Generate and export authority intelligence reports
          </p>
        </div>
        {report && (
          <button
            onClick={handleExportPDF}
            className="self-start sm:self-auto px-5 py-2.5 rounded-lg bg-accent/90 text-background text-sm font-medium cursor-pointer transition-colors hover:bg-accent-glow"
          >
            Export PDF
          </button>
        )}
      </div>

      {/* Report type selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {reportTypes.map((rt) => (
          <button
            key={rt.type}
            onClick={() => handleGenerate(rt.type)}
            disabled={loading}
            className="text-left rounded-lg bg-background-raised border border-card-border-subtle px-3.5 py-3 cursor-pointer transition-colors hover:border-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <p className="text-xs text-foreground-bright font-medium">{rt.label}</p>
            <p className="text-xs text-muted mt-0.5">{rt.description}</p>
          </button>
        ))}
      </div>

      {/* Generated report */}
      {report && (
        <div className="space-y-3">
          {/* Report header */}
          <div className="rounded-lg bg-accent/5 border border-accent/15 px-4 py-3">
            <p className="text-sm font-semibold text-foreground-bright">{report.title}</p>
            <p className="text-xs text-muted mt-0.5">
              {report.subtitle} &middot;{" "}
              {new Date(report.generatedAt).toLocaleString("en-GB")}
            </p>
          </div>

          {/* Sections */}
          {report.sections.map((section, i) => (
            <SectionCard key={i} section={section} />
          ))}
        </div>
      )}

      {/* Report history */}
      {history.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Report History ({history.length})
          </h3>
          <div className="space-y-1">
            {history.slice(0, 5).map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between bg-background-raised border border-card-border-subtle rounded-lg px-3 py-2 text-xs"
              >
                <span className="text-foreground">{h.title}</span>
                <span className="text-muted text-xs">
                  {new Date(h.generatedAt).toLocaleString("en-GB", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!report && !loading && (
        <div className="rounded-lg bg-background-raised border border-card-border-subtle px-6 py-10 text-center">
          <p className="text-sm text-muted">
            Select a report type above to generate a strategic intelligence report.
          </p>
        </div>
      )}
    </section>
  );
}

function SectionCard({ section }: { section: ReportSection }) {
  const accentColor = sectionTypeColors[section.type] ?? "#6b7280";

  return (
    <div className="rounded-lg bg-background-raised border border-card-border-subtle px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        <h3 className="text-xs font-semibold text-foreground-bright">{section.title}</h3>
      </div>

      {section.type === "metrics" ? (
        <div className="flex flex-wrap gap-3 text-xs">
          {section.content.split(" | ").map((m, i) => {
            const [label, value] = m.split(": ");
            return (
              <div key={i} className="bg-background border border-card-border-subtle rounded px-2.5 py-1.5 text-center">
                <span className="text-foreground-bright font-bold">{value}</span>
                <span className="text-muted ml-1.5">{label}</span>
              </div>
            );
          })}
        </div>
      ) : section.type === "list" ? (
        <div className="space-y-1">
          {section.content.split("\n").filter(Boolean).map((line, i) => (
            <p key={i} className="text-xs text-foreground/70 leading-relaxed flex items-start gap-2">
              <span className="text-muted/40 shrink-0">-</span>
              <span>{line}</span>
            </p>
          ))}
        </div>
      ) : section.type === "warning" ? (
        <div className="rounded bg-red-500/4 border border-red-500/10 px-3 py-2">
          <p className="text-xs text-foreground/80 leading-relaxed">{section.content}</p>
        </div>
      ) : section.type === "opportunity" ? (
        <div className="rounded bg-green-500/4 border border-green-500/10 px-3 py-2">
          <p className="text-xs text-foreground/80 leading-relaxed">{section.content}</p>
        </div>
      ) : (
        <p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-wrap">
          {section.content}
        </p>
      )}
    </div>
  );
}
