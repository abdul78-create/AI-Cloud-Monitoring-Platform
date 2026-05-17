"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Bell, Brain, User, Shield, Zap, Save, RefreshCw, Moon, Sun,
  Key, Plus, Trash2, Sliders, Play, Check, AlertTriangle, Users, Mail, Clock
} from "lucide-react";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import toast from "react-hot-toast";

type Tab = "account" | "notifications" | "thresholds" | "apikeys" | "team";

export default function SettingsPage() {
  const { theme, setTheme } = useMonitoringStore();
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [saveSuccess, setSaveSuccess] = useState(false);

  /* ── State for notifications ── */
  const [slackUrl, setSlackUrl] = useState("https://example.com/services/T00000000/B00000000/mock_slack_webhook");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pagerdutyKey, setPagerdutyKey] = useState("pd_key_prod_84930e");

  /* ── State for thresholds ── */
  const [cpuWarning, setCpuWarning] = useState(80);
  const [cpuCritical, setCpuCritical] = useState(90);
  const [memWarning, setMemWarning] = useState(85);
  const [memCritical, setMemCritical] = useState(95);

  /* ── State for API Keys ── */
  const [apiKeys, setApiKeys] = useState([
    { id: "1", name: "Production Datadog Exporter", key: "am_live_sk_8f8e...39f1", created: "2026-05-10" },
    { id: "2", name: "CI/CD Autoscale Script", key: "am_live_sk_4a2c...881b", created: "2026-05-15" }
  ]);
  const [newKeyName, setNewKeyName] = useState("");

  /* ── State for Team Management ── */
  const [team, setTeam] = useState([
    { email: "admin@enterprise.com", role: "Admin", status: "Active" },
    { email: "sre-lead@enterprise.com", role: "SRE", status: "Active" },
    { email: "dev-01@enterprise.com", role: "Developer", status: "Active" },
  ]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Developer");

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      toast.success("Settings saved successfully!");
    }, 1200);
  };

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    const randomHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const newKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `am_live_sk_${randomHex.substring(0, 4)}...${randomHex.substring(12)}`,
      created: new Date().toISOString().split("T")[0]
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName("");
    toast.success("API key generated successfully!");
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
    toast.success("API key revoked");
  };

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;
    if (team.some(t => t.email.toLowerCase() === newMemberEmail.toLowerCase())) {
      toast.error("User already in team");
      return;
    }
    setTeam([...team, { email: newMemberEmail, role: newMemberRole, status: "Active" }]);
    setNewMemberEmail("");
    toast.success("Invitation sent successfully!");
  };

  const handleRemoveTeam = (email: string) => {
    setTeam(team.filter(t => t.email !== email));
    toast.success("Team member removed");
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div>
        <h1 className="heading-page flex items-center gap-2">
          <Settings style={{ color: "var(--text-secondary)" }} size={20} />
          System Settings
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
          Manage your observability thresholds, Slack webhooks, API keys, and team permissions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-start">
        {/* ── Left Sidebar Navigation ── */}
        <div
          className="card p-2 space-y-1"
          style={{ background: "var(--surface-0)", borderColor: "var(--border-default)" }}
        >
          {[
            { id: "account",       label: "Account",       icon: User },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "thresholds",    label: "Alert Rules",   icon: Sliders },
            { id: "apikeys",       label: "API Access",    icon: Key },
            { id: "team",          label: "Team Members",  icon: Users },
          ].map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md transition-all duration-150"
                style={{
                  background: active ? "var(--brand-50)" : "transparent",
                  color: active ? "var(--brand-600)" : "var(--text-secondary)",
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-2)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                  }
                }}
              >
                <div className="flex items-center gap-2.5">
                  <tab.icon size={14} style={{ color: active ? "var(--brand-600)" : "var(--text-tertiary)" }} />
                  {tab.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Right Content Panel ── */}
        <div className="md:col-span-3 space-y-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="card p-6"
              style={{ background: "var(--surface-0)", borderColor: "var(--border-default)" }}
            >
              {/* ──────────────────────────────────────────────────
                  1. ACCOUNT TAB
              ────────────────────────────────────────────────── */}
              {activeTab === "account" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="heading-section">Profile Settings</h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                      Manage display name and general display settings
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: "var(--text-secondary)" }}>
                        Display Name
                      </label>
                      <input
                        type="text"
                        defaultValue="Ops Admin"
                        className="w-full bg-[var(--surface-1)] border border-[var(--border-default)] rounded-md px-3 py-2 text-xs focus:outline-none"
                        style={{ color: "var(--text-primary)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: "var(--text-secondary)" }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue="admin@enterprise.com"
                        className="w-full bg-[var(--surface-1)] border border-[var(--border-default)] rounded-md px-3 py-2 text-xs focus:outline-none"
                        style={{ color: "var(--text-primary)" }}
                      />
                    </div>
                  </div>

                  <div className="divider" />

                  {/* Theme toggler */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase mb-2.5" style={{ color: "var(--text-secondary)" }}>
                      Display Theme
                    </label>
                    <div className="flex gap-3 max-w-[280px]">
                      <button
                        onClick={() => setTheme("light")}
                        className="flex-1 btn flex items-center justify-center gap-1.5 py-2 px-3 text-xs"
                        style={{
                          background: theme === "light" ? "var(--brand-50)" : "transparent",
                          borderColor: theme === "light" ? "var(--brand-600)" : "var(--border-default)",
                          color: theme === "light" ? "var(--brand-600)" : "var(--text-secondary)",
                        }}
                      >
                        <Sun size={13} />
                        Light
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className="flex-1 btn flex items-center justify-center gap-1.5 py-2 px-3 text-xs"
                        style={{
                          background: theme === "dark" ? "var(--brand-50)" : "transparent",
                          borderColor: theme === "dark" ? "var(--brand-600)" : "var(--border-default)",
                          color: theme === "dark" ? "var(--brand-600)" : "var(--text-secondary)",
                        }}
                      >
                        <Moon size={13} />
                        Dark
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────────────
                  2. NOTIFICATIONS TAB
              ────────────────────────────────────────────────── */}
              {activeTab === "notifications" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="heading-section">Incident Notifications</h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                      Configure webhooks and alerts destination endpoints
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Slack Webhook */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: "var(--text-secondary)" }}>
                        Slack Incoming Webhook URL
                      </label>
                      <input
                        type="text"
                        value={slackUrl}
                        onChange={e => setSlackUrl(e.target.value)}
                        className="w-full bg-[var(--surface-1)] border border-[var(--border-default)] rounded-md px-3 py-2 text-xs font-mono focus:outline-none"
                        style={{ color: "var(--text-primary)" }}
                      />
                      <p className="text-[10px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                        Get webhook links from Slack Application settings panel.
                      </p>
                    </div>

                    {/* PagerDuty */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: "var(--text-secondary)" }}>
                        PagerDuty Routing Key
                      </label>
                      <input
                        type="password"
                        value={pagerdutyKey}
                        onChange={e => setPagerdutyKey(e.target.value)}
                        className="w-full bg-[var(--surface-1)] border border-[var(--border-default)] rounded-md px-3 py-2 text-xs font-mono focus:outline-none"
                        style={{ color: "var(--text-primary)" }}
                      />
                    </div>

                    <div className="divider" />

                    {/* Email Alerts Toggle */}
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Send Weekly Digest Email</p>
                        <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Receive weekly reports summarizing incident uptime statistics</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailAlerts}
                        onChange={e => setEmailAlerts(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────────────
                  3. ALERT RULES & THRESHOLDS TAB
              ────────────────────────────────────────────────── */}
              {activeTab === "thresholds" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="heading-section">Metric Thresholds</h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                      Define warning and critical levels to trigger immediate incident escalations
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* CPU slider */}
                    <div className="p-4 rounded-lg" style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold flex items-center gap-1.5">
                          <AlertTriangle size={13} style={{ color: "var(--color-warning)" }} />
                          CPU Warning Level
                        </span>
                        <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>{cpuWarning}%</span>
                      </div>
                      <input
                        type="range"
                        min="50" max="95"
                        value={cpuWarning}
                        onChange={e => setCpuWarning(parseInt(e.target.value))}
                        className="w-full h-1 bg-[var(--surface-3)] rounded-lg appearance-none cursor-pointer accent-[var(--brand-600)]"
                      />
                    </div>

                    <div className="p-4 rounded-lg" style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold flex items-center gap-1.5">
                          <AlertTriangle size={13} style={{ color: "var(--color-error)" }} />
                          CPU Critical Level
                        </span>
                        <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>{cpuCritical}%</span>
                      </div>
                      <input
                        type="range"
                        min="60" max="99"
                        value={cpuCritical}
                        onChange={e => setCpuCritical(parseInt(e.target.value))}
                        className="w-full h-1 bg-[var(--surface-3)] rounded-lg appearance-none cursor-pointer accent-[var(--color-error)]"
                      />
                    </div>

                    {/* MEM slider */}
                    <div className="p-4 rounded-lg" style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold flex items-center gap-1.5">
                          <AlertTriangle size={13} style={{ color: "var(--color-warning)" }} />
                          Memory Warning Level
                        </span>
                        <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>{memWarning}%</span>
                      </div>
                      <input
                        type="range"
                        min="50" max="95"
                        value={memWarning}
                        onChange={e => setMemWarning(parseInt(e.target.value))}
                        className="w-full h-1 bg-[var(--surface-3)] rounded-lg appearance-none cursor-pointer accent-[var(--brand-600)]"
                      />
                    </div>

                    <div className="p-4 rounded-lg" style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold flex items-center gap-1.5">
                          <AlertTriangle size={13} style={{ color: "var(--color-error)" }} />
                          Memory Critical Level
                        </span>
                        <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>{memCritical}%</span>
                      </div>
                      <input
                        type="range"
                        min="60" max="99"
                        value={memCritical}
                        onChange={e => setMemCritical(parseInt(e.target.value))}
                        className="w-full h-1 bg-[var(--surface-3)] rounded-lg appearance-none cursor-pointer accent-[var(--color-error)]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────────────
                  4. API KEYS ACCESS TAB
              ────────────────────────────────────────────────── */}
              {activeTab === "apikeys" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="heading-section">API Keys Access</h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                      Generate secure client secrets to interface logs exporter programmatically
                    </p>
                  </div>

                  {/* Create API Key */}
                  <form onSubmit={handleGenerateKey} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Production Logs Fetcher"
                      value={newKeyName}
                      onChange={e => setNewKeyName(e.target.value)}
                      className="flex-1 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-md px-3 py-2 text-xs focus:outline-none"
                      style={{ color: "var(--text-primary)" }}
                    />
                    <button type="submit" className="btn btn-primary flex items-center gap-1 py-2 px-3 text-xs">
                      <Plus size={13} />
                      Generate Key
                    </button>
                  </form>

                  {/* Active keys table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                          <th className="py-2.5 font-bold" style={{ color: "var(--text-secondary)" }}>Name</th>
                          <th className="py-2.5 font-bold" style={{ color: "var(--text-secondary)" }}>Token Secret</th>
                          <th className="py-2.5 font-bold" style={{ color: "var(--text-secondary)" }}>Created</th>
                          <th className="py-2.5 text-right font-bold" style={{ color: "var(--text-secondary)" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apiKeys.map(k => (
                          <tr key={k.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                            <td className="py-3 font-semibold" style={{ color: "var(--text-primary)" }}>{k.name}</td>
                            <td className="py-3 font-mono text-[10px]" style={{ color: "var(--brand-600)" }}>{k.key}</td>
                            <td className="py-3" style={{ color: "var(--text-tertiary)" }}>{k.created}</td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => handleDeleteKey(k.id)}
                                className="p-1 rounded hover:bg-rose-500/10 text-rose-500 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {apiKeys.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-xs" style={{ color: "var(--text-tertiary)" }}>
                              No active API keys created yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────────────
                  5. TEAM MEMBERS TAB
              ────────────────────────────────────────────────── */}
              {activeTab === "team" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="heading-section">Team Permissions</h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                      Invite SRE team members and manage role roles
                    </p>
                  </div>

                  {/* Add user form */}
                  <form onSubmit={handleAddTeam} className="flex gap-2 flex-wrap sm:flex-nowrap">
                    <div className="flex-1 min-w-[200px] relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={13} />
                      <input
                        type="email"
                        placeholder="sre-dev-2@enterprise.com"
                        value={newMemberEmail}
                        onChange={e => setNewMemberEmail(e.target.value)}
                        className="w-full bg-[var(--surface-1)] border border-[var(--border-default)] rounded-md pl-8 pr-3 py-2 text-xs focus:outline-none"
                        style={{ color: "var(--text-primary)" }}
                      />
                    </div>
                    <select
                      value={newMemberRole}
                      onChange={e => setNewMemberRole(e.target.value)}
                      className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-md px-3 py-2 text-xs focus:outline-none cursor-pointer"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <option value="Admin">Admin</option>
                      <option value="SRE">SRE</option>
                      <option value="Developer">Developer</option>
                    </select>
                    <button type="submit" className="btn btn-primary flex items-center gap-1.5 py-2 px-4 text-xs">
                      <Plus size={13} />
                      Invite
                    </button>
                  </form>

                  {/* Members list */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                          <th className="py-2.5 font-bold" style={{ color: "var(--text-secondary)" }}>Email Address</th>
                          <th className="py-2.5 font-bold" style={{ color: "var(--text-secondary)" }}>Role</th>
                          <th className="py-2.5 font-bold" style={{ color: "var(--text-secondary)" }}>Status</th>
                          <th className="py-2.5 text-right font-bold" style={{ color: "var(--text-secondary)" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.map(m => (
                          <tr key={m.email} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                            <td className="py-3 font-semibold" style={{ color: "var(--text-primary)" }}>{m.email}</td>
                            <td className="py-3">
                              <span
                                className="badge text-[10px]"
                                style={{
                                  background: m.role === "Admin" ? "var(--color-error-bg)" : m.role === "SRE" ? "var(--color-info-bg)" : "var(--surface-2)",
                                  color: m.role === "Admin" ? "var(--color-error)" : m.role === "SRE" ? "var(--color-info)" : "var(--text-secondary)",
                                }}
                              >
                                {m.role}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className="badge badge-success text-[10px]">{m.status}</span>
                            </td>
                            <td className="py-3 text-right">
                              {m.email !== "admin@enterprise.com" && (
                                <button
                                  onClick={() => handleRemoveTeam(m.email)}
                                  className="p-1 rounded hover:bg-rose-500/10 text-rose-500 transition-colors"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Action bar ── */}
              <div className="divider my-5" />
              <div className="flex justify-end gap-3">
                <button
                  className="btn btn-ghost text-xs"
                  onClick={() => toast.error("Changes discarded")}
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  className="btn btn-primary flex items-center gap-1.5 py-2 px-4 text-xs font-semibold"
                >
                  {saveSuccess ? (
                    <>
                      <Check size={13} />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save size={13} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
