"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity, Wifi, WifiOff, BarChart2, FileText, Clock,
  AlertTriangle, RefreshCw, TrendingUp, Filter, Server, CheckCircle2, ShieldAlert, Zap, Hammer, Lock
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { useLiveEngineStore } from "@/hooks/useLiveEngine";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MetricPoint {
  t: string;
  cpu: number;
  memory: number;
  rps: number;
  latency: number;
  errors: number;
}

interface LogEntry {
  id: string;
  ts: string;
  level: "INFO" | "WARN" | "ERROR" | "CRITICAL" | "DEBUG";
  service: string;
  message: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SERVICES = ["api-gateway", "auth-service", "db-primary", "cache-redis", "worker-queue", "analytics-svc"];

const LOG_MESSAGES: Record<LogEntry["level"], string[]> = {
  INFO:     ["Health check passed. All endpoints within SLA.", "Cache warmed — 95% hit rate.", "JWT rotation completed.", "Config hot-reload applied."],
  WARN:     ["Connection pool at 78% — scaling threshold approaching.", "p99 response time approaching SLA (1450ms).", "TLS certificate expires in 14 days.", "Slow query detected: 3.2s on users table."],
  ERROR:    ["Connection refused: db-primary:5432 after 3 retries.", "Request timeout — auth-service unresponsive.", "Deadlock detected in transaction — rolled back."],
  CRITICAL: ["FATAL: db-primary unreachable — initiating failover.", "CRITICAL: All replicas lagging >30s.", "ALERT: Potential data exfiltration pattern detected."],
  DEBUG:    ["gRPC keepalive ping sent.", "Cache key evicted: user_session_7f3a2b.", "HTTP/2 stream multiplexed."],
};

const LEVELS: LogEntry["level"][] = ["INFO", "WARN", "ERROR", "CRITICAL", "DEBUG"];
const LEVEL_WEIGHTS = [0.45, 0.25, 0.18, 0.06, 0.06];

function pickLevel(): LogEntry["level"] {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    acc += LEVEL_WEIGHTS[i];
    if (r < acc) return LEVELS[i];
  }
  return "INFO";
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function seedMetrics(n = 40): MetricPoint[] {
  let cpu = 45, mem = 60, rps = 1200, lat = 45, err = 0.3;
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.now() - (n - i) * 3000);
    cpu = Math.max(5, Math.min(95, cpu + (Math.random() - 0.5) * 5));
    mem = Math.max(20, Math.min(95, mem + (Math.random() - 0.5) * 3));
    rps = Math.max(100, Math.min(8000, rps + (Math.random() - 0.5) * 200));
    lat = Math.max(10, Math.min(800, lat + (Math.random() - 0.5) * 20));
    err = Math.max(0, Math.min(20, err + (Math.random() - 0.5) * 0.5));
    return {
      t: fmtTime(d),
      cpu: +cpu.toFixed(1),
      memory: +mem.toFixed(1),
      rps: Math.round(rps),
      latency: Math.round(lat),
      errors: +err.toFixed(2),
    };
  });
}

