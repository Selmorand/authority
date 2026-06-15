export type MissionStatus = "pending" | "in-progress" | "completed";
export type MissionPriority = "high" | "medium" | "low";

export type MissionCategory =
  | "LinkedIn Authority Post"
  | "GEO Educational Article"
  | "YouTube Audit Breakdown"
  | "Case Study Development"
  | "Umbraco Authority Contribution"
  | "Research Collection"
  | "Entity Reinforcement"
  | "Technical SEO Breakdown";

export interface Mission {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  title: string;
  category: MissionCategory;
  authorityFocus: string;
  platform: string;
  estimatedTime: string;
  objective: string;
  topic: string;
  description: string;
  status: MissionStatus;
  priority: MissionPriority;
}

// ─── 2 Weeks of Realistic Mock Missions ─────────────────────

export const missions: Mission[] = [];

// ─── Helpers ─────────────────────────────────────────────────

export function getMissionsByDate(date: string): Mission[] {
  return missions.filter((m) => m.date === date);
}

export function getMissionsForWeek(weekStartDate: string): Mission[] {
  const start = new Date(weekStartDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 5); // Mon-Fri
  return missions.filter((m) => {
    const d = new Date(m.date);
    return d >= start && d < end;
  });
}

export function getWeekDates(weekStartDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(weekStartDate);
  for (let i = 0; i < 5; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}
