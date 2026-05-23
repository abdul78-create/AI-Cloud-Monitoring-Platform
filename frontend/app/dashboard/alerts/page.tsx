"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Plus, Trash2, Check, X, AlertTriangle, Shield,
  MessageSquare, Mail, Link2, Clock, ToggleLeft, ToggleRight,
  Search, ChevronDown, Zap
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: ">" | "<" | "=";
  threshold: number;
  unit: string;
  severity: "warning" | "critical";
  channel: string;
  enabled: boolean;
  triggered: number;
  lastFired: string | null;
}

interface HistoryEntry {
  id: string;
  rule: string;
  severity: "warning" | "critical";
  firedAt: string;
  resolvedAt: string | null;
  duration: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_RULES: AlertRule[] = [
  { id: "1", name: "CPU Saturation", metric: "cpu_usage", condition: ">", threshold: 85, unit: "%", severity: "critical", channel: "slack", enabled: true, triggered: 12, lastFired: "2h ago" },
  { id: "2", name: "Memory Pressure", metric: "memory_usage", condition: ">", threshold: 90, unit: "%", severity: "critical", channel: "pagerduty", enabled: true, triggered: 4, lastFired: "6h ago" },
  { id: "3", name: "High Error Rate", metric: "error_rate", condition: ">", threshold: 5, unit: "%", severity: "warning", channel: "slack", enabled: true, triggered: 28, lastFired: "30m ago" },
  { id: "4", name: "P99 Latency SLA", metric: "p99_latency", condition: ">", threshold: 2000, unit: "ms", severity: "critical", channel: "pagerduty", enabled: true, triggered: 3, lastFired: "1d ago" },
  { id: "5", name: "Low Disk Space", metric: "disk_usage", condition: ">", threshold: 80, unit: "%", severity: "warning", channel: "email", enabled: false, triggered: 1, lastFired: "3d ago" },
  { id: "6", name: "Service Down", metric: "uptime", condition: "<", threshold: 100, unit: "%", severity: "critical", channel: "pagerduty", enabled: true, triggered: 2, lastFired: "4d ago" },
];

const HISTORY: HistoryEntry[] = [
  { id: "h1", rule: "High Error Rate", severity: "warning", firedAt: "2026-05-21 12:34:02", resolvedAt: "2026-05-21 12:39:14", duration: "5m 12s" },
  { id: "h2", rule: "CPU Saturation", severity: "critical", firedAt: "2026-05-21 10:18:45", resolvedAt: "2026-05-21 10:31:00", duration: "12m 15s" },
  { id: "h3", rule: "Memory Pressure", severity: "critical", firedAt: "2026-05-21 08:05:22", resolvedAt: "2026-05-21 08:22:41", duration: "17m 19s" },
  { id: "h4", rule: "High Error Rate", severity: "warning", firedAt: "2026-05-20 22:11:00", resolvedAt: "2026-05-20 22:15:30", duration: "4m 30s" },
  { id: "h5", rule: "P99 Latency SLA", severity: "critical", firedAt: "2026-05-20 18:44:10", resolvedAt: null, duration: "Ongoing" },
];

const CHANNELS = [
  { id: "slack", name: "Slack", icon: MessageSquare, color: "text-emerald-600" },
  { id: "email", name: "Email", icon: Mail, color: "text-blue-600" },
  { id: "pagerduty", name: "PagerDuty", icon: Zap, color: "text-emerald-500" },
  { id: "webhook", name: "Webhook", icon: Link2, color: "text-purple-600" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

type Tab = "rules" | "history" | "channels";

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("rules");
  const [rules, setRules] = useState<AlertRule[]>(INITIAL_RULES);
  const [showNewRule, setShowNewRule] = useState(false);
  const [editingChannel, setEditingChannel] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    toast.success("Alert rule updated.");
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    toast.success("Alert rule deleted.");
  };

  const filteredRules = rules.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
  const enabledCount = rules.filter(r => r.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell size={20} className="text-blue-600" />
            Alert Engine
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configure threshold rules, escalation policies, and notification channels.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-900 dark:text-white">{enabledCount}</span> active rules
          </div>
          <button
            onClick={() => setShowNewRule(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={13} /> New Rule
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Rules", value: rules.length, color: "text-slate-900 dark:text-white" },
          { label: "Active Rules", value: enabledCount, color: "text-blue-600 dark:text-blue-400" },
          { label: "Fired Today", value: 14, color: "text-amber-600 dark:text-amber-400" },
          { label: "Open Incidents", value: HISTORY.filter(h => !h.resolvedAt).length, color: "text-red-600 dark:text-red-400" },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{stat.label}</div>
            <div className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg w-fit">
        {(["rules", "history", "channels"] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors ${
              activeTab === tab
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab === "history" ? "Alert History" : tab === "channels" ? "Channels" : "Alert Rules"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          {/* ─── Rules Tab ─── */}
          {activeTab === "rules" && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <Search size={14} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search rules..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 text-sm bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRules.map(rule => (
                  <div key={rule.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <button onClick={() => toggleRule(rule.id)} className="shrink-0">
                      {rule.enabled
                        ? <ToggleRight size={20} className="text-blue-600" />
                        : <ToggleLeft size={20} className="text-slate-400" />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{rule.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${rule.severity === "critical" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"}`}>
                          {rule.severity.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {rule.metric} {rule.condition} {rule.threshold}{rule.unit}
                      </span>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="text-right">
                        <div className="font-semibold text-slate-900 dark:text-white">{rule.triggered}×</div>
                        <div>triggered</div>
                      </div>
                      <div className="text-right min-w-[60px]">
                        <div className="font-semibold text-slate-900 dark:text-white">{rule.channel}</div>
                        <div>{rule.lastFired ?? "never"}</div>
                      </div>
                    </div>
                    <button onClick={() => deleteRule(rule.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors ml-2 shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── History Tab ─── */}
          {activeTab === "history" && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    {["Rule", "Severity", "Fired At", "Resolved At", "Duration"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {HISTORY.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{entry.rule}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${entry.severity === "critical" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"}`}>
                          {entry.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">{entry.firedAt}</td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">
                        {entry.resolvedAt ?? <span className="text-red-500 font-semibold">Ongoing</span>}
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{entry.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── Channels Tab ─── */}
          {activeTab === "channels" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CHANNELS.map(ch => (
                <div key={ch.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <ch.icon size={20} className={ch.color} />
                      <span className="font-semibold text-slate-900 dark:text-white">{ch.name}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check size={12} /> Configured
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Endpoint</div>
                    <div className="font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded px-3 py-2 truncate">
                      {ch.id === "slack" ? "hooks.slack.com/services/T0000.../B0000..." :
                       ch.id === "email" ? "ops-alerts@enterprise.com" :
                       ch.id === "pagerduty" ? "pd_routing_key_****8f2a" : "https://hooks.example.com/alerts"}
                    </div>
                  </div>
                  <button 
                    className="mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() => setEditingChannel(ch.id)}
                  >
                    Edit configuration →
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* New Rule Modal placeholder */}
      <AnimatePresence>
        {showNewRule && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowNewRule(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl z-50 p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">New Alert Rule</h3>
                <button onClick={() => setShowNewRule(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Rule Name", placeholder: "e.g. CPU Saturation Alert" },
                  { label: "Metric", placeholder: "e.g. cpu_usage" },
                  { label: "Threshold", placeholder: "e.g. 85" },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{f.label}</label>
                    <input type="text" placeholder={f.placeholder} className="mt-1.5 w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500" />
                  </div>
                ))}
                <button onClick={() => { setShowNewRule(false); toast.success("Alert rule created!"); }} className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  Create Rule
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Channel Modal */}
      <AnimatePresence>
        {editingChannel && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => setEditingChannel(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl z-50 p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">Configure {editingChannel}</h3>
                <button onClick={() => setEditingChannel(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Webhook / API URL</label>
                  <input type="text" defaultValue={editingChannel === "slack" ? "https://hooks.slack.com/services/..." : ""} className="mt-1.5 w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500 font-mono" />
                </div>
                {editingChannel === "webhook" && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Authorization Header</label>
                    <input type="text" placeholder="Bearer ..." className="mt-1.5 w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500 font-mono" />
                  </div>
                )}
                <button onClick={() => { setEditingChannel(null); toast.success("Configuration saved!"); }} className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  Save Configuration
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
