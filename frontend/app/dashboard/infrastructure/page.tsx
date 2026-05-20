"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server, Cpu, HardDrive, Activity, RefreshCw, Terminal, Globe, Clock, AlertTriangle, Shield, CheckCircle2, ChevronRight, LayoutGrid, List
} from "lucide-react";

interface RealSystemMetrics {
  timestamp: string;
  hostname: string;
  platform: string;
  arch: string;
  cpu: {
    manufacturer: string;
    brand: string;
    speed: number;
    cores: number;
    physicalCores: number;
    usage: number;
    perCore: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    available: number;
    usagePercent: number;
    swapTotal: number;
    swapUsed: number;
  };
  disk: Array<{
    fs: string;
    mount: string;
    size: number;
    used: number;
    available: number;
    usagePercent: number;
  }>;
  network: Array<{
    iface: string;
    rxSec: number;
    txSec: number;
    rxTotal: number;
    txTotal: number;
  }>;
  processes: Array<{
    pid: number;
    name: string;
    cpu: number;
    mem: number;
    memPercent: number;
    command: string;
    user: string;
    status: string;
  }>;
  uptime: number;
  loadAvg: number[];
  os: {
    platform: string;
    distro: string;
    release: string;
    kernel: string;
    hostname: string;
  };
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  return `${h}h ${m}m`;
}

// ─── Ring Chart Component ──────────────────────────────────────────────────────

