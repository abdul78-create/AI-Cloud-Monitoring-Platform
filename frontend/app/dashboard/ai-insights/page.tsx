"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Sparkles, TrendingUp, Shield, Zap, AlertTriangle,
  CheckCircle2, ArrowRight, Clock, RefreshCw, Activity
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { useLiveEngineStore } from "@/hooks/useLiveEngine";

const PRIORITY_STYLES: Record<string, { bg: string; border: string; badge: string; icon: React.ElementType; iconColor: string }> = {
  critical: { bg:"bg-rose-500/5", border:"border-rose-500/20", badge:"bg-rose-500/10 text-rose-400 border-rose-500/20", icon:Shield, iconColor:"text-rose-400" },
  high:     { bg:"bg-amber-500/5", border:"border-amber-500/20", badge:"bg-amber-500/10 text-amber-400 border-amber-500/20", icon:AlertTriangle, iconColor:"text-amber-400" },
  medium:   { bg:"bg-blue-500/5",  border:"border-blue-500/20",  badge:"bg-blue-500/10 text-blue-400 border-blue-500/20",   icon:Zap, iconColor:"text-blue-400" },
  low:      { bg:"bg-emerald-500/5", border:"border-emerald-500/20", badge:"bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon:CheckCircle2, iconColor:"text-emerald-400" },
};

const PIE_COLORS = ["#10b981","#f59e0b","#ef4444"];

export default function AIInsightsPage() {
  const { liveMetrics, aiInsights } = useLiveEngineStore();
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [trendData, setTrendData] = useState<any[]>([]);

  // Build trend chart from live metrics
  useEffect(() => {
    if (liveMetrics.length < 2) return;
    setTrendData(
      liveMetrics.slice(-20).map((m, i) => ({
        i,
        cpu: m.cpu,
        mem: m.memory,
        net: Math.round(m.network / 10), // scale for chart
      }))
    );
    setLastRefreshed(new Date());
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 text-xs font-medium text-indigo-400 mb-2">
            <Sparkles size={12} />
            Powered by AI Operations Engine
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Insights Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">Predictive analytics and intelligent recommendations — live</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <RefreshCw size={12} className="animate-spin" />
          Updated {lastRefreshed.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})}
        </div>
      </div>

      {/* Top grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Trend chart */}
        <div className="lg:col-span-2 bg-white/5 dark:bg-white/[0.03] border border-white/10 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Live Resource Trend</h2>
              <p className="text-xs text-slate-500">Real-time CPU, Memory & Network</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2.5 py-0.5">
              <TrendingUp size={12} /> Live
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="aiCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="aiMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="i" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip
                  contentStyle={{ background:'#0f172a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, fontSize:11 }}
                  labelStyle={{ color:'#94a3b8' }}
                  itemStyle={{ color:'#e2e8f0' }}
                />
                <Area type="monotone" dataKey="cpu" name="CPU %" stroke="#818cf8" strokeWidth={2}
                  fill="url(#aiCpu)" dot={false} isAnimationActive={false} />
                <Area type="monotone" dataKey="mem" name="Mem %" stroke="#a78bfa" strokeWidth={2}
                  fill="url(#aiMem)" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health score */}
        <div className="bg-white/5 dark:bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex flex-col">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Health Score</h2>
            <p className="text-xs text-slate-500">AI-assessed stability</p>
          </div>
          <div className="flex-1 flex items-center justify-center relative">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={52} outerRadius={70} paddingAngle={4} dataKey="value" startAngle={90} endAngle={-270} isAnimationActive={false}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute text-center pointer-events-none">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{healthScore}</div>
              <div className="text-xs text-slate-500 font-medium">/ 100</div>
            </div>
          </div>
          <div className="space-y-1.5 text-xs mt-2">
            {[["Optimal","text-emerald-400","bg-emerald-400"],["Warning","text-amber-400","bg-amber-400"],["Critical","text-rose-400","bg-rose-400"]].map(([label, tc, bc], i) => (
              <div key={label} className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <div className={`h-2 w-2 rounded-sm ${bc}`} />
                  <span className="text-slate-400">{label}</span>
                </div>
                <span className={`font-bold ${tc}`}>{pieData[i].value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live AI Insights */}
      <div className="bg-white/5 dark:bg-white/[0.03] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">AI Recommendations</h2>
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          </div>
          <span className="text-xs text-slate-500">{aiInsights.length} insights active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {aiInsights.slice(0, 9).map((insight) => {
              const s = PRIORITY_STYLES[insight.priority];
              const Icon = s.icon;
              return (
                <motion.div
                  key={insight.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className={`rounded-xl border p-4 ${s.bg} ${s.border} hover:brightness-110 transition-all`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className={`p-1.5 rounded-lg bg-white/5 ${s.iconColor}`}>
                      <Icon size={14} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${s.badge}`}>
                      {insight.priority}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{insight.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{insight.detail}</p>
                  <div className="flex items-center justify-between">
                    {insight.action && (
                      <button className={`text-xs font-semibold flex items-center gap-1 ${s.iconColor} hover:opacity-80 transition-opacity`}>
                        {insight.action} <ArrowRight size={10} />
                      </button>
                    )}
                    <span className="text-[10px] text-slate-600 flex items-center gap-1">
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
