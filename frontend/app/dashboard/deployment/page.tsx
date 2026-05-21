"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Box, CheckCircle2, XCircle, Clock, RefreshCw, AlertCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api, unwrap } from "@/services/api";

interface Deployment {
  id: string;
  version: string;
  service: string;
  deployedAt: string;
  deployedBy: string;
  status: "success" | "failed" | "rolling-back";
  commitSha: string;
  changelog: string[];
}

function formatTimeAgo(dateInput: string) {
  try {
    const date = new Date(dateInput);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 0) return "just now";
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch (e) {
    return "recent";
  }
}

export default function DeploymentAnalyticsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeployments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/ops/deployments");
      setDeployments(unwrap(res));
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch deployments:", err);
      setError(err.message || "Failed to load deployments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, []);

  const { successCount, failureCount, successRate } = useMemo(() => {
    const total = deployments.length;
    const success = deployments.filter(d => d.status === "success").length;
    const failure = deployments.filter(d => d.status === "failed").length;
    const rate = total > 0 ? ((success / total) * 100).toFixed(1) : "0.0";
    return { successCount: success, failureCount: failure, successRate: rate };
  }, [deployments]);

  const chartData = useMemo(() => {
    if (deployments.length === 0) {
      return [
        { name: "api-gateway", success: 0, fail: 0 },
        { name: "auth-service", success: 0, fail: 0 },
        { name: "worker-queue", success: 0, fail: 0 },
      ];
    }
    const serviceMap = new Map<string, { name: string; success: number; fail: number }>();
    deployments.forEach((dep) => {
      const serviceName = dep.service;
      if (!serviceMap.has(serviceName)) {
        serviceMap.set(serviceName, { name: serviceName, success: 0, fail: 0 });
      }
      const record = serviceMap.get(serviceName)!;
      if (dep.status === "success") {
        record.success += 1;
      } else if (dep.status === "failed") {
        record.fail += 1;
      }
    });
    return Array.from(serviceMap.values());
  }, [deployments]);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Deployment Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">CI/CD metrics and release tracking.</p>
        </div>
        <button 
          onClick={fetchDeployments}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
          <RefreshCw className="animate-spin text-indigo-500" size={32} />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading deployment analytics...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl border border-rose-100 dark:border-rose-950/30 bg-rose-50/50 dark:bg-rose-950/10 text-center space-y-3">
          <AlertCircle className="mx-auto text-rose-500" size={32} />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Failed to Load Deployments</h3>
          <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
          <button 
            onClick={fetchDeployments}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Success Rate */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/80 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Deployment Status by Service</h2>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      borderColor: '#e2e8f0',
                      borderRadius: '0.75rem',
                      color: '#1e293b'
                    }}
                    itemStyle={{ color: '#1e293b' }}
                  />
                  <Area type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSuccess)" name="Successes" isAnimationActive={false} />
                  <Area type="monotone" dataKey="fail" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorFail)" name="Failures" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="glass-card rounded-2xl p-6 border border-white/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Summary</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total metrics tracking.</p>
            </div>

            <div className="space-y-4 my-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 size={16} className="text-emerald-500" /> Total Successes
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{successCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <XCircle size={16} className="text-rose-500" /> Total Failures
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{failureCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock size={16} className="text-slate-400" /> Avg. Deploy Time
                </div>
                <span className="font-bold text-slate-900 dark:text-white">3m 45s</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium pt-3 border-t border-slate-100 dark:border-slate-800">
              Overall Success Rate: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{successRate}%</span>
            </div>
          </div>

          {/* History List */}
          <div className="lg:col-span-3 glass-card rounded-2xl p-6 border border-white/80 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Deployment History</h2>
              <button 
                onClick={fetchDeployments} 
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                Refresh Log
              </button>
            </div>

            <div className="space-y-3">
              {deployments.map((dep) => (
                <div key={dep.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:border-indigo-100 dark:hover:border-slate-600 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg mt-0.5 ${dep.status === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' : dep.status === 'failed' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600'} border ${dep.status === 'success' ? 'border-emerald-100 dark:border-emerald-900/30' : 'border-rose-100 dark:border-rose-900/30'}`}>
                      <Box size={16} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-white">{dep.version}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold">{dep.commitSha}</span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-medium text-[10px]">{dep.service}</span>
                      </div>
                      <div className="text-slate-400 dark:text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>by <strong className="text-slate-600 dark:text-slate-300 font-medium">{dep.deployedBy}</strong></span>
                        <span>•</span>
                        <span>{formatTimeAgo(dep.deployedAt)}</span>
                      </div>
                      {dep.changelog && dep.changelog.length > 0 && (
                        <div className="mt-2 pl-2 border-l border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[11px] space-y-0.5">
                          {dep.changelog.map((change, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                              <span>{change}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-slate-50 dark:border-slate-750 pt-2 md:pt-0">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] tracking-wider ${dep.status === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600'} border ${dep.status === 'success' ? 'border-emerald-100 dark:border-emerald-900/30' : 'border-rose-100 dark:border-rose-900/30'}`}>
                      {dep.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
              {deployments.length === 0 && (
                <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                  No deployments recorded.
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </motion.div>
  );
}
