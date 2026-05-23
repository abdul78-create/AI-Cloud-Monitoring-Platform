"use client";

import React, { useState } from "react";
import { Play, PlayCircle, X, ChevronRight, Server, AlertTriangle, Database, Activity, Cpu, Box, Network } from "lucide-react";

export function ScenarioController() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const runScenario = async (scenarioId: string) => {
    setStatus(`Triggering ${scenarioId}...`);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/scenarios/trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId }),
      });
      if (res.ok) {
        setStatus("Scenario triggered! Watch the dashboard.");
        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus("Failed to trigger scenario.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Error triggering scenario.");
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-transform hover:scale-105"
      >
        <PlayCircle size={18} />
        <span className="text-sm font-semibold">Demo Scenarios</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Play size={14} className="text-indigo-500" />
          Recruiter Demo Hub
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Trigger authentic end-to-end operational flows to evaluate platform behavior.
        </p>

        <button
          onClick={() => runScenario("agent-lifecycle")}
          className="w-full text-left group p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Server size={14} className="text-indigo-500" />
              Flow 1: Agent Lifecycle
            </span>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-indigo-500 transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Agent installs → Streams metrics → CPU Spike → Alert fires → AI RCA generated.
          </p>
        </button>

        <button
          onClick={() => runScenario("incident-recovery")}
          className="w-full text-left group p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-400 dark:hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle size={14} className="text-rose-500" />
              Flow 2: Incident Recovery
            </span>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-rose-500 transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Critical Alert → AI Correlation → SSH Execution (Restart DB) → Metrics Recover → Resolved.
          </p>
        </button>

        <button
          onClick={() => runScenario("redis-failure")}
          className="w-full text-left group p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Database size={14} className="text-orange-500" />
              Redis Cache Failure
            </span>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Spikes cache latency to 850ms, drops hit rate. Triggers RCA on Redis tier.
          </p>
        </button>

        <button
          onClick={() => runScenario("api-latency")}
          className="w-full text-left group p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity size={14} className="text-blue-500" />
              API Gateway Latency
            </span>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-blue-500 transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Spikes API latency to 2500ms, pushes error rate to 8%. PagerDuty alert generated.
          </p>
        </button>

        <button
          onClick={() => runScenario("memory-leak")}
          className="w-full text-left group p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu size={14} className="text-purple-500" />
              Node Memory Leak
            </span>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-purple-500 transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Simulates a memory leak pushing util to 99%. Triggers OOM critical alert.
          </p>
        </button>

        <button
          onClick={() => runScenario("container-crash")}
          className="w-full text-left group p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Box size={14} className="text-emerald-500" />
              Container Crash Loop
            </span>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-emerald-500 transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Spikes container restart count to 45. AI flags as bad deployment.
          </p>
        </button>

        <button
          onClick={() => runScenario("network-degradation")}
          className="w-full text-left group p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-pink-400 dark:hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Network size={14} className="text-pink-500" />
              Network Degradation
            </span>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-pink-500 transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Introduces 15% packet loss on Load Balancer. Triggers warning alert.
          </p>
        </button>

        {status && (
          <div className="text-xs text-center font-medium text-emerald-600 dark:text-emerald-400 animate-pulse">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
