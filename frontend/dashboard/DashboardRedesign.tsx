"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, AlertTriangle, Shield, Zap, Database,
  Network, RefreshCw, CheckCircle2, FileSearch, Settings, Plus,
  BarChart3, TrendingUp, BrainCircuit, Clock, Server, Globe
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
import { useMonitoringPolling } from "@/hooks/useMonitoringPolling";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { useLiveEngineStore } from "@/hooks/useLiveEngine";
import { OnboardingChecklist } from "@/dashboard/components/OnboardingChecklist";

/* ── CPU icon (not in lucide) ── */
const CpuIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2" />
  </svg>
);

/* ── Metric stat card (internal, compact) ── */
function StatCard({
  label, value, unit, trend, icon: Icon, accentColor,
}: {
  label: string; value: string | number; unit: string;
  trend: number; icon: React.ElementType; accentColor: string;
}) {
  const isUp = trend > 0;
  const isNeutral = trend === 0;
  return (
    <div
      className="card card-hover p-5 relative overflow-hidden group"
      style={{ borderTop: `2px solid ${accentColor}` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="p-2 rounded-lg"
          style={{ background: `${accentColor}18`, color: accentColor }}
        >
          <Icon style={{ width: 15, height: 15 }} />
        </div>
        <span
          className="text-[11px] font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded"
          style={{
            color: isNeutral ? "var(--text-tertiary)" : isUp ? "var(--color-error)" : "var(--color-success)",
            background: isNeutral ? "var(--surface-2)" : isUp ? "var(--color-error-bg)" : "var(--color-success-bg)",
          }}
        >
          {isNeutral ? "—" : `${isUp ? "▲" : "▼"} ${Math.abs(trend)}%`}
        </span>
      </div>
      <p className="text-[11px] font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums tracking-tight" style={{ color: "var(--text-primary)" }}>
          {value}
        </span>
        {unit && (
          <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>{unit}</span>
        )}
      </div>
    </div>
  );
}

/* ── Recharts tooltip ── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs"
      style={{
        background: "var(--surface-elevated)",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-3)",
        color: "var(--text-primary)",
      }}
    >
      <p className="font-medium mb-1" style={{ color: "var(--text-secondary)" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="tabular-nums">
          <span style={{ color: p.color }} className="font-semibold">{p.value?.toFixed(1)}</span>
          <span style={{ color: "var(--text-tertiary)" }}>{p.dataKey === "network" ? " Mbps" : "%"}</span>
        </p>
      ))}
    </div>
  );
}

/* ── Severity colour helper ── */
const severityColor = (s: string) => {
  switch (s) {
    case "critical": return "var(--color-error)";
    case "warning":  return "var(--color-warning)";
    case "info":     return "var(--color-info)";
    default:         return "var(--text-tertiary)";
  }
};

const SectionCard = React.memo(function SectionCard({
  title, subtitle, action, badge, children,
}: {
  title: string; subtitle?: string; action?: React.ReactNode;
  badge?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="heading-section flex items-center gap-2">
            {title}
            {badge}
          </h3>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
});

/* ═══════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════ */
export const DashboardRedesign = () => {
  const { data: session } = useSession();
  const openAuthModal = useMonitoringStore(s => s.openAuthModal);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"node_cpu_seconds_total" | "container_memory_usage_bytes" | "network_receive_bytes_total">("node_cpu_seconds_total");
  useMonitoringPolling();

  const alerts      = useMonitoringStore(s => s.alerts);
  const serviceHealth = useMonitoringStore(s => s.serviceHealth) ?? [];
  const timeline    = useMonitoringStore(s => s.timeline) ?? [];
  const rootCause   = useMonitoringStore(s => s.rootCause);

  const { liveMetrics, incidents } = useLiveEngineStore();
  const latest = liveMetrics[liveMetrics.length - 1];

  const chartData = useMemo(() =>
    liveMetrics.slice(-24).map((m, i) => ({
      name: `T-${24 - i}`,
      node_cpu_seconds_total: m.cpu, 
      container_memory_usage_bytes: m.memory, 
      network_receive_bytes_total: m.network,
    })),
    [liveMetrics]
  );

  const combinedTimeline = useMemo(() => {
    const inc = incidents.slice(0, 10).map(i => ({
      id: i.id,
      type: i.type === "critical" ? "critical"
          : i.type === "security" ? "warning"
          : i.type === "recovery" ? "info" : "info",
      message: `[${i.service}] ${i.title}: ${i.message}`,
      timestamp: new Date(i.timestamp),
    }));
    return [...inc, ...timeline].slice(0, 25);
  }, [incidents, timeline]);

  const unresolvedIncidents = incidents.filter(i => i.type === "critical" || i.type === "security");
  const tabColor = activeTab === "node_cpu_seconds_total" ? "#4285f4" : activeTab === "container_memory_usage_bytes" ? "#8b5cf6" : "#0891b2";

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
        <div>
          <h1 className="heading-page">Mission Control</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Real-time observability and infrastructure health
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold"
            style={{
              background: "var(--color-success-bg)",
              border: "1px solid var(--color-success-border)",
              color: "var(--color-success)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-success)", animation: "live-ping 2s ease infinite" }} />
            Live Telemetry
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Active Incidents */}
        <SectionCard
          title="Active Incidents"
          subtitle="Requires immediate action"
          badge={unresolvedIncidents.length > 0 ? <span className="badge badge-critical ml-2">{unresolvedIncidents.length}</span> : <span className="badge badge-success ml-2">0</span>}
        >
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {unresolvedIncidents.length > 0 ? unresolvedIncidents.map((inc) => (
              <div key={inc.id} className="p-3 rounded-md text-xs border" style={{ borderColor: "var(--color-error-border)", background: "var(--color-error-bg)" }}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold" style={{ color: "var(--color-error)" }}>{inc.service}</span>
                  <span className="tabular-nums" style={{ color: "var(--color-error)" }}>{new Date(inc.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}</span>
                </div>
                <p style={{ color: "var(--color-critical)" }}>{inc.title}</p>
              </div>
            )) : (
              <div className="py-8 text-center flex flex-col items-center gap-2" style={{ color: "var(--text-tertiary)" }}>
                <CheckCircle2 size={24} style={{ color: "var(--color-success)" }} className="opacity-80" />
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No active incidents detected.</p>
                  <p className="text-[10px] mt-0.5 opacity-80">All monitored systems are operating normally.</p>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* 2. Infrastructure Health */}
        <SectionCard
          title="Infrastructure Health"
          subtitle="Active services and nodes"
          badge={
            <span className="badge badge-success ml-1" style={{ fontSize: 10 }}>Operational</span>
          }
        >
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {serviceHealth.slice(0, 6).map((svc: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-lg"
                style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{
                      background: svc.status === "DOWN" ? "var(--color-error-bg)" : "var(--color-success-bg)",
                      color: svc.status === "DOWN" ? "var(--color-error)" : "var(--color-success)",
                    }}
                  >
                    {svc.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>{svc.name}</p>
                  </div>
                </div>
                <span className={`badge text-[10px] ${svc.status === "UP" ? "badge-success" : "badge-critical"}`}>
                  {svc.status}
                </span>
              </div>
            ))}
            {serviceHealth.length === 0 && (
              <div className="py-8 text-center flex flex-col items-center gap-2" style={{ color: "var(--text-tertiary)" }}>
                <Server size={32} className="opacity-30 mb-1" />
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>No services detected</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>Infrastructure nodes are currently initializing.</p>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* 5. Alert Timeline */}
        <SectionCard
          title="Alert Timeline"
          subtitle="Current events"
        >
          <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
            {alerts.slice(0, 8).map((alert, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-xs"
                style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ background: severityColor(alert.severity) }}
                  />
                  <span className="font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {alert.message}
                  </span>
                </div>
                <span className="shrink-0 tabular-nums text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                  {new Date(alert.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="py-8 text-center flex flex-col items-center gap-2" style={{ color: "var(--text-tertiary)" }}>
                <CheckCircle2 size={24} style={{ color: "var(--color-success)" }} className="opacity-80" />
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No active alerts detected.</p>
                  <p className="text-[10px] mt-0.5 opacity-80">The environment is stable.</p>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* 3. Live Telemetry (Spans 2 columns) */}
        <div className="md:col-span-2">
          <SectionCard
            title="Live Telemetry"
            subtitle="Real-time visibility"
            badge={<span className="live-dot ml-1" />}
            action={
              <div
                className="flex p-0.5 rounded-lg gap-0.5"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border-default)" }}
              >
                {(["node_cpu_seconds_total", "container_memory_usage_bytes", "network_receive_bytes_total"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-3 py-1 rounded-md text-[10px] font-mono lowercase transition-all duration-150 truncate max-w-[150px]"
                    style={{
                      background: activeTab === tab ? "var(--surface-0)" : "transparent",
                      color: activeTab === tab ? "var(--text-primary)" : "var(--text-tertiary)",
                      boxShadow: activeTab === tab ? "var(--shadow-1)" : "none",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            }
          >
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 2, right: 2, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={tabColor} stopOpacity={0.12} />
                      <stop offset="100%" stopColor={tabColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="var(--border-subtle)" />
                  <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} interval={4} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone" dataKey={activeTab}
                    stroke={tabColor} strokeWidth={2}
                    fill="url(#activeGrad)" dot={false} isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        {/* 4. AI Insights */}
        <SectionCard
          title="AI Insights"
          subtitle="Operational recommendations"
          badge={<BrainCircuit size={14} style={{ color: "var(--brand-600)" }} className="ml-1" />}
        >
          <div className="space-y-2">
            {rootCause && (
              <div
                className="rounded-lg p-3"
                style={{
                  background: "var(--color-error-bg)",
                  border: "1px solid var(--color-error-border)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={12} style={{ color: "var(--color-error)" }} />
                  <span className="text-xs font-bold" style={{ color: "var(--color-error)" }}>Root Cause</span>
                </div>
                <p className="text-xs" style={{ color: "var(--text-primary)" }}>{rootCause}</p>
              </div>
            )}
            {[
              {
                icon: TrendingUp, color: "success" as const,
                title: "Predictive Scaling",
                msg: "AI predicts +40% traffic in us-east within 15 minutes.",
              },
              {
                icon: Zap, color: "warning" as const,
                title: "Traffic Insight",
                msg: "Recommend pre-emptive scaling for us-east cluster.",
              },
            ].map(({ icon: Icon, color, title, msg }) => (
              <div
                key={title}
                className="rounded-lg p-3"
                style={{
                  background: `var(--color-${color}-bg)`,
                  border: `1px solid var(--color-${color}-border)`,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={12} style={{ color: `var(--color-${color})` }} />
                  <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{title}</span>
                </div>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{msg}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 6. Service Map (Spans 3 columns) */}
        <div className="md:col-span-3">
          <SectionCard
            title="Service Map"
            subtitle="Architecture awareness"
            action={
              <button onClick={() => router.push("/dashboard/architecture")} className="btn btn-outlined text-xs">
                View Full Topology
              </button>
            }
          >
            <div className="h-64 rounded-xl border flex items-center justify-center relative overflow-hidden" style={{ borderColor: "var(--border-default)", background: "var(--surface-1)" }}>
              {/* Simplified mock view of service map */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, var(--border-strong) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
              
              <div className="relative z-10 flex items-center justify-center gap-12 w-full px-10">
                <div className="flex flex-col gap-6">
                  <div className="card p-3 flex items-center gap-2 text-xs shadow-sm"><Globe size={14} className="text-blue-500" /> Web App</div>
                  <div className="card p-3 flex items-center gap-2 text-xs shadow-sm"><Globe size={14} className="text-blue-500" /> Mobile API</div>
                </div>
                
                <div className="h-0.5 w-16 bg-slate-300 dark:bg-slate-700 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                </div>

                <div className="card p-4 border-2 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)] flex flex-col items-center">
                  <Network size={24} className="text-indigo-500 mb-2" />
                  <span className="text-xs font-bold">API Gateway</span>
                </div>

                <div className="h-0.5 w-16 bg-slate-300 dark:bg-slate-700 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                </div>

                <div className="flex flex-col gap-4">
                  <div className="card p-3 flex items-center gap-2 text-xs shadow-sm"><Server size={14} className="text-emerald-500" /> Auth Service</div>
                  <div className="card p-3 flex items-center gap-2 text-xs shadow-sm border-rose-500/30 bg-rose-500/5"><Server size={14} className="text-rose-500" /> Payment API <span className="absolute -top-1 -right-1 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span></span></div>
                  <div className="card p-3 flex items-center gap-2 text-xs shadow-sm"><Database size={14} className="text-violet-500" /> Main DB</div>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

      </div>
    </div>
  );
};

export default DashboardRedesign;
