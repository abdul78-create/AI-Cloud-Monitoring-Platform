"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Brain, AlertTriangle, CheckCircle2, Clock,
  Server, ChevronRight, ChevronDown, Zap, Shield, Activity,
  GitBranch, Terminal, Download, RefreshCw, Circle,
  TrendingUp, TrendingDown, Minus, Copy, Check
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
  ReferenceLine, CartesianGrid
} from "recharts";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface RCANode {
  id: string;
  label: string;
  description: string;
  type: "trigger" | "cause" | "symptom" | "impact";
  confidence: number;
  leadsTo?: string[];
}

interface AffectedService {
  name: string;
  impact: "primary" | "secondary" | "downstream";
  degradation: number;
  status: "degraded" | "down" | "slow" | "healthy";
}

interface DeploymentCorrelation {
  version: string;
  deployedAt: string;
  minutesBefore: number;
  confidence: number;
  changes: string[];
}

interface AnomalySignal {
  metric: string;
  currentValue: number;
  baselineValue: number;
  deviationSigma: number;
  severity: "low" | "medium" | "high";
  trend: "rising" | "falling" | "spike" | "stable";
}

interface RemediationStep {
  order: number;
  action: string;
  command?: string;
  expectedEffect: string;
  urgency: "immediate" | "soon" | "monitor";
  automated: boolean;
}

interface TimelineEvent {
  timestamp: string;
  type: "metric_anomaly" | "alert_fired" | "deployment" | "auto_remediation" | "manual_action" | "resolved";
  title: string;
  detail: string;
  severity?: "info" | "warning" | "error" | "critical";
}

interface IncidentMetrics {
  cpuAtIncident: number;
  memoryAtIncident: number;
  errorRateAtIncident: number;
  latencyAtIncident: number;
  requestsPerSec: number;
  normalCpu: number;
  normalMemory: number;
  normalErrorRate: number;
  normalLatency: number;
}

interface IncidentRCA {
  incidentId: string;
  title: string;
  service: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "active" | "investigating" | "mitigated" | "resolved";
  detectedAt: string;
  resolvedAt?: string;
  durationMinutes?: number;
  summary: string;
  confidence: number;
  outageProbability: number;
  rootCauseChain: RCANode[];
  affectedServices: AffectedService[];
  deploymentCorrelation?: DeploymentCorrelation;
  anomalySignals: AnomalySignal[];
  remediationSteps: RemediationStep[];
  timelineEvents: TimelineEvent[];
  metrics: IncidentMetrics;
}

// ─── Static mock to use before API load ───────────────────────────────────────

