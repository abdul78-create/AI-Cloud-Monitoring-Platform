"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit, AlertTriangle, TrendingUp, TrendingDown,
  Activity, Shield, Zap, Server, Clock, ChevronRight,
  CheckCircle2, RefreshCw, BarChart2, Cpu
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

// ─── Types & Data ─────────────────────────────────────────────────────────────

interface Anomaly {
  id: string;
  service: string;
  type: "spike" | "drop" | "pattern" | "security" | "latency";
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  message: string;
  recommendation: string;
  detectedAt: string;
  resolved: boolean;
}

interface ForecastPoint { t: string; actual: number; predicted: number; upper: number; lower: number; }

const ANOMALIES: Anomaly[] = [
  { id: "a1", service: "api-gateway", type: "spike", severity: "critical", confidence: 94, message: "CPU saturation pattern detected. 42% increase over baseline after deployment v2.3.1. Similar patterns have historically preceded gateway instability.", recommendation: "Scale api-gateway replicas from 3 to 6. Enable connection draining. Review recent deployments.", detectedAt: "3m ago", resolved: false },
  { id: "a2", service: "db-primary", type: "latency", severity: "high", confidence: 89, message: "Query latency P99 degrading steadily over 40 minutes. Pattern resembles connection pool exhaustion from a slow-query cascade.", recommendation: "Increase pg_stat_activity timeout. Check for table lock contention. Run VACUUM ANALYZE.", detectedAt: "11m ago", resolved: false },
  { id: "a3", service: "auth-service", type: "security", severity: "high", confidence: 87, message: "Unusual credential validation spike — 180 failed attempts in 90 seconds. Originating from 3 distinct IPs. Potential credential stuffing.", recommendation: "Enable rate limiting on /auth/login. Alert security team. Block IPs via WAF.", detectedAt: "22m ago", resolved: false },
  { id: "a4", service: "cache-redis", type: "drop", severity: "medium", confidence: 76, message: "Cache hit rate dropped from 92% to 64% over 15 minutes. Correlated with increased db-primary load.", recommendation: "Investigate cache invalidation logic. Consider increasing TTL for frequently-queried keys.", detectedAt: "35m ago", resolved: false },
  { id: "a5", service: "worker-queue", type: "pattern", severity: "low", confidence: 68, message: "Job queue depth shows a recurring 20-minute spike cycle. Pattern consistent with a cron-triggered batch job.", recommendation: "Stagger batch job schedules. Increase worker concurrency during peak windows.", detectedAt: "58m ago", resolved: true },
];

function seedForecast(n = 30): ForecastPoint[] {
  let v = 45;
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.now() + i * 3600 * 1000);
    v = Math.max(20, Math.min(95, v + (Math.random() - 0.48) * 6));
    const trend = i > 20 ? 1.3 : 1;
    return {
      t: `+${i}h`,
      actual: i < 12 ? +v.toFixed(1) : 0,
      predicted: +(v * trend).toFixed(1),
      upper: +(v * trend * 1.1).toFixed(1),
      lower: +(v * trend * 0.9).toFixed(1),
    };
  });
}

