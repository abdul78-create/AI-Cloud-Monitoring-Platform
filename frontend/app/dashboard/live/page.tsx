"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Server, Cpu, Database, Wifi, AlertTriangle, CheckCircle, Terminal,
  Zap, RefreshCw, ArrowUpRight, ArrowDownRight, Radio, Layers, Shield
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis
} from "recharts";
import { useLiveEngineStore } from "@/hooks/useLiveEngine";

/* ── Stat Tile (compact, aligned with tokens) ── */
const StatTile = React.memo(function StatTile({
  label, value, unit, icon: Icon, tone, prev, sparkData,
}: {
  label: string; value: number; unit: string; icon: React.ElementType;
  tone: "blue" | "purple" | "cyan" | "rose" | "emerald" | "amber"; prev: number; sparkData: number[];
}) {
  const delta = value - prev;
  const up = delta >= 0;
  const pct = prev > 0 ? Math.abs((delta / prev) * 100).toFixed(1) : "0.0";

  const colors = {
    blue:    { text: "var(--brand-600)",       bg: "var(--brand-50)",        border: "var(--border-default)" },
    purple:  { text: "#8b5cf6",                 bg: "rgba(139,92,246,0.08)",  border: "var(--border-default)" },
    cyan:    { text: "#0891b2",                 bg: "rgba(8,145,178,0.08)",   border: "var(--border-default)" },
    rose:    { text: "var(--color-error)",      bg: "var(--color-error-bg)",  border: "var(--color-error-border)" },
    emerald: { text: "var(--color-success)",    bg: "var(--color-success-bg)",border: "var(--color-success-border)" },
    amber:   { text: "var(--color-warning)",    bg: "var(--color-warning-bg)",border: "var(--color-warning-border)" },
  }[tone];

  return (
    <motion.div
      layout
      className="card card-hover p-4 flex flex-col gap-2.5 relative overflow-hidden"
    >
      <div className="flex justify-between items-start">
        <div
          className="p-1.5 rounded-lg flex items-center justify-center"
          style={{ background: colors.bg, color: colors.text }}
        >
          <Icon size={14} />
        </div>
        <span
          className="text-[10px] font-bold flex items-center gap-0.5 px-1 rounded"
          style={{
            background: up ? "var(--color-error-bg)" : "var(--color-success-bg)",
            color: up ? "var(--color-error)" : "var(--color-success)",
          }}
        >
          {up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {pct}%
        </span>
      </div>
      <div>
        <p className="text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>{label}</p>
        <p className="text-xl font-bold tabular-nums tracking-tight mt-0.5" style={{ color: "var(--text-primary)" }}>
          {value.toFixed(1)}
          {unit && <span className="text-xs font-semibold ml-0.5" style={{ color: "var(--text-tertiary)" }}>{unit}</span>}
        </p>
      </div>

      {/* Mini Sparkline */}
      <div className="h-6 mt-1 opacity-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData.map((v, i) => ({ i, v }))}>
            <Line
              type="monotone"
              dataKey="v"
              stroke={colors.text}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
});

/* ── Log Stream ── */
const LOG_COLORS: Record<string, { text: string; bg: string }> = {
  INFO:     { text: "var(--color-success)", bg: "transparent" },
  WARNING:  { text: "var(--color-warning)", bg: "var(--color-warning-bg)" },
  ERROR:    { text: "var(--color-error)",   bg: "var(--color-error-bg)" },
  CRITICAL: { text: "var(--color-error)",   bg: "var(--color-error-bg)" },
  DEBUG:    { text: "var(--text-tertiary)", bg: "transparent" },
  RECOVERY: { text: "var(--color-info)",    bg: "var(--color-info-bg)" },
};

const LogLine = React.memo(function LogLine({ log }: { log: any }) {
  const ts = new Date(log.timestamp).toLocaleTimeString("en-US", { hour12: false });
  const levelStyle = LOG_COLORS[log.level] || LOG_COLORS.INFO;

  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.1 }}
      className="flex gap-2 px-3 py-1 rounded-md text-[11px] font-mono transition-colors"
      style={{ background: levelStyle.bg }}
    >
      <span className="shrink-0 tabular-nums" style={{ color: "var(--text-tertiary)" }}>{ts}</span>
      <span className="shrink-0 w-16 font-bold" style={{ color: levelStyle.text }}>[{log.level}]</span>
      <span className="shrink-0 w-24 truncate font-semibold" style={{ color: "var(--text-tertiary)" }}>{log.service}</span>
      <span className="break-all" style={{ color: "var(--text-secondary)" }}>{log.message}</span>
      {log.traceId && (
        <span className="shrink-0 opacity-60 font-mono text-[10px] ml-auto" style={{ color: "var(--text-tertiary)" }}>
          id:{log.traceId.substring(0, 6)}
        </span>
      )}
    </motion.div>
  );
});

