import { themes } from "./themes";
import { seedMemory } from "./strategicMemory";

// ─── Types ───────────────────────────────────────────────────

export type ClusterType = "ai-visibility" | "geo" | "technical" | "founder" | "semantic";

export interface GraphNode {
  id: string;
  label: string;
  cluster: ClusterType;
  authorityLevel: "core" | "supporting" | "emerging";
  strength: number; // 1-10
  description: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: "strong" | "moderate" | "weak";
  label: string;
}

export interface ClusterInfo {
  id: ClusterType;
  label: string;
  color: string;
  description: string;
}

// ─── Clusters ────────────────────────────────────────────────

export const clusters: ClusterInfo[] = [
  { id: "ai-visibility", label: "AI Visibility", color: "#38bdf8", description: "Core AI search presence and discoverability themes" },
  { id: "geo", label: "GEO & Search", color: "#22c55e", description: "Generative engine optimisation and search evolution" },
  { id: "technical", label: "Technical Authority", color: "#a855f7", description: "Technical SEO, structured data, and machine readability" },
  { id: "founder", label: "Founder Authority", color: "#ec4899", description: "Personal entity trust and founder positioning" },
  { id: "semantic", label: "Semantic Architecture", color: "#f59e0b", description: "Semantic consistency and content architecture" },
];

// ─── Nodes ───────────────────────────────────────────────────

function calculateStrength(themeId: string): number {
  const items = seedMemory.filter((m) => m.theme === themeId);
  if (items.length === 0) return 3;
  const avgImpact = items.reduce((s, m) => s + m.authorityImpact, 0) / items.length;
  return Math.min(10, Math.round(avgImpact + items.length * 0.3));
}

export const graphNodes: GraphNode[] = [
  { id: "ai-readiness", label: "AI Readiness", cluster: "ai-visibility", authorityLevel: "core", strength: calculateStrength("ai-readiness"), description: "Preparing websites and businesses for AI-first search" },
  { id: "geo", label: "GEO", cluster: "geo", authorityLevel: "core", strength: calculateStrength("geo"), description: "Generative Engine Optimisation — optimising for LLM citation" },
  { id: "ai-search-visibility", label: "AI Search Visibility", cluster: "ai-visibility", authorityLevel: "emerging", strength: calculateStrength("ai-search-visibility"), description: "Measuring brand presence in AI-generated answers" },
  { id: "entity-trust", label: "Entity Trust", cluster: "founder", authorityLevel: "core", strength: calculateStrength("entity-trust"), description: "Verifiable entity identity for AI evaluation" },
  { id: "structured-data", label: "Structured Data", cluster: "technical", authorityLevel: "supporting", strength: calculateStrength("structured-data"), description: "Advanced schema markup beyond basics" },
  { id: "umbraco-ai", label: "Umbraco Authority", cluster: "technical", authorityLevel: "core", strength: calculateStrength("umbraco-ai"), description: "Umbraco CMS + AI visibility strategies" },
  { id: "machine-readable", label: "Machine-Readable Websites", cluster: "semantic", authorityLevel: "supporting", strength: calculateStrength("machine-readable"), description: "Semantic HTML and clean architecture for AI crawlers" },
  { id: "technical-seo", label: "Technical SEO", cluster: "technical", authorityLevel: "supporting", strength: calculateStrength("technical-seo"), description: "Evolving technical SEO for multi-crawler world" },
  // Extended nodes
  { id: "semantic-architecture", label: "Semantic Architecture", cluster: "semantic", authorityLevel: "emerging", strength: 5, description: "Content structure and semantic consistency across properties" },
  { id: "founder-authority", label: "Founder Authority", cluster: "founder", authorityLevel: "supporting", strength: 6, description: "Personal brand and entity authority of the founder" },
];

// ─── Edges ───────────────────────────────────────────────────

