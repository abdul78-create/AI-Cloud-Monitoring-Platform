"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, AlertTriangle, Shield, Zap, Database,
  Network, ArrowUpRight, ArrowDownRight, RefreshCw,
  CheckCircle2, FileSearch, Settings, Plus, BarChart3,
  TrendingUp, BrainCircuit
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useMonitoringPolling } from "@/hooks/useMonitoringPolling";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { useLiveEngineStore } from "@/hooks/useLiveEngine";

const CpuIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
    <path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>
  </svg>
);

function StatCard({ id, label, value, unit, trend, icon: Icon, colorClass }: any) {
  const up = trend > 0;
  return (
    <motion.div
      layout
      className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-5 hover:shadow-md hover:border-slate-200 dark:hover:border-white/10 transition-all duration-300 group relative overflow-hidden"
    >
      <div className={`absolute -top-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-0 group-hover:opacity-15 transition-opacity ${colorClass}`} />
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2 rounded-xl bg-slate-50 dark:bg-white/5 ${colorClass}`}>
          <Icon size={16} />
        </div>
        <span className={`text-xs font-semibold flex items-center gap-0.5 ${up ? "text-rose-500" : "text-emerald-500"}`}>
          {up ? <ArrowUpRight size={11}/> : <ArrowDownRight size={11}/>}
          {Math.abs(trend)}%
        </span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      <div className="flex items-baseline gap-1 mt-0.5">
        <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{value}</span>
        <span className="text-sm text-slate-400">{unit}</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-white/5 h-1 rounded-full mt-3 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${colorClass} bg-current`}
          style={{ width: `${Math.min(Number(value) || 0, 100)}%`, opacity: 0.4 }} />
      </div>
    </motion.div>
  );
}

