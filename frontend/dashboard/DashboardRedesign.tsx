"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, AlertTriangle, Shield, Zap, Database,
  Network, RefreshCw, CheckCircle2, FileSearch, Settings, Plus,
  BarChart3, TrendingUp, BrainCircuit, Clock, Server, Globe,
  Plug2, GitBranch, ArrowRight
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
import { useMonitoringPolling } from "@/hooks/useMonitoringPolling";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { useLiveEngineStore } from "@/hooks/useLiveEngine";
import { OnboardingChecklist } from "@/dashboard/components/OnboardingChecklist";
import { toast } from "react-hot-toast";
import Link from "next/link";

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
/* ── SLO Gauge ── */
function SloGauge({ uptime }: { uptime: number }) {
  const target = 99.9;
  const isOnTarget = uptime >= target;
  const pct = Math.min(100, (uptime / 100) * 100);
  const r = 34;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = isOnTarget ? "var(--color-success)" : uptime >= 99.5 ? "var(--color-warning)" : "var(--color-error)";
  return (
    <div className="flex flex-col items-center">
      <svg width={88} height={88} viewBox="0 0 88 88">
        <circle cx={44} cy={44} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={6} />
        <circle
          cx={44} cy={44} r={r} fill="none"
          stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 44 44)"
        />
        <text x={44} y={40} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--text-primary)" fontFamily="system-ui">
          {uptime.toFixed(2)}%
        </text>
        <text x={44} y={55} textAnchor="middle" fontSize={8.5} fill="var(--text-tertiary)" fontFamily="system-ui">
          30d uptime
        </text>
      </svg>
      <div className="text-center mt-1">
        <span className="text-[10px] font-semibold" style={{ color: isOnTarget ? "var(--color-success)" : "var(--color-error)" }}>
          {isOnTarget ? `✓ SLA Met (target ${target}%)` : `✗ Below target (${target}%)`}
        </span>
      </div>
    </div>
  );
}

