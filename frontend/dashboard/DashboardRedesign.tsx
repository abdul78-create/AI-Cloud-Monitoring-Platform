"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, AlertTriangle, BarChart3, BrainCircuit, FileSearch, LayoutDashboard, Server, Settings, Shield, Zap, MessageSquare, Box, X, Search, Bell, Menu, ArrowUpRight, ArrowDownRight, MoreVertical, RefreshCw, Plus, Download, Filter, Trash2, CheckCircle2, AlertCircle, Database, Network, ArrowRight } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { useMonitoringPolling } from "@/hooks/useMonitoringPolling";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { SidebarNav } from "@/dashboard/components/SidebarNav";
import { TopNavbar } from "@/dashboard/components/TopNavbar";
import dynamic from 'next/dynamic';

const AIAssistant = dynamic(() => import('@/dashboard/components/AIAssistant').then(mod => mod.AIAssistant), {
  ssr: false,
  loading: () => <div className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-slate-200 animate-pulse" />
});

// Main Component
export const DashboardRedesign = () => {
  const [activeChartTab, setActiveChartTab] = useState("cpu");
  
  useMonitoringPolling();

  const dashboardLoading = useMonitoringStore((state) => state.dashboardLoading);
  const metrics = useMonitoringStore((state) => state.metrics);
  const infrastructure = useMonitoringStore((state) => state.infrastructure);
  const alerts = useMonitoringStore((state) => state.alerts);
  const analytics = useMonitoringStore((state) => state.analytics);
  const aiResult = useMonitoringStore((state) => state.aiResult);
  const serviceHealth = useMonitoringStore((state) => state.serviceHealth) || [];
  const timeline = useMonitoringStore((state) => state.timeline) || [];

  // Derived data
  const latestMetric = metrics[metrics.length - 1] || { cpu: 0, memory: 0, networkTrafficMbps: 0 };
  const prevMetric = metrics[metrics.length - 2] || latestMetric;

  const trend = (curr: number, old: number) => Number(((curr - old) / Math.max(old, 1) * 100).toFixed(1));

  const stats = [
    { id: "cpu", label: "CPU Usage", value: latestMetric.cpu, unit: "%", trend: trend(latestMetric.cpu, prevMetric.cpu), tone: "indigo", icon: CpuIcon },
    { id: "memory", label: "Memory Usage", value: latestMetric.memory, unit: "%", trend: trend(latestMetric.memory, prevMetric.memory), tone: "violet", icon: Database },
    { id: "network", label: "Network Traffic", value: latestMetric.networkTrafficMbps, unit: "Mbps", trend: trend(latestMetric.networkTrafficMbps, prevMetric.networkTrafficMbps), tone: "cyan", icon: Network },
    { id: "threats", label: "Active Threats", value: alerts.filter(a => a.severity === "critical").length, unit: "", trend: -12, tone: "rose", icon: Shield },
  ];

  const chartData = useMemo(() => {
    return metrics.slice(-10).map((m, i) => ({
      name: `T-${10-i}`,
      cpu: m.cpu,
      memory: m.memory,
      network: m.networkTrafficMbps,
    }));
  }, [metrics]);

  return (
    <>
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Enterprise Observability</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Real-time AI monitoring and infrastructure intelligence.</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded-xl border border-slate-200/60 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 shadow-sm">
                  <RefreshCw size={14} className="text-slate-500 dark:text-slate-400" /> Refresh
                </button>
                <button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm shadow-indigo-100 dark:shadow-none">
                  <Zap size={14} /> Run AI Scan
                </button>
              </div>
            </div>

            {/* 1. Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="glass-card rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-premium transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400`}>
                      <stat.icon size={18} />
                    </div>
                    <div className={`flex items-center text-xs font-medium ${stat.trend > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {stat.trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {Math.abs(stat.trend)}%
                    </div>
                  </div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <div className="text-3xl font-bold font-display text-slate-900 dark:text-white">{stat.value}</div>
                    <div className="text-sm font-medium text-slate-400 dark:text-slate-500">{stat.unit}</div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
                    <div className={`h-full rounded-full ${stat.tone === 'indigo' ? 'bg-indigo-600' : stat.tone === 'violet' ? 'bg-violet-600' : stat.tone === 'cyan' ? 'bg-cyan-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(stat.value, 100)}%` }} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 2. Charts Section & 3. AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Charts */}
              <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Infrastructure Performance</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Live telemetry analysis.</p>
                  </div>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
                    <button onClick={() => setActiveChartTab("cpu")} className={`px-3 py-1.5 rounded-md transition-all ${activeChartTab === "cpu" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}>CPU</button>
                    <button onClick={() => setActiveChartTab("memory")} className={`px-3 py-1.5 rounded-md transition-all ${activeChartTab === "memory" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}>Memory</button>
                    <button onClick={() => setActiveChartTab("network")} className={`px-3 py-1.5 rounded-md transition-all ${activeChartTab === "network" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}>Network</button>
                  </div>
                </div>
                
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-700" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip />
                      <Area type="monotone" dataKey={activeChartTab} stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorPrimary)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Insights Panel */}
              <div className="glass-card rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Insights</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ollama Llama3 Analysis</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    <BrainCircuit size={18} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-2 mb-1 relative">
                      <div className="p-1 rounded-md bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                        <AlertTriangle size={12} />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-white">Anomaly Detected</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 relative">Memory pressure detected in **cluster-A**. Spiked by 15% without traffic increase.</p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-2 mb-1 relative">
                      <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={12} />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-white">Predictive Action</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 relative">AI predicts scaling event within **10 minutes** for us-east cluster.</p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-2 mb-1 relative">
                      <div className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                        <Zap size={12} />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-white">Traffic Insight</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 relative">Traffic increasing in **us-east** cluster. Recommend pre-emptive scaling.</p>
                  </div>
                </div>
                
                <button className="w-full mt-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl py-2 text-xs font-semibold hover:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:text-white transition-all flex items-center justify-center gap-2">
                  View Full Report <ArrowRight size={12} />
                </button>
              </div>
            </div>

            {/* 4. Alerts Panel & 5. Infrastructure Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Infrastructure Health */}
              <div className="glass-card rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Infrastructure Health</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Active services and nodes.</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" /> All Systems Operational
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {serviceHealth.map((service: any, i: number) => (
                    <div key={i} className="bg-slate-50/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 rounded-xl p-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${service.status === 'DOWN' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {service.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{service.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Redis: {service.redis}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-bold ${service.status === 'UP' ? 'text-emerald-600' : 'text-rose-600'}`}>{service.status}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">Status</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Alerts */}
              <div className="glass-card rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Alerts</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Live system events.</p>
                  </div>
                  <button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">View All</button>
                </div>

                <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar">
                  {alerts.slice(0, 5).map((alert, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`h-2 w-2 rounded-full flex-shrink-0 ${alert.severity === 'critical' ? 'bg-rose-500' : alert.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{alert.message}</span>
                      </div>
                      <div className="flex-shrink-0 text-slate-400 font-medium">
                        {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 6. Activity Feed & 7. Monitoring Timeline (Mocked for visual completeness) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Activity Feed */}
              <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live Activity Feed</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Real-time system events.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Streaming</span>
                  </div>
                </div>

                <div className="space-y-3 font-mono text-xs text-slate-600 dark:text-slate-400 max-h-[150px] overflow-y-auto custom-scrollbar">
                  <AnimatePresence>
                    {timeline.slice(-10).map((event: any) => (
                      <motion.div 
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-start gap-2"
                      >
                        <span className="text-slate-400">[{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                        <span className={`font-bold ${
                          event.type === 'info' ? 'text-emerald-600' :
                          event.type === 'ai' ? 'text-indigo-600' :
                          event.type === 'warning' ? 'text-amber-600' :
                          event.type === 'critical' ? 'text-rose-600' :
                          'text-slate-600'
                        }`}>{event.type?.toUpperCase()}:</span>
                        <span className="dark:text-slate-300">{event.message}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-card rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 text-center hover:bg-white dark:hover:bg-slate-700 hover:border-indigo-100 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-sm transition-all text-xs font-semibold flex flex-col items-center gap-2">
                    <FileSearch size={16} /> Logs
                  </button>
                  <button className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 text-center hover:bg-white dark:hover:bg-slate-700 hover:border-indigo-100 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-sm transition-all text-xs font-semibold flex flex-col items-center gap-2">
                    <BarChart3 size={16} /> Reports
                  </button>
                  <button className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 text-center hover:bg-white dark:hover:bg-slate-700 hover:border-indigo-100 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-sm transition-all text-xs font-semibold flex flex-col items-center gap-2">
                    <Settings size={16} /> Config
                  </button>
                  <button className="bg-indigo-600 text-white rounded-xl p-3 text-center hover:bg-indigo-700 hover:shadow-sm transition-all text-xs font-semibold flex flex-col items-center gap-2 shadow-sm shadow-indigo-100 dark:shadow-none">
                    <Plus size={16} /> Add Node
                  </button>
                </div>
              </div>
            </div>
    </>
  );
};

// Simple icon wrapper
const CpuIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>
);

export default DashboardRedesign;