function RingChart({ percentage, color, label, subLabel }: { percentage: number; color: string; label: string; subLabel: string }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <svg className="w-24 h-24 transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="var(--surface-3)"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{Math.round(percentage)}%</span>
      </div>
      <div className="mt-4 text-center">
        <div className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>{label}</div>
        <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{subLabel}</div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RealInfrastructurePage() {
  const [metrics, setMetrics] = useState<RealSystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"local" | "remote">("local");

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/analytics/system-metrics");
      const body = await res.json();
      if (body.success && body.data) {
        setMetrics(body.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "local") {
      fetchMetrics();
      const interval = setInterval(fetchMetrics, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2" style={{ background: "var(--color-success-bg)", border: "1px solid var(--color-success-border)", color: "var(--color-success)" }}>
            <Activity size={11} /> Real-Time Agent Connected
          </div>
          <h1 className="heading-page">Infrastructure Monitoring</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Live hardware metrics and deep process inspection.
          </p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("local")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "local" ? "bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Local Machine (Real)
          </button>
          <button
            onClick={() => setActiveTab("remote")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "remote" ? "bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            SSH Remote Servers
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "local" && (
            loading || !metrics ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center gap-3 text-slate-500">
                  <RefreshCw className="animate-spin" size={18} />
                  <span>Gathering hardware metrics via systeminformation...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* System Info Banner */}
                <div className="card p-5" style={{ borderLeft: "4px solid var(--brand-500)" }}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl" style={{ background: "var(--surface-2)" }}>
                        <Terminal size={24} style={{ color: "var(--text-primary)" }} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{metrics.hostname}</h2>
                        <div className="flex items-center gap-3 text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                          <span className="flex items-center gap-1"><Server size={12} /> {metrics.os.distro} {metrics.os.release}</span>
                          <span className="flex items-center gap-1"><Cpu size={12} /> {metrics.cpu.brand}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> Uptime: {formatUptime(metrics.uptime)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Load Avg (1m)</div>
                        <div className="text-xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{metrics.loadAvg[0]?.toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Processes</div>
                        <div className="text-xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{metrics.processes.length}+</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resource Rings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="card">
                    <RingChart 
                      percentage={metrics.cpu.usage} 
                      color={metrics.cpu.usage > 85 ? "#ef4444" : metrics.cpu.usage > 65 ? "#f59e0b" : "#3b82f6"} 
                      label="CPU Utilization" 
                      subLabel={`${metrics.cpu.cores} Cores @ ${metrics.cpu.speed}GHz`}
                    />
                  </div>
                  <div className="card">
                    <RingChart 
                      percentage={metrics.memory.usagePercent} 
                      color={metrics.memory.usagePercent > 85 ? "#ef4444" : metrics.memory.usagePercent > 70 ? "#f59e0b" : "#8b5cf6"} 
                      label="Memory Usage" 
                      subLabel={`${formatBytes(metrics.memory.used)} / ${formatBytes(metrics.memory.total)}`}
                    />
                  </div>
                  <div className="card">
                    {metrics.disk[0] ? (
                      <RingChart 
                        percentage={metrics.disk[0].usagePercent} 
                        color={metrics.disk[0].usagePercent > 90 ? "#ef4444" : "#10b981"} 
                        label="Disk Space (Root)" 
                        subLabel={`${formatBytes(metrics.disk[0].used)} / ${formatBytes(metrics.disk[0].size)}`}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-slate-500">No disk data</div>
                    )}
                  </div>
                </div>

                {/* Per-Core CPU & Network */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="card p-5">
                    <h3 className="heading-section mb-4 flex items-center gap-2">
                      <Cpu size={16} /> Per-Core Utilization
                    </h3>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {metrics.cpu.perCore.map((load, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className="h-20 w-4 bg-slate-100 dark:bg-slate-800 rounded-sm relative overflow-hidden mb-1">
                            <motion.div 
                              className="absolute bottom-0 w-full"
                              style={{ 
                                background: load > 85 ? "#ef4444" : load > 60 ? "#f59e0b" : "#3b82f6",
                                height: `${load}%` 
                              }}
                              initial={{ height: 0 }}
                              animate={{ height: `${load}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                          <div className="text-[9px] font-mono text-slate-500">{i}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card p-5">
                    <h3 className="heading-section mb-4 flex items-center gap-2">
                      <Globe size={16} /> Network Interface (eth0)
                    </h3>
                    {metrics.network[0] ? (
                      <div className="grid grid-cols-2 gap-4 h-full">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex flex-col justify-center">
                          <div className="text-xs font-bold uppercase text-slate-500 mb-1">RX (Download)</div>
                          <div className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                            {formatBytes(metrics.network[0].rxSec)}<span className="text-sm font-normal text-slate-500">/s</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">Total: {formatBytes(metrics.network[0].rxTotal)}</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex flex-col justify-center">
                          <div className="text-xs font-bold uppercase text-slate-500 mb-1">TX (Upload)</div>
                          <div className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                            {formatBytes(metrics.network[0].txSec)}<span className="text-sm font-normal text-slate-500">/s</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">Total: {formatBytes(metrics.network[0].txTotal)}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500">Network stats unavailable</div>
                    )}
                  </div>
                </div>

                {/* Top Processes Table */}
                <div className="card p-5 overflow-hidden">
                  <h3 className="heading-section mb-4 flex items-center gap-2">
                    <Activity size={16} /> Top Processes (CPU)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-4 py-2 font-bold">PID</th>
                          <th className="px-4 py-2 font-bold">Command</th>
                          <th className="px-4 py-2 font-bold">User</th>
                          <th className="px-4 py-2 font-bold text-right">CPU %</th>
                          <th className="px-4 py-2 font-bold text-right">Memory</th>
                          <th className="px-4 py-2 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {metrics.processes.map(p => (
                          <tr key={p.pid} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{p.pid}</td>
                            <td className="px-4 py-2.5 text-slate-900 dark:text-white font-medium max-w-[200px] truncate" title={p.command}>{p.name}</td>
                            <td className="px-4 py-2.5 text-xs text-slate-500">{p.user}</td>
                            <td className="px-4 py-2.5 text-right font-mono text-xs font-bold" style={{ color: p.cpu > 50 ? "#ef4444" : "var(--text-primary)" }}>{p.cpu.toFixed(1)}</td>
                            <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-600 dark:text-slate-300">{p.mem} MB</td>
                            <td className="px-4 py-2.5">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${p.status === 'running' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                {p.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          )}

          {activeTab === "remote" && (
            <div className="space-y-4">
              <div className="card p-8 text-center border-dashed border-2 bg-slate-50 dark:bg-slate-900/50">
                <Shield size={32} className="mx-auto mb-4 text-slate-400" />
                <h2 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">SSH Remote Servers</h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                  Connect remote Linux servers securely via SSH to collect real-time system metrics using the node-ssh agent.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button className="btn btn-primary">Add Remote Server</button>
                  <button className="btn btn-outlined text-slate-600">View Connection Logs</button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mock remote server 1 */}
                <div className="card p-5 opacity-75 hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg"><Terminal size={16} /></div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">db-replica-01.prod</div>
                        <div className="text-xs text-slate-500 font-mono">10.0.1.44</div>
                      </div>
                    </div>
                    <span className="badge badge-success text-[10px]">CONNECTED</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded p-2">
                      <div className="text-[10px] text-slate-500 uppercase">CPU</div>
                      <div className="font-bold text-sm">24%</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded p-2">
                      <div className="text-[10px] text-slate-500 uppercase">MEM</div>
                      <div className="font-bold text-sm">61%</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded p-2">
                      <div className="text-[10px] text-slate-500 uppercase">PING</div>
                      <div className="font-bold text-sm">12ms</div>
                    </div>
                  </div>
                </div>

                {/* Mock remote server 2 */}
                <div className="card p-5 opacity-75 hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg"><Terminal size={16} /></div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">worker-queue-05</div>
                        <div className="text-xs text-slate-500 font-mono">10.0.2.19</div>
                      </div>
                    </div>
                    <span className="badge badge-warning text-[10px]">OFFLINE</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-4 bg-slate-50 dark:bg-slate-800 p-3 rounded flex items-start gap-2">
                    <AlertTriangle size={14} className="text-yellow-500 flex-shrink-0" />
                    Connection timed out after 30000ms. SSH key authentication failed.
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
