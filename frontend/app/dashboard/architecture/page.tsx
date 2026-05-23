"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Server, Database, Cpu, Zap, Wifi, LayoutDashboard,
  Bell, ArrowDown, ArrowRight, Shield, GitBranch
} from "lucide-react";

// ─── Architecture Node ─────────────────────────────────────────────────────────

interface ArchNode {
  icon: React.ElementType;
  label: string;
  sublabel: string;
  color: string;
  bg: string;
  border: string;
  tech: string[];
}

const ARCH_LAYERS: { title: string; nodes: ArchNode[] }[] = [
  {
    title: "Infrastructure Layer",
    nodes: [
      {
        icon: Server,
        label: "Linux Servers",
        sublabel: "EC2 / Bare Metal",
        color: "text-slate-400",
        bg: "bg-slate-500/10",
        border: "border-slate-500/30",
        tech: ["Ubuntu", "CentOS", "Amazon Linux"],
      },
      {
        icon: Database,
        label: "Docker / K8s",
        sublabel: "Container Runtime",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        tech: ["Docker", "Kubernetes", "containerd"],
      },
    ],
  },
  {
    title: "Agent Layer",
    nodes: [
      {
        icon: Wifi,
        label: "cloudai-agent",
        sublabel: "Lightweight Go/Node daemon",
        color: "text-indigo-400",
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/30",
        tech: ["Heartbeat", "SSH tunnel", "Metric collectors"],
      },
    ],
  },
  {
    title: "Ingestion Layer",
    nodes: [
      {
        icon: Database,
        label: "Redis Streams",
        sublabel: "Time-series event bus",
        color: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "border-rose-500/30",
        tech: ["XADD / XREAD", "BullMQ", "Stream trimming"],
      },
    ],
  },
  {
    title: "Processing Layer",
    nodes: [
      {
        icon: Cpu,
        label: "Telemetry Workers",
        sublabel: "BullMQ job processors",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        tech: ["BullMQ", "Threshold eval", "Alert dedup"],
      },
      {
        icon: GitBranch,
        label: "Correlation Engine",
        sublabel: "Incident pattern matching",
        color: "text-violet-400",
        bg: "bg-violet-500/10",
        border: "border-violet-500/30",
        tech: ["Event grouping", "Causal chains", "Seeded RNG"],
      },
      {
        icon: Cpu,
        label: "AI RCA Engine",
        sublabel: "Root cause analysis",
        color: "text-pink-400",
        bg: "bg-pink-500/10",
        border: "border-pink-500/30",
        tech: ["LLM context", "Confidence scoring", "Deterministic"],
      },
    ],
  },
  {
    title: "Gateway Layer",
    nodes: [
      {
        icon: Zap,
        label: "WebSocket Gateway",
        sublabel: "Real-time push to UI",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        tech: ["Socket.io", "Room isolation", "Event fanout"],
      },
      {
        icon: Shield,
        label: "REST API",
        sublabel: "Express + JWT auth",
        color: "text-sky-400",
        bg: "bg-sky-500/10",
        border: "border-sky-500/30",
        tech: ["Rate limiting", "Zod validation", "Helmet"],
      },
    ],
  },
  {
    title: "Presentation Layer",
    nodes: [
      {
        icon: LayoutDashboard,
        label: "Next.js Dashboard",
        sublabel: "React 18 + Tailwind",
        color: "text-indigo-400",
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/30",
        tech: ["framer-motion", "Recharts", "Zustand"],
      },
    ],
  },
  {
    title: "Alert Delivery",
    nodes: [
      {
        icon: Bell,
        label: "Notification Service",
        sublabel: "Multi-channel delivery",
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
        tech: ["Slack", "PagerDuty", "Webhooks"],
      },
    ],
  },
];

// ─── Layer Component ───────────────────────────────────────────────────────────

function ArchLayer({ layer, delay }: { layer: typeof ARCH_LAYERS[0]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay }}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {layer.title}
        </span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className={`flex flex-wrap gap-3 justify-center`}>
        {layer.nodes.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.label}
              className={`flex-1 min-w-[200px] max-w-[280px] card p-4 border ${node.border} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg ${node.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={node.color} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{node.label}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{node.sublabel}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {node.tech.map((t) => (
                  <span
                    key={t}
                    className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Flow Arrow ────────────────────────────────────────────────────────────────

function FlowArrow({ delay }: { delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.3, delay }}
      className="flex justify-center my-1"
    >
      <ArrowDown size={16} className="text-slate-400 dark:text-slate-600" />
    </motion.div>
  );
}

// ─── Stats Row ─────────────────────────────────────────────────────────────────

const STATS = [
  { label: "Data Freshness", value: "3s", sub: "telemetry interval" },
  { label: "Stream Capacity", value: "10k", sub: "events per stream" },
  { label: "Alert Latency", value: "<500ms", sub: "threshold → notification" },
  { label: "RCA Confidence", value: "88–96%", sub: "seeded deterministic" },
  { label: "API Rate Limit", value: "300/15m", sub: "per IP, configurable" },
  { label: "SSH Timeout", value: "10s", sub: "execution hard limit" },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ArchitecturePage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Architecture</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          End-to-end data flow from infrastructure agents to the dashboard UI and alert delivery.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="card p-3 text-center"
          >
            <p className="text-lg font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{s.label}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Architecture layers */}
      <div className="space-y-2">
        {ARCH_LAYERS.map((layer, i) => (
          <React.Fragment key={layer.title}>
            <ArchLayer layer={layer} delay={i * 0.08} />
            {i < ARCH_LAYERS.length - 1 && <FlowArrow delay={i * 0.08 + 0.05} />}
          </React.Fragment>
        ))}
      </div>

      {/* Design decisions */}
      <div className="card p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Key Design Decisions
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              title: "Redis Streams over Kafka",
              body: "Chosen for simplicity and zero-infrastructure overhead. XADD/XREAD provides the same ordered, persistent stream semantics at a fraction of the operational cost.",
            },
            {
              title: "Deterministic RCA seeding",
              body: "All AI output is seeded from the incident ID, ensuring the same failure always produces the same root cause — critical for reproducible demos and testing.",
            },
            {
              title: "WebSocket + REST hybrid",
              body: "Mutations and queries go through REST. Real-time telemetry and incident updates use Socket.io for push efficiency and consistent fan-out.",
            },
            {
              title: "SSH whitelisting",
              body: "Only pre-approved commands can be executed via SSH. This mirrors enterprise PAM controls and prevents arbitrary code execution from the UI layer.",
            },
            {
              title: "BullMQ for job isolation",
              body: "Telemetry processing is decoupled from the HTTP layer via BullMQ queues, preventing slow metric analysis from blocking API response times.",
            },
            {
              title: "Graceful degradation",
              body: "Docker, Redis, and SSH all have explicit fallback states. The platform stays partially operational and informs the operator of degraded components instead of crashing.",
            },
          ].map((item) => (
            <div key={item.title} className="space-y-1">
              <div className="flex items-center gap-2">
                <ArrowRight size={12} className="text-indigo-500 shrink-0" />
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{item.title}</p>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pl-4">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
