"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, CheckCircle2, Brain, Zap, Shield, Activity,
  GitBranch, Filter, Search, Clock, Server, ChevronRight,
  TrendingUp, RefreshCw, SlidersHorizontal, X
} from "lucide-react";
import { useLiveEngineStore } from "@/hooks/useLiveEngine";

// ─── Types & Data ─────────────────────────────────────────────────────────────

type Severity = "critical" | "high" | "medium" | "low";
type Status = "active" | "investigating" | "mitigated" | "resolved";

interface Incident {
  id: string;
  title: string;
  service: string;
  status: Status;
  severity: Severity;
  detectedAt: string;
  durationMinutes: number;
  outageProbability: number;
  aiConfidence: number;
  deployCorrelation?: { version: string; minutesBefore: number };
  affectedCount: number;
  summary: string;
}

const MOCK_INCIDENTS: Incident[] = [
  {
    id: "inc-2024-001",
    title: "Memory Leak — api-gateway",
    service: "api-gateway",
    status: "investigating",
    severity: "high",
    detectedAt: new Date(Date.now() - 7 * 60000).toISOString(),
    durationMinutes: 7,
    outageProbability: 34,
    aiConfidence: 89,
    deployCorrelation: { version: "v2.4.1", minutesBefore: 18 },
    affectedCount: 3,
    summary: "Heap growing at 2MB/min with no GC recovery. Pattern consistent with unclosed event listener in request handler.",
  },
  {
    id: "inc-2024-002",
    title: "DB Connection Pool Exhausted",
    service: "db-primary",
    status: "mitigated",
    severity: "critical",
    detectedAt: new Date(Date.now() - 2.5 * 3600000).toISOString(),
    durationMinutes: 23,
    outageProbability: 8,
    aiConfidence: 94,
    deployCorrelation: { version: "v2.4.0", minutesBefore: 31 },
    affectedCount: 5,
    summary: "Connection pool (20/20) fully saturated due to traffic surge +340% RPS. Long-running transactions held open.",
  },
  {
    id: "inc-2024-003",
    title: "CPU Saturation — worker-queue",
    service: "worker-queue",
    status: "resolved",
    severity: "high",
    detectedAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    durationMinutes: 12,
    outageProbability: 3,
    aiConfidence: 91,
    affectedCount: 2,
    summary: "Single worker thread at 87% CPU. Unbounded iteration in job queue caused request queue depth to grow.",
  },
  {
    id: "inc-2024-004",
    title: "P99 Latency SLA Breach — auth-service",
    service: "auth-service",
    status: "resolved",
    severity: "medium",
    detectedAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    durationMinutes: 8,
    outageProbability: 2,
    aiConfidence: 85,
    deployCorrelation: { version: "v2.3.9", minutesBefore: 12 },
    affectedCount: 2,
    summary: "Redis cache miss storm caused 73% of latency in downstream calls. Cache stampede after keyspace invalidation.",
  },
  {
    id: "inc-2024-005",
    title: "Brute-Force Attack Detected",
    service: "auth-service",
    status: "resolved",
    severity: "critical",
    detectedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    durationMinutes: 4,
    outageProbability: 1,
    aiConfidence: 97,
    affectedCount: 1,
    summary: "847 failed login attempts from 23 IPs in 4 minutes. Fail2Ban blocked 12 IPs. Credential stuffing pattern.",
  },
  {
    id: "inc-2024-006",
    title: "Disk Usage Critical — db-primary",
    service: "db-primary",
    status: "resolved",
    severity: "medium",
    detectedAt: new Date(Date.now() - 72 * 3600000).toISOString(),
    durationMinutes: 31,
    outageProbability: 2,
    aiConfidence: 88,
    affectedCount: 2,
    summary: "WAL archive log accumulation caused disk to reach 91%. Automated cleanup removed 48GB of old WAL segments.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 2) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

const SEV_BADGE: Record<Severity, string> = {
  critical: "badge-critical",
  high:     "badge-warning",
  medium:   "badge-live",
  low:      "badge-success",
};

const STATUS_ICON: Record<Status, React.ElementType> = {
  active:        AlertTriangle,
  investigating: Brain,
  mitigated:     Shield,
  resolved:      CheckCircle2,
};

const STATUS_COLOR: Record<Status, string> = {
  active:        "var(--color-error)",
  investigating: "var(--brand-600)",
  mitigated:     "var(--color-warning)",
  resolved:      "var(--color-success)",
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function IncidentIntelligencePage() {
  const { incidents: liveIncidents } = useLiveEngineStore();
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<Severity | "all">("all");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  const activeCount   = MOCK_INCIDENTS.filter(i => i.status === "active" || i.status === "investigating").length;
  const criticalCount = MOCK_INCIDENTS.filter(i => i.severity === "critical").length;
  const mttr          = Math.round(MOCK_INCIDENTS.filter(i => i.status === "resolved").reduce((s, i) => s + i.durationMinutes, 0) / MOCK_INCIDENTS.filter(i => i.status === "resolved").length);

  const filtered = useMemo(() => {
    return MOCK_INCIDENTS.filter(inc => {
      const matchSearch = !search || inc.title.toLowerCase().includes(search.toLowerCase()) || inc.service.toLowerCase().includes(search.toLowerCase());
      const matchSev    = filterSeverity === "all" || inc.severity === filterSeverity;
      const matchStatus = filterStatus   === "all" || inc.status   === filterStatus;
      return matchSearch && matchSev && matchStatus;
    });
  }, [search, filterSeverity, filterStatus]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2"
            style={{ background: "var(--brand-50)", border: "1px solid var(--border-default)", color: "var(--brand-600)" }}
          >
            <Brain size={11} /> AI Incident Investigation Active
          </div>
          <h1 className="heading-page">Incident Intelligence</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            AI-powered root cause analysis, deployment correlation, and outage probability scoring.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
          <RefreshCw size={11} className="animate-spin text-blue-500" />
          <span>Syncing live</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Incidents",   value: activeCount,   icon: AlertTriangle, color: "var(--color-error)" },
          { label: "Critical",           value: criticalCount, icon: Shield,        color: "var(--color-warning)" },
          { label: "Avg MTTR (min)",     value: mttr,          icon: Clock,         color: "var(--brand-600)" },
          { label: "AI Confidence Avg",  value: "90%",         icon: Brain,         color: "var(--color-success)" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={13} style={{ color }} />
              <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>{label}</span>
            </div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
          <input
            type="text"
            placeholder="Search incidents or services..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border"
            style={{ background: "var(--surface-0)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
          />
        </div>
        <button
          onClick={() => setShowFilters(s => !s)}
          className="btn btn-outlined flex items-center gap-2 text-sm"
        >
          <SlidersHorizontal size={13} />
          Filters
          {(filterSeverity !== "all" || filterStatus !== "all") && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          )}
        </button>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="card p-4 overflow-hidden"
          >
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--text-tertiary)" }}>Severity</label>
                <div className="flex gap-1.5">
                  {(["all", "critical", "high", "medium", "low"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setFilterSeverity(s)}
                      className="px-2.5 py-1 rounded text-xs font-semibold border transition-colors"
                      style={{
                        background: filterSeverity === s ? "var(--brand-600)" : "var(--surface-1)",
                        color: filterSeverity === s ? "#fff" : "var(--text-secondary)",
                        borderColor: filterSeverity === s ? "var(--brand-600)" : "var(--border-default)",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: "var(--text-tertiary)" }}>Status</label>
                <div className="flex gap-1.5">
                  {(["all", "active", "investigating", "mitigated", "resolved"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className="px-2.5 py-1 rounded text-xs font-semibold border transition-colors"
                      style={{
                        background: filterStatus === s ? "var(--brand-600)" : "var(--surface-1)",
                        color: filterStatus === s ? "#fff" : "var(--text-secondary)",
                        borderColor: filterStatus === s ? "var(--brand-600)" : "var(--border-default)",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => { setFilterSeverity("all"); setFilterStatus("all"); }}
                className="ml-auto flex items-center gap-1 text-xs"
                style={{ color: "var(--text-tertiary)" }}
              >
                <X size={11} /> Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two-column layout: incidents list + AI workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Incidents list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="heading-section">{filtered.length} Incidents</h3>
          </div>

          <AnimatePresence>
            {filtered.map((inc, i) => {
              const StatusIcon = STATUS_ICON[inc.status];
              const isActive = inc.status === "active" || inc.status === "investigating";
              return (
                <motion.div
                  key={inc.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link href={`/dashboard/incidents/${inc.id}`}>
                    <div
                      className="card p-4 cursor-pointer transition-all duration-150 group"
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-strong)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-default)"; }}
                      style={{ borderLeft: isActive ? `3px solid ${STATUS_COLOR[inc.status]}` : undefined }}
                    >
                      {/* Row 1: title + severity + status */}
                      <div className="flex items-start gap-2.5 mb-2">
                        <div
                          className="p-1.5 rounded-md flex-shrink-0 mt-0.5"
                          style={{ background: isActive ? "var(--color-error-bg)" : "var(--surface-2)", color: STATUS_COLOR[inc.status] }}
                        >
                          <StatusIcon size={12} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{inc.title}</span>
                            <span className={`badge ${SEV_BADGE[inc.severity]} text-[9px]`}>{inc.severity.toUpperCase()}</span>
                          </div>
                          <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--text-secondary)" }}>{inc.summary}</p>
                        </div>
                        <ChevronRight size={14} className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--text-tertiary)" }} />
                      </div>

                      {/* Row 2: metadata badges */}
                      <div className="flex flex-wrap items-center gap-2 ml-8">
                        <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                          <Server size={9} /> {inc.service}
                        </span>
                        <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                          <Clock size={9} /> {relativeTime(inc.detectedAt)} · {inc.durationMinutes}m
                        </span>
                        <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                          <Activity size={9} /> {inc.affectedCount} services
                        </span>

                        {/* Deployment correlation */}
                        {inc.deployCorrelation && (
                          <span className="flex items-center gap-1 text-[10px] badge badge-info">
                            <GitBranch size={9} /> {inc.deployCorrelation.version} · {inc.deployCorrelation.minutesBefore}m before
                          </span>
                        )}

                        {/* Outage probability */}
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded ml-auto"
                          style={{
                            background: inc.outageProbability > 40 ? "var(--color-error-bg)" : inc.outageProbability > 20 ? "var(--color-warning-bg)" : "var(--color-success-bg)",
                            color: inc.outageProbability > 40 ? "var(--color-error)" : inc.outageProbability > 20 ? "var(--color-warning)" : "var(--color-success)",
                          }}
                        >
                          <TrendingUp size={8} className="inline mr-0.5" />
                          {inc.outageProbability}% outage risk
                        </span>
                      </div>

                      {/* AI summary highlight for active incidents */}
                      {isActive && (
                        <div
                          className="mt-3 ml-8 p-3 rounded-lg"
                          style={{ background: "var(--brand-50)", border: "1px solid var(--border-default)" }}
                        >
                          <p className="text-[10px] font-bold flex items-center gap-1 mb-1" style={{ color: "var(--brand-600)" }}>
                            <Zap size={9} /> AI Root Cause · {inc.aiConfidence}% confidence
                          </p>
                          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{inc.summary}</p>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="card p-12 text-center">
              <CheckCircle2 size={28} className="mx-auto mb-3 text-green-500" />
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>No incidents match your filters</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>All clear — try adjusting the filters above</p>
            </div>
          )}
        </div>

        {/* Right panel: AI Workflow + Outage Probability */}
        <div className="space-y-4">
          {/* AI Engine workflow */}
          <div className="card p-5">
            <h3 className="heading-section mb-1">AI Analysis Engine</h3>
            <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>How the correlation engine works</p>
            <div className="space-y-4">
              {[
                { step: 1, title: "Detect & Correlate",   desc: "Cluster alerts into cascading failure trees using temporal proximity" },
                { step: 2, title: "Trace Root Cause",      desc: "Correlate metric anomalies, logs, and deployments with σ-based scoring" },
                { step: 3, title: "Score Probability",     desc: "Weighted outage probability model using 4 signal factors" },
                { step: 4, title: "Suggest Playbook",      desc: "Pattern-matched remediation steps with copy-paste commands" },
              ].map(s => (
                <div key={s.step} className="flex gap-3">
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0"
                    style={{ background: "var(--brand-50)", color: "var(--brand-600)", border: "1px solid var(--border-default)" }}
                  >
                    {s.step}
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{s.title}</p>
                    <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outage probability mini-leaderboard */}
          <div className="card p-5">
            <h3 className="heading-section mb-3">Service Risk Scores</h3>
            <div className="space-y-2">
              {[
                { name: "worker-queue",  risk: 61 },
                { name: "api-gateway",   risk: 34 },
                { name: "ml-inference",  risk: 28 },
                { name: "auth-service",  risk: 14 },
                { name: "db-primary",    risk: 8 },
                { name: "cache-redis",   risk: 4 },
              ].map(s => (
                <div key={s.name}>
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{s.name}</span>
                    <span
                      className="text-[10px] font-bold tabular-nums"
                      style={{ color: s.risk > 50 ? "#ef4444" : s.risk > 25 ? "#f59e0b" : "#22c55e" }}
                    >
                      {s.risk}%
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${s.risk}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      style={{ background: s.risk > 50 ? "#ef4444" : s.risk > 25 ? "#f59e0b" : "#22c55e" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
