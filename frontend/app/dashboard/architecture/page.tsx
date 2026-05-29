"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, X, ExternalLink, RefreshCw, Zap, AlertTriangle,
  CheckCircle2, Clock, Server, Database, Globe, Shield,
  Network, Cpu, TrendingUp, GitBranch, Eye, RotateCcw
} from "lucide-react";
import Link from "next/link";
import { useLiveEngineStore } from "@/hooks/useLiveEngine";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { toast } from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type NodeStatus = "healthy" | "degraded" | "critical" | "recovering";

interface ServiceNode {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  x: number;
  y: number;
  status: NodeStatus;
  latencyP99: number;
  errorRate: number;
  rps: number;
  replicas: number;
  uptime: string;
  description: string;
  lastIncident?: string;
}

interface ServiceEdge {
  source: string;
  target: string;
  rps: number;
  label?: string;
}

// ─── Static layout positions (normalized 0..1 for responsive scaling) ─────────

const BASE_NODES: Omit<ServiceNode, "status" | "latencyP99" | "errorRate" | "rps" | "replicas" | "uptime" | "lastIncident">[] = [
  {
    id: "cdn",
    label: "CDN / Edge",
    sublabel: "Cloudfront",
    icon: Globe,
    x: 0.5, y: 0.05,
    description: "Global content delivery and DDoS mitigation layer. Terminates TLS and caches static assets.",
  },
  {
    id: "lb",
    label: "Load Balancer",
    sublabel: "ALB / HAProxy",
    icon: Network,
    x: 0.5, y: 0.2,
    description: "Layer-7 load balancer distributing traffic across API gateway instances with health checks.",
  },
  {
    id: "api",
    label: "API Gateway",
    sublabel: "Express + REST",
    icon: Zap,
    x: 0.5, y: 0.38,
    description: "Central API surface. Handles JWT validation, rate limiting, request routing, and WebSocket upgrades.",
  },
  {
    id: "auth",
    label: "Auth Service",
    sublabel: "NextAuth / JWT",
    icon: Shield,
    x: 0.18, y: 0.55,
    description: "Stateless JWT issuer and validator. Backed by session store in Redis for revocation.",
  },
  {
    id: "worker",
    label: "Worker Queue",
    sublabel: "BullMQ",
    icon: Cpu,
    x: 0.5, y: 0.55,
    description: "Asynchronous telemetry processing, alert evaluation, and AI RCA job orchestration.",
  },
  {
    id: "redis",
    label: "Redis",
    sublabel: "Cache & Streams",
    icon: Activity,
    x: 0.82, y: 0.55,
    description: "Primary cache, Pub/Sub hub for real-time events, and stream source for telemetry ingestion.",
  },
  {
    id: "db",
    label: "PostgreSQL",
    sublabel: "Primary + Replica",
    icon: Database,
    x: 0.5, y: 0.75,
    description: "Relational store for incidents, agents, audit logs, and configuration. Replica for read scaling.",
  },
  {
    id: "ai",
    label: "AI RCA Engine",
    sublabel: "Seeded LLM",
    icon: TrendingUp,
    x: 0.18, y: 0.75,
    description: "Deterministic root cause analyzer. Runs parallel anomaly detection and confidence scoring per incident.",
  },
  {
    id: "notif",
    label: "Notification",
    sublabel: "Slack / PagerDuty",
    icon: GitBranch,
    x: 0.82, y: 0.75,
    description: "Multi-channel alert delivery via Slack webhooks, PagerDuty incidents, and email digest.",
  },
];

const EDGES: ServiceEdge[] = [
  { source: "cdn", target: "lb", rps: 4200, label: "HTTPS" },
  { source: "lb", target: "api", rps: 3800, label: "HTTP/2" },
  { source: "api", target: "auth", rps: 1100, label: "JWT verify" },
  { source: "api", target: "worker", rps: 890, label: "async jobs" },
  { source: "api", target: "redis", rps: 2400, label: "cache read" },
  { source: "worker", target: "db", rps: 340, label: "writes" },
  { source: "worker", target: "ai", rps: 120, label: "RCA" },
  { source: "worker", target: "notif", rps: 45, label: "alerts" },
  { source: "redis", target: "worker", rps: 760, label: "stream" },
  { source: "auth", target: "redis", rps: 420, label: "session" },
  { source: "api", target: "db", rps: 580, label: "reads" },
];

const STATUS_COLOR: Record<NodeStatus, string> = {
  healthy:   "#22c55e",
  degraded:  "#f59e0b",
  critical:  "#ef4444",
  recovering: "#6366f1",
};

