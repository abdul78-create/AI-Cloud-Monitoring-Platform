"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck, Lock, Unlock, Eye, EyeOff, AlertTriangle, Terminal, Globe } from "lucide-react";

export default function SecurityCenterPage() {
  const threats = [
    { id: 1, type: "Brute Force", source: "192.168.1.45", severity: "critical", time: "10 mins ago" },
    { id: 2, type: "SQL Injection", source: "203.0.113.5", severity: "high", time: "1 hour ago" },
    { id: 3, type: "DDoS Attempt", source: "Multiple", severity: "medium", time: "2 hours ago" },
    { id: 4, type: "Port Scan", source: "198.51.100.12", severity: "low", time: "5 hours ago" },
  ];

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Security Center</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">AI-powered cloud security and threat detection.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Security Score */}
        <div className="glass-card rounded-2xl p-6 border-white/80 dark:border-slate-800 shadow-sm flex flex-col justify-between bg-gradient-to-br from-white dark:from-slate-900 to-slate-50 dark:to-slate-900/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security Score</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Based on active threats and configs.</p>
          </div>

          <div className="text-center my-6">
            <div className="text-6xl font-bold text-emerald-600 font-display">A+</div>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">Excellent Protection</p>
          </div>

          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Threats Blocked: 1,240</span>
            <span>Active Shields: 5/5</span>
          </div>
        </div>

        {/* Active Threats */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border-white/80 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Threats</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Flagged by AI engine.</p>
            </div>
            <button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">View All</button>
          </div>

          <div className="space-y-3">
            {threats.map((threat) => (
              <div key={threat.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${threat.severity === 'critical' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600' : threat.severity === 'high' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'}`}>
                    <ShieldAlert size={14} />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white">{threat.type}</span>
                    <span className="text-slate-500 dark:text-slate-400 block">Source: {threat.source}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-bold uppercase ${threat.severity === 'critical' ? 'text-rose-600' : threat.severity === 'high' ? 'text-amber-600' : 'text-blue-600'}`}>{threat.severity}</span>
                  <span className="text-slate-400 block">{threat.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attack Map Mock */}
        <div className="lg:col-span-3 glass-card rounded-2xl p-6 border-white/80 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Attack Map</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time visualization of blocked attempts.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Live</span>
            </div>
          </div>

          <div className="h-[200px] bg-slate-900 rounded-xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem]" />
            <div className="relative text-white/50 text-sm flex flex-col items-center gap-2">
              <Globe size={32} className="text-indigo-500" />
              <span>World Map Visualization Placeholder</span>
              <span className="text-xs text-white/30">Showing 4 active blocks from Russia, China, and US.</span>
            </div>
            
            {/* Ping lines or dots can be added with CSS or SVGs */}
            <div className="absolute top-1/4 left-1/4 h-2 w-2 bg-rose-500 rounded-full animate-ping" />
            <div className="absolute bottom-1/3 right-1/3 h-2 w-2 bg-amber-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

      </div>
    </motion.div>
  );
}
