"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Server, Cpu, Database, Globe, Shield, Wifi,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Terminal,
  Zap, RefreshCw, ArrowUpRight, ArrowDownRight, Radio, Layers
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
import { useLiveEngineStore } from "@/hooks/useLiveEngine";

// ─── Stat Tile ────────────────────────────────────────────────────────────────
const StatTile = React.memo(function StatTile({
  label, value, unit, icon: Icon, colorClass, prev, sparkData,
}: {
  label: string; value: number; unit: string; icon: React.ElementType;
  colorClass: string; prev: number; sparkData: number[];
}) {
  const delta = value - prev;
  const up = delta >= 0;
  const pct = prev > 0 ? Math.abs((delta / prev) * 100).toFixed(1) : "0.0";

  return (
    <motion.div
      layout
      className="bg-white/5 dark:bg-white/[0.03] border border-white/10 dark:border-white/5 rounded-2xl p-5 flex flex-col gap-3 hover:border-white/20 transition-all duration-300 group relative overflow-hidden"
    >
      {/* subtle glow */}
      <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity ${colorClass}`} />
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-xl border border-white/10 ${colorClass} bg-opacity-10`}>
          <Icon size={16} className="text-current" />
        </div>
        <span className={`text-xs font-semibold flex items-center gap-0.5 ${up ? "text-rose-400" : "text-emerald-400"}`}>
          {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {pct}%
        </span>
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums leading-tight">
          {value}<span className="text-sm font-medium text-slate-400 ml-0.5">{unit}</span>
        </p>
      </div>
      {/* Sparkline */}
      <div className="h-8 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData.map((v, i) => ({ i, v }))}>
            <Line type="monotone" dataKey="v" stroke="currentColor"
              strokeWidth={1.5} dot={false} isAnimationActive={false}
              className={colorClass} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
});

// ─── Log Stream ───────────────────────────────────────────────────────────────
const LOG_COLORS: Record<string, string> = {
  INFO:     "text-emerald-400",
  WARNING:  "text-amber-400",
  ERROR:    "text-rose-400",
  CRITICAL: "text-rose-500 font-bold",
  DEBUG:    "text-slate-500",
  RECOVERY: "text-cyan-400",
};
const LOG_BG: Record<string, string> = {
  INFO:     "",
  WARNING:  "",
  ERROR:    "bg-rose-500/5",
  CRITICAL: "bg-rose-500/10",
  DEBUG:    "",
  RECOVERY: "bg-cyan-500/5",
};

const LogLine = React.memo(function LogLine({ log }: { log: any }) {
  const ts = new Date(log.timestamp).toLocaleTimeString("en-US", { hour12: false });
  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.1 }}
      className={`flex gap-2 px-3 py-1 rounded-lg text-xs font-mono ${LOG_BG[log.level]}`}
    >
      <span className="text-slate-600 dark:text-slate-500 shrink-0 tabular-nums">{ts}</span>
      <span className={`shrink-0 w-16 ${LOG_COLORS[log.level]}`}>[{log.level}]</span>
      <span className="text-slate-400 dark:text-slate-500 shrink-0 w-24 truncate">{log.service}</span>
      <span className="text-slate-700 dark:text-slate-300">{log.message}</span>
      {log.traceId && <span className="text-slate-500 shrink-0">trace:{log.traceId}</span>}
    </motion.div>
  );
});

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 shadow-2xl text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-white font-semibold">
          {p.name}: <span className="text-indigo-400">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}{unit}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LiveMonitoringPage() {
  const { liveMetrics, incidents, logs } = useLiveEngineStore();
  const [logFilter, setLogFilter] = useState<string>("ALL");
  const [isPaused, setIsPaused] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const latest = liveMetrics[liveMetrics.length - 1];
  const prev = liveMetrics[liveMetrics.length - 2] ?? latest;

  // Downsample chart data to last 30 points
  const chartData = useMemo(() =>
    liveMetrics.slice(-30).map((m, i) => ({
      t: i,
      cpu: m.cpu,
      mem: m.memory,
      net: m.network,
      rps: m.requestsPerSec,
      lat: m.latencyMs,
      err: m.errorRate,
    })),
    [liveMetrics]
  );

  const sparkFor = useCallback((key: keyof typeof latest) =>
    liveMetrics.slice(-12).map(m => m[key] as number), [liveMetrics]);

  const filteredLogs = useMemo(() =>
    logs.filter(l => logFilter === "ALL" || l.level === logFilter).slice(0, 80),
    [logs, logFilter]
  );

  // Auto-scroll log pane
  useEffect(() => {
    if (autoScroll && logRef.current) {
      logRef.current.scrollTop = 0;
    }
  }, [filteredLogs, autoScroll]);

  if (!latest) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-sm flex items-center gap-2">
          <RefreshCw size={16} className="animate-spin" /> Initializing engine...
        </div>
      </div>
    );
  }

  const statusColor = (v: number, warn: number, crit: number) =>
    v >= crit ? "text-rose-400" : v >= warn ? "text-amber-400" : "text-emerald-400";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Radio size={18} className="text-emerald-400 animate-pulse" />
            Live Monitoring
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">Real-time telemetry — updating every 2.5s</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            STREAMING
          </span>
          <button
            onClick={() => setIsPaused(p => !p)}
            className="text-xs font-medium px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="CPU Usage" value={latest.cpu} unit="%" icon={Cpu}
          colorClass="text-indigo-400" prev={prev.cpu} sparkData={sparkFor("cpu")} />
        <StatTile label="Memory" value={latest.memory} unit="%" icon={Database}
          colorClass="text-violet-400" prev={prev.memory} sparkData={sparkFor("memory")} />
        <StatTile label="Network" value={latest.network} unit="Mbps" icon={Wifi}
          colorClass="text-cyan-400" prev={prev.network} sparkData={sparkFor("network")} />
        <StatTile label="Threats" value={latest.activeThreats} unit="" icon={Shield}
          colorClass="text-rose-400" prev={prev.activeThreats} sparkData={sparkFor("activeThreats")} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="Requests/s" value={latest.requestsPerSec} unit="" icon={Zap}
          colorClass="text-emerald-400" prev={prev.requestsPerSec} sparkData={sparkFor("requestsPerSec")} />
        <StatTile label="Error Rate" value={latest.errorRate} unit="%" icon={AlertTriangle}
          colorClass="text-amber-400" prev={prev.errorRate} sparkData={sparkFor("errorRate")} />
        <StatTile label="Latency p99" value={latest.latencyMs} unit="ms" icon={Activity}
          colorClass="text-blue-400" prev={prev.latencyMs} sparkData={sparkFor("latencyMs")} />
        <StatTile label="Disk I/O" value={latest.disk} unit="%" icon={Layers}
          colorClass="text-slate-400" prev={prev.disk} sparkData={sparkFor("disk")} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CPU + Memory */}
        <div className="bg-white/5 dark:bg-white/[0.03] border border-white/10 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">CPU & Memory</h3>
              <p className="text-xs text-slate-500">Live utilisation %</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1 text-indigo-400"><span className="h-2 w-2 rounded-sm bg-indigo-400"/>CPU</span>
              <span className="flex items-center gap-1 text-violet-400"><span className="h-2 w-2 rounded-sm bg-violet-400"/>Mem</span>
            </div>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="t" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip content={<ChartTooltip unit="%" />} />
                <Area type="monotone" dataKey="cpu" name="CPU" stroke="#818cf8" strokeWidth={2}
                  fill="url(#gCpu)" dot={false} isAnimationActive={false} />
                <Area type="monotone" dataKey="mem" name="Mem" stroke="#a78bfa" strokeWidth={2}
                  fill="url(#gMem)" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RPS + Latency */}
        <div className="bg-white/5 dark:bg-white/[0.03] border border-white/10 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Requests & Latency</h3>
              <p className="text-xs text-slate-500">RPS vs p99 ms</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400"><span className="h-2 w-2 rounded-sm bg-emerald-400"/>RPS</span>
              <span className="flex items-center gap-1 text-amber-400"><span className="h-2 w-2 rounded-sm bg-amber-400"/>Latency</span>
            </div>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gRps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="t" hide />
                <YAxis hide />
                <Tooltip content={<ChartTooltip unit="" />} />
                <Area type="monotone" dataKey="rps" name="RPS" stroke="#34d399" strokeWidth={2}
                  fill="url(#gRps)" dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="lat" name="Latency" stroke="#fbbf24" strokeWidth={2}
                  dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Log Stream + Incident Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Log stream */}
        <div className="lg:col-span-2 bg-[#0a0f1e] dark:bg-[#050810] border border-white/10 rounded-2xl overflow-hidden flex flex-col" style={{ height: 360 }}>
          {/* Log header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-emerald-400" />
              <span className="text-xs font-semibold text-white">Live Log Stream</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex gap-1">
              {["ALL","INFO","WARNING","ERROR","CRITICAL","RECOVERY"].map(f => (
                <button
                  key={f}
                  onClick={() => setLogFilter(f)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                    logFilter === f
                      ? "bg-emerald-400/20 text-emerald-400 border border-emerald-400/30"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {f === "ALL" ? "ALL" : f.slice(0,4)}
                </button>
              ))}
            </div>
          </div>
          {/* Log body */}
          <div
            ref={logRef}
            className="flex-1 overflow-y-auto py-2 space-y-0.5 custom-scrollbar"
            onScroll={e => setAutoScroll((e.target as HTMLDivElement).scrollTop < 20)}
          >
            <AnimatePresence initial={false}>
              {filteredLogs.map(log => (
                <LogLine key={log.id} log={log} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Incident feed */}
        <div className="bg-white/5 dark:bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden flex flex-col" style={{ height: 360 }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400" />
              <span className="text-xs font-semibold text-slate-900 dark:text-white">Incident Feed</span>
            </div>
            <span className="text-xs text-slate-500">{incidents.length} events</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar py-2 px-3 space-y-2">
            <AnimatePresence initial={false}>
              {incidents.slice(0, 30).map(inc => (
                <motion.div
                  key={inc.id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`rounded-xl p-3 border text-xs ${
                    inc.type === 'critical' || inc.type === 'security'
                      ? 'border-rose-500/20 bg-rose-500/5'
                      : inc.type === 'recovery'
                      ? 'border-emerald-500/20 bg-emerald-500/5'
                      : inc.type === 'scaling'
                      ? 'border-cyan-500/20 bg-cyan-500/5'
                      : 'border-amber-500/20 bg-amber-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={`font-bold uppercase text-[10px] tracking-wider ${
                      inc.type === 'critical' || inc.type === 'security' ? 'text-rose-400' :
                      inc.type === 'recovery' ? 'text-emerald-400' :
                      inc.type === 'scaling' ? 'text-cyan-400' : 'text-amber-400'
                    }`}>{inc.type}</span>
                    <span className="text-slate-500 text-[10px] tabular-nums shrink-0">
                      {new Date(inc.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white mb-0.5">{inc.title}</p>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{inc.message}</p>
                </motion.div>
              ))}
            </AnimatePresence>
            {incidents.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs gap-2">
                <CheckCircle size={24} className="text-emerald-400 opacity-50" />
                All systems nominal
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
