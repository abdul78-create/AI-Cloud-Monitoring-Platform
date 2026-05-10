"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, Clock, ArrowRight, Brain, Zap, Terminal } from "lucide-react";

export default function IncidentIntelligencePage() {
  const incidents = [
    { id: "inc-01", title: "API Gateway Latency Spike", status: "active", time: "10 mins ago", severity: "high" },
    { id: "inc-02", title: "Database Connection Pool Exhaustion", status: "resolved", time: "2 hours ago", severity: "critical" },
    { id: "inc-03", title: "Auth Service High CPU", status: "resolved", time: "1 day ago", severity: "medium" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 text-xs font-medium text-indigo-600 mb-2">
          <Brain size={12} />
          <span>AI Root Cause Analysis Active</span>
        </div>
        <h1 className="text-2xl font-bold font-display text-slate-900">Incident Intelligence</h1>
        <p className="text-sm text-slate-500">AI-powered incident investigation and root cause analysis.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Incidents */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border-white/80 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900">Active & Recent Incidents</h2>
            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700">View History</button>
          </div>

          <div className="space-y-3">
            {incidents.map((inc) => (
              <div key={inc.id} className="bg-white border border-slate-100 rounded-xl p-4 hover:border-indigo-100 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${inc.status === 'active' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {inc.status === 'active' ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900">{inc.title}</span>
                      <span className="text-xs text-slate-400 block">{inc.id} • {inc.time}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${inc.severity === 'critical' ? 'bg-rose-50 text-rose-600' : inc.severity === 'high' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                    {inc.severity.toUpperCase()}
                  </span>
                </div>
                
                {inc.status === 'active' && (
                  <div className="mt-3 bg-slate-50 border border-slate-100 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mb-1">
                      <Zap size={12} /> AI Root Cause Analysis
                    </div>
                    <p className="text-xs text-slate-600">The latency spike correlates with a DB write lock on the `users` table. Recommend scaling write-replica.</p>
                    <button className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                      View Investigation <ArrowRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Investigation Workflow */}
        <div className="glass-card rounded-2xl p-6 border-white/80 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Investigation Flow</h2>
            <p className="text-xs text-slate-500">How AI processes incidents.</p>
          </div>

          <div className="space-y-4 my-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">1</div>
              <div>
                <span className="font-bold text-slate-800">Detect & Correlate</span>
                <span className="text-slate-500 block">Groups related alerts.</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">2</div>
              <div>
                <span className="font-bold text-slate-800">Root Cause Analysis</span>
                <span className="text-slate-500 block">Traces origin in logs/metrics.</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">3</div>
              <div>
                <span className="font-bold text-slate-800">Remediation</span>
                <span className="text-slate-500 block">Suggests steps to resolve.</span>
              </div>
            </div>
          </div>

          <button className="w-full bg-slate-900 text-white rounded-xl py-2 text-xs font-semibold hover:bg-indigo-600 transition-all">
            Open Full Workflow
          </button>
        </div>

      </div>
    </div>
  );
}
