"use client";

import { getMissionsByDate } from "@/data/missions";
import MissionCard from "./MissionCard";

function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

export default function TodaysMissions() {
  // Try today first; fall back to first available date with missions
  let today = getTodayString();
  let todayMissions = getMissionsByDate(today);

  // If no missions for today (e.g. weekend or outside mock range), show first mock date
  if (todayMissions.length === 0) {
    today = "2026-05-11"; // first Monday in mock data
    todayMissions = getMissionsByDate(today);
  }

  const dayLabel = new Date(today + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const totalTime = todayMissions.reduce((sum, m) => {
    const mins = parseInt(m.estimatedTime);
    return sum + (isNaN(mins) ? 0 : mins);
  }, 0);

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            Today&apos;s Missions
          </h2>
          <p className="text-sm text-muted mt-0.5">{dayLabel}</p>
        </div>
        <div className="flex gap-4 text-xs text-muted">
          <span>{todayMissions.length} missions</span>
          <span>{totalTime} min estimated</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {todayMissions.map((m) => (
          <MissionCard key={m.id} mission={m} />
        ))}
      </div>
    </section>
  );
}