function buildMockIncident(id: string): IncidentRCA {
  const now = new Date();
  const detected = new Date(now.getTime() - 7 * 60000);
  const deployed = new Date(now.getTime() - 25 * 60000);
  return {
    incidentId: id,
    title: "Memory Leak Detected — api-gateway",
    service: "api-gateway",
    severity: "high",
    status: "investigating",
    detectedAt: detected.toISOString(),
    durationMinutes: 7,
    summary:
      "Sustained memory growth detected on api-gateway. Heap allocation is increasing at ~2MB/min with no GC recovery, " +
      "a pattern consistent with a memory leak introduced in v2.4.1. The process will exhaust available memory " +
      "in approximately 47 minutes without intervention. Confidence: 89%.",
    confidence: 89,
    outageProbability: 34,
    rootCauseChain: [
      { id: "rca-0", label: "Memory growth +2MB/min", type: "trigger", description: "Heap size growing monotonically with no GC relief", confidence: 94, leadsTo: ["rca-1"] },
      { id: "rca-1", label: "Event listener accumulation", type: "cause",   description: "Unclosed event listeners accumulating in long-lived request handlers", confidence: 87, leadsTo: ["rca-2"] },
      { id: "rca-2", label: "Response time degradation", type: "symptom",  description: "GC pauses causing P99 latency to increase from 42ms → 380ms", confidence: 91, leadsTo: ["rca-3"] },
      { id: "rca-3", label: "OOM crash risk in ~47m",   type: "impact",   description: "Node process will be killed by OOM killer if unremediated", confidence: 82, leadsTo: [] },
    ],
    affectedServices: [
      { name: "api-gateway",    impact: "primary",    degradation: 78, status: "degraded" },
      { name: "auth-service",   impact: "secondary",  degradation: 31, status: "slow" },
      { name: "payments-svc",   impact: "downstream", degradation: 12, status: "slow" },
    ],
    deploymentCorrelation: {
      version: "v2.4.1",
      deployedAt: deployed.toISOString(),
      minutesBefore: 18,
      confidence: 91,
      changes: [
        "Refactored request handler to async iterator pattern",
        "Updated @redis/client from 1.3.0 to 1.5.6",
        "Increased default request timeout 5000ms → 15000ms",
      ],
    },
    anomalySignals: [
      { metric: "Memory Usage",   currentValue: 84, baselineValue: 54, deviationSigma: 3.8, severity: "high",   trend: "rising" },
      { metric: "Error Rate",     currentValue: 4.2, baselineValue: 0.3, deviationSigma: 7.8, severity: "high",  trend: "spike" },
      { metric: "P99 Latency",    currentValue: 380, baselineValue: 42,  deviationSigma: 5.6, severity: "high",  trend: "rising" },
      { metric: "CPU Usage",      currentValue: 71,  baselineValue: 34,  deviationSigma: 3.1, severity: "medium", trend: "rising" },
    ],
    remediationSteps: [
      { order: 1, action: "Restart container to free heap",        command: "kubectl rollout restart deploy/api-gateway",  expectedEffect: "Immediately free heap; resolve OOM risk",              urgency: "immediate", automated: true  },
      { order: 2, action: "Rollback deployment to v2.4.0",         command: "kubectl rollout undo deploy/api-gateway",     expectedEffect: "Remove leaking code path introduced in v2.4.1",         urgency: "immediate", automated: false },
      { order: 3, action: "Add memory limit to pod spec",          command: "kubectl set resources deploy/api-gateway --limits=memory=2Gi", expectedEffect: "Prevent OOM from affecting other pods", urgency: "soon",      automated: false },
      { order: 4, action: "Profile with --inspect for listeners",  command: "node --inspect dist/server.js",               expectedEffect: "Identify exact unclosed listener location",             urgency: "soon",      automated: false },
      { order: 5, action: "Add memory alerting threshold",         command: "",                                            expectedEffect: "Alert before next leak reaches critical level",         urgency: "monitor",   automated: false },
    ],
    timelineEvents: [
      { timestamp: new Date(now.getTime() - 25 * 60000).toISOString(), type: "deployment",       title: "Deployment v2.4.1 pushed to api-gateway",      detail: "3 files changed. Memory management refactored in request handler.", severity: "info" },
      { timestamp: new Date(now.getTime() - 15 * 60000).toISOString(), type: "metric_anomaly",   title: "Memory anomaly detected (2.3σ above baseline)", detail: "Heap size 2.3σ above 7-day baseline. Automated threshold check triggered.", severity: "warning" },
      { timestamp: new Date(now.getTime() - 10 * 60000).toISOString(), type: "metric_anomaly",   title: "Error rate elevation — 12× baseline",           detail: "Error rate rose from 0.3% to 4.2%. Circuit breaker approaching threshold.", severity: "error" },
      { timestamp: new Date(now.getTime() - 7  * 60000).toISOString(), type: "alert_fired",      title: "Incident declared — SLA breached",               detail: "Memory growth rate exceeded 2MB/min threshold. PagerDuty alert sent.", severity: "critical" },
      { timestamp: new Date(now.getTime() - 4  * 60000).toISOString(), type: "auto_remediation", title: "Auto-remediation triggered",                    detail: "Automated runbook: connection pool reset + rate limit applied.", severity: "info" },
      { timestamp: new Date(now.getTime() - 2  * 60000).toISOString(), type: "manual_action",    title: "Engineer joined incident",                      detail: "On-call engineer acknowledged. Root cause identified as post-deploy regression.", severity: "info" },
    ],
    metrics: {
      cpuAtIncident: 71, memoryAtIncident: 84, errorRateAtIncident: 4.2, latencyAtIncident: 380, requestsPerSec: 1240,
      normalCpu: 34,     normalMemory: 54,     normalErrorRate: 0.3,     normalLatency: 42,
    },
  };
}

// ─── Chart data builder ────────────────────────────────────────────────────────

