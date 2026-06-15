export type SignalCategory =
  | "trend"
  | "topic-shift"
  | "industry-observation"
  | "competitor-pattern"
  | "semantic-opportunity"
  | "authority-gap";

export type SignalUrgency = "high" | "medium" | "low";

export type AlertType =
  | "high-priority-opportunity"
  | "authority-gap-warning"
  | "emerging-trend"
  | "competitor-movement"
  | "topic-saturation-risk";

export interface ResearchSignal {
  id: string;
  title: string;
  category: SignalCategory;
  relevance: number; // 1-10
  authorityOpportunity: number; // 1-10
  urgency: SignalUrgency;
  relatedThemes: string[]; // theme ids
  insightSummary: string;
  suggestedActions: string[];
  alertType: AlertType;
  dateDetected: string; // ISO date
}

export const researchSignals: ResearchSignal[] = [];

// ─── Helpers ─────────────────────────────────────────────────

export function getSignalsByUrgency(urgency: SignalUrgency): ResearchSignal[] {
  return researchSignals.filter((s) => s.urgency === urgency);
}

export function getSignalsByTheme(themeId: string): ResearchSignal[] {
  return researchSignals.filter((s) => s.relatedThemes.includes(themeId));
}

export function getSignalsByAlert(alertType: AlertType): ResearchSignal[] {
  return researchSignals.filter((s) => s.alertType === alertType);
}
