export interface ContentAngle {
  id: string;
  name: string;
  description: string;
  tone: string;
}

export const contentAngles: ContentAngle[] = [
  {
    id: "myth-busting",
    name: "Myth Busting",
    description:
      "Challenge widely held assumptions with evidence and technical clarity",
    tone: "Authoritative, direct",
  },
  {
    id: "audit-breakdown",
    name: "Audit Breakdown",
    description:
      "Walk through a real audit process showing methodology and findings",
    tone: "Technical, educational",
  },
  {
    id: "before-vs-after",
    name: "Before vs After",
    description:
      "Show measurable transformation with concrete metrics and outcomes",
    tone: "Evidence-driven, compelling",
  },
  {
    id: "technical-explainer",
    name: "Technical Explainer",
    description:
      "Break down complex technical concepts for a professional audience",
    tone: "Clear, precise",
  },
  {
    id: "industry-critique",
    name: "Industry Critique",
    description:
      "Offer informed criticism of common industry practices or trends",
    tone: "Thought-provoking, candid",
  },
  {
    id: "founder-insight",
    name: "Founder Insight",
    description:
      "Share strategic perspective from hands-on consultancy experience",
    tone: "Personal, strategic",
  },
  {
    id: "strategic-warning",
    name: "Strategic Warning",
    description:
      "Alert audience to emerging risks they may not yet be aware of",
    tone: "Urgent, authoritative",
  },
  {
    id: "case-study",
    name: "Case Study",
    description:
      "Document a real engagement with problem, process, and results",
    tone: "Professional, evidence-based",
  },
  {
    id: "framework-explanation",
    name: "Framework Explanation",
    description:
      "Introduce a reusable framework or methodology for solving a specific problem",
    tone: "Structured, instructional",
  },
];

export function getAngleById(id: string): ContentAngle | undefined {
  return contentAngles.find((a) => a.id === id);
}
