"use client";

import React from "react";
import { motion } from "framer-motion";
import { BarChart3, Database, Cpu, Globe, Server, Download, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const data = [
  { name: "Jan", cpu: 65, mem: 40, net: 2400 },
  { name: "Feb", cpu: 59, mem: 45, net: 2210 },
  { name: "Mar", cpu: 80, mem: 60, net: 2290 },
  { name: "Apr", cpu: 81, mem: 65, net: 2000 },
  { name: "May", cpu: 56, mem: 40, net: 2181 },
  { name: "Jun", cpu: 55, mem: 45, net: 2500 },
  { name: "Jul", cpu: 40, mem: 35, net: 2100 },
];

export default function InfrastructureAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Infrastructure Analytics</h1>
          <p className="text-sm text-slate-500">Deep dive into historical performance and resource utilization.</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
            <Filter size={14} /> Filter
          </button>
          <button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm shadow-indigo-100">
            <Download size={14} /> Export Data
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Resource Utilization */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border-white/80 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Resource Utilization</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="cpu" fill="#4f46e5" radius={[4, 4, 0, 0]} name="CPU %" />
                <Bar dataKey="mem" fill="#a78bfa" radius={[4, 4, 0, 0]} name="Memory %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Efficiency Score */}
        <div className="glass-card rounded-2xl p-6 border-white/80 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Efficiency Score</h2>
            <p className="text-xs text-slate-500">How well resources are utilized.</p>
          </div>

          <div className="text-center my-6">
            <div className="text-5xl font-bold text-slate-900 font-display">92<span className="text-3xl text-slate-400">/100</span></div>
            <p className="text-sm text-emerald-600 font-medium mt-1">Excellent Efficiency</p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>CPU Oversupply</span>
              <span className="font-semibold text-slate-900">Low (8%)</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Memory Waist</span>
              <span className="font-semibold text-slate-900">Medium (15%)</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Idle Instances</span>
              <span className="font-semibold text-slate-900">2 Nodes</span>
            </div>
          </div>
          
          <button className="w-full mt-4 bg-slate-900 text-white rounded-xl py-2 text-xs font-semibold hover:bg-indigo-600 transition-all">
            Optimize Resources
          </button>
        </div>

        {/* Network Traffic */}
        <div className="lg:col-span-3 glass-card rounded-2xl p-6 border-white/80 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Network Traffic (MB/s)</h2>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="net" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
