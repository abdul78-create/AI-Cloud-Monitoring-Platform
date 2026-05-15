"use client";

import React from "react";
import { motion } from "framer-motion";
import { BarChart3, Shield, Clock, TrendingUp, Filter, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const data = [
  { name: "Mon", incidents: 4, mttr: 12 },
  { name: "Tue", incidents: 2, mttr: 8 },
  { name: "Wed", incidents: 8, mttr: 24 },
  { name: "Thu", incidents: 5, mttr: 15 },
  { name: "Fri", incidents: 3, mttr: 10 },
  { name: "Sat", incidents: 1, mttr: 5 },
  { name: "Sun", incidents: 2, mttr: 6 },
];

export default function IncidentAnalyticsPage() {
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Incident Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track MTTR, threat history, and anomaly trends.</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 shadow-sm">
            <Filter size={14} /> Filter
          </button>
          <button className="rounded-xl bg-slate-900 dark:bg-slate-100 px-4 py-2 text-sm font-semibold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all flex items-center gap-2 shadow-sm">
            <Download size={14} /> Export Data
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Incidents Per Day */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border-white/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Incidents Per Day</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    borderColor: '#e2e8f0',
                    borderRadius: '0.5rem'
                  }}
                  itemStyle={{ color: '#1e293b' }}
                />
                <Bar dataKey="incidents" fill="#0f172a" radius={[4, 4, 0, 0]} name="Incidents" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MTTR Card */}
        <div className="glass-card rounded-2xl p-6 border-white/80 dark:border-slate-800 shadow-sm flex flex-col justify-between bg-white dark:bg-slate-900">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mean Time To Resolution</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Average time to fix incidents.</p>
          </div>

          <div className="text-center my-6">
            <div className="text-5xl font-bold text-slate-900 dark:text-white font-display">11.4<span className="text-3xl text-slate-400 dark:text-slate-500">m</span></div>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">↓ 14% from last week</p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Critical Incidents</span>
              <span className="font-semibold text-slate-900 dark:text-white">22m avg</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Warning Alerts</span>
              <span className="font-semibold text-slate-900 dark:text-white">5m avg</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Auto-Resolved</span>
              <span className="font-semibold text-slate-900 dark:text-white">65%</span>
            </div>
          </div>
        </div>

        {/* Anomaly Trends */}
        <div className="lg:col-span-3 glass-card rounded-2xl p-6 border-white/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Anomaly Trends (MTTR over time)</h2>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    borderColor: '#e2e8f0',
                    borderRadius: '0.5rem'
                  }}
                  itemStyle={{ color: '#1e293b' }}
                />
                <Line type="monotone" dataKey="mttr" stroke="#0f172a" strokeWidth={3} dot={{ r: 4 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
