export type MemoryType =
  | "completed-mission"
  | "successful-topic"
  | "authority-insight"
  | "content-performance"
  | "semantic-pattern"
  | "strategic-lesson";

export interface MemoryItem {
  id: string;
  date: string;
  type: MemoryType;
  theme: string; // theme id
  insight: string;
  authorityImpact: number; // 1-10
  semanticValue: number; // 1-10
  outcomeSummary: string;
  strategicNotes: string;
  category?: string;
  platform?: string;
}

// ─── Seed Data: Realistic Historical Memory ──────────────────
// Represents 4 weeks of prior strategic execution

export const seedMemory: MemoryItem[] = [];
