"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Zap, ArrowLeft, Clock, User, Server, GitBranch, BrainCircuit,
  CheckCircle2, AlertTriangle, Activity, Shield, ChevronRight,
  Terminal, BookOpen, TrendingUp, MessageSquare, RefreshCw
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid
} from "recharts";
import { api, unwrap } from "@/services/api";
import { useMonitoringStore } from "@/store/useMonitoringStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type TimelineEventType = "alert_fired" | "deployment" | "metric_spike" | "user_action" | "ai_insight" | "recovery" | "escalation";

interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: TimelineEventType;
  actor: string;
  message: string;
}

interface IncidentDetail {
  id: string;
  title: string;
  severity: "warning" | "high" | "critical";
  status: "open" | "acknowledged" | "investigating" | "resolved";
  affectedServices: string[];
  startedAt: Date;
  acknowledgedAt: Date | null;
  resolvedAt: Date | null;
  assignedTo: string | null;
  deploymentCorrelation: {
    version: string;
    deployedAt: Date;
    deployedBy: string;
    confidence: number;
    regressionSignal: string;
    changelog: string[];
  } | null;
  aiSummary: string;
  aiRecommendations: string[];
  metrics: { peakCpu: number; peakMemory: number; peakLatency: number; errorRate: number };
  timeline: TimelineEvent[];
  runbook: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIMELINE_CFG: Record<TimelineEventType, { icon: React.ElementType; color: string; bg: string }> = {
  alert_fired: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
  deployment:  { icon: GitBranch,    color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
  metric_spike:{ icon: Activity,     color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" },
  user_action: { icon: User,         color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  ai_insight:  { icon: BrainCircuit, color: "text-violet-600", bg: "bg-violet-100 dark:bg-violet-900/30" },
  recovery:    { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  escalation:  { icon: Zap,          color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
};

function timeAgo(d: Date) {
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return `${Math.round(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
  return `${Math.round(diff / 3600000)}h ago`;
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
}

function seedChartData(inc: IncidentDetail) {
  const start = inc.startedAt.getTime();
  return Array.from({ length: 30 }, (_, i) => {
    const t = new Date(start - (15 - i) * 60 * 1000);
    const isBeforeIncident = t < inc.startedAt;
    const baseCpu = isBeforeIncident ? 45 : 65 + Math.random() * 25;
    const baseLat = isBeforeIncident ? 45 : 200 + Math.random() * 600;
    return {
      t: fmtTime(t),
      cpu: +(baseCpu + (Math.random() - 0.5) * 8).toFixed(1),
      latency: Math.round(baseLat + (Math.random() - 0.5) * 50),
    };
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function IncidentDetailPage() {
  const params = useParams<{ id: string }>();
  const [inc, setInc] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<{ t: string; cpu: number; latency: number }[]>([]);

  const socket = useMonitoringStore((state) => state.socket);

  const fetchIncident = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/ops/incidents/${params.id}`);
      const data = unwrap<any>(res);
      if (!data) {
        throw new Error("Incident not found");
      }
      const parsed: IncidentDetail = {
        ...data,
        startedAt: new Date(data.startedAt),
        acknowledgedAt: data.acknowledgedAt ? new Date(data.acknowledgedAt) : null,
        resolvedAt: data.resolvedAt ? new Date(data.resolvedAt) : null,
        deploymentCorrelation: data.deploymentCorrelation ? {
          ...data.deploymentCorrelation,
          deployedAt: data.deploymentCorrelation.deployedAt ? new Date(data.deploymentCorrelation.deployedAt) : undefined,
          changelog: data.deploymentCorrelation.changelog || [],
        } : null,
        timeline: (data.timeline || []).map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        })),
        runbook: data.runbook || [],
        aiRecommendations: data.aiRecommendations || [],
      };
      setInc(parsed);
      setChartData(seedChartData(parsed));
      setError(null);
    } catch (err: any) {
      console.error("Error fetching incident:", err);
      setError(err?.message || "Failed to load incident details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchIncident();
    }
  }, [params.id]);

