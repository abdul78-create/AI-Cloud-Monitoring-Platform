"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Brain, Play, Pause, CheckCircle2, AlertTriangle, XCircle,
  Clock, Zap, Shield, Activity, RefreshCw, ChevronDown, ChevronRight,
  Terminal, Eye, Lock, TrendingUp, Database, Network, Cpu, BarChart3,
  ArrowRight, Sparkles, User, Check, X
} from "lucide-react";
import Link from "next/link";
import { useAgentStore, AgentDecision, AgentDecisionStatus, RULES } from "@/store/useAgentStore";
import { useLiveEngineStore } from "@/hooks/useLiveEngine";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { toast } from "react-hot-toast";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return `${Math.round(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
  return `${Math.round(diff / 3600000)}h ago`;
}

function duration(start: string, end?: string) {
  const ms = (end ? new Date(end).getTime() : Date.now()) - new Date(start).getTime();
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

const STATUS_CONFIG: Record<AgentDecisionStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  analyzing:       { label: "Analyzing",        color: "#818cf8", bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.3)",  icon: Brain },
  deciding:        { label: "Deciding",          color: "#a78bfa", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.3)", icon: Brain },
  pending_approval:{ label: "Awaiting Approval", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", icon: Eye },
  executing:       { label: "Executing",         color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)", icon: Terminal },
  verifying:       { label: "Verifying",         color: "#06b6d4", bg: "rgba(6,182,212,0.1)",  border: "rgba(6,182,212,0.3)",  icon: Activity },
  resolved:        { label: "Resolved",          color: "#22c55e", bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.3)",  icon: CheckCircle2 },
  escalated:       { label: "Escalated",         color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.3)", icon: AlertTriangle },
  failed:          { label: "Failed",            color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.3)",  icon: XCircle },
  rejected:        { label: "Rejected",          color: "#6b7280", bg: "rgba(107,114,128,0.1)","border": "rgba(107,114,128,0.3)", icon: X },
};

const ACTIVE_STATUSES: AgentDecisionStatus[] = ["analyzing", "deciding", "pending_approval", "executing", "verifying"];
const TERMINAL_STATUSES: AgentDecisionStatus[] = ["resolved", "escalated", "failed", "rejected"];

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-2xl font-bold tabular-nums mb-0.5" style={{ color: color ?? "var(--text-primary)" }}>
        {value}
      </div>
      <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </div>
      {sub && <div className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{sub}</div>}
    </div>
  );
}

// ─── Success Rate Gauge ───────────────────────────────────────────────────────

function SuccessGauge({ rate }: { rate: number }) {
  const r = 42, circ = 2 * Math.PI * r;
  const dash = (rate / 100) * circ;
  const color = rate >= 90 ? "#22c55e" : rate >= 75 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex flex-col items-center">
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={7} />
        <circle cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          transform="rotate(-90 50 50)" />
        <text x={50} y={46} textAnchor="middle" fontSize={15} fontWeight={700}
          fill="var(--text-primary)" fontFamily="system-ui">{rate.toFixed(1)}%</text>
        <text x={50} y={60} textAnchor="middle" fontSize={8.5}
          fill="var(--text-tertiary)" fontFamily="system-ui">success</text>
      </svg>
    </div>
  );
}

// ─── Execution Log ────────────────────────────────────────────────────────────

function ExecLog({ lines, status }: { lines: string[]; status: AgentDecisionStatus }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines]);
  return (
    <div ref={ref} className="rounded-lg p-3 font-mono text-[11px] space-y-0.5 max-h-36 overflow-y-auto"
      style={{ background: "#0d1117", border: "1px solid #30363d" }}>
      {lines.map((line, i) => (
        <div key={i} className="flex items-start gap-2">
          <span style={{ color: "#3fb950" }}>$</span>
          <span style={{ color: "#e6edf3" }}>{line}</span>
        </div>
      ))}
      {ACTIVE_STATUSES.includes(status) && (
        <div className="flex items-center gap-1" style={{ color: "#3fb950" }}>
          <span>$</span>
          <span className="animate-pulse">▊</span>
        </div>
      )}
    </div>
  );
}

// ─── Decision Card ────────────────────────────────────────────────────────────

function DecisionCard({ decision }: { decision: AgentDecision }) {
  const [expanded, setExpanded] = useState(ACTIVE_STATUSES.includes(decision.status));
  const cfg = STATUS_CONFIG[decision.status];
  const StatusIcon = cfg.icon;
  const { approve, reject, currentUserRole } = {
    ...useAgentStore.getState(),
    currentUserRole: useMonitoringStore.getState().currentUserRole,
  };
  const canApprove = currentUserRole !== "Developer";
  const isActive = ACTIVE_STATUSES.includes(decision.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="card overflow-hidden"
      style={{ borderLeft: `3px solid ${cfg.color}` }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: cfg.bg }}>
            <StatusIcon size={15} style={{ color: cfg.color }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {RULES.find(r => r.id === decision.ruleId)?.name ?? decision.ruleId}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                {cfg.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cfg.color }} />
              )}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Triggered: {decision.triggeredBy} · {timeAgo(decision.startedAt)}
              {decision.resolvedAt && ` · Duration: ${duration(decision.startedAt, decision.resolvedAt)}`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded"
            style={{ background: "var(--surface-1)", color: "var(--text-tertiary)", border: "1px solid var(--border-default)" }}>
            {decision.confidence}% conf.
          </span>
          {expanded ? <ChevronDown size={14} style={{ color: "var(--text-tertiary)" }} /> : <ChevronRight size={14} style={{ color: "var(--text-tertiary)" }} />}
        </div>
      </div>

      {/* Expanded body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: "var(--border-default)" }}>
              {/* Root cause + metrics */}
              <div className="pt-3 grid sm:grid-cols-2 gap-3">
                <div className="rounded-lg p-3" style={{ background: "var(--surface-1)", border: "1px solid var(--border-default)" }}>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--text-tertiary)" }}>Root Cause Analysis</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-primary)" }}>{decision.rootCause}</p>
                </div>
                <div className="rounded-lg p-3" style={{ background: "var(--surface-1)", border: "1px solid var(--border-default)" }}>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--text-tertiary)" }}>Metrics at Trigger</p>
                  <p className="text-[11px] font-mono" style={{ color: "var(--text-secondary)" }}>{decision.metric}</p>
                  {decision.previousSuccessRate !== undefined && (
                    <p className="text-[10px] mt-1.5" style={{ color: "var(--text-tertiary)" }}>
                      Agent memory: {decision.previousAttempts} prior runs · {decision.previousSuccessRate.toFixed(0)}% success
                    </p>
                  )}
                </div>
              </div>

              {/* Planned action */}
              <div className="rounded-lg p-3 flex items-start justify-between gap-3"
                style={{ background: "#0d1117", border: "1px solid #30363d" }}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "#8b949e" }}>Planned Action</p>
                  <code className="text-[11px]" style={{ color: "#79c0ff" }}>{decision.action.command}</code>
                  <p className="text-[10px] mt-1" style={{ color: "#8b949e" }}>
                    Target: {decision.action.target} · {decision.action.estimatedImpact}
                  </p>
                </div>
                {decision.action.requiresAdmin && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded"
                    style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
                    <Lock size={10} /> Admin only
                  </span>
                )}
              </div>

              {/* Execution log */}
              {decision.executionLog.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-tertiary)" }}>Execution Log</p>
                  <ExecLog lines={decision.executionLog} status={decision.status} />
                </div>
              )}

              {/* Outcome badge */}
              {decision.outcome && (
                <div className="flex items-center gap-2">
                  {decision.outcome === "success" ? (
                    <div className="flex items-center gap-2 text-xs font-semibold"
                      style={{ color: "#22c55e" }}>
                      <CheckCircle2 size={14} /> Auto-healed successfully · {duration(decision.startedAt, decision.resolvedAt)} total
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-semibold"
                      style={{ color: "#f97316" }}>
                      <AlertTriangle size={14} /> Escalated to on-call SRE — automated fix unsuccessful
                    </div>
                  )}
                </div>
              )}

              {/* Supervised approval buttons */}
              {decision.status === "pending_approval" && (
                <div className="flex items-center gap-3">
                  {canApprove ? (
                    <>
                      <button
                        onClick={() => useAgentStore.getState().approve(decision.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                        style={{ background: "#22c55e", color: "#fff" }}>
                        <Check size={13} /> Approve & Execute
                      </button>
                      <button
                        onClick={() => useAgentStore.getState().reject(decision.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                        style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
                        <X size={13} /> Reject
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
                      <Lock size={12} /> Admin or SRE role required to approve actions
                    </div>
                  )}
                  <span className="text-[11px] ml-auto animate-pulse" style={{ color: "var(--text-tertiary)" }}>
                    Awaiting approval...
                  </span>
                </div>
              )}

              {/* Links */}
              <div className="flex gap-3">
                <Link href="/dashboard/traces" className="text-[11px] flex items-center gap-1 font-semibold"
                  style={{ color: "var(--brand-600)" }}>
                  <Eye size={11} /> View Traces
                </Link>
                <Link href="/dashboard/incidents" className="text-[11px] flex items-center gap-1 font-semibold"
                  style={{ color: "var(--brand-600)" }}>
                  <Zap size={11} /> View Incident
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Multi-Agent Architecture Diagram ────────────────────────────────────────

const AGENT_NODES = [
  { id: "monitor", label: "Monitor Agent", sub: "Telemetry collection", icon: Activity, color: "#3b82f6", x: 0.5, y: 0.08 },
  { id: "rca",     label: "RCA Agent",     sub: "Root cause analysis", icon: Brain,    color: "#8b5cf6", x: 0.2, y: 0.5 },
  { id: "heal",    label: "Healing Agent", sub: "Executes fixes",      icon: Zap,      color: "#22c55e", x: 0.5, y: 0.5 },
  { id: "verify",  label: "Verify Agent",  sub: "Post-action check",   icon: Check,    color: "#06b6d4", x: 0.8, y: 0.5 },
  { id: "security",label: "Security Agent",sub: "Threat detection",    icon: Shield,   color: "#f97316", x: 0.35, y: 0.88 },
  { id: "notify",  label: "Notify Agent",  sub: "Escalation & alerts", icon: User,     color: "#f59e0b", x: 0.65, y: 0.88 },
];

const AGENT_EDGES = [
  { from: "monitor", to: "rca" },
  { from: "monitor", to: "heal" },
  { from: "rca", to: "heal" },
  { from: "heal", to: "verify" },
  { from: "verify", to: "notify" },
  { from: "monitor", to: "security" },
  { from: "security", to: "notify" },
];

function AgentArchDiagram() {
  const W = 480, H = 260;
  const pos = (n: typeof AGENT_NODES[0]) => ({ x: n.x * W, y: n.y * H });
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      {AGENT_EDGES.map((e, i) => {
        const src = AGENT_NODES.find(n => n.id === e.from)!;
        const tgt = AGENT_NODES.find(n => n.id === e.to)!;
        const s = pos(src), t = pos(tgt);
        return (
          <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y}
            stroke="var(--border-strong)" strokeWidth={1.5} strokeOpacity={0.5}
            strokeDasharray="4 3" />
        );
      })}
      {AGENT_NODES.map((n) => {
        const { x, y } = pos(n);
        return (
          <g key={n.id}>
            <circle cx={x} cy={y} r={22} fill={n.color + "22"} stroke={n.color} strokeWidth={1.5} />
            <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
              fontSize={9} fontWeight={700} fill={n.color} fontFamily="monospace">
              {n.label.split(" ")[0].toUpperCase().slice(0, 3)}
            </text>
            <text x={x} y={y + 30} textAnchor="middle" fontSize={9} fontWeight={600}
              fill="var(--text-primary)" fontFamily="system-ui">{n.label}</text>
            <text x={x} y={y + 42} textAnchor="middle" fontSize={7.5}
              fill="var(--text-tertiary)" fontFamily="system-ui">{n.sub}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AiAgentPage() {
  const {
    decisions, stats, memory, isEnabled, agentMode,
    setEnabled, setMode, clearAll
  } = useAgentStore();
  const { liveMetrics } = useLiveEngineStore();
  const { currentUserRole } = useMonitoringStore();
  const [activeTab, setActiveTab] = useState<"decisions" | "memory" | "architecture">("decisions");

  // Feed live metrics into agent every 10s
  useEffect(() => {
    const latest = liveMetrics[liveMetrics.length - 1];
    if (!latest || !isEnabled) return;
    useAgentStore.getState().evaluate({
      cpu: latest.cpu,
      memory: latest.memory,
      latencyMs: latest.latencyMs,
      errorRate: latest.errorRate,
      activeThreats: latest.activeThreats,
    });
  }, [liveMetrics.length > 0 ? Math.floor(liveMetrics.length / 4) : 0, isEnabled]);

  const activeDecisions = decisions.filter(d => ACTIVE_STATUSES.includes(d.status));
  const historyDecisions = decisions.filter(d => TERMINAL_STATUSES.includes(d.status));
  const memoryArr = Object.values(memory);

  const latest = liveMetrics[liveMetrics.length - 1];

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="heading-page flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: isEnabled ? "rgba(34,197,94,0.1)" : "var(--surface-2)" }}>
              <Bot size={18} style={{ color: isEnabled ? "#22c55e" : "var(--text-tertiary)" }} />
            </div>
            AI SRE Agent
            {isEnabled && (
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            )}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Autonomous detection · analysis · remediation · verification
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode selector */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--border-default)" }}>
            {(["autonomous", "supervised"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className="px-3 py-1.5 text-[11px] font-semibold capitalize transition-colors"
                style={{
                  background: agentMode === m ? "var(--brand-600)" : "var(--surface-0)",
                  color: agentMode === m ? "#fff" : "var(--text-secondary)",
                }}>
                {m === "autonomous" ? "🤖 Auto" : "👁 Supervised"}
              </button>
            ))}
          </div>
          {/* Enable toggle */}
          <button
            onClick={() => setEnabled(!isEnabled)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{
              background: isEnabled ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
              color: isEnabled ? "#ef4444" : "#22c55e",
              border: `1px solid ${isEnabled ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
            }}>
            {isEnabled ? <><Pause size={12} /> Pause Agent</> : <><Play size={12} /> Enable Agent</>}
          </button>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-center">
        <div className="sm:col-span-1 lg:col-span-1 flex justify-center card p-4">
          <SuccessGauge rate={stats.successRate} />
        </div>
        <StatCard label="Total Actions" value={stats.totalActions} color="var(--brand-600)" />
        <StatCard label="Avg MTTR" value={`${Math.round(stats.avgResolutionMs / 60000)}m ${Math.round((stats.avgResolutionMs % 60000) / 1000)}s`} color="var(--text-primary)" />
        <StatCard label="Escalations" value={stats.escalations} color={stats.escalations > 0 ? "var(--color-warning)" : "var(--color-success)"} />
        <StatCard label="Last Action" value={stats.lastActionAt ? timeAgo(stats.lastActionAt) : "Never"} />
      </div>

      {/* ── Live context banner if metrics are spiking ── */}
      {latest && (latest.cpu > 85 || latest.memory > 88 || latest.latencyMs > 1500) && isEnabled && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-3 flex items-center gap-3 text-xs font-semibold"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444" }}>
          <div className="w-2 h-2 rounded-full bg-red-400 animate-ping flex-shrink-0" />
          Anomaly detected — Agent scanning rules against live metrics (CPU: {latest.cpu.toFixed(0)}%  MEM: {latest.memory.toFixed(0)}%  Latency: {latest.latencyMs}ms)
        </motion.div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1.5" style={{ borderBottom: "1px solid var(--border-default)", paddingBottom: 0 }}>
        {([
          { id: "decisions", label: `Decisions (${decisions.length})` },
          { id: "memory",    label: `Agent Memory (${memoryArr.length})` },
          { id: "architecture", label: "Multi-Agent Architecture" },
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors"
            style={{
              background: activeTab === tab.id ? "var(--surface-0)" : "transparent",
              color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-tertiary)",
              borderBottom: activeTab === tab.id ? "2px solid var(--brand-600)" : "2px solid transparent",
              marginBottom: -1,
            }}>
            {tab.label}
          </button>
        ))}
        {decisions.length > 0 && (
          <button onClick={clearAll} className="ml-auto text-[11px] px-3 py-1 rounded"
            style={{ color: "var(--text-tertiary)" }}>
            Clear all
          </button>
        )}
      </div>

      {/* ── Tab: Decisions ── */}
      {activeTab === "decisions" && (
        <div className="space-y-4">
          {/* Active */}
          {activeDecisions.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"
                style={{ color: "var(--text-tertiary)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Active Decisions ({activeDecisions.length})
              </h2>
              <div className="space-y-3">
                <AnimatePresence>
                  {activeDecisions.map(d => <DecisionCard key={d.id} decision={d} />)}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* History */}
          {historyDecisions.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: "var(--text-tertiary)" }}>
                Healing History ({historyDecisions.length})
              </h2>
              <div className="space-y-2">
                {historyDecisions.slice(0, 10).map(d => {
                  const cfg = STATUS_CONFIG[d.status];
                  const rule = RULES.find(r => r.id === d.ruleId);
                  return (
                    <div key={d.id} className="card p-3 flex items-center gap-3"
                      style={{ borderLeft: `3px solid ${cfg.color}` }}>
                      <cfg.icon size={14} style={{ color: cfg.color, flexShrink: 0 }} />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                          {rule?.name ?? d.ruleId}
                        </span>
                        <span className="text-[10px] ml-2" style={{ color: "var(--text-tertiary)" }}>
                          {timeAgo(d.startedAt)} · {duration(d.startedAt, d.resolvedAt)}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {decisions.length === 0 && (
            <div className="card p-12 text-center">
              <div className="inline-flex p-4 rounded-2xl mb-4" style={{ background: "rgba(34,197,94,0.1)" }}>
                <Bot size={28} style={{ color: "#22c55e" }} />
              </div>
              <h3 className="text-base font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                All Systems Nominal
              </h3>
              <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
                The AI Agent is monitoring live metrics. No anomalies detected yet.
              </p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                Trigger a scenario from{" "}
                <Link href="/dashboard/monitoring" className="underline" style={{ color: "var(--brand-600)" }}>
                  Monitoring → Scenarios
                </Link>{" "}
                to see the agent in action.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Memory ── */}
      {activeTab === "memory" && (
        <div className="space-y-3">
          <div className="card p-4 text-xs" style={{ background: "var(--surface-1)", color: "var(--text-secondary)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Brain size={13} style={{ color: "var(--brand-600)" }} />
              <span className="font-bold" style={{ color: "var(--text-primary)" }}>
                Agent has learned from {stats.totalActions} healing actions
              </span>
            </div>
            Each time the agent resolves an issue, it records the outcome. Future decisions for the same failure pattern use this history to improve confidence scoring.
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {memoryArr.map(entry => {
              const barW = entry.successRate;
              const barColor = barW >= 90 ? "#22c55e" : barW >= 75 ? "#f59e0b" : "#ef4444";
              return (
                <div key={entry.ruleId} className="card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
                      {entry.name}
                    </p>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{
                        background: entry.lastOutcome === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                        color: entry.lastOutcome === "success" ? "#22c55e" : "#ef4444",
                        border: `1px solid ${entry.lastOutcome === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                      }}>
                      {entry.lastOutcome}
                    </span>
                  </div>

                  {/* Success rate bar */}
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span style={{ color: "var(--text-tertiary)" }}>Success rate</span>
                      <span className="font-bold tabular-nums" style={{ color: barColor }}>
                        {entry.successRate.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${barW}%`, background: barColor }} />
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span style={{ color: "var(--text-tertiary)" }}>Total runs</span>
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{entry.totalRuns}</span>
                    </div>
                    <div className="pt-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                      <p className="text-[10px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>Last fix applied:</p>
                      <code className="text-[10px] block" style={{ color: "#79c0ff" }}>{entry.lastFix}</code>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab: Architecture ── */}
      {activeTab === "architecture" && (
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="heading-section mb-4">Multi-Agent Architecture</h2>
            <AgentArchDiagram />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: Activity, color: "#3b82f6", title: "Monitor Agent", body: "Continuously polls telemetry from all connected integrations. Feeds normalized metrics to downstream agents every 2.5s." },
              { icon: Brain, color: "#8b5cf6", title: "RCA Agent", body: "Applies 5 decision rules against live metrics. Calculates confidence scores using historical success rates from Agent Memory." },
              { icon: Zap, color: "#22c55e", title: "Healing Agent", body: "Executes approved remediation commands via SSH or Kubernetes API. Streams execution output in real-time." },
              { icon: Check, color: "#06b6d4", title: "Verify Agent", body: "After execution, waits 15s and re-checks metrics to confirm resolution. Triggers escalation if metrics are unchanged." },
              { icon: Shield, color: "#f97316", title: "Security Agent", body: "Monitors active threat counts, brute-force patterns, and DDoS signatures. Triggers nginx reload or IP block actions." },
              { icon: User, color: "#f59e0b", title: "Notify Agent", body: "Sends escalation alerts to on-call via PagerDuty/Slack when automated healing fails or human approval is required." },
            ].map(a => (
              <div key={a.title} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg" style={{ background: a.color + "22" }}>
                    <a.icon size={14} style={{ color: a.color }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{a.title}</span>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