export const DashboardRedesign = () => {
  const [activeTab, setActiveTab] = useState("cpu");
  useMonitoringPolling();

  const alerts    = useMonitoringStore(s => s.alerts);
  const analytics = useMonitoringStore(s => s.analytics);
  const serviceHealth = useMonitoringStore(s => s.serviceHealth) ?? [];
  const timeline  = useMonitoringStore(s => s.timeline) ?? [];
  const rootCause = useMonitoringStore(s => s.rootCause);
  const playbook  = useMonitoringStore(s => s.playbook);

  const { liveMetrics, incidents } = useLiveEngineStore();
  const latest = liveMetrics[liveMetrics.length - 1];
  const prev   = liveMetrics[liveMetrics.length - 2] ?? latest;

  const trend = (a: number, b: number) =>
    b > 0 ? Number(((a - b) / b * 100).toFixed(1)) : 0;

  const stats = latest ? [
    { id:"cpu",    label:"CPU Usage",      value:latest.cpu.toFixed(1),    unit:"%",    trend:trend(latest.cpu, prev?.cpu??0),    colorClass:"text-indigo-500", icon:CpuIcon },
    { id:"memory", label:"Memory",         value:latest.memory.toFixed(1), unit:"%",    trend:trend(latest.memory, prev?.memory??0), colorClass:"text-violet-500", icon:Database },
    { id:"network",label:"Network",        value:latest.network,           unit:"Mbps", trend:trend(latest.network, prev?.network??0), colorClass:"text-cyan-500", icon:Network },
    { id:"threats",label:"Active Threats", value:latest.activeThreats,     unit:"",     trend:trend(latest.activeThreats, prev?.activeThreats??0), colorClass:"text-rose-500", icon:Shield },
  ] : [];

  const chartData = useMemo(() =>
    liveMetrics.slice(-20).map((m, i) => ({
      name: `T-${20-i}`,
      cpu: m.cpu, memory: m.memory, network: m.network,
    })),
    [liveMetrics]
  );

  // Combined timeline: monitoring store + live incidents
  const combinedTimeline = useMemo(() => {
    const inc = incidents.slice(0, 10).map(i => ({
      id: i.id,
      type: i.type === 'critical' ? 'critical' : i.type === 'security' ? 'warning' : i.type === 'recovery' ? 'info' : 'info',
      message: `[${i.service}] ${i.title}: ${i.message}`,
      timestamp: new Date(i.timestamp),
    }));
    return [...inc, ...timeline].slice(0, 25);
  }, [incidents, timeline]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Enterprise Observability</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time AI monitoring and infrastructure intelligence.</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center gap-2">
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm shadow-indigo-900/20">
            <Zap size={13} /> Run AI Scan
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => <StatCard key={s.id} {...s} />)}
      </div>

      {/* Charts + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Infrastructure Performance</h3>
              <p className="text-xs text-slate-500">Live telemetry stream</p>
            </div>
            <div className="flex bg-slate-100 dark:bg-white/5 p-0.5 rounded-lg text-xs font-medium">
              {["cpu","memory","network"].map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`px-3 py-1.5 rounded-md transition-all capitalize ${
                    activeTab === t
                      ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  }`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="dGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background:'rgba(15,23,42,0.95)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, fontSize:11 }}
                  itemStyle={{ color:'#e2e8f0' }}
                />
                <Area type="monotone" dataKey={activeTab} stroke="#4f46e5" strokeWidth={2}
                  fillOpacity={1} fill="url(#dGrad)" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                AI Insights
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              </h3>
              <p className="text-xs text-slate-500">Live recommendations</p>
            </div>
            <BrainCircuit size={16} className="text-indigo-400" />
          </div>
          <div className="space-y-2.5">
            {rootCause && (
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={12} className="text-rose-400" />
                  <span className="text-xs font-bold text-rose-400">Root Cause</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300">{rootCause}</p>
              </div>
            )}
            {[
              { icon:AlertTriangle, color:"text-rose-400 bg-rose-500/5 border-rose-500/20", title:"Anomaly Detected", msg:"Memory pressure in cluster-A spiked 15% without traffic change." },
              { icon:TrendingUp,    color:"text-emerald-400 bg-emerald-500/5 border-emerald-500/20", title:"Predictive Scaling", msg:"AI predicts +40% traffic in us-east within 15 minutes." },
              { icon:Zap,          color:"text-amber-400 bg-amber-500/5 border-amber-500/20", title:"Traffic Insight", msg:"Recommend pre-emptive scaling for us-east cluster." },
            ].map(({ icon: Icon, color, title, msg }) => (
              <div key={title} className={`rounded-xl border p-3 ${color.split(' ').slice(1).join(' ')}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={12} className={color.split(' ')[0]} />
                  <span className="text-xs font-bold text-slate-800 dark:text-white">{title}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{msg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Infrastructure Health + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Infrastructure Health</h3>
              <p className="text-xs text-slate-500">Active services and nodes</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-500">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Operational
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {serviceHealth.slice(0, 6).map((svc: any, i: number) => (
              <div key={i} className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${svc.status === 'DOWN' ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                    {svc.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{svc.name}</p>
                    <p className="text-[10px] text-slate-400">{svc.redis}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold ${svc.status === 'UP' ? 'text-emerald-500' : 'text-rose-500'}`}>{svc.status}</span>
              </div>
            ))}
            {serviceHealth.length === 0 && (
              <div className="col-span-2 text-center py-8 text-slate-400 text-xs">Connecting to services...</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Alerts</h3>
              <p className="text-xs text-slate-500">Live system events</p>
            </div>
            <button className="text-xs font-medium text-indigo-500 hover:text-indigo-400">View All</button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {alerts.slice(0, 6).map((alert, i) => (
              <div key={i} className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 ${alert.severity === 'critical' ? 'bg-rose-500' : alert.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{alert.message}</span>
                </div>
                <span className="shrink-0 text-slate-400 tabular-nums">
                  {new Date(alert.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                </span>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs flex items-center justify-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" /> No active alerts
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Activity Feed + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Activity Feed</h3>
              <p className="text-xs text-slate-500">Real-time system events and incidents</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Streaming
            </div>
          </div>
          <div className="space-y-1.5 font-mono text-xs max-h-40 overflow-y-auto custom-scrollbar">
            <AnimatePresence initial={false}>
              {combinedTimeline.slice(0, 15).map((event: any) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-2 py-1"
                >
                  <span className="text-slate-400 dark:text-slate-500 shrink-0 tabular-nums">
                    [{new Date(event.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})}]
                  </span>
                  <span className={`font-bold shrink-0 ${
                    event.type === 'info' ? 'text-emerald-500' :
                    event.type === 'ai' ? 'text-indigo-400' :
                    event.type === 'warning' ? 'text-amber-500' :
                    event.type === 'critical' ? 'text-rose-500' : 'text-slate-500'
                  }`}>{event.type?.toUpperCase()}:</span>
                  <span className="text-slate-600 dark:text-slate-300 break-words min-w-0">{event.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon:FileSearch, label:"Logs",    cls:"" },
              { icon:BarChart3,  label:"Reports",  cls:"" },
              { icon:Settings,   label:"Config",   cls:"" },
              { icon:Plus,       label:"Add Node", cls:"bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:text-white border-transparent shadow-sm" },
            ].map(({ icon: Icon, label, cls }) => (
              <button key={label} className={`rounded-xl border border-slate-100 dark:border-white/5 p-3 text-center hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-xs font-semibold flex flex-col items-center gap-2 text-slate-700 dark:text-slate-300 ${cls}`}>
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardRedesign;
