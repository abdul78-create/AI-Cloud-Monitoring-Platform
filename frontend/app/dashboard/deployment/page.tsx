"use client";

import React from "react";
import { motion } from "framer-motion";
import { Box, CheckCircle2, XCircle, Clock, GitBranch, GitCommit, GitMerge, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "W1", success: 12, fail: 1 },
  { name: "W2", success: 15, fail: 0 },
  { name: "W3", success: 10, fail: 2 },
  { name: "W4", success: 18, fail: 0 },
  { name: "W5", success: 14, fail: 1 },
];

export default function DeploymentAnalyticsPage() {
  const deployments = [
    { id: "dep-124", version: "v1.2.4", status: "success", time: "2 hours ago", author: "alex_chen" },
    { id: "dep-123", version: "v1.2.3", status: "success", time: "1 day ago", author: "sarah_j" },
    { id: "dep-122", version: "v1.2.2", status: "failed", time: "2 days ago", author: "m_abdul" },
    { id: "dep-121", version: "v1.2.1", status: "success", time: "3 days ago", author: "alex_chen" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900">Deployment Analytics</h1>
        <p className="text-sm text-slate-500">CI/CD metrics and release tracking.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Success Rate */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border-white/80 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Deployment Success Rate</h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFail" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSuccess)" name="Successes" />
                <Area type="monotone" dataKey="fail" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorFail)" name="Failures" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="glass-card rounded-2xl p-6 border-white/80 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Summary</h2>
            <p className="text-xs text-slate-500">Last 30 days.</p>
          </div>

          <div className="space-y-4 my-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 size={16} className="text-emerald-500" /> Total Successes
              </div>
              <span className="font-bold text-slate-900">69</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <XCircle size={16} className="text-rose-500" /> Total Failures
              </div>
              <span className="font-bold text-slate-900">4</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock size={16} className="text-slate-400" /> Avg. Deploy Time
              </div>
              <span className="font-bold text-slate-900">3m 45s</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 text-center font-medium">
            Overall Success Rate: <span className="text-emerald-600 font-bold">94.5%</span>
          </div>
        </div>

        {/* History List */}
        <div className="lg:col-span-3 glass-card rounded-2xl p-6 border-white/80 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900">Deployment History</h2>
            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700">View All</button>
          </div>

          <div className="space-y-2">
            {deployments.map((dep) => (
              <div key={dep.id} className="bg-white border border-slate-100 rounded-xl p-3 flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${dep.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <Box size={14} />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">{dep.version}</span>
                    <span className="text-slate-400 block">by {dep.author}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-bold ${dep.status === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>{dep.status.toUpperCase()}</span>
                  <span className="text-slate-400 block">{dep.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