/* ── Custom Chart Tooltip ── */
function ChartTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-2.5 py-1.5 text-[11px]"
      style={{
        background: "var(--surface-elevated)",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-2)",
        color: "var(--text-primary)",
      }}
    >
      <p className="font-semibold mb-0.5" style={{ color: "var(--text-tertiary)" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="tabular-nums">
          <span className="font-semibold" style={{ color: p.color }}>{p.value.toFixed(1)}</span>
          <span style={{ color: "var(--text-tertiary)" }}>{unit}</span>
        </p>
      ))}
    </div>
  );
}

/* ── Main Component ── */
export default function LiveMonitoringPage() {
  const { liveMetrics, incidents, logs } = useLiveEngineStore();
  const [logFilter, setLogFilter] = useState<string>("ALL");
  const [isPaused, setIsPaused] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const latest = liveMetrics[liveMetrics.length - 1];
  const prev = liveMetrics[liveMetrics.length - 2] ?? latest;

  const chartData = useMemo(() =>
    liveMetrics.slice(-24).map((m, i) => ({
      name: `T-${24 - i}`,
      cpu: m.cpu,
      mem: m.memory,
      net: m.network,
      rps: m.requestsPerSec,
      lat: m.latencyMs,
    })),
    [liveMetrics]
  );

  const sparkFor = useCallback((key: keyof typeof latest) =>
    liveMetrics.slice(-12).map(m => m[key] as number), [liveMetrics]);

  const filteredLogs = useMemo(() =>
    logs.filter(l => logFilter === "ALL" || l.level === logFilter).slice(0, 80),
    [logs, logFilter]
  );

  useEffect(() => {
    if (autoScroll && logRef.current) {
      logRef.current.scrollTop = 0;
    }
  }, [filteredLogs, autoScroll]);

  if (!latest) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm flex items-center gap-2" style={{ color: "var(--text-tertiary)" }}>
          <RefreshCw size={14} className="animate-spin" /> Initializing live telemetry engine…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="heading-page flex items-center gap-2">
            <Radio size={16} className="animate-pulse" style={{ color: "var(--color-success)" }} />
            Live Telemetry Stream
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            High-frequency infrastructure metrics and diagnostic log streaming
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md"
            style={{
              background: "var(--color-success-bg)",
              border: "1px solid var(--color-success-border)",
              color: "var(--color-success)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-success)", animation: "live-ping 2s ease infinite" }} />
            STREAMING
          </span>
          <button
            onClick={() => setIsPaused(p => !p)}
            className="btn btn-outlined flex items-center gap-1.5 py-1 px-3 text-xs"
          >
            {isPaused ? "Resume Stream" : "Pause Stream"}
          </button>
        </div>
      </div>

      {/* ── Stat Tiles ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="CPU Usage" value={latest.cpu} unit="%" icon={Cpu}
          tone="blue" prev={prev.cpu} sparkData={sparkFor("cpu")} />
        <StatTile label="Memory" value={latest.memory} unit="%" icon={Database}
          tone="purple" prev={prev.memory} sparkData={sparkFor("memory")} />
        <StatTile label="Network" value={latest.network} unit="Mbps" icon={Wifi}
          tone="cyan" prev={prev.network} sparkData={sparkFor("network")} />
        <StatTile label="Threats Detected" value={latest.activeThreats} unit="" icon={Shield}
          tone="rose" prev={prev.activeThreats} sparkData={sparkFor("activeThreats")} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Requests/s" value={latest.requestsPerSec} unit="" icon={Zap}
          tone="emerald" prev={prev.requestsPerSec} sparkData={sparkFor("requestsPerSec")} />
        <StatTile label="Error Rate" value={latest.errorRate} unit="%" icon={AlertTriangle}
          tone="amber" prev={prev.errorRate} sparkData={sparkFor("errorRate")} />
        <StatTile label="Latency p99" value={latest.latencyMs} unit="ms" icon={Activity}
          tone="blue" prev={prev.latencyMs} sparkData={sparkFor("latencyMs")} />
        <StatTile label="Disk Utilization" value={latest.disk} unit="%" icon={Layers}
          tone="cyan" prev={prev.disk} sparkData={sparkFor("disk")} />
      </div>

      {/* ── Chart Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CPU & Memory Area Chart */}
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="heading-section">CPU & Memory Performance</h3>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Utilisation percentage timeline</p>
            </div>
            <div className="flex gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded" style={{ background: "var(--brand-600)" }} />CPU</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded" style={{ background: "#8b5cf6" }} />Mem</span>
            </div>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="liveCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand-600)" stopOpacity={0.10} />
                    <stop offset="100%" stopColor="var(--brand-600)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="liveMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--border-subtle)" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip content={<ChartTooltip unit="%" />} />
                <Area type="monotone" dataKey="cpu" name="CPU" stroke="var(--brand-600)" strokeWidth={1.8}
                  fill="url(#liveCpu)" dot={false} isAnimationActive={false} />
                <Area type="monotone" dataKey="mem" name="Mem" stroke="#8b5cf6" strokeWidth={1.8}
                  fill="url(#liveMem)" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Requests vs Latency Line Chart */}
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="heading-section">Load & Response Latency</h3>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Requests per second vs response speed</p>
            </div>
            <div className="flex gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded" style={{ background: "var(--color-success)" }} />RPS</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded" style={{ background: "var(--color-warning)" }} />Latency</span>
            </div>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="liveRps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="liveLat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-warning)" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="var(--color-warning)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--border-subtle)" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip content={<ChartTooltip unit="" />} />
                <Area type="monotone" dataKey="rps" name="RPS" stroke="var(--color-success)" strokeWidth={1.8}
                  fill="url(#liveRps)" dot={false} isAnimationActive={false} />
                <Area type="monotone" dataKey="lat" name="Latency" stroke="var(--color-warning)" strokeWidth={1.8}
                  fill="url(#liveLat)" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Live Log Stream & Incident Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Terminal log panel */}
        <div className="lg:col-span-2 card p-0 overflow-hidden flex flex-col" style={{ height: 350 }}>
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--border-default)", background: "var(--surface-1)" }}
          >
            <div className="flex items-center gap-2">
              <Terminal size={13} style={{ color: "var(--color-success)" }} />
              <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Live Diagnostics Feed</span>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-success)", animation: "live-ping 2s ease infinite" }} />
            </div>
            <div className="flex gap-1">
              {["ALL", "INFO", "WARNING", "ERROR", "CRITICAL", "RECOVERY"].map(filterVal => (
                <button
                  key={filterVal}
                  onClick={() => setLogFilter(filterVal)}
                  className="text-[10px] font-bold px-2 py-0.5 rounded transition-all"
                  style={{
                    background: logFilter === filterVal ? "var(--brand-50)" : "transparent",
                    color: logFilter === filterVal ? "var(--brand-600)" : "var(--text-tertiary)",
                  }}
                  onMouseEnter={e => {
                    if (logFilter !== filterVal) (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={e => {
                    if (logFilter !== filterVal) (e.currentTarget as HTMLButtonElement).style.color = "var(--text-tertiary)";
                  }}
                >
                  {filterVal === "ALL" ? "ALL" : filterVal.substring(0, 4)}
                </button>
              ))}
            </div>
          </div>

          {/* Panel logs container */}
          <div
            ref={logRef}
            className="flex-1 overflow-y-auto py-2 space-y-0.5 custom-scrollbar"
            style={{ background: "var(--surface-0)" }}
            onScroll={e => setAutoScroll((e.target as HTMLDivElement).scrollTop < 20)}
          >
            <AnimatePresence initial={false}>
              {filteredLogs.map(log => (
                <LogLine key={log.id} log={log} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Incidents Feed */}
        <div className="card p-0 overflow-hidden flex flex-col" style={{ height: 350 }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-default)" }}>
            <span className="text-xs font-bold flex items-center gap-1.5">
              <AlertTriangle size={13} style={{ color: "var(--color-warning)" }} />
              Telemetry Events
            </span>
            <span className="text-[10px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
              {incidents.length} active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2" style={{ background: "var(--surface-0)" }}>
            <AnimatePresence initial={false}>
              {incidents.slice(0, 20).map(inc => {
                const colorTone =
                  inc.type === "critical" || inc.type === "security" ? "error"
                  : inc.type === "recovery" ? "success"
                  : inc.type === "scaling" ? "info"
                  : "warning";

                return (
                  <motion.div
                    key={inc.id}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className="p-3 rounded-lg text-xs"
                    style={{
                      background: `var(--color-${colorTone}-bg)`,
                      border: `1px solid var(--color-${colorTone}-border)`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-bold uppercase text-[9px]" style={{ color: `var(--color-${colorTone})` }}>
                        {inc.type}
                      </span>
                      <span className="text-[10px] shrink-0 font-semibold" style={{ color: "var(--text-tertiary)" }}>
                        {new Date(inc.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </div>
                    <p className="font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>{inc.title}</p>
                    <p style={{ color: "var(--text-secondary)" }}>{inc.message}</p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {incidents.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-xs gap-2" style={{ color: "var(--text-tertiary)" }}>
                <CheckCircle size={20} style={{ color: "var(--color-success)", opacity: 0.6 }} />
                No diagnostic anomalies reported
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
