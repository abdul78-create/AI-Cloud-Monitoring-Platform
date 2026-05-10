"use client";

import React, { useEffect } from "react";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { Server, Globe, Shield, Zap, Search, Filter, HardDrive, Cpu } from "lucide-react";

export default function InfrastructurePage() {
  const { infrastructure, fetchDashboardData, initSocket } = useMonitoringStore();

  useEffect(() => {
    fetchDashboardData(true);
    initSocket();
  }, [fetchDashboardData, initSocket]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Infrastructure Inventory</h1>
          <p className="text-sm text-slate-500">Manage and monitor all registered nodes.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search servers..."
              className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm bg-white transition-all w-64"
            />
          </div>
          <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      {/* Grid or Table */}
      <div className="glass-card rounded-2xl border-white/80 shadow-sm overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs uppercase text-slate-500 bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold">Node</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">IP Address</th>
                <th className="px-6 py-4 font-bold">OS</th>
                <th className="px-6 py-4 font-bold">Environment</th>
                <th className="px-6 py-4 font-bold">Tags</th>
              </tr>
            </thead>
            <tbody>
              {infrastructure.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No servers registered yet. Run the agent to see them here.
                  </td>
                </tr>
              ) : (
                infrastructure.map((node: any, i: number) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${node.status === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        <Server size={16} />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{node.service}</span>
                        <span className="text-xs text-slate-400">ID: node-{i + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${node.status === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${node.status === 'online' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {node.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{node.ip || "127.0.0.1"}</td>
                    <td className="px-6 py-4 text-xs">{node.os || "Linux"}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${node.environment === 'Production' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                        {node.environment || "Production"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {(node.tags || ["backend", "api"]).map((tag: string, j: number) => (
                          <span key={j} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