export const graphEdges: GraphEdge[] = [
  // Core AI visibility connections
  { source: "ai-readiness", target: "geo", weight: "strong", label: "AI readiness enables GEO" },
  { source: "ai-readiness", target: "ai-search-visibility", weight: "strong", label: "Readiness drives visibility" },
  { source: "geo", target: "ai-search-visibility", weight: "strong", label: "GEO improves AI visibility" },

  // Entity trust connections
  { source: "entity-trust", target: "founder-authority", weight: "strong", label: "Entity trust builds founder authority" },
  { source: "entity-trust", target: "ai-search-visibility", weight: "moderate", label: "Trust signals improve AI citations" },
  { source: "entity-trust", target: "structured-data", weight: "moderate", label: "Schema reinforces entity identity" },

  // Technical authority connections
  { source: "structured-data", target: "machine-readable", weight: "strong", label: "Schema enables machine readability" },
  { source: "structured-data", target: "ai-readiness", weight: "moderate", label: "Structured data is an AI readiness pillar" },
  { source: "technical-seo", target: "machine-readable", weight: "strong", label: "Technical SEO ensures crawlability" },
  { source: "technical-seo", target: "ai-readiness", weight: "moderate", label: "Tech SEO supports AI readiness" },

  // Umbraco connections
  { source: "umbraco-ai", target: "structured-data", weight: "moderate", label: "Umbraco implements structured data" },
  { source: "umbraco-ai", target: "machine-readable", weight: "moderate", label: "Umbraco outputs machine-readable content" },
  { source: "umbraco-ai", target: "ai-readiness", weight: "weak", label: "Umbraco as AI readiness platform" },

  // Semantic architecture connections
  { source: "semantic-architecture", target: "machine-readable", weight: "strong", label: "Semantic architecture drives readability" },
  { source: "semantic-architecture", target: "geo", weight: "moderate", label: "Semantic structure supports GEO" },
  { source: "semantic-architecture", target: "structured-data", weight: "moderate", label: "Architecture guides schema implementation" },

  // Founder authority connections
  { source: "founder-authority", target: "geo", weight: "weak", label: "Founder voice in GEO content" },
  { source: "founder-authority", target: "ai-readiness", weight: "weak", label: "Founder as AI readiness expert" },

  // Cross-cluster bridges
  { source: "geo", target: "structured-data", weight: "moderate", label: "GEO leverages structured data" },
  { source: "ai-search-visibility", target: "entity-trust", weight: "moderate", label: "Visibility requires entity trust" },
];

// ─── Analysis Helpers ────────────────────────────────────────

export function getIsolatedNodes(): GraphNode[] {
  const connected = new Set<string>();
  for (const edge of graphEdges) {
    connected.add(edge.source);
    connected.add(edge.target);
  }
  return graphNodes.filter((n) => !connected.has(n.id));
}

export function getWeakConnections(): GraphEdge[] {
  return graphEdges.filter((e) => e.weight === "weak");
}

export function getStrongestClusters(): { cluster: ClusterType; avgStrength: number }[] {
  const clusterNodes: Record<string, number[]> = {};
  for (const node of graphNodes) {
    if (!clusterNodes[node.cluster]) clusterNodes[node.cluster] = [];
    clusterNodes[node.cluster].push(node.strength);
  }
  return Object.entries(clusterNodes)
    .map(([cluster, strengths]) => ({
      cluster: cluster as ClusterType,
      avgStrength: Math.round((strengths.reduce((s, v) => s + v, 0) / strengths.length) * 10) / 10,
    }))
    .sort((a, b) => b.avgStrength - a.avgStrength);
}

export function getOverlapOpportunities(): string[] {
  const opportunities: string[] = [];
  // Find nodes in different clusters with only weak connections
  for (const edge of graphEdges.filter((e) => e.weight === "weak")) {
    const source = graphNodes.find((n) => n.id === edge.source);
    const target = graphNodes.find((n) => n.id === edge.target);
    if (source && target && source.cluster !== target.cluster) {
      opportunities.push(
        `Strengthen connection between "${source.label}" and "${target.label}" — cross-cluster reinforcement opportunity`
      );
    }
  }
  return opportunities;
}
