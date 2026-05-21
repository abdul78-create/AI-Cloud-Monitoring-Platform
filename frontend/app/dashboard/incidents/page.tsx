"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Zap, AlertTriangle, CheckCircle2, Clock, User, ArrowRight,
  ChevronRight, Activity, Server, GitBranch, BrainCircuit,
  Shield, RefreshCw, MoreHorizontal, Eye
} from "lucide-react";
import { api, unwrap } from "@/services/api";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { toast } from "react-hot-toast";

// ─── Types ─────────────────────────────────────────────────────────────────────

type IncidentSeverity = "warning" | "high" | "critical";
type IncidentStatus   = "open" | "acknowledged" | "investigating" | "resolved";

interface Incident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedServices: string[];
  startedAt: Date;
  acknowledgedAt: Date | null;
  resolvedAt: Date | null;
  assignedTo: string | null;
  deploymentCorrelation: {
    version: string;
    confidence: number;
    regressionSignal: string;
  } | null;
  aiSummary: string;
  metrics: { peakCpu: number; peakMemory: number; peakLatency: number; errorRate: number };
}

// ─── Config ────────────────────────────────────────────────────────────────────

const SEV = {
  critical: { dot: "bg-red-500 animate-pulse", badge: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400", border: "border-l-red-500" },
  high:     { dot: "bg-amber-500",              badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400", border: "border-l-amber-500" },
  warning:  { dot: "bg-blue-400",               badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400", border: "border-l-blue-400" },
};

const STATUS = {
  open:          { label: "Open",          color: "text-red-600 dark:text-red-400" },
  acknowledged:  { label: "Acknowledged",  color: "text-amber-600 dark:text-amber-400" },
  investigating: { label: "Investigating", color: "text-blue-600 dark:text-blue-400" },
  resolved:      { label: "Resolved",      color: "text-emerald-600 dark:text-emerald-400" },
};

function timeAgo(d: Date) {
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return `${Math.round(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
  return `${Math.round(diff / 3600000)}h ago`;
}

function duration(a: Date, b: Date | null) {
  if (!b) return "Ongoing";
  const diff = b.getTime() - a.getTime();
  const m = Math.round(diff / 60000);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

type FilterStatus = "all" | IncidentStatus;

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const socket = useMonitoringStore((state) => state.socket);

  const fetchIncidents = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      const res = await api.get("/ops/incidents");
      const data = unwrap<any[]>(res) || [];
      const parsed = data.map((item: any) => ({
        ...item,
        startedAt: new Date(item.startedAt),
        acknowledgedAt: item.acknowledgedAt ? new Date(item.acknowledgedAt) : null,
        resolvedAt: item.resolvedAt ? new Date(item.resolvedAt) : null,
        deploymentCorrelation: item.deploymentCorrelation ? {
          ...item.deploymentCorrelation,
          deployedAt: item.deploymentCorrelation.deployedAt ? new Date(item.deploymentCorrelation.deployedAt) : undefined,
        } : null,
      }));
      setIncidents(parsed);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching incidents:", err);
      setError(err?.message || "Failed to load incidents");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onCreated = (newInc: any) => {
      const parsed = {
        ...newInc,
        startedAt: new Date(newInc.startedAt),
        acknowledgedAt: newInc.acknowledgedAt ? new Date(newInc.acknowledgedAt) : null,
        resolvedAt: newInc.resolvedAt ? new Date(newInc.resolvedAt) : null,
        deploymentCorrelation: newInc.deploymentCorrelation ? {
          ...newInc.deploymentCorrelation,
          deployedAt: newInc.deploymentCorrelation.deployedAt ? new Date(newInc.deploymentCorrelation.deployedAt) : undefined,
        } : null,
      };
      setIncidents(prev => {
        if (prev.some(i => i.id === parsed.id)) return prev.map(i => i.id === parsed.id ? parsed : i);
        return [parsed, ...prev];
      });
    };

    const onAcknowledged = (updatedInc: any) => {
      const parsed = {
        ...updatedInc,
        startedAt: new Date(updatedInc.startedAt),
        acknowledgedAt: updatedInc.acknowledgedAt ? new Date(updatedInc.acknowledgedAt) : null,
        resolvedAt: updatedInc.resolvedAt ? new Date(updatedInc.resolvedAt) : null,
        deploymentCorrelation: updatedInc.deploymentCorrelation ? {
          ...updatedInc.deploymentCorrelation,
          deployedAt: updatedInc.deploymentCorrelation.deployedAt ? new Date(updatedInc.deploymentCorrelation.deployedAt) : undefined,
        } : null,
      };
      setIncidents(prev => prev.map(i => i.id === parsed.id ? parsed : i));
    };

    const onResolved = (updatedInc: any) => {
      const parsed = {
        ...updatedInc,
        startedAt: new Date(updatedInc.startedAt),
        acknowledgedAt: updatedInc.acknowledgedAt ? new Date(updatedInc.acknowledgedAt) : null,
        resolvedAt: updatedInc.resolvedAt ? new Date(updatedInc.resolvedAt) : null,
        deploymentCorrelation: updatedInc.deploymentCorrelation ? {
          ...updatedInc.deploymentCorrelation,
          deployedAt: updatedInc.deploymentCorrelation.deployedAt ? new Date(updatedInc.deploymentCorrelation.deployedAt) : undefined,
        } : null,
      };
      setIncidents(prev => prev.map(i => i.id === parsed.id ? parsed : i));
    };

    const onUpdated = (updatedInc: any) => {
      const parsed = {
        ...updatedInc,
        startedAt: new Date(updatedInc.startedAt),
        acknowledgedAt: updatedInc.acknowledgedAt ? new Date(updatedInc.acknowledgedAt) : null,
        resolvedAt: updatedInc.resolvedAt ? new Date(updatedInc.resolvedAt) : null,
        deploymentCorrelation: updatedInc.deploymentCorrelation ? {
          ...updatedInc.deploymentCorrelation,
          deployedAt: updatedInc.deploymentCorrelation.deployedAt ? new Date(updatedInc.deploymentCorrelation.deployedAt) : undefined,
        } : null,
      };
      setIncidents(prev => prev.map(i => i.id === parsed.id ? parsed : i));
    };

    socket.on("incident:created", onCreated);
    socket.on("incident:acknowledged", onAcknowledged);
    socket.on("incident:resolved", onResolved);
    socket.on("incident:updated", onUpdated);

    return () => {
      socket.off("incident:created", onCreated);
      socket.off("incident:acknowledged", onAcknowledged);
      socket.off("incident:resolved", onResolved);
      socket.off("incident:updated", onUpdated);
    };
  }, [socket]);

  const handleAcknowledge = async (id: string) => {
    try {
      const res = await api.post(`/ops/incidents/${id}/acknowledge`, { by: "sre-lead@enterprise.com" });
      const updated = unwrap<any>(res);
      const parsed = {
        ...updated,
        startedAt: new Date(updated.startedAt),
        acknowledgedAt: updated.acknowledgedAt ? new Date(updated.acknowledgedAt) : null,
        resolvedAt: updated.resolvedAt ? new Date(updated.resolvedAt) : null,
        deploymentCorrelation: updated.deploymentCorrelation ? {
          ...updated.deploymentCorrelation,
          deployedAt: updated.deploymentCorrelation.deployedAt ? new Date(updated.deploymentCorrelation.deployedAt) : undefined,
        } : null,
      };
      setIncidents(prev => prev.map(i => i.id === id ? parsed : i));
      toast.success(`Incident ${id} acknowledged.`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to acknowledge incident");
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const res = await api.post(`/ops/incidents/${id}/resolve`, { by: "sre-lead@enterprise.com" });
      const updated = unwrap<any>(res);
      const parsed = {
        ...updated,
        startedAt: new Date(updated.startedAt),
        acknowledgedAt: updated.acknowledgedAt ? new Date(updated.acknowledgedAt) : null,
        resolvedAt: updated.resolvedAt ? new Date(updated.resolvedAt) : null,
        deploymentCorrelation: updated.deploymentCorrelation ? {
          ...updated.deploymentCorrelation,
          deployedAt: updated.deploymentCorrelation.deployedAt ? new Date(updated.deploymentCorrelation.deployedAt) : undefined,
        } : null,
      };
      setIncidents(prev => prev.map(i => i.id === id ? parsed : i));
      toast.success(`Incident ${id} resolved.`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to resolve incident");
    }
  };

  const filtered = incidents.filter(i => filter === "all" || i.status === filter);
  const selected = incidents.find(i => i.id === selectedId);

  const openCount     = incidents.filter(i => i.status === "open").length;
  const activeCount   = incidents.filter(i => i.status !== "resolved").length;
  const resolvedCount = incidents.filter(i => i.status === "resolved").length;
  const criticalCount = incidents.filter(i => i.severity === "critical" && i.status !== "resolved").length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 dark:text-slate-400">
        <RefreshCw className="animate-spin mb-3 text-blue-600" size={32} />
        <p className="text-sm font-semibold">Loading production incidents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <AlertTriangle className="text-red-500 mx-auto mb-3" size={36} />
        <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-1">Failed to Load Incidents</h3>
        <p className="text-sm text-red-600 dark:text-red-300 mb-4">{error}</p>
        <button
          onClick={() => fetchIncidents()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap size={20} className="text-blue-600" />
            Incident Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Triage, investigate, and resolve production incidents. Full timeline and AI RCA included.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-700 dark:text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {criticalCount} critical active
            </div>
          )}
          <button
            onClick={() => fetchIncidents(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Active", value: activeCount, color: "text-slate-900 dark:text-white" },
          { label: "Open / Unack'd", value: openCount, color: "text-red-600 dark:text-red-400" },
          { label: "Investigating", value: incidents.filter(i => i.status === "investigating").length, color: "text-blue-600 dark:text-blue-400" },
          { label: "Resolved Today", value: resolvedCount, color: "text-emerald-600 dark:text-emerald-400" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{s.label}</div>
            <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 flex-wrap">
        {(["all", "open", "acknowledged", "investigating", "resolved"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              filter === f
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {f === "all" ? `All (${incidents.length})` : STATUS[f]?.label}
          </button>
        ))}
      </div>

      <div className={`grid gap-6 ${selectedId ? "xl:grid-cols-2" : "grid-cols-1"}`}>
        {/* Incident list */}
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((inc, i) => {
              const sev = SEV[inc.severity];
              const stat = STATUS[inc.status];
              const isSelected = selectedId === inc.id;

              return (
                <motion.div
                  key={inc.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`bg-white dark:bg-slate-900 rounded-xl border border-l-4 shadow-sm overflow-hidden cursor-pointer transition-all ${sev.border} ${isSelected ? "border-blue-400 dark:border-blue-500" : "border-slate-200 dark:border-slate-800"}`}
                  onClick={() => setSelectedId(isSelected ? null : inc.id)}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${sev.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-[11px] font-mono font-semibold text-slate-400">{inc.id}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sev.badge}`}>
                            {inc.severity.toUpperCase()}
                          </span>
                          <span className={`text-[11px] font-semibold ${stat.color}`}>{stat.label}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug mb-2">{inc.title}</p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1"><Clock size={11} />{timeAgo(inc.startedAt)}</span>
                          <span className="flex items-center gap-1"><Activity size={11} />Duration: {duration(inc.startedAt, inc.resolvedAt)}</span>
                          {inc.assignedTo && <span className="flex items-center gap-1"><User size={11} />{inc.assignedTo.split("@")[0]}</span>}
                          {inc.deploymentCorrelation && (
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                              <GitBranch size={11} />{inc.deploymentCorrelation.version} ({inc.deploymentCorrelation.confidence}% confidence)
                            </span>
                          )}
                        </div>
                        {/* Affected services */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {inc.affectedServices.slice(0, 3).map(svc => (
                            <span key={svc} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                              {svc.split(".")[0]}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
                        {inc.status === "open" && (
                          <button
                            onClick={e => { e.stopPropagation(); handleAcknowledge(inc.id); }}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-100 transition-colors border border-amber-200 dark:border-amber-800"
                          >
                            Acknowledge
                          </button>
                        )}
                        {inc.status !== "resolved" && inc.status !== "open" && (
                          <button
                            onClick={e => { e.stopPropagation(); handleResolve(inc.id); }}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200 dark:border-emerald-800"
                          >
                            Resolve
                          </button>
                        )}
                        <Link
                          href={`/dashboard/incidents/${inc.id}`}
                          onClick={e => e.stopPropagation()}
                          className="px-2 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <Eye size={11} /> Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-sm text-slate-400">
              <CheckCircle2 size={28} className="mx-auto mb-2 text-emerald-400" />
              No incidents matching this filter.
            </div>
          )}
        </div>

        {/* Incident detail panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden self-start sticky top-4"
            >
              {/* Panel header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-slate-400">{selected.id}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${SEV[selected.severity].badge}`}>
                    {selected.severity.toUpperCase()}
                  </span>
                </div>
                <Link href={`/dashboard/incidents/${selected.id}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  Full details <ArrowRight size={11} />
                </Link>
              </div>

              <div className="p-4 space-y-5">
                {/* Title */}
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">{selected.title}</p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Peak CPU", value: `${selected.metrics.peakCpu}%`, alert: selected.metrics.peakCpu > 80 },
                    { label: "Peak Memory", value: `${selected.metrics.peakMemory}%`, alert: selected.metrics.peakMemory > 85 },
                    { label: "Peak Latency", value: `${selected.metrics.peakLatency}ms`, alert: selected.metrics.peakLatency > 1000 },
                    { label: "Error Rate", value: `${selected.metrics.errorRate}%`, alert: selected.metrics.errorRate > 5 },
                  ].map(m => (
                    <div key={m.label} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] text-slate-500">{m.label}</div>
                      <div className={`text-base font-bold tabular-nums ${m.alert ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}>{m.value}</div>
                    </div>
                  ))}
                </div>

                {/* AI Summary */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BrainCircuit size={13} className="text-blue-600" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Root Cause Analysis</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-3">
                    {selected.aiSummary}
                  </p>
                </div>

                {/* Deployment correlation */}
                {selected.deploymentCorrelation && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <GitBranch size={13} className="text-amber-600" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deployment Correlation</span>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-amber-800 dark:text-amber-300">{selected.deploymentCorrelation.version}</span>
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          {selected.deploymentCorrelation.confidence}% confidence
                        </span>
                      </div>
                      <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{selected.deploymentCorrelation.regressionSignal}</p>
                    </div>
                  </div>
                )}

                {/* Quick actions */}
                <div className="flex gap-2 pt-1">
                  {selected.status === "open" && (
                    <button onClick={() => handleAcknowledge(selected.id)} className="flex-1 py-2 text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-100 transition-colors border border-amber-200 dark:border-amber-800">
                      Acknowledge
                    </button>
                  )}
                  {selected.status !== "resolved" && (
                    <button onClick={() => handleResolve(selected.id)} className="flex-1 py-2 text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200 dark:border-emerald-800">
                      Mark Resolved
                    </button>
                  )}
                  <Link href={`/dashboard/incidents/${selected.id}`} className="flex-1 py-2 text-xs font-semibold text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    View Timeline →
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
