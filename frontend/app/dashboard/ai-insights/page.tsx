"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, TrendingUp, Shield, Zap, AlertTriangle, CheckCircle2, ArrowRight, BarChart3, Clock, Cpu, Database } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const mockTrendData = [
  { name: "Mon", cpu: 40, mem: 60 },
  { name: "Tue", cpu: 45, mem: 65 },
  { name: "Wed", cpu: 55, mem: 70 },
  { name: "Thu", cpu: 50, mem: 68 },
  { name: "Fri", cpu: 70, mem: 85 },
  { name: "Sat", cpu: 35, mem: 55 },
  { name: "Sun", cpu: 40, mem: 60 },
];

const pieData = [
  { name: "Optimal", value: 70 },
  { name: "Warning", value: 20 },
  { name: "Critical", value: 10 },
];

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

export default function AIInsightsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
          <Sparkles size={12} className="text-indigo-600 dark:text-indigo-400" />
          <span>Powered by Ollama Llama3</span>
        </div>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">AI Insights Center</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Predictive analytics and intelligent recommendations for your stack.</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main AI Summary */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Predictive Resource Trend</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">AI forecasted usage for the next 7 days.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={14} /> Confidence: 94%
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendData}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="cpu" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" name="Predicted CPU" />
                <Area type="monotone" dataKey="mem" stroke="#a78bfa" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" name="Predicted Memory" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Score Pie */}
        <div className="glass-card rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Infrastructure Health</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI assessment of overall stability.</p>
          </div>

          <div className="h-[200px] flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">85%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Score</div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-emerald-500" /> Optimal Nodes</div>
              <span className="font-bold">70%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-amber-500" /> Warning State</div>
              <span className="font-bold">20%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-rose-500" /> Critical Alert</div>
              <span className="font-bold">10%</span>
            </div>
          </div>
        </div>

        {/* Recommendations List */}
        <div className="lg:col-span-3 glass-card rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">AI Recommendations</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1 */}
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4 hover:border-indigo-100 dark:hover:border-indigo-500 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <Zap size={16} />
                </div>
                <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">High Impact</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Scale Down Idle DB Replica</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">The write-replica has been under 20% utilization for 5 days. Scaling down can save $120/mo.</p>
              <button className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
                Apply Fix <ArrowRight size={12} />
              </button>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4 hover:border-indigo-100 dark:hover:border-indigo-500 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={16} />
                </div>
                <span className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">Medium</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">API Gateway Latency Spike</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Detected a 1.2s latency increase on /v1/users. Likely caused by unindexed DB query.</p>
              <button className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
                Investigate <ArrowRight size={12} />
              </button>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4 hover:border-indigo-100 dark:hover:border-indigo-500 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                  <Shield size={16} />
                </div>
                <span className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold px-2 py-0.5 rounded-full">Critical</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Suspicious Access Pattern</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">IP 192.168.1.45 attempted 50 invalid logins in 2 mins. AI recommends blocking IP.</p>
              <button className="mt-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1">
                Block IP <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