function buildChartData(metrics: IncidentMetrics) {
  const points = [];
  const now = Date.now();
  for (let i = 29; i >= 0; i--) {
    const isIncident = i < 8;
    const t = new Date(now - i * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const drift = isIncident ? (8 - i) * 2 : 0;
    points.push({
      t,
      cpu:       isIncident ? Math.min(99, metrics.normalCpu    + drift * 2.5 + Math.random() * 5) : metrics.normalCpu    + Math.random() * 8 - 4,
      memory:    isIncident ? Math.min(99, metrics.normalMemory + drift * 1.8 + Math.random() * 3) : metrics.normalMemory + Math.random() * 5 - 2.5,
      errorRate: isIncident ? Math.min(15, metrics.normalErrorRate + drift * 0.5 + Math.random()) : metrics.normalErrorRate + Math.random() * 0.2,
      latency:   isIncident ? Math.min(3000, metrics.normalLatency + drift * 40 + Math.random() * 50) : metrics.normalLatency + Math.random() * 15,
    });
  }
  return points;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const RCA_TYPE_STYLES = {
  trigger: { color: "#ef4444", bg: "#fef2f2", border: "#fecaca", label: "TRIGGER" },
  cause:   { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", label: "CAUSE" },
  symptom: { color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", label: "SYMPTOM" },
  impact:  { color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe", label: "IMPACT" },
};

function RCAChain({ chain }: { chain: RCANode[] }) {
  return (
    <div className="space-y-0">
      {chain.map((node, i) => {
        const style = RCA_TYPE_STYLES[node.type];
        return (
          <div key={node.id}>
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 p-4 rounded-lg border"
              style={{ background: style.bg, borderColor: style.border }}
            >
              <div className="flex-shrink-0 mt-0.5">
                <span
                  className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: style.color, color: "#fff" }}
                >
                  {style.label}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{node.label}</span>
                  <span className="text-[10px] font-bold tabular-nums" style={{ color: style.color }}>{node.confidence}% conf.</span>
                </div>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{node.description}</p>
              </div>
            </motion.div>
            {i < chain.length - 1 && (
              <div className="flex justify-center py-1">
                <ChevronDown size={14} style={{ color: "var(--text-tertiary)" }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TimelineView({ events }: { events: TimelineEvent[] }) {
  const SEV_STYLE: Record<string, { dot: string; label: string }> = {
    info:     { dot: "#6b7280", label: "" },
    warning:  { dot: "#f59e0b", label: "" },
    error:    { dot: "#ef4444", label: "" },
    critical: { dot: "#dc2626", label: "" },
  };
  const TYPE_ICON: Record<string, React.ElementType> = {
    deployment:       GitBranch,
    metric_anomaly:   TrendingUp,
    alert_fired:      AlertTriangle,
    auto_remediation: Zap,
    manual_action:    Terminal,
    resolved:         CheckCircle2,
  };

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-2 top-2 bottom-2 w-px" style={{ background: "var(--border-default)" }} />

      <div className="space-y-5">
        {events.map((event, i) => {
          const sev = SEV_STYLE[event.severity ?? "info"];
          const Icon = TYPE_ICON[event.type] ?? Circle;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="relative"
            >
              <div
                className="absolute -left-6 mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                style={{ background: "#fff", borderColor: sev.dot }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: sev.dot }} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Icon size={12} style={{ color: sev.dot }} />
                  <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{event.title}</span>
                  <span className="text-[10px] ml-auto tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                </div>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{event.detail}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function CommandBlock({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(command).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [command]);

  return (
    <div
      className="relative group mt-2 rounded-lg px-4 py-3 font-mono text-[11px] leading-relaxed"
      style={{ background: "#0f172a", color: "#94a3b8" }}
    >
      <span style={{ color: "#4ade80" }}>$ </span>
      <span style={{ color: "#e2e8f0" }}>{command}</span>
      <button
        onClick={copy}
        className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: "#64748b", background: "#1e293b" }}
        title="Copy command"
      >
        {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
      </button>
    </div>
  );
}

function AnomalySignalRow({ signal }: { signal: AnomalySignal }) {
  const delta = signal.currentValue - signal.baselineValue;
  const isPercent = signal.metric.includes("Usage") || signal.metric.includes("Rate");
  const isMs = signal.metric.includes("Latency");
  const unit = isPercent ? "%" : isMs ? "ms" : "";
  const TrendIcon = signal.trend === "rising" || signal.trend === "spike" ? TrendingUp : signal.trend === "falling" ? TrendingDown : Minus;
  const trendColor = signal.trend === "rising" || signal.trend === "spike" ? "#ef4444" : signal.trend === "falling" ? "#22c55e" : "#6b7280";

  return (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-b-0" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="w-28 text-xs font-medium truncate" style={{ color: "var(--text-secondary)" }}>{signal.metric}</div>
      <div className="w-16 text-right">
        <span className="text-sm font-bold tabular-nums" style={{ color: signal.severity === "high" ? "#ef4444" : signal.severity === "medium" ? "#f59e0b" : "var(--text-primary)" }}>
          {typeof signal.currentValue === "number" && signal.currentValue > 10 ? Math.round(signal.currentValue) : signal.currentValue}{unit}
        </span>
      </div>
      <div className="w-20 text-right text-xs tabular-nums" style={{ color: "var(--text-tertiary)" }}>
        baseline: {Math.round(signal.baselineValue)}{unit}
      </div>
      <div className="flex items-center gap-1 ml-auto">
        <span className="text-[10px] font-bold tabular-nums" style={{ color: trendColor }}>
          +{signal.deviationSigma}σ
        </span>
        <TrendIcon size={12} style={{ color: trendColor }} />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function IncidentDetailPage() {
  const params = useParams();
  const id = (params?.id as string) ?? "inc-001";

  const [incident, setIncident] = useState<IncidentRCA | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"summary" | "timeline" | "rca" | "remediation" | "metrics">("summary");
  const [postmortemVisible, setPostmortemVisible] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  useEffect(() => {
    // Fetch from backend; fall back to mock on any error
    fetch(`/api/analytics/rca/${id}`)
      .then(r => r.json())
      .then(body => {
        if (body.success && body.data) setIncident(body.data);
        else setIncident(buildMockIncident(id));
      })
      .catch(() => setIncident(buildMockIncident(id)))
      .finally(() => setLoading(false));
  }, [id]);

  const chartData = incident ? buildChartData(incident.metrics) : [];

  const incidentTime = incident ? new Date(incident.detectedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
  const incidentDate = incident ? new Date(incident.detectedAt).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" }) : "";

  const severityColors: Record<string, string> = {
    critical: "#ef4444", high: "#f59e0b", medium: "#3b82f6", low: "#22c55e",
  };
  const severityBg: Record<string, string> = {
    critical: "#fef2f2", high: "#fffbeb", medium: "#eff6ff", low: "#f0fdf4",
  };
  const sev = incident?.severity ?? "high";

  const TABS = [
    { id: "summary",     label: "Summary" },
    { id: "timeline",    label: "Timeline" },
    { id: "rca",         label: "Root Cause" },
    { id: "remediation", label: "Remediation" },
    { id: "metrics",     label: "Metrics" },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center gap-2" style={{ color: "var(--text-tertiary)" }}>
          <RefreshCw size={16} className="animate-spin" />
          <span className="text-sm">Loading incident analysis...</span>
        </div>
      </div>
    );
  }

  if (!incident) return null;

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-tertiary)" }}>
        <Link href="/dashboard/incidents" className="hover:opacity-70 transition-opacity flex items-center gap-1">
          <ArrowLeft size={13} /> Incidents
        </Link>
        <ChevronRight size={12} />
        <span style={{ color: "var(--text-secondary)" }}>{incident.incidentId}</span>
      </div>

      {/* Header */}
      <div
        className="card p-5"
        style={{
          borderLeft: `4px solid ${severityColors[sev]}`,
          background: severityBg[sev],
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className="badge text-[10px] px-2 py-0.5 font-bold uppercase"
                style={{ background: severityColors[sev], color: "#fff" }}
              >
                {sev}
              </span>
              <span className="badge badge-warning text-[10px]">{incident.status.toUpperCase()}</span>
              {incident.deploymentCorrelation && (
                <span className="badge badge-info text-[10px]">
                  <GitBranch size={9} className="mr-1 inline" />
                  Deploy correlation {incident.deploymentCorrelation.confidence}%
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              {incident.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
              <span className="flex items-center gap-1"><Server size={11} /> {incident.service}</span>
              <span className="flex items-center gap-1"><Clock size={11} /> {incidentDate} · {incidentTime}</span>
              {incident.durationMinutes && (
                <span className="flex items-center gap-1"><Activity size={11} /> {incident.durationMinutes}m duration</span>
              )}
            </div>
          </div>

          {/* Scores */}
          <div className="flex gap-3 flex-shrink-0">
            <div className="text-center px-4 py-2 rounded-lg" style={{ background: "var(--surface-0)", border: "1px solid var(--border-default)" }}>
              <div className="text-xl font-extrabold tabular-nums" style={{ color: "var(--brand-600)" }}>
                {incident.confidence}%
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>AI Confidence</div>
            </div>
            <div className="text-center px-4 py-2 rounded-lg" style={{ background: "var(--surface-0)", border: "1px solid var(--border-default)" }}>
              <div
                className="text-xl font-extrabold tabular-nums"
                style={{ color: incident.outageProbability > 50 ? "#ef4444" : incident.outageProbability > 25 ? "#f59e0b" : "#22c55e" }}
              >
                {incident.outageProbability}%
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Outage Risk</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-0 border-b" style={{ borderColor: "var(--border-default)" }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px"
            style={{
              borderColor: activeTab === tab.id ? "var(--brand-600)" : "transparent",
              color: activeTab === tab.id ? "var(--brand-600)" : "var(--text-secondary)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {/* ─── SUMMARY ─── */}
          {activeTab === "summary" && (
            <div className="space-y-4">
              {/* AI Summary */}
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Brain size={15} style={{ color: "var(--brand-600)" }} />
                  <h3 className="heading-section">AI Incident Summary</h3>
                  <span className="badge badge-live text-[9px] ml-auto">AI-GENERATED</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {incident.summary}
                </p>
              </div>

              {/* 3-column cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Affected services */}
                <div className="card p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--text-tertiary)" }}>Affected Services</h4>
                  <div className="space-y-2">
                    {incident.affectedServices.map(svc => (
                      <div key={svc.name} className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: svc.status === "degraded" ? "#ef4444" : svc.status === "down" ? "#dc2626" : "#f59e0b" }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{svc.name}</div>
                          <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{svc.impact} · {svc.degradation}% degraded</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deployment correlation */}
                {incident.deploymentCorrelation && (
                  <div className="card p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--text-tertiary)" }}>Deployment Correlation</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <GitBranch size={12} style={{ color: "var(--brand-600)" }} />
                        <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{incident.deploymentCorrelation.version}</span>
                      </div>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        Deployed {incident.deploymentCorrelation.minutesBefore}m before incident onset.
                      </p>
                      <div className="space-y-1 mt-2">
                        {incident.deploymentCorrelation.changes.map((c, i) => (
                          <div key={i} className="text-[11px] flex gap-1.5" style={{ color: "var(--text-secondary)" }}>
                            <span style={{ color: "#f59e0b" }}>△</span> {c}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Anomaly signals */}
                <div className="card p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--text-tertiary)" }}>Anomaly Signals</h4>
                  <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                    {incident.anomalySignals.slice(0, 3).map(sig => (
                      <div key={sig.metric} className="flex items-center justify-between py-1.5">
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{sig.metric}</span>
                        <span
                          className="text-xs font-bold"
                          style={{ color: sig.severity === "high" ? "#ef4444" : sig.severity === "medium" ? "#f59e0b" : "#6b7280" }}
                        >
                          +{sig.deviationSigma}σ
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Postmortem */}
              <div className="flex gap-3">
                <button
                  onClick={() => setPostmortemVisible(v => !v)}
                  className="btn btn-outlined flex items-center gap-2 text-sm"
                >
                  <Download size={13} /> Generate Postmortem
                </button>
                <Link href="/dashboard/incidents" className="btn btn-ghost flex items-center gap-2 text-sm">
                  All Incidents
                </Link>
              </div>
            </div>
          )}

          {/* ─── TIMELINE ─── */}
          {activeTab === "timeline" && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <Clock size={15} style={{ color: "var(--brand-600)" }} />
                <h3 className="heading-section">Incident Timeline</h3>
                <span className="text-xs ml-auto" style={{ color: "var(--text-tertiary)" }}>{incident.timelineEvents.length} events</span>
              </div>
              <TimelineView events={incident.timelineEvents} />
            </div>
          )}

          {/* ─── ROOT CAUSE ─── */}
          {activeTab === "rca" && (
            <div className="space-y-4">
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Brain size={15} style={{ color: "var(--brand-600)" }} />
                  <h3 className="heading-section">Root Cause Chain</h3>
                  <span className="badge badge-live text-[9px] ml-auto">{incident.confidence}% CONFIDENCE</span>
                </div>
                <RCAChain chain={incident.rootCauseChain} />
              </div>
              <div className="card p-5">
                <h3 className="heading-section mb-4">Anomaly Signal Analysis</h3>
                <div>
                  <div className="flex items-center gap-3 pb-2 text-[10px] font-bold uppercase" style={{ color: "var(--text-tertiary)", borderBottom: "1px solid var(--border-subtle)" }}>
                    <span className="w-28">Metric</span>
                    <span className="w-16 text-right">Current</span>
                    <span className="w-20 text-right">Baseline</span>
                    <span className="ml-auto">Deviation</span>
                  </div>
                  {incident.anomalySignals.map(sig => <AnomalySignalRow key={sig.metric} signal={sig} />)}
                </div>
              </div>
            </div>
          )}

          {/* ─── REMEDIATION ─── */}
          {activeTab === "remediation" && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-5">
                <Zap size={15} style={{ color: "var(--brand-600)" }} />
                <h3 className="heading-section">Remediation Playbook</h3>
              </div>
              <div className="space-y-3">
                {incident.remediationSteps.map(step => {
                  const urgencyStyles = {
                    immediate: { bg: "#fef2f2", border: "#fca5a5", color: "#ef4444", label: "IMMEDIATE" },
                    soon:      { bg: "#fffbeb", border: "#fde68a", color: "#f59e0b", label: "SOON" },
                    monitor:   { bg: "#f0fdf4", border: "#86efac", color: "#22c55e", label: "MONITOR" },
                  }[step.urgency];
                  const isExpanded = expandedStep === step.order;

                  return (
                    <motion.div
                      key={step.order}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: step.order * 0.06 }}
                      className="rounded-lg border overflow-hidden"
                      style={{ borderColor: urgencyStyles.border }}
                    >
                      <button
                        onClick={() => setExpandedStep(isExpanded ? null : step.order)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left"
                        style={{ background: urgencyStyles.bg }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: urgencyStyles.color, color: "#fff" }}
                        >
                          {step.order}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{step.action}</div>
                          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{step.expectedEffect}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: urgencyStyles.color, color: "#fff" }}>
                            {urgencyStyles.label}
                          </span>
                          {step.automated && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded badge-success">AUTO</span>
                          )}
                          <ChevronDown size={12} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} style={{ color: "var(--text-tertiary)" }} />
                        </div>
                      </button>
                      {isExpanded && step.command && (
                        <div className="px-4 pb-4 pt-2" style={{ background: "var(--surface-1)" }}>
                          <p className="text-[11px] mb-1" style={{ color: "var(--text-tertiary)" }}>Run command:</p>
                          <CommandBlock command={step.command} />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── METRICS ─── */}
          {activeTab === "metrics" && (
            <div className="space-y-4">
              {/* Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "CPU at Incident", value: `${incident.metrics.cpuAtIncident}%`, normal: `${incident.metrics.normalCpu}%`, color: "#ef4444" },
                  { label: "Memory at Incident", value: `${incident.metrics.memoryAtIncident}%`, normal: `${incident.metrics.normalMemory}%`, color: "#f59e0b" },
                  { label: "Error Rate", value: `${incident.metrics.errorRateAtIncident}%`, normal: `${incident.metrics.normalErrorRate}%`, color: "#ef4444" },
                  { label: "P99 Latency", value: `${incident.metrics.latencyAtIncident}ms`, normal: `${incident.metrics.normalLatency}ms`, color: "#f59e0b" },
                ].map(stat => (
                  <div key={stat.label} className="card p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-tertiary)" }}>{stat.label}</div>
                    <div className="text-2xl font-bold tabular-nums" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>Baseline: {stat.normal}</div>
                  </div>
                ))}
              </div>

              {/* CPU/Memory chart */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="heading-section">Resource Usage During Incident</h3>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1"><span className="w-2 h-0.5 inline-block bg-blue-500 rounded" /> CPU</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-0.5 inline-block bg-purple-500 rounded" /> Memory</span>
                    <span className="text-red-400">← Incident detected</span>
                  </div>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="cpu-fill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.12} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="mem-fill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.10} />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 4" stroke="var(--border-subtle)" />
                      <XAxis dataKey="t" tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} interval={4} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} tickFormatter={v => `${v}%`} />
                      <Tooltip
                        contentStyle={{ background: "var(--surface-elevated)", border: "1px solid var(--border-default)", borderRadius: 8, fontSize: 11 }}
                        labelStyle={{ color: "var(--text-tertiary)" }}
                      />
                      <ReferenceLine x={chartData[22]?.t} stroke="#ef4444" strokeDasharray="4 2" label={{ value: "INC", fill: "#ef4444", fontSize: 10 }} />
                      <Area type="monotone" dataKey="cpu" name="CPU" stroke="#3b82f6" strokeWidth={1.8} fill="url(#cpu-fill)" dot={false} isAnimationActive={false} />
                      <Area type="monotone" dataKey="memory" name="Memory" stroke="#8b5cf6" strokeWidth={1.8} fill="url(#mem-fill)" dot={false} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
