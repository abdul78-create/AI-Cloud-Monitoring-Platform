"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server, Cpu, HardDrive, Activity, RefreshCw, Terminal, Globe, Clock, AlertTriangle, Shield, CheckCircle2, Trash2, Power, Play, Eye
} from "lucide-react";
import { api, unwrap } from "@/services/api";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { toast } from "react-hot-toast";

// ─── Interfaces ───────────────────────────────────────────────────────────────

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

interface Agent {
  agentId: string;
  hostname: string;
  ip: string;
  version: string;
  lastSeen: string;
  status: "healthy" | "warning" | "critical" | "offline" | "draining";
  metrics?: {
    cpu: number;
    memory: number;
    disk: number;
    networkIn?: number;
    networkOut?: number;
    networkInBytes?: number;
    networkOutBytes?: number;
    uptime?: number;
  };
  processes?: Array<{
    pid: number;
    name: string;
    cpu: number;
    memory: number; // MB
    status: string;
  }>;
  uptime: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
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

const getStatusBadge = (status: Agent["status"]) => {
  const config = {
    healthy: { bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400", dot: "bg-emerald-500", label: "Healthy" },
    warning: { bg: "bg-amber-500/10 border-amber-500/30 text-amber-400", dot: "bg-amber-500 animate-pulse", label: "Warning" },
    critical: { bg: "bg-rose-500/10 border-rose-500/30 text-rose-400", dot: "bg-rose-500 animate-pulse", label: "Critical" },
    draining: { bg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400", dot: "bg-indigo-500", label: "Draining" },
    offline: { bg: "bg-slate-500/10 border-slate-500/30 text-slate-400", dot: "bg-slate-500", label: "Offline" },
  };

  const c = config[status] || config.offline;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RealInfrastructurePage() {
  const [activeTab, setActiveTab] = useState<"fleet" | "local" | "remote">("fleet");
  
  // Local Metrics State
  const [localMetrics, setLocalMetrics] = useState<RealSystemMetrics | null>(null);
  const [localLoading, setLocalLoading] = useState(true);

  // Fleet Metrics State
  const [agents, setAgents] = useState<Agent[]>([]);
  const [fleetLoading, setFleetLoading] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  
  // SSH State
  const [sshCommand, setSshCommand] = useState("");
  const [sshOutput, setSshOutput] = useState("");
  const [sshExecuting, setSshExecuting] = useState(false);
  
  const socket = useMonitoringStore((state) => state.socket);

  // ─── Fetching Data ──────────────────────────────────────────────────────────

  const handleSshExecute = async () => {
    if (!selectedAgentId || !sshCommand.trim() || sshExecuting) return;
    
    setSshExecuting(true);
    setSshOutput(`$ ${sshCommand}\nExecuting...`);
    try {
      // Find agent hostname to use as connectionId (mock uses hostname)
      const agent = agents.find(a => a.agentId === selectedAgentId);
      const connectionId = agent?.hostname || selectedAgentId;

      const res = await api.post("/ops/ssh/execute", {
        connectionId,
        command: sshCommand
      });
      const data = unwrap<any>(res);
      setSshOutput(`$ ${sshCommand}\n\n${data.output}`);
    } catch (err: any) {
      setSshOutput(`$ ${sshCommand}\n\nError: ${err.message || 'Execution failed'}`);
      toast.error("SSH command execution failed");
    } finally {
      setSshExecuting(false);
      setSshCommand("");
    }
  };

  const fetchLocalMetrics = async () => {
    try {
      const res = await api.get("/analytics/system-metrics");
      const data = unwrap<RealSystemMetrics>(res);
      setLocalMetrics(data);
    } catch (e) {
      console.error("Local metrics fetch failed", e);
    } finally {
      setLocalLoading(false);
    }
  };

  const fetchFleetAgents = async () => {
    try {
      const res = await api.get("/ops/agents");
      const data = unwrap<Agent[]>(res);
      setAgents(data);
      if (data.length > 0 && !selectedAgentId) {
        setSelectedAgentId(data[0].agentId);
      }
    } catch (e) {
      console.error("Fleet agents fetch failed", e);
    } finally {
      setFleetLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "local") {
      fetchLocalMetrics();
      const interval = setInterval(fetchLocalMetrics, 5000);
      return () => clearInterval(interval);
    } else if (activeTab === "fleet") {
      fetchFleetAgents();
      const interval = setInterval(fetchFleetAgents, 5000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ─── WebSockets Real-time Updates ───────────────────────────────────────────

  useEffect(() => {
    if (!socket) return;

    const handleAgentTelemetry = (data: any) => {
      setAgents((prev) =>
        prev.map((a) =>
          a.agentId === data.agentId
            ? {
                ...a,
                metrics: data.metrics,
                processes: data.processes,
                lastSeen: data.timestamp,
              }
            : a
        )
      );
    };

    const handleAgentUpdated = (data: any) => {
      setAgents((prev) =>
        prev.map((a) =>
          a.agentId === data.agentId
            ? {
                ...a,
                status: data.status,
                lastSeen: data.lastSeen || new Date().toISOString(),
              }
            : a
        )
      );
    };

    const handleAgentDeleted = (data: any) => {
      setAgents((prev) => prev.filter((a) => a.agentId !== data.agentId));
      if (selectedAgentId === data.agentId) {
        setSelectedAgentId(null);
      }
    };

    socket.on("agent:telemetry", handleAgentTelemetry);
    socket.on("agent:updated", handleAgentUpdated);
    socket.on("agent:deleted", handleAgentDeleted);

    return () => {
      socket.off("agent:telemetry", handleAgentTelemetry);
      socket.off("agent:updated", handleAgentUpdated);
      socket.off("agent:deleted", handleAgentDeleted);
    };
  }, [socket, selectedAgentId]);

  // ─── Agent Control Actions ──────────────────────────────────────────────────

  const handleRestart = async (agentId: string) => {
    try {
      const loadToast = toast.loading("Sending restart signal to agent...");
      await api.post(`/ops/agents/${agentId}/restart`);
      toast.dismiss(loadToast);
      toast.success("Restart signal accepted by agent.");
      fetchFleetAgents();
    } catch (e: any) {
      toast.error(e.message || "Failed to restart agent.");
    }
  };

  const handleDrain = async (agentId: string) => {
    try {
      const loadToast = toast.loading("Marking agent as draining...");
      await api.post(`/ops/agents/${agentId}/drain`);
      toast.dismiss(loadToast);
      toast.success("Host marked as draining. Requests routed away.");
      fetchFleetAgents();
    } catch (e: any) {
      toast.error(e.message || "Failed to drain host.");
    }
  };

  const handleDisconnect = async (agentId: string) => {
    try {
      const loadToast = toast.loading("Disconnecting agent...");
      await api.post(`/ops/agents/${agentId}/disconnect`);
      toast.dismiss(loadToast);
      toast.success("Agent successfully removed from active registry.");
      fetchFleetAgents();
    } catch (e: any) {
      toast.error(e.message || "Failed to disconnect agent.");
    }
  };

  const inspectedAgent = agents.find((a) => a.agentId === selectedAgentId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2" style={{ background: "var(--surface-2)", border: "1px solid var(--surface-3)", color: "var(--text-secondary)" }}>
            <Activity size={11} className="text-emerald-500 animate-pulse" /> Live Fleet Observability Ingress
          </div>
          <h1 className="heading-page">Infrastructure Monitoring</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Monitor and coordinate system metrics, daemon tasks, and network connections.
          </p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("fleet")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "fleet" ? "bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Connected Agents ({agents.length})
          </button>
          <button
            onClick={() => setActiveTab("local")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "local" ? "bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Local Server (Real)
          </button>
          <button
            onClick={() => setActiveTab("remote")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "remote" ? "bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            SSH Simulators
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
          {/* TAB 1: FLEET AGENTS */}
          {activeTab === "fleet" && (
            fleetLoading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="flex items-center gap-3 text-slate-500">
                  <RefreshCw className="animate-spin" size={18} />
                  <span>Loading connected daemon agents...</span>
                </div>
              </div>
            ) : agents.length === 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card p-8 text-center border-dashed border-2 bg-slate-50 dark:bg-slate-900/50 flex flex-col justify-center items-center">
                  <Server size={48} className="text-slate-400 mb-4 animate-pulse" />
                  <h2 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">No infrastructure connected yet.</h2>
                  <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                    Connect your first server to begin live telemetry analysis.
                  </p>
                  <div className="w-full text-left bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-xs max-w-xl overflow-x-auto border border-slate-800">
                    <p className="text-slate-500 mb-2"># Install CloudAI daemon agent</p>
                    <p className="text-indigo-400">curl -sSL https://cloudai.monitor/install.sh | bash</p>
                    <p className="text-slate-500 my-2"># Or execute locally via standalone script</p>
                    <p className="text-indigo-400">cd agent && npm install && node agent.js</p>
                  </div>
                </div>
                <div className="card p-6 space-y-4">
                  <h3 className="font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white">
                    <Shield size={18} className="text-indigo-500" /> Daemon Integration Requirements
                  </h3>
                  <div className="text-xs space-y-3 text-slate-600 dark:text-slate-400">
                    <div className="flex gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                      <span><strong>Interval:</strong> Agent gathers metrics every 5 seconds.</span>
                    </div>
                    <div className="flex gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                      <span><strong>Evaluation:</strong> Backend auto-evaluates CPU (&gt;85%), RAM (&gt;90%), Disk (&gt;85%) thresholds instantly.</span>
                    </div>
                    <div className="flex gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                      <span><strong>Failures:</strong> Alerts automatically fire WebSocket toasts and populate the Incident Timeline.</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Agent Fleet Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agents.map((agent) => {
                    const isSelected = agent.agentId === selectedAgentId;
                    return (
                      <div
                        key={agent.agentId}
                        onClick={() => setSelectedAgentId(agent.agentId)}
                        className={`card p-5 cursor-pointer transition-all border ${
                          isSelected
                            ? "ring-2 ring-indigo-500 border-indigo-500 bg-indigo-500/5"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Terminal size={14} className="text-slate-400" />
                              {agent.hostname}
                            </h3>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{agent.ip} | v{agent.version}</span>
                          </div>
                          {getStatusBadge(agent.status)}
                        </div>

                        {agent.metrics && (
                          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded p-2 border border-slate-100 dark:border-slate-800">
                              <div className="text-[9px] text-slate-500 uppercase font-semibold">CPU</div>
                              <div className="font-bold text-xs mt-0.5 tabular-nums text-slate-900 dark:text-white">
                                {agent.metrics.cpu}%
                              </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded p-2 border border-slate-100 dark:border-slate-800">
                              <div className="text-[9px] text-slate-500 uppercase font-semibold">RAM</div>
                              <div className="font-bold text-xs mt-0.5 tabular-nums text-slate-900 dark:text-white">
                                {Math.round(agent.metrics.memory)}%
                              </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded p-2 border border-slate-100 dark:border-slate-800">
                              <div className="text-[9px] text-slate-500 uppercase font-semibold">Disk</div>
                              <div className="font-bold text-xs mt-0.5 tabular-nums text-slate-900 dark:text-white">
                                {Math.round(agent.metrics.disk)}%
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAgentId(agent.agentId);
                            }}
                            className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                          >
                            <Eye size={12} /> Inspect
                          </button>
                          
                          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleRestart(agent.agentId)}
                              title="Restart Agent Daemon"
                              className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-indigo-500 dark:text-slate-400"
                            >
                              <RefreshCw size={11} />
                            </button>
                            <button
                              onClick={() => handleDrain(agent.agentId)}
                              title="Drain Traffic"
                              className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-amber-500 dark:text-slate-400"
                            >
                              <Power size={11} />
                            </button>
                            <button
                              onClick={() => handleDisconnect(agent.agentId)}
                              title="Force Disconnect Agent"
                              className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-rose-500 dark:text-slate-400"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Agent Telemetry Inspection */}
                {inspectedAgent ? (
                  <div className="space-y-4">
                    {/* Ring Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="card">
                        <RingChart
                          percentage={inspectedAgent.metrics?.cpu || 0}
                          color={(inspectedAgent.metrics?.cpu || 0) > 85 ? "#ef4444" : (inspectedAgent.metrics?.cpu || 0) > 65 ? "#f59e0b" : "#3b82f6"}
                          label="CPU Utilization"
                          subLabel={`Fleet Daemon Streaming`}
                        />
                      </div>
                      <div className="card">
                        <RingChart
                          percentage={inspectedAgent.metrics?.memory || 0}
                          color={(inspectedAgent.metrics?.memory || 0) > 85 ? "#ef4444" : (inspectedAgent.metrics?.memory || 0) > 70 ? "#f59e0b" : "#8b5cf6"}
                          label="Memory Usage"
                          subLabel="RAM Capacity Buffer"
                        />
                      </div>
                      <div className="card">
                        <RingChart
                          percentage={inspectedAgent.metrics?.disk || 0}
                          color={(inspectedAgent.metrics?.disk || 0) > 85 ? "#ef4444" : "#10b981"}
                          label="Primary Volume"
                          subLabel="Disk Storage Limit"
                        />
                      </div>
                    </div>

                    {/* Agent Processes */}
                    {inspectedAgent.processes && inspectedAgent.processes.length > 0 && (
                      <div className="card p-5 overflow-hidden">
                        <h3 className="heading-section mb-4 flex items-center gap-2">
                          <Activity size={16} /> Top Processes ({inspectedAgent.hostname})
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                              <tr>
                                <th className="px-4 py-2 font-bold">PID</th>
                                <th className="px-4 py-2 font-bold">Name</th>
                                <th className="px-4 py-2 font-bold text-right">CPU %</th>
                                <th className="px-4 py-2 font-bold text-right">Memory</th>
                                <th className="px-4 py-2 font-bold">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {inspectedAgent.processes.map((p, idx) => (
                                <tr key={`${p.pid}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                  <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{p.pid}</td>
                                  <td className="px-4 py-2.5 text-slate-900 dark:text-white font-medium max-w-[200px] truncate">{p.name}</td>
                                  <td className="px-4 py-2.5 text-right font-mono text-xs font-bold text-slate-900 dark:text-white">{p.cpu}%</td>
                                  <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-600 dark:text-slate-300">{p.memory.toFixed(1)} MB</td>
                                  <td className="px-4 py-2.5">
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                      {p.status.toUpperCase()}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Agent Docker Containers */}
                    {(inspectedAgent as any).docker && (inspectedAgent as any).docker.length > 0 && (
                      <div className="card p-5 overflow-hidden border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)]">
                        <h3 className="heading-section mb-4 flex items-center gap-2">
                          <svg className="w-4 h-4 text-[#2496ed]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.434h2.118a.186.186 0 00.186-.186V3.57a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.185m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185h-2.119a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.185m2.93 2.718h2.118a.187.187 0 00.186-.186V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.187.187 0 00.184-.186V9.006a.186.186 0 00-.185-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.938 0h2.12a.187.187 0 00.184-.186V9.006a.186.186 0 00-.185-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.93 0h2.119a.186.186 0 00.185-.186V9.006a.186.186 0 00-.185-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.187.187 0 00.184-.186V9.006a.186.186 0 00-.185-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185M20.348 11.39a6.071 6.071 0 00-3.282-1.769l-.02-.006H1.933a.186.186 0 00-.186.186v2.213c0 3.738 2.656 6.541 6.643 6.541h10.97c3.987 0 6.642-2.803 6.642-6.541v-1.63a.186.186 0 00-.185-.186h-5.469v.005zm-6.233 4.137a1.696 1.696 0 11-1.697-1.695 1.695 1.695 0 011.697 1.695M16.14 15.527a1.696 1.696 0 11-1.697-1.695 1.695 1.695 0 011.697 1.695M18.156 15.527a1.696 1.696 0 11-1.696-1.695 1.696 1.696 0 011.696 1.695"/></svg>
                          Docker Containers
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                              <tr>
                                <th className="px-4 py-2 font-bold">Container ID</th>
                                <th className="px-4 py-2 font-bold">Name</th>
                                <th className="px-4 py-2 font-bold">Image</th>
                                <th className="px-4 py-2 font-bold text-right">CPU %</th>
                                <th className="px-4 py-2 font-bold text-right">Memory %</th>
                                <th className="px-4 py-2 font-bold">State</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {(inspectedAgent as any).docker.map((c: any) => (
                                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                  <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{c.id}</td>
                                  <td className="px-4 py-2.5 text-slate-900 dark:text-white font-medium max-w-[200px] truncate">{c.name}</td>
                                  <td className="px-4 py-2.5 text-xs text-slate-500 max-w-[150px] truncate" title={c.image}>{c.image}</td>
                                  <td className="px-4 py-2.5 text-right font-mono text-xs font-bold text-slate-900 dark:text-white">{(c.cpu || 0).toFixed(1)}%</td>
                                  <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-600 dark:text-slate-300">{(c.memory || 0).toFixed(1)}%</td>
                                  <td className="px-4 py-2.5">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${c.state === 'running' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                      {c.state.toUpperCase()}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="card p-6 text-center text-sm text-slate-500">
                    Select an active agent card from the fleet registry to inspect metrics.
                  </div>
                )}
              </div>
            )
          )}

          {/* TAB 2: LOCAL HOST METRICS */}
          {activeTab === "local" && (
            localLoading || !localMetrics ? (
              <div className="flex items-center justify-center min-h-[300px]">
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
                        <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{localMetrics.hostname}</h2>
                        <div className="flex items-center gap-3 text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                          <span className="flex items-center gap-1"><Server size={12} /> {localMetrics.os.distro} {localMetrics.os.release}</span>
                          <span className="flex items-center gap-1"><Cpu size={12} /> {localMetrics.cpu.brand}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> Uptime: {formatUptime(localMetrics.uptime)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Load Avg (1m)</div>
                        <div className="text-xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{localMetrics.loadAvg[0]?.toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>Processes</div>
                        <div className="text-xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{localMetrics.processes.length}+</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resource Rings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="card">
                    <RingChart 
                      percentage={localMetrics.cpu.usage} 
                      color={localMetrics.cpu.usage > 85 ? "#ef4444" : localMetrics.cpu.usage > 65 ? "#f59e0b" : "#3b82f6"} 
                      label="CPU Utilization" 
                      subLabel={`${localMetrics.cpu.cores} Cores @ ${localMetrics.cpu.speed}GHz`}
                    />
                  </div>
                  <div className="card">
                    <RingChart 
                      percentage={localMetrics.memory.usagePercent} 
                      color={localMetrics.memory.usagePercent > 85 ? "#ef4444" : localMetrics.memory.usagePercent > 70 ? "#f59e0b" : "#8b5cf6"} 
                      label="Memory Usage" 
                      subLabel={`${formatBytes(localMetrics.memory.used)} / ${formatBytes(localMetrics.memory.total)}`}
                    />
                  </div>
                  <div className="card">
                    {localMetrics.disk[0] ? (
                      <RingChart 
                        percentage={localMetrics.disk[0].usagePercent} 
                        color={localMetrics.disk[0].usagePercent > 90 ? "#ef4444" : "#10b981"} 
                        label="Disk Space (Root)" 
                        subLabel={`${formatBytes(localMetrics.disk[0].used)} / ${formatBytes(localMetrics.disk[0].size)}`}
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
                      {localMetrics.cpu.perCore.map((load, i) => (
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
                      <Globe size={16} /> Network Interface
                    </h3>
                    {localMetrics.network[0] ? (
                      <div className="grid grid-cols-2 gap-4 h-full">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex flex-col justify-center">
                          <div className="text-xs font-bold uppercase text-slate-500 mb-1">RX (Download)</div>
                          <div className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                            {formatBytes(localMetrics.network[0].rxSec)}<span className="text-sm font-normal text-slate-500">/s</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">Total: {formatBytes(localMetrics.network[0].rxTotal)}</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex flex-col justify-center">
                          <div className="text-xs font-bold uppercase text-slate-500 mb-1">TX (Upload)</div>
                          <div className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                            {formatBytes(localMetrics.network[0].txSec)}<span className="text-sm font-normal text-slate-500">/s</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">Total: {formatBytes(localMetrics.network[0].txTotal)}</div>
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
                        {localMetrics.processes.map(p => (
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

          {/* TAB 3: SSH SIMULATOR */}
          {activeTab === "remote" && (
            <div className="space-y-4">
              <div className="card p-8 text-center border-dashed border-2 bg-slate-50 dark:bg-slate-900/50">
                <Shield size={32} className="mx-auto mb-4 text-slate-400" />
                <h2 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Secure Remote Execution</h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                  Execute whitelisted management commands directly on connected infrastructure. Only safe telemetry commands are permitted.
                </p>
              </div>
              
              <div className="card p-5">
                <h3 className="heading-section mb-4 flex items-center gap-2">
                  <Terminal size={16} /> Web Terminal
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="input flex-1 font-mono text-sm bg-slate-950 text-green-400 focus:ring-green-500" 
                      placeholder="e.g. uptime, docker ps, df -h, free -m, systemctl status cloudai-agent"
                      value={sshCommand}
                      onChange={(e) => setSshCommand(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSshExecute(); }}
                    />
                    <button 
                      className="btn btn-primary whitespace-nowrap bg-green-600 hover:bg-green-700 text-white border-none"
                      onClick={handleSshExecute}
                      disabled={sshExecuting || !sshCommand.trim() || !inspectedAgent}
                    >
                      {sshExecuting ? <RefreshCw className="animate-spin w-4 h-4" /> : "Execute"}
                    </button>
                  </div>
                  
                  {!inspectedAgent && (
                    <div className="text-xs text-amber-500 bg-amber-500/10 p-2 rounded">
                      Please select an agent from the fleet view to run remote commands against its host.
                    </div>
                  )}

                  <div className="bg-slate-950 rounded-lg p-4 min-h-[300px] overflow-auto border border-slate-800 relative">
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <pre className="font-mono text-xs text-slate-300 mt-4 whitespace-pre-wrap">{sshOutput || "Waiting for input..."}</pre>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase mr-2 mt-1">Whitelisted:</span>
                    {["uptime", "df -h", "free -m", "docker ps", "systemctl status"].map(cmd => (
                      <button 
                        key={cmd}
                        onClick={() => setSshCommand(cmd)}
                        className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded hover:bg-slate-200 dark:hover:bg-slate-700 font-mono"
                      >
                        {cmd}
                      </button>
                    ))}
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
