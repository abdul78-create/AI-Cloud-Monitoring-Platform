"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ArrowRight, Brain, Zap, Shield, Info } from "lucide-react";

export default function IncidentIntelligencePage() {
  const incidents = [
    { id: "inc-01", title: "API Gateway Latency Spike", status: "active", time: "10 mins ago", severity: "high" },
    { id: "inc-02", title: "Database Connection Pool Exhaustion", status: "resolved", time: "2 hours ago", severity: "critical" },
    { id: "inc-03", title: "Auth Service High CPU Load", status: "resolved", time: "1 day ago", severity: "medium" },
  ];

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2"
          style={{
            background: "var(--brand-50)",
            border: "1px solid var(--border-default)",
            color: "var(--brand-600)",
          }}
        >
          <Brain size={11} />
          AI Incident Investigation Active
        </div>
        <h1 className="heading-page">Incident Intelligence</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
          Real-time incident tracking, root cause diagnostics, and automated runbook recommendations
        </p>
      </div>

      {/* ── Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* Active Incidents List */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="heading-section">Active & Historical Incidents</h3>
            <button className="text-xs font-semibold transition-colors" style={{ color: "var(--brand-600)" }}>
              View Archive
            </button>
          </div>

          <div className="space-y-3">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="p-4 rounded-lg flex flex-col gap-2.5 transition-all"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--border-subtle)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-strong)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-subtle)";
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="p-1.5 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: inc.status === "active" ? "var(--color-error-bg)" : "var(--color-success-bg)",
                        color: inc.status === "active" ? "var(--color-error)" : "var(--color-success)",
                      }}
                    >
                      {inc.status === "active" ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>{inc.title}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                        {inc.id} · {inc.time}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`badge text-[9px] px-1.5 py-0.5 ${
                      inc.severity === "critical" ? "badge-critical"
                      : inc.severity === "high" ? "badge-warning"
                      : "badge-live"
                    }`}
                  >
                    {inc.severity.toUpperCase()}
                  </span>
                </div>
                
                {inc.status === "active" && (
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      background: "var(--brand-50)",
                      border: "1px solid var(--border-default)",
                    }}
                  >
                    <p className="text-[11px] font-bold flex items-center gap-1 mb-1" style={{ color: "var(--brand-600)" }}>
                      <Zap size={11} />
                      AI Root Cause Analysis
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      Incident latency spike correlates with lock contention on table `users`.
                      Recommended action: increase pool size or verify indexing.
                    </p>
                    <button className="mt-2 text-[10px] font-bold flex items-center gap-0.5 transition-opacity" style={{ color: "var(--brand-600)" }}>
                      Run Playbook <ArrowRight size={10} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Workflow Panel */}
        <div className="card p-5 flex flex-col justify-between min-h-[320px]">
          <div>
            <h3 className="heading-section">Heuristics Workflow</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>How the AI correlation engine works</p>
          </div>

          <div className="space-y-3.5 my-4 text-xs">
            {[
              { step: 1, title: "Detect & Correlate", desc: "Clustered SRE alerts into cascading trees" },
              { step: 2, title: "Trace Root Cause", desc: "Correlates Redis/SQL streams with telemetry drift" },
              { step: 3, title: "Suggest Runbook", desc: "Pushes actionable recommendations in real-time" },
            ].map(s => (
              <div key={s.step} className="flex gap-3">
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0"
                  style={{ background: "var(--brand-50)", color: "var(--brand-600)", border: "1px solid var(--border-default)" }}
                >
                  {s.step}
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{s.title}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-primary w-full py-2 text-xs font-semibold">
            View Live Logs Correlated
          </button>
        </div>

      </div>
    </div>
  );
}
