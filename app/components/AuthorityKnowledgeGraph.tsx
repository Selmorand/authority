"use client";

import { useMemo, useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  graphNodes,
  graphEdges,
  clusters,
  getStrongestClusters,
  getWeakConnections,
  getOverlapOpportunities,
  getIsolatedNodes,
} from "@/data/authorityGraph";
import type { GraphNode, ClusterType } from "@/data/authorityGraph";

// ─── Layout ──────────────────────────────────────────────────

const clusterPositions: Record<ClusterType, { x: number; y: number }> = {
  "ai-visibility": { x: 400, y: 80 },
  geo: { x: 150, y: 250 },
  technical: { x: 650, y: 250 },
  founder: { x: 250, y: 450 },
  semantic: { x: 550, y: 450 },
};

function layoutNodes() {
  const clusterCounts: Record<string, number> = {};

  return graphNodes.map((n) => {
    const base = clusterPositions[n.cluster];
    const idx = clusterCounts[n.cluster] || 0;
    clusterCounts[n.cluster] = idx + 1;

    // Offset within cluster
    const angle = (idx * Math.PI * 2) / 3 + Math.PI / 6;
    const radius = 100;
    const x = base.x + Math.cos(angle) * radius * (idx > 0 ? 1 : 0);
    const y = base.y + Math.sin(angle) * radius * (idx > 0 ? 1 : 0);

    return {
      id: n.id,
      type: "authority",
      position: { x, y },
      data: n as unknown as Record<string, unknown>,
    };
  });
}

function layoutEdges() {
  const weightStyles: Record<string, { stroke: string; strokeWidth: number; opacity: number }> = {
    strong: { stroke: "#38bdf8", strokeWidth: 2.5, opacity: 0.7 },
    moderate: { stroke: "#6b7280", strokeWidth: 1.5, opacity: 0.5 },
    weak: { stroke: "#374151", strokeWidth: 1, opacity: 0.3 },
  };

  return graphEdges.map((e, i) => {
    const style = weightStyles[e.weight];
    return {
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      style: { stroke: style.stroke, strokeWidth: style.strokeWidth, opacity: style.opacity },
      label: undefined,
      animated: e.weight === "strong",
    };
  });
}

// ─── Custom Node ─────────────────────────────────────────────

function AuthorityNode({ data }: NodeProps) {
  const d = data as unknown as GraphNode;
  const cluster = clusters.find((c) => c.id === d.cluster);
  const color = cluster?.color ?? "#6b7280";
  const size = 24 + d.strength * 4;

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ visibility: "hidden" }} />
      <div
        className="flex flex-col items-center gap-1 cursor-grab"
        style={{ width: size * 2.5 }}
      >
        <div
          className="rounded-full flex items-center justify-center font-bold text-xs"
          style={{
            width: size,
            height: size,
            backgroundColor: `${color}20`,
            border: `2px solid ${color}50`,
            color,
          }}
        >
          {d.strength}
        </div>
        <span
          className="text-xs font-medium text-center leading-tight"
          style={{ color }}
        >
          {d.label}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ visibility: "hidden" }} />
    </>
  );
}

const nodeTypes = { authority: AuthorityNode };

// ─── Main Component ──────────────────────────────────────────

export default function AuthorityKnowledgeGraph() {
  const initialNodes = useMemo(() => layoutNodes(), []);
  const initialEdges = useMemo(() => layoutEdges(), []);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  const clusterStrengths = useMemo(() => getStrongestClusters(), []);
  const weakLinks = useMemo(() => getWeakConnections(), []);
  const overlaps = useMemo(() => getOverlapOpportunities(), []);
  const isolated = useMemo(() => getIsolatedNodes(), []);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data as unknown as GraphNode);
  }, []);

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            Authority Knowledge Graph
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {graphNodes.length} nodes &middot; {graphEdges.length} relationships &middot;{" "}
            {clusters.length} clusters
          </p>
        </div>
        {/* Cluster legend */}
        <div className="flex flex-wrap gap-2">
          {clusters.map((c) => (
            <span
              key={c.id}
              className="flex items-center gap-1.5 text-xs"
              style={{ color: c.color }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              {c.label}
            </span>
          ))}
        </div>
      </div>

      {/* Graph */}
      <div className="rounded-lg border border-card-border-subtle overflow-hidden" style={{ height: 520 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.5}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          style={{ background: "#111315" }}
        >
          <Background color="#1b1f24" gap={20} />
        </ReactFlow>
      </div>

      {/* Selected node detail */}
      {selectedNode && (
        <div className="rounded-lg bg-accent/5 border border-accent/15 px-4 py-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-foreground-bright">
              {selectedNode.label}
            </span>
            <span className="text-xs text-accent font-bold">
              Strength: {selectedNode.strength}/10
            </span>
          </div>
          <p className="text-xs text-foreground/70">{selectedNode.description}</p>
          <div className="flex gap-2 mt-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-background-raised border border-card-border-subtle text-muted">
              {selectedNode.authorityLevel}
            </span>
            <span
              className="px-2 py-0.5 rounded-full border"
              style={{
                color: clusters.find((c) => c.id === selectedNode.cluster)?.color,
                borderColor: `${clusters.find((c) => c.id === selectedNode.cluster)?.color}25`,
                backgroundColor: `${clusters.find((c) => c.id === selectedNode.cluster)?.color}08`,
              }}
            >
              {clusters.find((c) => c.id === selectedNode.cluster)?.label}
            </span>
          </div>
        </div>
      )}

      {/* Strategic insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strongest clusters */}
        <div>
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Most Reinforced Clusters
          </h3>
          <div className="space-y-1.5">
            {clusterStrengths.map((c) => {
              const info = clusters.find((cl) => cl.id === c.cluster);
              return (
                <div
                  key={c.cluster}
                  className="flex items-center justify-between bg-background-raised border border-card-border-subtle rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: info?.color }}
                    />
                    <span className="text-xs text-foreground">{info?.label}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: info?.color }}>
                    {c.avgStrength}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strategic insights */}
        <div>
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Strategic Graph Insights
          </h3>
          <div className="space-y-1.5">
            {weakLinks.length > 0 && (
              <InsightItem
                type="warning"
                text={`${weakLinks.length} weak connections detected — cross-cluster reinforcement needed`}
              />
            )}
            {isolated.length > 0 && (
              <InsightItem
                type="risk"
                text={`${isolated.length} isolated node${isolated.length > 1 ? "s" : ""}: ${isolated.map((n) => n.label).join(", ")}`}
              />
            )}
            {overlaps.slice(0, 3).map((o, i) => (
              <InsightItem key={i} type="opportunity" text={o} />
            ))}
            {weakLinks.length === 0 && isolated.length === 0 && (
              <InsightItem type="strong" text="All nodes well-connected — authority graph is healthy" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function InsightItem({
  type,
  text,
}: {
  type: "warning" | "risk" | "opportunity" | "strong";
  text: string;
}) {
  const colors: Record<string, { icon: string; color: string }> = {
    warning: { icon: "!", color: "#f59e0b" },
    risk: { icon: "!!", color: "#ef4444" },
    opportunity: { icon: "->", color: "#38bdf8" },
    strong: { icon: "+", color: "#22c55e" },
  };
  const c = colors[type];

  return (
    <div className="flex items-start gap-2 text-xs bg-background-raised border border-card-border-subtle rounded-lg px-3 py-2">
      <span className="shrink-0 font-mono font-bold text-xs" style={{ color: c.color }}>
        {c.icon}
      </span>
      <span className="text-foreground/70 leading-relaxed">{text}</span>
    </div>
  );
}
