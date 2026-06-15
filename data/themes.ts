export type AuthorityLevel = "core" | "supporting" | "emerging";

export interface Theme {
  id: string;
  name: string;
  description: string;
  strategicGoal: string;
  targetAudience: string;
  authorityLevel: AuthorityLevel;
  // Target share of monthly content output (0..1). Should sum to 1.0
  // across all themes. The mission generator uses this to rotate.
  weight: number;
  relatedThemes: string[];
  keywords: string[];
  contentAngles: string[]; // content angle ids
}

// ─── Content Pillars ─────────────────────────────────────────
// Interon's eight content pillars, defined by the current
// positioning: "AI-Engineered Web Architecture and Agentic
// Automation specialist". Weights sum to 1.0 and drive the
// monthly rotation enforced by the mission generator.

export const themes: Theme[] = [
  {
    id: "website-health",
    name: "Website Health",
    description:
      "Why a website is no longer just a brochure. Structure, clarity, performance, security, backups, hosting, maintenance. Why cheap AI-built sites cause long-term problems. Why sites must be readable by humans, search engines, and AI systems. How unhealthy sites lose trust, traffic, leads, and citations.",
    strategicGoal:
      "Position Interon as the practical authority on what makes a website genuinely healthy in the AI era",
    targetAudience:
      "Business owners, marketing managers, operations leads at SMBs and mid-market companies",
    authorityLevel: "core",
    weight: 0.20,
    relatedThemes: ["ai-visibility-geo", "trust-security-risk", "business-systems"],
    keywords: [
      "website health",
      "website performance",
      "website maintenance",
      "website structure",
      "AI-readable website",
      "cheap AI website",
      "website security",
      "site speed",
    ],
    contentAngles: [
      "audit-breakdown",
      "before-vs-after",
      "technical-explainer",
      "strategic-warning",
    ],
  },
  {
    id: "ai-visibility-geo",
    name: "AI Visibility and GEO",
    description:
      "How AI tools interpret businesses. Why structured data matters. Why clear business identity matters. Why vague content does not get cited. How AI assistants choose which businesses to mention. Generative Engine Optimisation explained simply.",
    strategicGoal:
      "Own the practical 'how AI cites businesses' conversation — without becoming a GEO-only consultancy",
    targetAudience:
      "Marketing leaders, content strategists, SEO managers, mid-market digital leads",
    authorityLevel: "core",
    weight: 0.15,
    relatedThemes: ["website-health", "digital-authority", "practical-ai-owners"],
    keywords: [
      "AI visibility",
      "generative engine optimisation",
      "GEO",
      "structured data",
      "schema markup",
      "entity clarity",
      "AI citation",
      "LLM visibility",
    ],
    contentAngles: [
      "myth-busting",
      "framework-explanation",
      "technical-explainer",
      "before-vs-after",
    ],
  },
  {
    id: "agentic-automation",
    name: "Agentic Automation",
    description:
      "How businesses can connect websites, CRM, email, accounting, reporting, customer service, internal workflows, and admin systems. What agentic automation actually means in practical business terms. Examples of small automations that save time. When automation is useful and when it is unnecessary. Why websites are becoming control points for wider business systems.",
    strategicGoal:
      "Make Interon the recognised practical voice on agentic automation for small and mid-market businesses",
    targetAudience:
      "Owner-operators, operations managers, COOs at small and mid-market businesses",
    authorityLevel: "core",
    weight: 0.20,
    relatedThemes: ["business-systems", "practical-ai-owners", "website-health"],
    keywords: [
      "agentic automation",
      "business automation",
      "AI agents",
      "workflow automation",
      "CRM integration",
      "automation example",
      "AI workflow",
    ],
    contentAngles: [
      "framework-explanation",
      "case-study",
      "technical-explainer",
      "before-vs-after",
    ],
  },
  {
    id: "business-systems",
    name: "Business Systems and Digital Operations",
    description:
      "How disconnected systems create admin waste. Why business data must flow between platforms. How to reduce manual follow-ups. How to create better quoting, onboarding, reporting, lead capture, and customer response systems. Why the website should connect into operations, not sit separately.",
    strategicGoal:
      "Surface the operations-and-integration side of Interon — not just websites, the systems behind them",
    targetAudience:
      "Owner-operators, COOs, ops managers, finance and admin leaders at SMBs",
    authorityLevel: "core",
    weight: 0.15,
    relatedThemes: ["agentic-automation", "website-health", "trust-security-risk"],
    keywords: [
      "business systems",
      "digital operations",
      "system integration",
      "data flow",
      "manual follow-up",
      "quoting system",
      "onboarding system",
      "lead capture",
    ],
    contentAngles: [
      "audit-breakdown",
      "before-vs-after",
      "framework-explanation",
      "industry-critique",
    ],
  },
  {
    id: "trust-security-risk",
    name: "Trust, Security and Risk",
    description:
      "Website security scans. Backups. Outdated CMS risk. Broken links. Technical debt. Domain, hosting, DNS, SSL, email deliverability. Why neglected websites damage credibility.",
    strategicGoal:
      "Build Interon's reputation as the consultancy that takes the unglamorous-but-critical risk surface seriously",
    targetAudience:
      "Business owners, IT managers, marketing managers responsible for the website",
    authorityLevel: "supporting",
    weight: 0.10,
    relatedThemes: ["website-health", "business-systems"],
    keywords: [
      "website security",
      "website backup",
      "SSL certificate",
      "DNS",
      "email deliverability",
      "broken links",
      "technical debt",
      "outdated CMS",
    ],
    contentAngles: [
      "strategic-warning",
      "audit-breakdown",
      "technical-explainer",
      "industry-critique",
    ],
  },
  {
    id: "practical-ai-owners",
    name: "Practical AI for Business Owners",
    description:
      "AI myths versus useful AI. What business owners should automate first. What should not be automated. How to prepare business content for AI tools. How to use AI without losing quality or control. How to build practical workflows instead of chasing hype.",
    strategicGoal:
      "Be the calm, practical AI voice for non-technical business owners — counter the hype",
    targetAudience:
      "Small business owners, founders, owner-operators, non-technical marketing leads",
    authorityLevel: "supporting",
    weight: 0.10,
    relatedThemes: ["agentic-automation", "ai-visibility-geo", "business-systems"],
    keywords: [
      "AI for business",
      "practical AI",
      "AI myths",
      "what to automate",
      "AI workflow",
      "AI for small business",
      "AI tools for owners",
    ],
    contentAngles: [
      "myth-busting",
      "framework-explanation",
      "before-vs-after",
      "founder-insight",
    ],
  },
  {
    id: "digital-authority",
    name: "Digital Authority and Content Strategy",
    description:
      "Building topical authority. Founder-led content. Case studies. Before-and-after examples. Explainers. FAQ content. Educational posts that answer real customer questions. How a business becomes easier to understand online.",
    strategicGoal:
      "Show prospects what good content strategy looks like by demonstrating it on Interon's own surfaces",
    targetAudience:
      "Marketing leaders, business owners running their own marketing, content strategists",
    authorityLevel: "supporting",
    weight: 0.05,
    relatedThemes: ["ai-visibility-geo", "behind-the-scenes", "website-health"],
    keywords: [
      "topical authority",
      "content strategy",
      "founder-led content",
      "case study",
      "FAQ content",
      "educational content",
      "B2B content",
    ],
    contentAngles: [
      "founder-insight",
      "case-study",
      "framework-explanation",
      "industry-critique",
    ],
  },
  {
    id: "behind-the-scenes",
    name: "Behind the Scenes at Interon",
    description:
      "How Interon audits websites. How Interon thinks about schema, SEO, GEO, security, and automation. Lessons from real client problems without exposing private information. How Interon improves its own systems. Practical demonstrations of tools, audits, workflows, and automations.",
    strategicGoal:
      "Humanise the consultancy and show real working methodology — proof of capability, not just claims",
    targetAudience:
      "Prospects evaluating Interon, fellow consultancies, business owners curious about delivery",
    authorityLevel: "supporting",
    weight: 0.05,
    relatedThemes: ["digital-authority", "agentic-automation", "website-health"],
    keywords: [
      "Interon audit",
      "consultancy methodology",
      "client lesson",
      "audit walkthrough",
      "behind the scenes",
      "consultancy process",
    ],
    contentAngles: [
      "audit-breakdown",
      "founder-insight",
      "case-study",
      "technical-explainer",
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────

export function getThemeById(id: string): Theme | undefined {
  return themes.find((t) => t.id === id);
}

export function getRelatedThemes(themeId: string): Theme[] {
  const theme = getThemeById(themeId);
  if (!theme) return [];
  return theme.relatedThemes
    .map((id) => getThemeById(id))
    .filter((t): t is Theme => t !== undefined);
}

export function getThemesByAuthority(level: AuthorityLevel): Theme[] {
  return themes.filter((t) => t.authorityLevel === level);
}

// Total weight should be 1.0 — useful for runtime sanity checks
export function totalWeight(): number {
  return themes.reduce((sum, t) => sum + t.weight, 0);
}
