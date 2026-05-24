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

        {/* Attack Map */}
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

          <div className="h-[280px] bg-slate-950 rounded-xl relative overflow-hidden border border-slate-800">
            {/* World grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />
            
            <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid slice">
              {/* World outlines representing continents */}
              <circle cx="200" cy="120" r="40" fill="currentColor" className="text-slate-900" />
              <circle cx="280" cy="160" r="30" fill="currentColor" className="text-slate-900" />
              <circle cx="340" cy="280" r="35" fill="currentColor" className="text-slate-900" />
              <circle cx="520" cy="120" r="30" fill="currentColor" className="text-slate-900" />
              <circle cx="540" cy="240" r="35" fill="currentColor" className="text-slate-900" />
              <circle cx="750" cy="140" r="60" fill="currentColor" className="text-slate-900" />
              <circle cx="820" cy="190" r="45" fill="currentColor" className="text-slate-900" />
              <circle cx="850" cy="300" r="25" fill="currentColor" className="text-slate-900" />

              {/* Target Datacenter node (us-east-1) */}
              <circle cx="350" cy="150" r="6" fill="#6366f1" />
              <circle cx="350" cy="150" r="12" stroke="#6366f1" strokeWidth="1" fill="none" className="animate-ping" style={{ animationDuration: '3s' }} />
              <text x="350" y="132" fill="#a5b4fc" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-mono">US-EAST-1 (PROD)</text>

              {/* Origin nodes */}
              {[
                { name: "Moscow, RU", x: 650, y: 110, color: "text-rose-500", labelX: 650, labelY: 95 },
                { name: "Beijing, CN", x: 820, y: 160, color: "text-amber-500", labelX: 820, labelY: 145 },
                { name: "Frankfurt, DE", x: 520, y: 130, color: "text-rose-500", labelX: 520, labelY: 115 },
                { name: "Shenzhen, CN", x: 800, y: 200, color: "text-rose-500", labelX: 800, labelY: 185 },
              ].map((origin, idx) => (
                <g key={origin.name}>
                  {/* Origin point */}
                  <circle cx={origin.x} cy={origin.y} r="4" fill={origin.color === "text-rose-500" ? "#f43f5e" : "#f59e0b"} />
                  <circle cx={origin.x} cy={origin.y} r="8" stroke={origin.color === "text-rose-500" ? "#f43f5e" : "#f59e0b"} strokeWidth="1" fill="none" className="animate-ping" style={{ animationDelay: `${idx * 0.8}s` }} />
                  <text x={origin.labelX} y={origin.labelY} fill="#64748b" fontSize="8" textAnchor="middle" className="font-mono">{origin.name}</text>

                  {/* Bezier curve connection vector to target */}
                  <path 
                    d={`M ${origin.x} ${origin.y} Q ${(origin.x + 350) / 2} ${(origin.y + 150) / 2 - 50} 350 150`}
                    fill="none"
                    stroke={origin.color === "text-rose-500" ? "url(#rose-grad)" : "url(#amber-grad)"}
                    strokeWidth="1.5"
                    strokeDasharray="8, 6"
                    className="animate-dash"
                    style={{
                      strokeDashoffset: 100,
                      animation: "dash 5s linear infinite",
                      animationDelay: `${idx * 0.5}s`
                    }}
                  />
                </g>
              ))}

              <defs>
                <linearGradient id="rose-grad" x1="1" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="amber-grad" x1="1" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>

            {/* Custom CSS for dashboard attack map vectors */}
            <style jsx>{`
              @keyframes dash {
                to {
                  stroke-dashoffset: -100;
                }
              }
              .animate-dash {
                animation: dash 8s linear infinite !important;
              }
            `}</style>
            
            {/* Live panel stats */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 p-2 rounded-lg text-[9px] font-mono text-slate-400 space-y-0.5">
              <div className="flex gap-2">
                <span className="text-slate-500">LAST EVENT:</span>
                <span className="text-rose-400 font-bold">SQLi Attempt blocked from 203.0.113.5</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-500">MITIGATION:</span>
                <span className="text-emerald-400 font-bold">IP Isolated automatically by SRE Agent</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
