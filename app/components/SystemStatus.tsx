"use client";

import { useState, useEffect } from "react";

interface SystemComponent {
  name: string;
  status: "healthy" | "degraded" | "error";
  message: string;
  lastChecked: string;
}

interface HealthData {
  overallStatus: "healthy" | "degraded" | "error";
  components: SystemComponent[];
  warnings: string[];
  uptime: string;
}

const statusConfig: Record<string, { color: string; label: string; dot: string }> = {
  healthy: { color: "#22c55e", label: "Healthy", dot: "bg-green-500" },
  degraded: { color: "#f59e0b", label: "Degraded", dot: "bg-yellow-500" },
  error: { color: "#ef4444", label: "Error", dot: "bg-red-500" },
};

export default function SystemStatus() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/system/health")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setHealth(d);
      })
      .catch(() => {});
  }, []);

  async function handleBackup() {
    setBackupStatus("Creating...");
    try {
      const res = await fetch("/api/system/backup", { method: "POST" });
      const data = await res.json();
      setBackupStatus(data.success ? "Backup created" : `Failed: ${data.error}`);
    } catch {
      setBackupStatus("Backup failed");
    }
  }

  if (!health) return null;

  const overall = statusConfig[health.overallStatus];

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            System Status
          </h2>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${overall.dot}`} />
            <span className="text-xs font-medium" style={{ color: overall.color }}>
              {overall.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted">Uptime: {health.uptime}</span>
          <button
            onClick={handleBackup}
            className="text-[11px] px-3 py-1.5 rounded-lg border border-card-border-subtle bg-background-raised text-muted hover:text-foreground cursor-pointer transition-colors"
          >
            {backupStatus ?? "Backup Database"}
          </button>
        </div>
      </div>

      {/* Components */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {health.components.map((c) => {
          const cfg = statusConfig[c.status];
          return (
            <div
              key={c.name}
              className="rounded-lg border px-3 py-2.5"
              style={{ borderColor: `${cfg.color}18`, backgroundColor: `${cfg.color}04` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                <span className="text-[11px] text-foreground-bright font-medium">
                  {c.name}
                </span>
              </div>
              <p className="text-[10px] text-muted leading-relaxed">{c.message}</p>
            </div>
          );
        })}
      </div>

      {/* Warnings */}
      {health.warnings.length > 0 && (
        <div className="space-y-1">
          {health.warnings.map((w, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-[11px] text-yellow-400/80 bg-yellow-500/4 border border-yellow-500/10 rounded-lg px-3 py-2"
            >
              <span className="shrink-0">!</span> {w}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