const SEVERITY_CFG = {
  critical: { bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800", badge: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400", dot: "bg-red-500 animate-pulse" },
  high:     { bg: "bg-amber-50 dark:bg-amber-900/10", border: "border-amber-200 dark:border-amber-800", badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  medium:   { bg: "bg-blue-50 dark:bg-blue-900/10", border: "border-blue-200 dark:border-blue-800", badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
  low:      { bg: "bg-slate-50 dark:bg-slate-800/50", border: "border-slate-200 dark:border-slate-800", badge: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400", dot: "bg-slate-400" },
};

const TYPE_ICON = { spike: TrendingUp, drop: TrendingDown, pattern: BarChart2, security: Shield, latency: Clock };

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AIOperationsPage() {
  const [forecast] = useState<ForecastPoint[]>(() => seedForecast(30));
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeAnomalies, setActiveAnomalies] = useState(ANOMALIES);
  const [scanning, setScanning] = useState(false);

  const runScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 2500);
  };

  const dismiss = (id: string) => {
    setActiveAnomalies(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  const openAnomalies = activeAnomalies.filter(a => !a.resolved);
  const resolvedAnomalies = activeAnomalies.filter(a => a.resolved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <BrainCircuit size={20} className="text-blue-600" />
            AI Operations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            LLM-powered anomaly detection, outage prediction, and AI-generated remediation.
          </p>
        </div>
        <button
          onClick={runScan}
          disabled={scanning}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {scanning ? <RefreshCw size={13} className="animate-spin" /> : <BrainCircuit size={13} />}
          {scanning ? "Scanning cluster..." : "Run AI Scan"}
        </button>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Anomalies", value: openAnomalies.length, icon: AlertTriangle, color: "text-red-600 dark:text-red-400" },
          { label: "Outage Risk (24h)", value: "18%", icon: Zap, color: "text-amber-600 dark:text-amber-400" },
          { label: "AI Scans Today", value: 47, icon: BrainCircuit, color: "text-blue-600 dark:text-blue-400" },
          { label: "Auto-Mitigated", value: 3, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</span>
              <stat.icon size={14} className={stat.color} />
            </div>
            <div className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Anomaly feed — 3 cols */}
        <div className="xl:col-span-3 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Active Anomalies ({openAnomalies.length})
          </h2>

          <AnimatePresence>
            {openAnomalies.map((anomaly, i) => {
              const cfg = SEVERITY_CFG[anomaly.severity];
              const Icon = TYPE_ICON[anomaly.type];
              const isExpanded = expandedId === anomaly.id;
              return (
                <motion.div
                  key={anomaly.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.06 }}
                  className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border} cursor-pointer`}
                  onClick={() => setExpandedId(isExpanded ? null : anomaly.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{anomaly.service}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.badge}`}>
                          {anomaly.severity.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Icon size={11} /> {anomaly.type}
                        </span>
                        <span className="text-[10px] text-slate-400">{anomaly.detectedAt}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {anomaly.message}
                      </p>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
                              <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Confidence</span>
                                <div className="mt-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${anomaly.confidence}%` }} />
                                </div>
                                <span className="text-[10px] text-blue-600 font-semibold">{anomaly.confidence}%</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recommended Action</span>
                                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{anomaly.recommendation}</p>
                              </div>
                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={(e) => { e.stopPropagation(); dismiss(anomaly.id); }}
                                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                  Mark Resolved
                                </button>
                                <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                  View Traces
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <ChevronRight size={14} className={`text-slate-400 transition-transform shrink-0 ${isExpanded ? "rotate-90" : ""}`} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {openAnomalies.length === 0 && (
            <div className="text-center py-12 text-sm text-slate-400">
              <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-500" />
              No active anomalies. All systems nominal.
            </div>
          )}

          {resolvedAnomalies.length > 0 && (
            <div className="text-xs text-slate-400 text-center pt-2">
              {resolvedAnomalies.length} resolved anomalie(s) hidden
            </div>
          )}
        </div>

        {/* Right column — forecast + capacity */}
        <div className="xl:col-span-2 space-y-4">
          {/* Capacity forecast */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={15} className="text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Capacity Forecast (30h)</h3>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={forecast} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="gfcast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="t" tick={{ fontSize: 9, fill: "#94a3b8" }} interval={5} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Area type="monotone" dataKey="upper" stroke="none" fill="#dbeafe" name="Upper bound" dot={false} />
                <Area type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={1.5} fill="url(#gfcast)" name="Predicted CPU %" dot={false} />
                <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual CPU %" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
              <AlertTriangle size={10} className="text-amber-500" />
              Predicted CPU breach in ~22h at current growth rate.
            </p>
          </div>

          {/* Security scans */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={15} className="text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Security Posture</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "IAM policies", status: "pass", detail: "30 rules audited" },
                { label: "Open ports scan", status: "warn", detail: "Port 3306 exposed" },
                { label: "TLS certificates", status: "pass", detail: "All valid" },
                { label: "Secrets leakage", status: "pass", detail: "No exposure detected" },
                { label: "DDoS signatures", status: "warn", detail: "Unusual ingress pattern" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{item.detail}</span>
                    {item.status === "pass"
                      ? <CheckCircle2 size={13} className="text-emerald-500" />
                      : <AlertTriangle size={13} className="text-amber-500" />
                    }
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
