"use client";

import { missions, getWeekDates, getMissionsByDate } from "@/data/missions";
import type { MissionStatus } from "@/data/missions";
import { useState } from "react";

const WEEK_1_START = "2026-05-11";
const WEEK_2_START = "2026-05-18";

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const statusDot: Record<MissionStatus, string> = {
  pending: "#94a3b8",
  "in-progress": "#f59e0b",
  completed: "#22c55e",
};

const priorityColors: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#3b82f6",
};

export default function WeeklyMissionView() {
  const [activeWeek, setActiveWeek] = useState(WEEK_1_START);
  const dates = getWeekDates(activeWeek);

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
          Weekly Mission Planner
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveWeek(WEEK_1_START)}
            className={`text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
              activeWeek === WEEK_1_START
                ? "bg-accent/15 text-accent border-accent/30"
                : "bg-background/50 text-muted border-card-border hover:text-foreground"
            }`}
          >
            Week 1
          </button>
          <button
            onClick={() => setActiveWeek(WEEK_2_START)}
            className={`text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
              activeWeek === WEEK_2_START
                ? "bg-accent/15 text-accent border-accent/30"
                : "bg-background/50 text-muted border-card-border hover:text-foreground"
            }`}
          >
            Week 2
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {dates.map((date, i) => {
          const dayMissions = getMissionsByDate(date);
          return (
            <div
              key={date}
              className="rounded-lg border border-card-border/60 bg-background/40 p-3 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-foreground-bright uppercase tracking-wider">
                  {dayNames[i]}
                </h3>
                <span className="text-[10px] text-muted">
                  {new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {dayMissions.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-md bg-card-bg/80 border border-card-border/40 px-2.5 py-2 text-[11px] leading-snug"
                  >
                    <div className="flex items-start gap-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1 shrink-0"
                        style={{ backgroundColor: statusDot[m.status] }}
                      />
                      <span className="text-foreground/90 line-clamp-2">
                        {m.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted">
                      <span>{m.estimatedTime}</span>
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: priorityColors[m.priority],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