  useEffect(() => {
    if (!socket || !params.id) return;

    const handleIncidentUpdate = (updatedInc: any) => {
      if (updatedInc.id !== params.id) return;
      const parsed: IncidentDetail = {
        ...updatedInc,
        startedAt: new Date(updatedInc.startedAt),
        acknowledgedAt: updatedInc.acknowledgedAt ? new Date(updatedInc.acknowledgedAt) : null,
        resolvedAt: updatedInc.resolvedAt ? new Date(updatedInc.resolvedAt) : null,
        deploymentCorrelation: updatedInc.deploymentCorrelation ? {
          ...updatedInc.deploymentCorrelation,
          deployedAt: updatedInc.deploymentCorrelation.deployedAt ? new Date(updatedInc.deploymentCorrelation.deployedAt) : undefined,
          changelog: updatedInc.deploymentCorrelation.changelog || [],
        } : null,
        timeline: (updatedInc.timeline || []).map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        })),
        runbook: updatedInc.runbook || [],
        aiRecommendations: updatedInc.aiRecommendations || [],
      };
      setInc(parsed);
    };

    socket.on("incident:acknowledged", handleIncidentUpdate);
    socket.on("incident:resolved", handleIncidentUpdate);
    socket.on("incident:updated", handleIncidentUpdate);

    return () => {
      socket.off("incident:acknowledged", handleIncidentUpdate);
      socket.off("incident:resolved", handleIncidentUpdate);
      socket.off("incident:updated", handleIncidentUpdate);
    };
  }, [socket, params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 dark:text-slate-400">
        <RefreshCw className="animate-spin mb-3 text-blue-600" size={32} />
        <p className="text-sm font-semibold">Loading incident details...</p>
      </div>
    );
  }

  if (error || !inc) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <AlertTriangle className="text-red-500 mx-auto mb-3" size={36} />
        <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-1">Failed to Load Incident Details</h3>
        <p className="text-sm text-red-600 dark:text-red-300 mb-4">{error || "Incident not found"}</p>
        <button
          onClick={() => fetchIncident()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const SEV_BADGE: Record<string, string> = {
    critical: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    high: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
    warning: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  };
  const STATUS_COLOR: Record<string, string> = {
    open: "text-red-600", acknowledged: "text-amber-600", investigating: "text-blue-600", resolved: "text-emerald-600"
  };

  const incidentStartIdx = chartData.findIndex(d => {
    return d.cpu > 70;
  });

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Link href="/dashboard/incidents" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-3">
          <ArrowLeft size={13} /> Back to Incidents
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold text-slate-400">{inc.id}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${SEV_BADGE[inc.severity]}`}>
                {inc.severity.toUpperCase()}
              </span>
              <span className={`text-xs font-semibold ${STATUS_COLOR[inc.status]} capitalize`}>{inc.status}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">{inc.title}</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Clock size={13} />
            Started {timeAgo(inc.startedAt)}
            {inc.assignedTo && <><span>·</span><User size={13} />{inc.assignedTo}</>}
          </div>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Peak CPU", value: `${inc.metrics.peakCpu}%`, alert: inc.metrics.peakCpu > 80 },
          { label: "Peak Memory", value: `${inc.metrics.peakMemory}%`, alert: inc.metrics.peakMemory > 85 },
          { label: "Peak Latency", value: `${inc.metrics.peakLatency}ms`, alert: inc.metrics.peakLatency > 1000 },
          { label: "Error Rate", value: `${inc.metrics.errorRate}%`, alert: inc.metrics.errorRate > 5 },
        ].map(m => (
          <div key={m.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{m.label}</div>
            <div className={`text-2xl font-bold tabular-nums ${m.alert ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}>{m.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left col — timeline + runbook */}
        <div className="xl:col-span-2 space-y-5">
          {/* Metric chart with incident marker */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity size={15} className="text-blue-600" /> CPU & Latency at Incident Time
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="gic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#94a3b8" }} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                {incidentStartIdx > 0 && (
                  <ReferenceLine x={chartData[incidentStartIdx]?.t} stroke="#ef4444" strokeDasharray="4 2" label={{ value: "Incident", fontSize: 9, fill: "#ef4444" }} />
                )}
                <Area type="monotone" dataKey="cpu" stroke="#ef4444" strokeWidth={1.5} fill="url(#gic)" name="CPU %" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock size={15} className="text-blue-600" />
                Incident Timeline
              </h3>
            </div>
            <div className="p-5">
              <div className="relative pl-6 space-y-5">
                <div className="absolute left-2.5 top-1 bottom-1 w-px bg-slate-200 dark:bg-slate-700" />
                {inc.timeline.map((event, i) => {
                  const cfg = TIMELINE_CFG[event.type];
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="relative flex gap-3"
                    >
                      <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center ${cfg.bg} z-10`}>
                        <cfg.icon size={11} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-mono text-slate-400">{fmtTime(event.timestamp)}</span>
                          <span className="text-[10px] font-semibold text-slate-500">{event.actor}</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{event.message}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Runbook */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Terminal size={15} className="text-blue-600" />
                Runbook
              </h3>
            </div>
            <div className="p-5 space-y-3">
              {inc.runbook.map((step, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 font-mono leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right col — AI RCA + deployment */}
        <div className="space-y-5">
          {/* AI Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-violet-50/50 dark:bg-violet-900/10">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <BrainCircuit size={15} className="text-violet-600" />
                AI Root Cause Analysis
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{inc.aiSummary}</p>
              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Recommended Actions</h4>
                <div className="space-y-2">
                  {inc.aiRecommendations.map((rec, i) => (
                    <div key={i} className="flex gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <ChevronRight size={13} className="text-violet-500 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Affected services */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Server size={15} className="text-blue-600" />
                Affected Services
              </h3>
            </div>
            <div className="p-4 space-y-2">
              {inc.affectedServices.map(svc => (
                <div key={svc} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="font-mono text-slate-700 dark:text-slate-300">{svc.split(".")[0]}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">IMPACTED</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deployment Correlation */}
          {inc.deploymentCorrelation && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/40 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10">
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                  <GitBranch size={15} className="text-amber-600" />
                  Deployment Correlation
                </h3>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{inc.deploymentCorrelation.version}</span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {inc.deploymentCorrelation.confidence}% confidence
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${inc.deploymentCorrelation.confidence}%` }} />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{inc.deploymentCorrelation.regressionSignal}</p>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Changelog</p>
                  {inc.deploymentCorrelation.changelog.map((c, i) => (
                    <p key={i} className="text-xs text-slate-600 dark:text-slate-400 flex gap-1.5 mb-1">
                      <span className="text-slate-300 dark:text-slate-600">—</span> {c}
                    </p>
                  ))}
                </div>
                <div className="text-[10px] text-slate-400">
                  Deployed by {inc.deploymentCorrelation.deployedBy} · {inc.deploymentCorrelation.deployedAt.toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