const LEVEL_STYLE: Record<LogEntry["level"], { bg: string; color: string; dot: string }> = {
  INFO:     { bg: "bg-slate-100 dark:bg-slate-800",     color: "text-slate-600 dark:text-slate-400",   dot: "bg-slate-400" },
  WARN:     { bg: "bg-amber-50 dark:bg-amber-900/20",   color: "text-amber-700 dark:text-amber-400",   dot: "bg-amber-500" },
  ERROR:    { bg: "bg-red-50 dark:bg-red-900/20",       color: "text-red-700 dark:text-red-400",       dot: "bg-red-500" },
  CRITICAL: { bg: "bg-red-100 dark:bg-red-900/30",      color: "text-red-800 dark:text-red-300 font-bold", dot: "bg-red-600 animate-pulse" },
  DEBUG:    { bg: "bg-purple-50 dark:bg-purple-900/10", color: "text-purple-700 dark:text-purple-400", dot: "bg-purple-400" },
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MonitoringPage() {
  const { currentUserRole, addAuditLog, isErrorInjected } = useMonitoringStore();
  const { incidents } = useLiveEngineStore();
  const [recoveringServices, setRecoveringServices] = useState<Record<string, boolean>>({});

  const servicesList = useMemo(() => {
    const isRedisDegraded = incidents.some(i => i.service.toLowerCase().includes("redis") || i.service.toLowerCase().includes("cache"));
    const isDbDegraded = incidents.some(i => i.service.toLowerCase().includes("db") || i.service.toLowerCase().includes("primary"));
    
    return [
      {
        name: "api-gateway",
        status: isErrorInjected ? "critical" : "healthy",
        latency: isErrorInjected ? "5020ms" : "42ms",
        errorRate: isErrorInjected ? "98.2%" : "0.05%",
        replicas: "3/3",
        description: "Edge Routing Service"
      },
      {
        name: "auth-service",
        status: isErrorInjected ? "degraded" : "healthy",
        latency: isErrorInjected ? "185ms" : "12ms",
        errorRate: isErrorInjected ? "1.2%" : "0.00%",
        replicas: "2/2",
        description: "Session Verification"
      },
      {
        name: "db-primary",
        status: recoveringServices["db-primary"] ? "recovering" : (isDbDegraded ? "critical" : "healthy"),
        latency: recoveringServices["db-primary"] ? "210ms" : (isDbDegraded ? "2100ms" : "64ms"),
        errorRate: recoveringServices["db-primary"] ? "1.5%" : (isDbDegraded ? "18.4%" : "0.00%"),
        replicas: "1/1",
        description: "Postgres Core DB"
      },
      {
        name: "cache-redis",
        status: recoveringServices["cache-redis"] ? "recovering" : (isRedisDegraded ? "degraded" : "healthy"),
        latency: recoveringServices["cache-redis"] ? "34ms" : (isRedisDegraded ? "850ms" : "8ms"),
        errorRate: recoveringServices["cache-redis"] ? "0.2%" : (isRedisDegraded ? "12.4%" : "0.01%"),
        replicas: "1/1",
        description: "In-Memory Datastore"
      },
      {
        name: "worker-queue",
        status: "healthy",
        latency: "115ms",
        errorRate: "0.00%",
        replicas: "4/4",
        description: "Async Task Scheduler"
      },
      {
        name: "analytics-svc",
        status: "maintenance",
        latency: "1480ms",
        errorRate: "0.00%",
        replicas: "2/2",
        description: "Daily Metrics Rollups"
      }
    ];
  }, [isErrorInjected, incidents, recoveringServices]);

  const handleServiceRestart = (serviceName: string) => {
    if (currentUserRole === "Developer") {
      toast.error("Access Denied: Admin or SRE role required to restart services.", { icon: "🚫" });
      return;
    }
    toast.success(`Restart signal dispatched to '${serviceName}' container pool.`);
    addAuditLog(`Dispatched container restart for service: ${serviceName}`, "system");
    
    setRecoveringServices(prev => ({ ...prev, [serviceName]: true }));
    
    setTimeout(() => {
      setRecoveringServices(prev => ({ ...prev, [serviceName]: false }));
      toast.success(`Service '${serviceName}' successfully restarted and healthy.`);
      if (serviceName === "cache-redis") {
        useMonitoringStore.setState({
          rootCause: null,
          playbook: null
        });
        useLiveEngineStore.setState({ incidents: [] });
      }
    }, 3000);
  };

  const [metrics, setMetrics] = useState<MetricPoint[]>(() => seedMetrics(40));
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logFilter, setLogFilter] = useState<LogEntry["level"] | "ALL">("ALL");
  const [connected, setConnected] = useState(true);
  const logRef = useRef<HTMLDivElement>(null);
  let logIdRef = useRef(0);

  // Simulate live metric updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const last = prev[prev.length - 1];
        const next: MetricPoint = {
          t: fmtTime(new Date()),
          cpu: Math.max(5, Math.min(95, last.cpu + (Math.random() - 0.5) * 4)),
          memory: Math.max(20, Math.min(95, last.memory + (Math.random() - 0.5) * 2)),
          rps: Math.max(100, Math.min(8000, last.rps + (Math.random() - 0.5) * 150)),
          latency: Math.max(10, Math.min(800, last.latency + (Math.random() - 0.5) * 15)),
          errors: Math.max(0, Math.min(20, last.errors + (Math.random() - 0.5) * 0.3)),
        };
        return [...prev.slice(-59), { ...next, cpu: +next.cpu.toFixed(1), memory: +next.memory.toFixed(1) }];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulate live log stream
  useEffect(() => {
    const interval = setInterval(() => {
      const level = pickLevel();
      const msgs = LOG_MESSAGES[level];
      const entry: LogEntry = {
        id: `log-${++logIdRef.current}`,
        ts: fmtTime(new Date()),
        level,
        service: SERVICES[Math.floor(Math.random() * SERVICES.length)],
        message: msgs[Math.floor(Math.random() * msgs.length)],
      };
      setLogs(prev => [entry, ...prev].slice(0, 200));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [logs.length]);

  const latest = metrics[metrics.length - 1] ?? { cpu: 0, memory: 0, rps: 0, latency: 0, errors: 0 };
  const filteredLogs = logFilter === "ALL" ? logs : logs.filter(l => l.level === logFilter);

  const statCards = [
    { label: "CPU Utilization", value: `${latest.cpu.toFixed(1)}%`, sub: "avg across cluster", color: latest.cpu > 80 ? "text-red-600" : "text-slate-900 dark:text-white", icon: Activity },
    { label: "Memory Usage", value: `${latest.memory.toFixed(1)}%`, sub: "heap + resident", color: latest.memory > 85 ? "text-amber-600" : "text-slate-900 dark:text-white", icon: BarChart2 },
    { label: "Requests / sec", value: latest.rps.toLocaleString(), sub: "p95 throughput", color: "text-slate-900 dark:text-white", icon: TrendingUp },
    { label: "P99 Latency", value: `${latest.latency}ms`, sub: "api-gateway", color: latest.latency > 400 ? "text-red-600" : "text-slate-900 dark:text-white", icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity size={20} className="text-blue-600" />
            Telemetry & Metrics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time telemetry stream from all connected infrastructure nodes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${connected ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400" : "border-red-200 bg-red-50 text-red-700"}`}>
            {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
            {connected ? "WebSocket Connected" : "Disconnected"}
          </div>
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
        </div>
      </div>

      {/* Service Health Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Server size={14} className="text-indigo-500" />
            Service Health Matrix
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Unified status, latency tracking, and operational action matrix across microservices.</p>
        </div>

        <div className="overflow-x-auto border border-slate-100 dark:border-slate-800/80 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/80">
                <th className="px-4 py-2.5 font-bold text-slate-500 dark:text-slate-400">Service</th>
                <th className="px-4 py-2.5 font-bold text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-4 py-2.5 font-bold text-slate-500 dark:text-slate-400">P95 Latency</th>
                <th className="px-4 py-2.5 font-bold text-slate-500 dark:text-slate-400">Error Rate</th>
                <th className="px-4 py-2.5 font-bold text-slate-500 dark:text-slate-400">Replicas</th>
                <th className="px-4 py-2.5 text-right font-bold text-slate-500 dark:text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {servicesList.map((svc) => {
                let badgeCls = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                let statusLabel = svc.status;
                let StatusIcon = CheckCircle2;
                
                if (svc.status === "critical") {
                  badgeCls = "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse";
                  StatusIcon = ShieldAlert;
                } else if (svc.status === "degraded") {
                  badgeCls = "bg-amber-500/10 text-amber-500 border-amber-500/20";
                  StatusIcon = AlertTriangle;
                } else if (svc.status === "recovering") {
                  badgeCls = "bg-blue-500/10 text-blue-500 border-blue-500/20";
                  StatusIcon = RefreshCw;
                } else if (svc.status === "maintenance") {
                  badgeCls = "bg-purple-500/10 text-purple-500 border-purple-500/20";
                  StatusIcon = Hammer;
                }

                return (
                  <tr key={svc.name} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">{svc.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{svc.description}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badgeCls}`}>
                        <StatusIcon size={10} className={svc.status === "recovering" ? "animate-spin" : ""} />
                        {statusLabel.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-900 dark:text-white font-medium">{svc.latency}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">{svc.errorRate}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">{svc.replicas}</td>
                    <td className="px-4 py-3.5 text-right">
                      {svc.status === "maintenance" ? (
                        <span className="text-[10px] text-slate-400 font-semibold px-2">Silenced</span>
                      ) : (
                        <button
                          onClick={() => handleServiceRestart(svc.name)}
                          disabled={svc.status === "recovering"}
                          title={currentUserRole === "Developer" ? "Requires Admin or SRE permissions" : undefined}
                          className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 ml-auto disabled:opacity-50"
                        >
                          <RefreshCw size={10} className={svc.status === "recovering" ? "animate-spin" : ""} />
                          Restart {currentUserRole === "Developer" && <Lock size={9} className="text-slate-400" />}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{card.label}</span>
              <card.icon size={14} className="text-slate-400" />
            </div>
            <div className={`text-2xl font-bold tabular-nums ${card.color}`}>{card.value}</div>
            <div className="text-[10px] text-slate-400 mt-1">{card.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CPU + Memory */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">CPU & Memory (60s rolling)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={metrics.slice(-20)} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="gcpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gmem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#94a3b8" }} interval={4} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
              <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={1.5} fill="url(#gcpu)" name="CPU %" dot={false} />
              <Area type="monotone" dataKey="memory" stroke="#8b5cf6" strokeWidth={1.5} fill="url(#gmem)" name="Memory %" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* RPS + Latency */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Request Rate & Latency</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={metrics.slice(-20)} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#94a3b8" }} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              <Bar dataKey="rps" fill="#3b82f6" name="Req/s" radius={[2, 2, 0, 0]} maxBarSize={12} />
              <Bar dataKey="latency" fill="#f59e0b" name="Latency ms" radius={[2, 2, 0, 0]} maxBarSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Log Stream */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Log Stream</span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-slate-400" />
            <div className="flex gap-1">
              {(["ALL", "ERROR", "WARN", "CRITICAL"] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setLogFilter(lvl)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${logFilter === lvl ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div ref={logRef} className="overflow-y-auto" style={{ maxHeight: 320, fontFamily: "var(--font-mono)" }}>
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-sm text-slate-400">
              <RefreshCw size={14} className="animate-spin mr-2" />
              Waiting for log events...
            </div>
          ) : (
            filteredLogs.map(log => (
              <div key={log.id} className={`flex items-start gap-3 px-4 py-2 border-b border-slate-50 dark:border-slate-800/50 text-xs ${LEVEL_STYLE[log.level].bg}`}>
                <span className="text-slate-400 shrink-0 tabular-nums">{log.ts}</span>
                <span className={`shrink-0 flex items-center gap-1 font-bold ${LEVEL_STYLE[log.level].color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${LEVEL_STYLE[log.level].dot}`} />
                  {log.level.padEnd(8)}
                </span>
                <span className="text-slate-400 dark:text-slate-500 shrink-0 font-medium">[{log.service}]</span>
                <span className="text-slate-700 dark:text-slate-300 break-all">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