const STATUS_BG: Record<NodeStatus, string> = {
  healthy:   "rgba(34,197,94,0.1)",
  degraded:  "rgba(245,158,11,0.1)",
  critical:  "rgba(239,68,68,0.1)",
  recovering: "rgba(99,102,241,0.1)",
};

// ─── Edge component ───────────────────────────────────────────────────────────

function AnimatedEdge({
  x1, y1, x2, y2, rps, highlight
}: { x1: number; y1: number; x2: number; y2: number; rps: number; highlight: boolean }) {
  const speed = Math.max(0.5, Math.min(3, rps / 1000));
  const strokeWidth = Math.max(1, Math.min(3, rps / 1500));
  const color = highlight ? "#818cf8" : "var(--border-strong, #334155)";

  return (
    <g>
      {/* Base line */}
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeOpacity={highlight ? 0.8 : 0.35}
      />
      {/* Animated traffic dot */}
      <circle r={2.5} fill={highlight ? "#818cf8" : "#6366f1"} opacity={0.85}>
        <animateMotion
          dur={`${3 / speed}s`}
          repeatCount="indefinite"
          path={`M${x1},${y1} L${x2},${y2}`}
        />
      </circle>
    </g>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ServiceMapPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 900, h: 540 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "degraded" | "busy">("all");
  const [tick, setTick] = useState(0);

  const { incidents, liveMetrics: liveMetricsArr } = useLiveEngineStore();
  const liveMetrics = liveMetricsArr[liveMetricsArr.length - 1] ?? null;
  const { currentUserRole, addAuditLog } = useMonitoringStore();

  // Derive node health from live store
  const liveNodes = useMemo<ServiceNode[]>(() => {
    const criticalIncidents = incidents.filter(i => i.type === "critical" || i.type === "security");
    const cpuHigh = liveMetrics && liveMetrics.cpu > 80;
    const memHigh = liveMetrics && liveMetrics.memory > 85;

    return BASE_NODES.map((n, i): ServiceNode => {
      let status: NodeStatus = "healthy";
      let latencyP99 = 40 + Math.sin(Date.now() / 5000 + i) * 20 + i * 8;
      let errorRate = Math.max(0, Math.sin(Date.now() / 8000 + i * 0.7) * 1.2);
      let rps = 200 + i * 80 + Math.sin(Date.now() / 3000 + i) * 60;

      // Propagate from live store
      if (n.id === "worker" && cpuHigh) { status = "degraded"; latencyP99 += 400; errorRate += 4; }
      if (n.id === "redis" && memHigh)  { status = "degraded"; latencyP99 += 200; errorRate += 2; }
      if (criticalIncidents.some(inc => inc.type === "critical") && (n.id === "api" || n.id === "db")) {
        status = "critical"; latencyP99 += 1500; errorRate += 12;
      }
      if (criticalIncidents.some(inc => inc.type === "security") && n.id === "auth") {
        status = "critical"; errorRate += 20;
      }

      return {
        ...n,
        status,
        latencyP99: Math.round(latencyP99),
        errorRate: Math.round(errorRate * 10) / 10,
        rps: Math.round(rps),
        replicas: n.id === "api" ? 3 : n.id === "worker" ? 2 : 1,
        uptime: ["99.98%", "99.95%", "100%", "99.91%", "99.87%"][i % 5],
        lastIncident: criticalIncidents[0]?.type === "critical" && n.id === "api"
          ? "High CPU incident 12m ago"
          : undefined,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidents, liveMetrics]);

  // Tick for animation
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  // Responsive container measurement
  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDims({ w: rect.width || 900, h: Math.max(420, rect.width * 0.58) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const nodeById = useMemo(() => Object.fromEntries(liveNodes.map(n => [n.id, n])), [liveNodes]);

  const px = useCallback((rel: number, dim: number) => rel * dim, []);

  const filteredEdges = useMemo(() => {
    if (filterMode === "busy") return EDGES.filter(e => e.rps > 500);
    if (filterMode === "degraded") {
      const degradedIds = new Set(liveNodes.filter(n => n.status !== "healthy").map(n => n.id));
      return EDGES.filter(e => degradedIds.has(e.source) || degradedIds.has(e.target));
    }
    return EDGES;
  }, [filterMode, liveNodes]);

  const filteredNodes = useMemo(() => {
    if (filterMode === "degraded") return liveNodes.filter(n => n.status !== "healthy");
    return liveNodes;
  }, [filterMode, liveNodes]);

  const selectedService = selectedNode ? nodeById[selectedNode] : null;
  const degradedCount = liveNodes.filter(n => n.status !== "healthy").length;

  const handleRestart = (nodeId: string) => {
    if (currentUserRole === "Developer") {
      toast.error("Requires Admin or SRE permissions");
      return;
    }
    toast.success(`Restart initiated for ${nodeById[nodeId]?.label}`, { icon: "🔄" });
    addAuditLog(`Restarted service: ${nodeId}`, "node");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="heading-page flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: "var(--brand-50)" }}>
              <Network size={16} style={{ color: "var(--brand-600)" }} />
            </div>
            Service Dependency Map
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Live traffic flow across {liveNodes.length} services · {filteredEdges.length} active routes
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status legend */}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg border text-[11px]"
            style={{ borderColor: "var(--border-default)", background: "var(--surface-0)" }}>
            {(["healthy", "degraded", "critical", "recovering"] as NodeStatus[]).map(s => (
              <span key={s} className="flex items-center gap-1.5 capitalize" style={{ color: "var(--text-secondary)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[s] }} />
                {s}
              </span>
            ))}
          </div>

          {degradedCount > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: "var(--color-error-bg)", color: "var(--color-error)", border: "1px solid var(--color-error-border)" }}>
              <AlertTriangle size={11} />
              {degradedCount} service{degradedCount > 1 ? "s" : ""} degraded
            </span>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex gap-1.5">
        {(["all", "degraded", "busy"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilterMode(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors"
            style={{
              background: filterMode === f ? "var(--brand-600)" : "var(--surface-0)",
              color: filterMode === f ? "#fff" : "var(--text-secondary)",
              border: `1px solid ${filterMode === f ? "var(--brand-600)" : "var(--border-default)"}`,
            }}
          >
            {f === "all" ? "All Services" : f === "degraded" ? "⚠ Degraded Only" : "🔥 High Traffic"}
          </button>
        ))}
      </div>

      {/* Map + Panel layout */}
      <div className="flex gap-4 items-start">
        {/* SVG Map */}
        <div
          ref={containerRef}
          className="card flex-1 relative overflow-hidden"
          style={{ minHeight: 420 }}
        >
          <svg
            width="100%"
            height={dims.h}
            viewBox={`0 0 ${dims.w} ${dims.h}`}
            style={{ display: "block" }}
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Edges */}
            {filteredEdges.map((edge, i) => {
              const src = nodeById[edge.source];
              const tgt = nodeById[edge.target];
              if (!src || !tgt) return null;
              const isHighlighted = selectedNode === edge.source || selectedNode === edge.target;
              return (
                <AnimatedEdge
                  key={i}
                  x1={px(src.x, dims.w)}
                  y1={px(src.y, dims.h)}
                  x2={px(tgt.x, dims.w)}
                  y2={px(tgt.y, dims.h)}
                  rps={edge.rps}
                  highlight={isHighlighted}
                />
              );
            })}

            {/* Edge labels */}
            {filteredEdges.map((edge, i) => {
              const src = nodeById[edge.source];
              const tgt = nodeById[edge.target];
              if (!src || !tgt || !edge.label) return null;
              const mx = (px(src.x, dims.w) + px(tgt.x, dims.w)) / 2;
              const my = (px(src.y, dims.h) + px(tgt.y, dims.h)) / 2;
              const isHighlighted = selectedNode === edge.source || selectedNode === edge.target;
              if (!isHighlighted && filterMode !== "busy") return null;
              return (
                <text key={`lbl-${i}`} x={mx} y={my - 6} textAnchor="middle"
                  fontSize={9} fill="var(--text-tertiary)" fontFamily="monospace">
                  {edge.label} · {edge.rps.toLocaleString()}/s
                </text>
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((node) => {
              const cx = px(node.x, dims.w);
              const cy = px(node.y, dims.h);
              const isSelected = selectedNode === node.id;
              const Icon = node.icon;

              return (
                <g
                  key={node.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedNode(isSelected ? null : node.id)}
                >
                  {/* Selection ring */}
                  {isSelected && (
                    <circle
                      cx={cx} cy={cy} r={32}
                      fill="none"
                      stroke={STATUS_COLOR[node.status]}
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                      opacity={0.7}
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from={`0 ${cx} ${cy}`}
                        to={`360 ${cx} ${cy}`}
                        dur="8s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Status halo for degraded/critical */}
                  {node.status !== "healthy" && (
                    <circle cx={cx} cy={cy} r={28}
                      fill={STATUS_BG[node.status]}
                      stroke={STATUS_COLOR[node.status]}
                      strokeWidth={1}
                      opacity={0.6}
                    />
                  )}

                  {/* Node circle */}
                  <circle
                    cx={cx} cy={cy} r={22}
                    fill={isSelected ? STATUS_COLOR[node.status] : "var(--surface-0)"}
                    stroke={STATUS_COLOR[node.status]}
                    strokeWidth={isSelected ? 0 : 1.5}
                    filter={isSelected ? "url(#glow)" : undefined}
                  />

                  {/* Icon placeholder — text label since SVG foreignObject has issues */}
                  <text
                    x={cx} y={cy + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={11}
                    fontWeight="600"
                    fill={isSelected ? "#fff" : STATUS_COLOR[node.status]}
                    fontFamily="monospace"
                  >
                    {node.label.slice(0, 3).toUpperCase()}
                  </text>

                  {/* Status dot */}
                  <circle
                    cx={cx + 15} cy={cy - 15} r={5}
                    fill={STATUS_COLOR[node.status]}
                    stroke="var(--surface-0)"
                    strokeWidth={1.5}
                  />
                  {node.status === "critical" && (
                    <circle cx={cx + 15} cy={cy - 15} r={5} fill={STATUS_COLOR[node.status]} opacity={0.6}>
                      <animate attributeName="r" values="5;10;5" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Labels */}
                  <text
                    x={cx} y={cy + 30}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight="600"
                    fill="var(--text-primary)"
                    fontFamily="system-ui, sans-serif"
                  >
                    {node.label}
                  </text>
                  <text
                    x={cx} y={cy + 42}
                    textAnchor="middle"
                    fontSize={9}
                    fill="var(--text-tertiary)"
                    fontFamily="system-ui, sans-serif"
                  >
                    {node.sublabel}
                  </text>

                  {/* RPS badge */}
                  <rect
                    x={cx - 18} y={cy - 40}
                    width={36} height={13}
                    rx={4}
                    fill={isSelected ? STATUS_COLOR[node.status] : "var(--surface-2)"}
                    opacity={0.9}
                  />
                  <text
                    x={cx} y={cy - 31}
                    textAnchor="middle"
                    fontSize={8}
                    fill={isSelected ? "#fff" : "var(--text-secondary)"}
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {node.rps}/s
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend overlay */}
          <div className="absolute bottom-3 left-3 text-[10px] flex items-center gap-3"
            style={{ color: "var(--text-tertiary)" }}>
            <span className="flex items-center gap-1">
              <span className="w-8 h-px inline-block" style={{ background: "var(--border-strong)", opacity: 0.6 }} />
              traffic route
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400" />
              live packet
            </span>
          </div>
        </div>

        {/* Side panel */}
        <AnimatePresence>
          {selectedService && (
            <motion.div
              key={selectedService.id}
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 300 }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="card overflow-hidden"
              style={{ width: 300, flexShrink: 0, alignSelf: "flex-start" }}
            >
              {/* Panel header */}
              <div className="p-4 flex items-start justify-between gap-2"
                style={{ borderBottom: "1px solid var(--border-default)", background: `${STATUS_BG[selectedService.status]}` }}>
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {selectedService.label}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {selectedService.sublabel}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                    style={{ background: STATUS_COLOR[selectedService.status] + "22", color: STATUS_COLOR[selectedService.status], border: `1px solid ${STATUS_COLOR[selectedService.status]}44` }}
                  >
                    {selectedService.status}
                  </span>
                  <button onClick={() => setSelectedNode(null)} style={{ color: "var(--text-tertiary)" }}>
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Description */}
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {selectedService.description}
                </p>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "P99 Latency", value: `${selectedService.latencyP99}ms`, alert: selectedService.latencyP99 > 500 },
                    { label: "Error Rate", value: `${selectedService.errorRate}%`, alert: selectedService.errorRate > 3 },
                    { label: "Req/sec", value: selectedService.rps.toLocaleString(), alert: false },
                    { label: "Uptime", value: selectedService.uptime, alert: false },
                  ].map(m => (
                    <div key={m.label} className="rounded-lg p-2.5"
                      style={{ background: "var(--surface-1)", border: "1px solid var(--border-default)" }}>
                      <p className="text-[9px] uppercase tracking-wide font-semibold mb-0.5"
                        style={{ color: "var(--text-tertiary)" }}>{m.label}</p>
                      <p className="text-sm font-bold tabular-nums"
                        style={{ color: m.alert ? "var(--color-error)" : "var(--text-primary)" }}>
                        {m.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Replicas */}
                <div className="flex items-center gap-2">
                  <Server size={12} style={{ color: "var(--text-tertiary)" }} />
                  <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    {selectedService.replicas} replica{selectedService.replicas > 1 ? "s" : ""} running
                  </span>
                  <div className="flex gap-1 ml-auto">
                    {Array.from({ length: selectedService.replicas }).map((_, i) => (
                      <span key={i} className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[selectedService.status] }} />
                    ))}
                  </div>
                </div>

                {/* Last incident */}
                {selectedService.lastIncident && (
                  <div className="flex items-center gap-2 rounded-lg p-2.5 text-[11px]"
                    style={{ background: "var(--color-warning-bg)", border: "1px solid var(--color-warning-border)", color: "var(--color-warning)" }}>
                    <AlertTriangle size={11} className="flex-shrink-0" />
                    {selectedService.lastIncident}
                  </div>
                )}

                {/* Incoming / outgoing edges */}
                <div>
                  <p className="text-[10px] uppercase tracking-wide font-bold mb-1.5"
                    style={{ color: "var(--text-tertiary)" }}>Connections</p>
                  <div className="space-y-1">
                    {EDGES.filter(e => e.source === selectedService.id || e.target === selectedService.id).map((e, i) => {
                      const isOut = e.source === selectedService.id;
                      const peerId = isOut ? e.target : e.source;
                      const peer = nodeById[peerId];
                      return (
                        <div key={i} className="flex items-center justify-between text-[11px]">
                          <span style={{ color: "var(--text-secondary)" }}>
                            {isOut ? "→" : "←"} {peer?.label}
                            {e.label && <span style={{ color: "var(--text-tertiary)" }}> · {e.label}</span>}
                          </span>
                          <span className="font-mono font-semibold" style={{ color: "var(--text-tertiary)" }}>
                            {e.rps}/s
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => handleRestart(selectedService.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors"
                    style={{
                      background: "var(--surface-1)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <RotateCcw size={12} /> Restart Service
                  </button>
                  <div className="flex gap-2">
                    <Link
                      href="/dashboard/traces"
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                      style={{ background: "var(--brand-50)", color: "var(--brand-600)", border: "1px solid var(--color-info-border)" }}
                    >
                      <Eye size={11} /> Traces
                    </Link>
                    <Link
                      href="/dashboard/live"
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                      style={{ background: "var(--surface-1)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
                    >
                      <Activity size={11} /> Live Logs
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* System stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Healthy Services", value: liveNodes.filter(n => n.status === "healthy").length, total: liveNodes.length, color: "var(--color-success)" },
          { label: "Total RPS", value: EDGES.reduce((s, e) => s + e.rps, 0).toLocaleString(), suffix: "", color: "var(--brand-600)" },
          { label: "Avg P99 Latency", value: Math.round(liveNodes.reduce((s, n) => s + n.latencyP99, 0) / liveNodes.length) + "ms", color: "var(--text-primary)" },
          { label: "Active Routes", value: EDGES.length, color: "var(--text-primary)" },
          { label: "Data Freshness", value: "3s", color: "var(--color-success)" },
          { label: "Alert Latency", value: "<500ms", color: "var(--text-primary)" },
        ].map((s, i) => (
          <div key={i} className="card p-3 text-center">
            <p className="text-base font-bold tabular-nums" style={{ color: s.color }}>
              {s.value}{s.total !== undefined ? `/${s.total}` : ""}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Design decisions panel */}
      <div className="card p-5 space-y-4">
        <h2 className="heading-section">Architecture & Design Decisions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "Redis Streams over Kafka", body: "Zero-infrastructure overhead with identical ordered, persistent stream semantics. XADD/XREAD at fraction of operational cost." },
            { title: "Deterministic RCA seeding", body: "All AI output is seeded from incident ID. Same failure → same root cause. Critical for reproducible demos and audit trails." },
            { title: "WebSocket + REST hybrid", body: "Mutations through REST. Real-time telemetry via Socket.io push. Separation keeps API predictable and WS latency minimal." },
            { title: "SSH command whitelisting", body: "Only pre-approved command set executes via SSH. Mirrors enterprise PAM controls, preventing arbitrary RCE from the UI layer." },
            { title: "BullMQ job isolation", body: "Telemetry processing decoupled from HTTP layer. Slow metric analysis never blocks API response times." },
            { title: "Graceful degradation", body: "Docker, Redis, and SSH all have fallback states. Platform stays partially operational and surfaces degraded component info." },
          ].map(item => (
            <div key={item.title} className="space-y-1">
              <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                → {item.title}
              </p>
              <p className="text-[11px] leading-relaxed pl-3" style={{ color: "var(--text-secondary)" }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