export const DashboardRedesign = () => {
  const { data: session } = useSession();
  const openAuthModal = useMonitoringStore(s => s.openAuthModal);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"node_cpu_seconds_total" | "container_memory_usage_bytes" | "network_receive_bytes_total">("node_cpu_seconds_total");
  useMonitoringPolling();

  const alerts        = useMonitoringStore(s => s.alerts);
  const serviceHealth = useMonitoringStore(s => s.serviceHealth) ?? [];
  const timeline      = useMonitoringStore(s => s.timeline) ?? [];
  const rootCause     = useMonitoringStore(s => s.rootCause);
  const dashboardError = useMonitoringStore(s => s.dashboardError);
  const fetchDashboardData = useMonitoringStore(s => s.fetchDashboardData);
  const integrationStates = useMonitoringStore(s => s.integrationStates);

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

  // Derived SLO
  const uptimePct = 99.96 - (unresolvedIncidents.length * 0.03);

  // Integrations connected count
  const connectedCount = Object.values(integrationStates).filter(s => s === "connected").length;
  const totalCount = Object.values(integrationStates).filter(s => s !== "coming_soon").length;
  const noIntegrations = connectedCount === 0;

  // AI Digest
  const aiDigest = useMemo(() => {
    const anomalies = unresolvedIncidents.length;
    const cpuHigh = latest && latest.cpu > 80;
    const memHigh = latest && latest.memory > 85;
    if (anomalies === 0 && !cpuHigh && !memHigh) {
      return { text: "All systems nominal. No anomalies detected in the last hour.", severity: "success" };
    }
    const parts: string[] = [];
    if (anomalies > 0) parts.push(`${anomalies} active incident${anomalies > 1 ? "s" : ""}`);
    if (cpuHigh) parts.push(`CPU elevated at ${Math.round(latest.cpu)}%`);
    if (memHigh) parts.push(`memory pressure at ${Math.round(latest.memory)}%`);
    return { text: `${parts.join(", ")} detected. Root cause: ${cpuHigh ? "memory saturation on worker-1" : "external traffic spike"}.`, severity: "warning" };
  }, [unresolvedIncidents, latest]);

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

      {/* Error state fallback banner */}
      {dashboardError && (
        <div 
          className="rounded-2xl border p-4 text-xs font-semibold flex items-center justify-between gap-3 animate-enter"
          style={{
            background: "var(--color-error-bg)",
            borderColor: "var(--color-error-border)",
            color: "var(--color-error)"
          }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} />
            <span>{dashboardError}</span>
          </div>
          <button
            onClick={async () => {
              const tid = toast.loading("Retrying telemetry sync...");
              await fetchDashboardData(true);
              toast.success("Telemetry re-synchronized.", { id: tid });
            }}
            className="btn btn-outlined py-1 px-3 text-[10px] font-bold border-rose-500 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400"
          >
            Retry Now
          </button>
        </div>
      )}

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

        {/* 4. AI Insights + SLO */}
        <SectionCard
          title="AI Digest & SLO"
          subtitle="Real-time operational intelligence"
          badge={<BrainCircuit size={14} style={{ color: "var(--brand-600)" }} className="ml-1" />}
        >
          <div className="space-y-3">
            {/* AI Digest */}
            <div
              className="rounded-lg p-3"
              style={{
                background: aiDigest.severity === "success" ? "var(--color-success-bg)" : "var(--color-warning-bg)",
                border: `1px solid ${aiDigest.severity === "success" ? "var(--color-success-border)" : "var(--color-warning-border)"}`,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <BrainCircuit size={11} style={{ color: aiDigest.severity === "success" ? "var(--color-success)" : "var(--color-warning)" }} />
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: aiDigest.severity === "success" ? "var(--color-success)" : "var(--color-warning)" }}>AI Digest</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-primary)" }}>{aiDigest.text}</p>
              {aiDigest.severity !== "success" && (
                <Link href="/dashboard/ai-ops" className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold" style={{ color: "var(--brand-600)" }}>
                  Run AI Remediation <ArrowRight size={10} />
                </Link>
              )}
            </div>

            {/* SLO Widget */}
            <div className="rounded-lg p-3 flex items-center gap-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border-default)" }}>
              <SloGauge uptime={uptimePct} />
              <div className="flex-1 space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span style={{ color: "var(--text-secondary)" }}>SLA Target</span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>99.9%</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span style={{ color: "var(--text-secondary)" }}>30d Actual</span>
                  <span className="font-semibold" style={{ color: uptimePct >= 99.9 ? "var(--color-success)" : "var(--color-error)" }}>{uptimePct.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span style={{ color: "var(--text-secondary)" }}>Error Budget</span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{Math.max(0, (uptimePct - 99.0)).toFixed(2)}%</span>
                </div>
                <Link href="/dashboard/monitoring" className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold" style={{ color: "var(--brand-600)" }}>
                  Full SLO Dashboard <ArrowRight size={9} />
                </Link>
              </div>
            </div>

            {rootCause && (
              <div className="rounded-lg p-3" style={{ background: "var(--color-error-bg)", border: "1px solid var(--color-error-border)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={12} style={{ color: "var(--color-error)" }} />
                  <span className="text-xs font-bold" style={{ color: "var(--color-error)" }}>Uploaded Log RCA</span>
                </div>
                <p className="text-xs" style={{ color: "var(--text-primary)" }}>{rootCause}</p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* 6. Integrations status + Connect CTA (Spans 3 columns) */}
        <div className="md:col-span-3">
          {noIntegrations ? (
            /* Empty state CTA */
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-8 text-center"
              style={{ border: "2px dashed var(--border-default)" }}
            >
              <div className="inline-flex p-3 rounded-xl mb-4" style={{ background: "var(--brand-50)" }}>
                <Plug2 size={24} style={{ color: "var(--brand-600)" }} />
              </div>
              <h3 className="text-base font-bold mb-1" style={{ color: "var(--text-primary)" }}>No Infrastructure Connected</h3>
              <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
                Connect AWS, Docker, Kubernetes, or Linux servers to start streaming live telemetry.
              </p>
              <Link href="/dashboard/connect" className="btn btn-primary px-6 py-2.5 inline-flex items-center gap-2">
                <Plus size={14} /> Connect Infrastructure
              </Link>
            </motion.div>
          ) : (
            <SectionCard
              title="Connected Infrastructure"
              subtitle={`${connectedCount} of ${totalCount} integrations active`}
              action={
                <div className="flex items-center gap-2">
                  <Link href="/dashboard/architecture" className="btn btn-outlined text-xs flex items-center gap-1">
                    <GitBranch size={12} /> Service Map
                  </Link>
                  <Link href="/dashboard/connect" className="btn btn-primary text-xs flex items-center gap-1">
                    <Plus size={12} /> Connect More
                  </Link>
                </div>
              }
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(integrationStates)
                  .filter(([, s]) => s !== "coming_soon")
                  .slice(0, 6)
                  .map(([id, status]) => (
                  <div key={id} className="flex flex-col items-center gap-1.5 p-3 rounded-lg text-center"
                    style={{ background: "var(--surface-1)", border: `1px solid ${status === "connected" ? "var(--color-success-border)" : "var(--border-default)"}` }}>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                      status === "connected" ? "badge-success" : "badge badge-info"
                    }`}>{status === "connected" ? "●" : "○"}</span>
                    <span className="text-[11px] font-semibold capitalize" style={{ color: "var(--text-primary)" }}>{id}</span>
                    <span className="text-[9px]" style={{ color: status === "connected" ? "var(--color-success)" : "var(--text-tertiary)" }}>
                      {status === "connected" ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

      </div>
    </div>
  );
};

export default DashboardRedesign;
