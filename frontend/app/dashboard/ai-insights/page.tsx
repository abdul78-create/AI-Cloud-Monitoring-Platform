"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Sparkles, TrendingUp, Shield, Zap, AlertTriangle,
  CheckCircle2, ArrowRight, RefreshCw, Activity
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, CartesianGrid
} from "recharts";
import { useLiveEngineStore } from "@/hooks/useLiveEngine";

/* ── Custom Chart Tooltip ── */
function ChartTooltip({ active, payload, label }: any) {
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
          <span className="font-semibold" style={{ color: p.color }}>{p.value}</span>
          <span style={{ color: "var(--text-tertiary)" }}>%</span>
        </p>
      ))}
    </div>
  );
}

const PRIORITY_STYLES: Record<string, { bg: string; border: string; badgeClass: string; icon: React.ElementType; color: string }> = {
  critical: { bg: "var(--color-error-bg)",   border: "1px solid var(--color-error-border)",   badgeClass: "badge badge-critical", icon: Shield,        color: "var(--color-error)" },
  high:     { bg: "var(--color-warning-bg)", border: "1px solid var(--color-warning-border)", badgeClass: "badge badge-warning",  icon: AlertTriangle, color: "var(--color-warning)" },
  medium:   { bg: "var(--brand-50)",          border: "1px solid var(--border-default)",       badgeClass: "badge badge-live",     icon: Zap,           color: "var(--brand-600)" },
  low:      { bg: "var(--color-success-bg)", border: "1px solid var(--color-success-border)", badgeClass: "badge badge-success",  icon: CheckCircle2,  color: "var(--color-success)" },
};

const PIE_COLORS = ["var(--color-success)", "var(--color-warning)", "var(--color-error)"];

export default function AIInsightsPage() {
  const { liveMetrics, aiInsights } = useLiveEngineStore();
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const trendData = useMemo(() => {
    if (liveMetrics.length < 2) return [];
    return liveMetrics.slice(-24).map((m, i) => ({
      name: `T-${24 - i}`,
      cpu: m.cpu,
      mem: m.memory,
    }));
  }, [liveMetrics]);

  useEffect(() => {
    if (liveMetrics.length > 0) {
      setLastRefreshed(new Date());
    }
  }, [liveMetrics]);

  const criticals = aiInsights.filter(i => i.priority === 'critical').length;
  const highs     = aiInsights.filter(i => i.priority === 'high').length;

  const pieData = [
    { name: "Optimal", value: Math.max(0, aiInsights.length - highs - criticals) },
    { name: "Warning", value: highs },
    { name: "Critical", value: criticals },
  ];

  const healthScore = Math.max(30, Math.round(100 - (criticals * 20) - (highs * 8)));

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2"
            style={{
              background: "var(--brand-50)",
              border: "1px solid var(--border-default)",
              color: "var(--brand-600)",
            }}
          >
            <Sparkles size={11} />
            AI Operations Core Active
          </div>
          <h1 className="heading-page">AI Insights & Diagnostics</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Intelligent predictive heuristics, anomalies categorization, and cascading failure alerts
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
          <RefreshCw size={12} className="animate-spin text-blue-500" />
          <span>Syncing {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
        </div>
      </div>

      {/* ── Top Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Resource trend */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="heading-section">Resource Performance Velocity</h3>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Correlated CPU and memory utilization trendlines</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded"
              style={{ background: "var(--color-success-bg)", color: "var(--color-success)" }}
            >
              <TrendingUp size={10} /> Syncing
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="aiInsightsCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand-600)" stopOpacity={0.10} />
                    <stop offset="100%" stopColor="var(--brand-600)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="aiInsightsMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--border-subtle)" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="cpu" name="CPU" stroke="var(--brand-600)" strokeWidth={1.8}
                  fill="url(#aiInsightsCpu)" dot={false} isAnimationActive={false} />
                <Area type="monotone" dataKey="mem" name="Memory" stroke="#8b5cf6" strokeWidth={1.8}
                  fill="url(#aiInsightsMem)" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stability Index score card */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <h3 className="heading-section">Stability Index</h3>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>AI operational confidence score</p>
          </div>

          <div className="flex-1 flex items-center justify-center relative my-2">
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={46}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    isAnimationActive={false}
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute text-center pointer-events-none">
              <div className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>{healthScore}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>stability</div>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            {[
              { label: "Optimal", tc: "var(--color-success)", bc: "var(--color-success)" },
              { label: "Warning", tc: "var(--color-warning)", bc: "var(--color-warning)" },
              { label: "Critical", tc: "var(--color-error)",   bc: "var(--color-error)" },
            ].map((item, idx) => (
              <div key={item.label} className="flex justify-between items-center py-0.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-sm" style={{ background: item.bc }} />
                  <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                </div>
                <span className="font-bold tabular-nums" style={{ color: item.tc }}>{pieData[idx].value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Active Heuristic Alerts Grid ── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain size={14} style={{ color: "var(--brand-600)" }} />
            <h3 className="heading-section">Active Heuristic Diagnostics</h3>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--brand-600)", animation: "live-ping 2s ease infinite" }} />
          </div>
          <span className="text-xs font-semibold" style={{ color: "var(--text-tertiary)" }}>
            {aiInsights.length} operational signals
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {aiInsights.slice(0, 9).map((insight) => {
              const styleSet = PRIORITY_STYLES[insight.priority] || PRIORITY_STYLES.medium;
              const Icon = styleSet.icon;

              return (
                <motion.div
                  key={insight.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="p-4 rounded-lg flex flex-col justify-between gap-3"
                  style={{
                    background: styleSet.bg,
                    border: styleSet.border,
                  }}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2.5">
                      <div className="p-1 rounded-md flex items-center justify-center" style={{ background: "var(--surface-0)", color: styleSet.color }}>
                        <Icon size={13} />
                      </div>
                      <span className={`${styleSet.badgeClass} text-[9px] px-1.5 py-0.5`}>
                        {insight.priority}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold mb-1" style={{ color: "var(--text-primary)" }}>{insight.title}</h4>
                    <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{insight.detail}</p>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    {insight.action ? (
                      <button className="text-[10px] font-bold flex items-center gap-0.5 transition-opacity" style={{ color: styleSet.color }}>
                        {insight.action} <ArrowRight size={8} />
                      </button>
                    ) : (
                      <div />
                    )}
                    <span className="text-[10px] flex items-center gap-1 font-semibold" style={{ color: "var(--text-tertiary)" }}>
                      <Activity size={9} /> {insight.confidence}% confidence
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
