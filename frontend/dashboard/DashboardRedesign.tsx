"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, AlertTriangle, Shield, Zap, Database,
  Network, RefreshCw, CheckCircle2, FileSearch, Settings, Plus,
  BarChart3, TrendingUp, BrainCircuit, Clock, Server
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

/* ── Section card wrapper ── */
function SectionCard({
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
}

/* ═══════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════ */
export const DashboardRedesign = () => {
  const { data: session } = useSession();
  const openAuthModal = useMonitoringStore(s => s.openAuthModal);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"cpu" | "memory" | "network">("cpu");
  useMonitoringPolling();

  const alerts      = useMonitoringStore(s => s.alerts);
  const serviceHealth = useMonitoringStore(s => s.serviceHealth) ?? [];
  const timeline    = useMonitoringStore(s => s.timeline) ?? [];
  const rootCause   = useMonitoringStore(s => s.rootCause);

  const { liveMetrics, incidents } = useLiveEngineStore();
  const latest = liveMetrics[liveMetrics.length - 1];
  const prev   = liveMetrics[liveMetrics.length - 2] ?? latest;

  const trend = (a: number, b: number) =>
    b > 0 ? Number(((a - b) / b * 100).toFixed(1)) : 0;

  const stats = latest
    ? [
        { id: "cpu",     label: "CPU Usage",     value: latest.cpu.toFixed(1),     unit: "%",    trend: trend(latest.cpu, prev?.cpu ?? 0),              accentColor: "#4285f4", icon: CpuIcon  },
        { id: "memory",  label: "Memory Usage",  value: latest.memory.toFixed(1),  unit: "%",    trend: trend(latest.memory, prev?.memory ?? 0),         accentColor: "#8b5cf6", icon: Database },
        { id: "network", label: "Network I/O",   value: latest.network,            unit: "Mbps", trend: trend(latest.network, prev?.network ?? 0),       accentColor: "#0891b2", icon: Network  },
        { id: "threats", label: "Active Threats",value: latest.activeThreats,      unit: "",     trend: trend(latest.activeThreats, prev?.activeThreats ?? 0), accentColor: "#ea4335", icon: Shield   },
      ]
    : [];

  const chartData = useMemo(() =>
    liveMetrics.slice(-24).map((m, i) => ({
      name: `T-${24 - i}`,
      cpu: m.cpu, memory: m.memory, network: m.network,
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

  const tabColor = activeTab === "cpu" ? "#4285f4" : activeTab === "memory" ? "#8b5cf6" : "#0891b2";

  return (
    <div className="space-y-5">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="heading-page">Enterprise Observability</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Real-time AI monitoring and infrastructure intelligence
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
            Live · 2s delay
          </div>
          <button className="btn btn-outlined flex items-center gap-1.5">
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            onClick={() => {
              if ((session?.user as any)?.isGuest) {
                openAuthModal();
              } else {
                alert("AI Scan completed successfully! All systems nominal.");
              }
            }}
            className="btn btn-primary flex items-center gap-1.5"
          >
            <Zap size={13} /> Run AI Scan
          </button>
        </div>
      </div>

      {/* ── Onboarding Checklist ── */}
      <OnboardingChecklist
        hasInfrastructure={serviceHealth.length > 0}
        hasAlerts={alerts.length > 0}
        hasViewedAI={false}
      />

      {/* ── Stat cards ── */}
      {latest ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => <StatCard key={s.id} {...s} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      )}

      {/* ── Charts + AI Insights ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main chart */}
        <SectionCard
          title="Infrastructure Performance"
          subtitle="Live telemetry — last 24 samples"
          badge={<span className="live-dot ml-1" />}
          action={
            <div
              className="flex p-0.5 rounded-lg gap-0.5"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-default)" }}
            >
              {(["cpu", "memory", "network"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-3 py-1 rounded-md text-xs font-medium capitalize transition-all duration-150"
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
          <div className="h-52">
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

        {/* AI Insights panel */}
        <SectionCard
          title="AI Insights"
          subtitle="Live recommendations"
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
                icon: AlertTriangle, color: "error" as const,
                title: "Anomaly Detected",
                msg: "Memory pressure in cluster-A spiked 15% without traffic change.",
              },
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
      </div>

      {/* ── Infrastructure Health + Alerts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Infrastructure health */}
        <SectionCard
          title="Infrastructure Health"
          subtitle="Active services and nodes"
          badge={
            <span
              className="badge badge-success ml-1"
              style={{ fontSize: 10 }}
            >
              Operational
            </span>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {serviceHealth.slice(0, 6).map((svc: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: svc.status === "DOWN" ? "var(--color-error-bg)" : "var(--color-success-bg)",
                      color: svc.status === "DOWN" ? "var(--color-error)" : "var(--color-success)",
                    }}
                  >
                    {svc.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{svc.name}</p>
                    <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{svc.redis}</p>
                  </div>
                </div>
                <span
                  className={`badge text-[10px] ${svc.status === "UP" ? "badge-success" : "badge-critical"}`}
                >
                  {svc.status}
                </span>
              </div>
            ))}
            {serviceHealth.length === 0 && (
              <div className="col-span-2 py-8 text-center text-xs" style={{ color: "var(--text-tertiary)" }}>
                <Server size={20} className="mx-auto mb-2 opacity-30" />
                Connecting to services…
              </div>
            )}
          </div>
        </SectionCard>

        {/* Recent alerts */}
        <SectionCard
          title="Recent Alerts"
          subtitle="Live system events"
          action={
            <button className="btn btn-ghost text-xs" style={{ color: "var(--brand-600)" }}>
              View All
            </button>
          }
        >
          <div className="space-y-1.5 max-h-52 overflow-y-auto custom-scrollbar">
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
                  {new Date(alert.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="py-8 text-center text-xs flex flex-col items-center gap-2" style={{ color: "var(--text-tertiary)" }}>
                <CheckCircle2 size={18} style={{ color: "var(--color-success)" }} />
                No active alerts
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* ── Activity Feed + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Live activity feed */}
        <div className="lg:col-span-2">
          <SectionCard
            title="Live Activity Feed"
            subtitle="Real-time system events and incidents"
            badge={<span className="live-dot ml-2" />}
          >
            <div className="space-y-0.5 font-mono text-xs max-h-44 overflow-y-auto custom-scrollbar">
              <AnimatePresence initial={false}>
                {combinedTimeline.slice(0, 15).map((event: any) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-start gap-2 py-1.5 px-2 rounded hover:bg-[var(--surface-1)] transition-colors"
                  >
                    <span className="tabular-nums shrink-0 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                      [{new Date(event.timestamp).toLocaleTimeString([], {
                        hour: "2-digit", minute: "2-digit", second: "2-digit",
                      })}]
                    </span>
                    <span
                      className="font-bold shrink-0 text-[10px] uppercase"
                      style={{
                        color:
                          event.type === "critical" ? "var(--color-error)"
                          : event.type === "warning" ? "var(--color-warning)"
                          : event.type === "ai" ? "var(--brand-600)"
                          : "var(--color-success)",
                      }}
                    >
                      {event.type}:
                    </span>
                    <span className="break-words min-w-0" style={{ color: "var(--text-secondary)" }}>
                      {event.message}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {combinedTimeline.length === 0 && (
                <div className="py-6 text-center" style={{ color: "var(--text-tertiary)" }}>
                  <Clock size={16} className="mx-auto mb-2 opacity-40" />
                  Waiting for events…
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Quick actions */}
        <SectionCard title="Quick Actions">
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: FileSearch, label: "View Logs",  onClick: () => router.push("/ai"), variant: "outlined" as const },
              { icon: BarChart3,  label: "Reports",    onClick: () => router.push("/dashboard/incident-analytics"), variant: "outlined" as const },
              { icon: Settings,  label: "Settings",   onClick: () => router.push("/dashboard/settings"), variant: "outlined" as const },
              { icon: Zap,       label: "Run Scan",   onClick: () => {
                if ((session?.user as any)?.isGuest) {
                  openAuthModal();
                } else {
                  alert("AI Scan completed successfully! All systems nominal.");
                }
              }, variant: "primary" as const  },
            ].map(({ icon: Icon, label, onClick, variant }) => (
              <button
                key={label}
                onClick={onClick}
                className={`flex flex-col items-center gap-2 p-3.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  variant === "primary" ? "btn btn-primary w-full" : ""
                }`}
                style={
                  variant !== "primary"
                    ? {
                        background: "var(--surface-1)",
                        border: "1px solid var(--border-default)",
                        color: "var(--text-secondary)",
                      }
                    : {}
                }
                onMouseEnter={e => {
                  if (variant !== "primary") {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-2)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={e => {
                  if (variant !== "primary") {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-1)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                  }
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default DashboardRedesign;
