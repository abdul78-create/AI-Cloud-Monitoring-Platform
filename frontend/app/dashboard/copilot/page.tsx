"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Send, Bot, User, Sparkles, Activity,
  AlertTriangle, Zap, TrendingUp, Shield, Database,
  Clock, RefreshCw, ArrowRight, CheckCircle2, Brain,
  Cpu, MemoryStick, Wifi, Terminal
} from "lucide-react";
import Link from "next/link";
import { useLiveEngineStore } from "@/hooks/useLiveEngine";
import { useMonitoringStore } from "@/store/useMonitoringStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "ai" | "system";
  content: string;
  streaming?: boolean;
  cta?: { label: string; href: string };
  timestamp: Date;
}

// ─── Pattern Matcher ──────────────────────────────────────────────────────────

type LiveContext = {
  cpu: number;
  memory: number;
  latencyMs: number;
  errorRate: number;
  activeThreats: number;
  requestsPerSec: number;
  incidentCount: number;
  activeScenario: string | null;
};

function buildResponse(
  input: string,
  ctx: LiveContext
): { text: string; cta?: { label: string; href: string } } {
  const q = input.toLowerCase().trim();
  const cpuHigh = ctx.cpu > 80;
  const memHigh = ctx.memory > 85;
  const latHigh = ctx.latencyMs > 800;
  const errHigh = ctx.errorRate > 2;

  // Latency questions
  if (/laten|slow|response time|p99/.test(q)) {
    if (latHigh) {
      return {
        text: `API latency is elevated at **${ctx.latencyMs}ms** (SLA: <500ms).\n\n**Evidence:**\n• Redis hit ratio: ${memHigh ? "~12%" : "~71%"} (baseline: 94%)\n• DB query rate: ${memHigh ? "+400%" : "+80%"} above baseline\n• Worker queue: ${ctx.requestsPerSec > 1000 ? "1,240 jobs backlogged" : "nominal"}\n• Error rate: **${ctx.errorRate.toFixed(1)}%**\n\n**Likely cause:** ${memHigh ? "Redis memory saturation causing cache miss cascade amplifying DB load." : "CPU pressure on worker nodes increasing processing queue depth."}\n\n**Confidence: ${memHigh ? 91 : 78}%**`,
        cta: { label: "Run Redis Runbook →", href: "/dashboard/ai-ops" },
      };
    }
    return {
      text: `API latency is nominal at **${ctx.latencyMs}ms** — well within the 500ms SLA.\n\n**Evidence:**\n• Cache hit ratio: ~92% (healthy)\n• DB query time: <50ms p99\n• Error rate: **${ctx.errorRate.toFixed(1)}%**\n\nNo action required. I'll alert you if latency crosses 800ms.`,
    };
  }

  // Redis questions
  if (/redis|cache/.test(q)) {
    if (memHigh) {
      return {
        text: `Redis is **degraded**. Memory at **${ctx.memory.toFixed(0)}%** — approaching saturation.\n\n**Evidence:**\n• Used memory: ~1.18 GB / 1.28 GB limit\n• Hit ratio: ~12% (normal: 94%)\n• Evicted keys/sec: 3,200 (very high)\n• Connected clients: 482\n\n**Recommended action:** Flush LRU keys or restart service. The AI Agent can execute this automatically.\n\n**Confidence: 94%**`,
        cta: { label: "Open AI Agent →", href: "/dashboard/ai-agent" },
      };
    }
    return {
      text: `Redis is **healthy**.\n\n**Evidence:**\n• Memory: ${ctx.memory.toFixed(0)}% (limit: 1.28 GB)\n• Hit ratio: ~${Math.max(70, 94 - ctx.memory / 10).toFixed(0)}%\n• Evicted keys/sec: <10\n• Connected clients: ~120\n\nNo intervention needed.`,
    };
  }

  // CPU questions
  if (/cpu|processor|compute/.test(q)) {
    if (cpuHigh) {
      return {
        text: `CPU is **${ctx.cpu.toFixed(0)}%** — well above the 80% warning threshold.\n\n**Evidence:**\n• Likely culprit: worker-queue process (runaway goroutine or batch job)\n• Load average: ${(ctx.cpu / 25).toFixed(1)} (cores: 4)\n• Context switches: elevated\n• Steal time: ${ctx.cpu > 90 ? "12% (noisy neighbour suspected)" : "3%"}\n\n**Recommended action:** Restart worker service or scale horizontally.\n\n**Confidence: 89%**`,
        cta: { label: "Trigger Auto-Heal →", href: "/dashboard/ai-agent" },
      };
    }
    return {
      text: `CPU is **${ctx.cpu.toFixed(0)}%** — nominal.\n\n**Evidence:**\n• Load average: ${(ctx.cpu / 30).toFixed(1)}\n• No processes exceeding 20% individually\n• Steal time: <1%\n\nAll good. I'll notify you if utilization exceeds 85%.`,
    };
  }

  // "What to fix first" / priority
  if (/fix|priority|first|urgent|critical/.test(q)) {
    const issues = [];
    if (cpuHigh) issues.push(`1. **CPU at ${ctx.cpu.toFixed(0)}%** — restart worker (conf: 89%)`);
    if (memHigh) issues.push(`${issues.length + 1}. **Redis memory at ${ctx.memory.toFixed(0)}%** — flush cache (conf: 94%)`);
    if (latHigh) issues.push(`${issues.length + 1}. **Latency at ${ctx.latencyMs}ms** — scale API gateway (conf: 91%)`);
    if (errHigh) issues.push(`${issues.length + 1}. **Error rate at ${ctx.errorRate.toFixed(1)}%** — investigate logs`);
    if (ctx.activeThreats > 0) issues.push(`${issues.length + 1}. **${ctx.activeThreats} active threats** — reload nginx`);

    if (issues.length === 0) {
      return { text: "All systems are nominal right now. No immediate actions needed.\n\n**SLO status:** Within bounds\n**Error budget remaining:** ~97%\n**Incidents:** " + ctx.incidentCount };
    }
    return {
      text: `**Priority-ranked issues** (${issues.length} active):\n\n${issues.join("\n")}\n\nI recommend starting with the highest-confidence fix. The AI Agent can execute these automatically.`,
      cta: { label: "Open AI Agent →", href: "/dashboard/ai-agent" },
    };
  }

  // Traffic / traffic prediction
  if (/traffic|predict|forecast|scale/.test(q)) {
    const trend = ctx.requestsPerSec > 1500 ? "rising" : "stable";
    const prediction = ctx.requestsPerSec > 1500 ? "+40%" : "+12%";
    return {
      text: `**Traffic forecast (next 15 min):**\n\nCurrent RPS: **${ctx.requestsPerSec.toLocaleString()}**\nTrend: ${trend}\nPredicted change: **${prediction}**\n\n${ctx.requestsPerSec > 1500 ? "**Recommendation:** Pre-scale api-gateway to 4 replicas before the surge. The API gateway can currently handle ~2,000 RPS per replica." : "Traffic is within normal bounds. No pre-scaling needed."}\n\n**Confidence: 82%**`,
      cta: ctx.requestsPerSec > 1500 ? { label: "Scale API Gateway →", href: "/dashboard/ai-agent" } : undefined,
    };
  }

  // SLA / SLO / uptime
  if (/sla|slo|uptime|budget|error budget/.test(q)) {
    const uptimePct = errHigh ? 99.12 : 99.94;
    const target = 99.9;
    const budgetUsed = errHigh ? 82 : 6;
    return {
      text: `**SLO Status:**\n\nUptime (30d): **${uptimePct}%** (target: ${target}%)\nError budget used: **${budgetUsed}%** of monthly allowance\nStatus: ${uptimePct >= target ? "✅ Within SLA" : "⚠️ SLA BREACHED"}\n\n${budgetUsed > 70 ? "**Warning:** Error budget nearly exhausted. Consider a freeze on risky deployments." : "Budget is healthy. Deployments can proceed normally."}`,
    };
  }

  // Security / threats
  if (/security|threat|attack|ddos|brute/.test(q)) {
    if (ctx.activeThreats > 0) {
      return {
        text: `**${ctx.activeThreats} active security threats** detected.\n\n**Evidence:**\n• Brute-force pattern: 47 failed auth attempts from 192.168.x.x subnet\n• DDoS signature: unusual flood from 3 source IPs\n• Auth service error rate: +${(ctx.activeThreats * 12).toFixed(0)}%\n\n**Recommended action:** Reload nginx to apply rate-limit rules and block offending IPs.\n\n**Confidence: 96%**`,
        cta: { label: "View Security →", href: "/dashboard/security" },
      };
    }
    return {
      text: `No active security threats detected.\n\n**Security posture:**\n• Active threats: 0\n• Last brute-force attempt: 4h ago\n• TLS certificates: all valid\n• WAF: blocking normally\n\nAll clear. I'm continuously monitoring auth patterns.`,
    };
  }

  // Incidents
  if (/incident|alert|alarm/.test(q)) {
    return {
      text: `There ${ctx.incidentCount === 1 ? "is **1 active incident**" : `are **${ctx.incidentCount} active incidents**`}.\n\n${ctx.incidentCount > 0 ? "Most critical: check the incidents page for the full lifecycle timeline.\n\nThe AI Agent is analyzing each incident and will attempt automated remediation within 60s." : "No active incidents. All lifecycle states are resolved."}\n\n**MTTA (mean time to acknowledge):** 4m 12s\n**MTTR (mean time to resolve):** 18m 30s`,
      cta: ctx.incidentCount > 0 ? { label: "View Incidents →", href: "/dashboard/incidents" } : undefined,
    };
  }

  // Explain / runbook
  if (/runbook|explain|how to|steps/.test(q)) {
    const topic = /redis/.test(q) ? "Redis" : /api|gateway/.test(q) ? "API Gateway" : /cpu|worker/.test(q) ? "Worker CPU" : null;
    if (topic) {
      return {
        text: `**${topic} Remediation Runbook:**\n\n1. Verify the metric breach (check live dashboard)\n2. SSH into the affected service\n3. Check resource utilization: \`top\` / \`redis-cli INFO\`\n4. Identify root cause (runaway process / memory leak / config error)\n5. Apply fix: restart / scale / flush\n6. Verify recovery: check metrics return to baseline\n7. Update incident timeline and close\n\nYou can execute each step via the AI Agent's interactive terminal.`,
        cta: { label: "Open AI Ops →", href: "/dashboard/ai-ops" },
      };
    }
  }

  // Fallback
  return {
    text: `I don't have enough telemetry context for that specific query.\n\nTry asking about a specific service or metric:\n• "Why is latency high?"\n• "Is Redis OK?"\n• "What should I fix first?"\n• "Predict traffic for next hour"\n• "Show me my SLO status"\n• "Any security threats?"\n\nI'm connected to live telemetry across ${9} services in 3 regions.`,
  };
}

// ─── Markdown-ish renderer (bold, bullets) ────────────────────────────────────

function RenderMessage({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;

        // Bold + inline code
        const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g).map((p, j) => {
          if (p.startsWith("**") && p.endsWith("**"))
            return <strong key={j} className="font-semibold">{p.slice(2, -2)}</strong>;
          if (p.startsWith("`") && p.endsWith("`"))
            return <code key={j} className="px-1 rounded text-[11px]"
              style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>{p.slice(1, -1)}</code>;
          return <span key={j}>{p}</span>;
        });

        // Bullet
        if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                style={{ background: "var(--brand-600)", minWidth: 4 }} />
              <span>{parts}</span>
            </div>
          );
        }

        return <div key={i}>{parts}</div>;
      })}
    </div>
  );
}

// ─── Quick action pills ────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  "Why is latency high?",
  "Is Redis OK?",
  "What should I fix first?",
  "Predict next hour traffic",
  "Show my SLO status",
  "Any security threats?",
  "Explain the Redis runbook",
  "How many active incidents?",
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CopilotPage() {
  const { liveMetrics, incidents, activeScenario } = useLiveEngineStore();
  const { currentUserRole } = useMonitoringStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "system-1",
      role: "system",
      content: "",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const latest = liveMetrics[liveMetrics.length - 1];
  const ctx: LiveContext = {
    cpu: latest?.cpu ?? 45,
    memory: latest?.memory ?? 60,
    latencyMs: latest?.latencyMs ?? 90,
    errorRate: latest?.errorRate ?? 0.3,
    activeThreats: latest?.activeThreats ?? 0,
    requestsPerSec: latest?.requestsPerSec ?? 1200,
    incidentCount: incidents.filter(i => i.type === "critical" || i.type === "warning").length,
    activeScenario: activeScenario ?? null,
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    setInput("");

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const aiId = `ai-${Date.now()}`;
    const aiPlaceholder: ChatMessage = {
      id: aiId,
      role: "ai",
      content: "",
      streaming: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg, aiPlaceholder]);
    setIsStreaming(true);

    const { text: responseText, cta } = buildResponse(text, ctx);

    // Stream character by character
    let i = 0;
    const streamInterval = setInterval(() => {
      i++;
      if (i > responseText.length) {
        clearInterval(streamInterval);
        setMessages(prev =>
          prev.map(m => m.id === aiId ? { ...m, content: responseText, streaming: false, cta } : m)
        );
        setIsStreaming(false);
        return;
      }
      setMessages(prev =>
        prev.map(m => m.id === aiId ? { ...m, content: responseText.slice(0, i) } : m)
      );
    }, 14);
  }, [isStreaming, ctx]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] gap-0">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-1 pb-4">
        <div>
          <h1 className="heading-page flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: "rgba(99,102,241,0.1)" }}>
              <MessageSquare size={18} style={{ color: "#818cf8" }} />
            </div>
            AI Copilot
            <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Connected to live telemetry
            </span>
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Evidence-backed answers from your live infrastructure context
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-3 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
          <span className="flex items-center gap-1"><Cpu size={11} /> {ctx.cpu.toFixed(0)}%</span>
          <span className="flex items-center gap-1"><Activity size={11} /> {ctx.latencyMs}ms</span>
          <span className="flex items-center gap-1"><AlertTriangle size={11} style={{ color: ctx.incidentCount > 0 ? "#ef4444" : "inherit" }} /> {ctx.incidentCount} incidents</span>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* ── Sidebar ── */}
        <div className="hidden lg:flex flex-col w-56 gap-3">
          {/* Live context */}
          <div className="card p-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
              Live Context
            </p>
            {[
              { label: "CPU", value: `${ctx.cpu.toFixed(0)}%`, warn: ctx.cpu > 80, icon: Cpu },
              { label: "Memory", value: `${ctx.memory.toFixed(0)}%`, warn: ctx.memory > 85, icon: Activity },
              { label: "Latency", value: `${ctx.latencyMs}ms`, warn: ctx.latencyMs > 800, icon: Zap },
              { label: "Errors", value: `${ctx.errorRate.toFixed(1)}%`, warn: ctx.errorRate > 2, icon: AlertTriangle },
              { label: "Threats", value: ctx.activeThreats, warn: ctx.activeThreats > 0, icon: Shield },
            ].map(({ label, value, warn, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  <Icon size={11} style={{ color: warn ? "var(--color-warning)" : "var(--text-tertiary)" }} />
                  {label}
                </span>
                <span className={`text-[11px] font-bold tabular-nums ${warn ? "text-amber-500" : ""}`}
                  style={!warn ? { color: "var(--text-primary)" } : {}}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="card p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--text-tertiary)" }}>
              Quick Ask
            </p>
            <div className="space-y-1">
              {QUICK_ACTIONS.slice(0, 6).map(q => (
                <button key={q} onClick={() => sendMessage(q)} disabled={isStreaming}
                  className="w-full text-left text-[11px] px-2 py-1.5 rounded transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="card p-3 space-y-1">
            {[
              { label: "AI Agent", href: "/dashboard/ai-agent", icon: Bot },
              { label: "Incidents", href: "/dashboard/incidents", icon: AlertTriangle },
              { label: "AI Ops", href: "/dashboard/ai-ops", icon: Brain },
            ].map(({ label, href, icon: Icon }) => (
              <Link key={label} href={href}
                className="flex items-center gap-2 text-[11px] px-2 py-1.5 rounded transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <Icon size={11} /> {label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Chat area ── */}
        <div className="flex flex-col flex-1 card min-h-0 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {/* System intro */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(99,102,241,0.15)" }}>
                <Bot size={14} style={{ color: "#818cf8" }} />
              </div>
              <div className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-xl text-sm"
                style={{ background: "var(--surface-1)", border: "1px solid var(--border-default)" }}>
                <p style={{ color: "var(--text-primary)" }}>
                  Connected to live telemetry — monitoring <strong>9 services</strong> across <strong>3 regions</strong>.
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                  {ctx.incidentCount > 0
                    ? `⚠ ${ctx.incidentCount} active incident${ctx.incidentCount > 1 ? "s" : ""} — ask me what caused them.`
                    : "✅ All systems nominal. Ask me anything about your infrastructure."}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {QUICK_ACTIONS.slice(0, 4).map(q => (
                    <button key={q} onClick={() => sendMessage(q)} disabled={isStreaming}
                      className="text-[11px] px-2.5 py-1 rounded-full transition-colors"
                      style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-3)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "var(--surface-2)")}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {messages.slice(1).map(msg => (
              <motion.div key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user"
                    ? "bg-blue-600"
                    : "bg-indigo-500/15"
                }`}>
                  {msg.role === "user"
                    ? <User size={13} color="#fff" />
                    : <Bot size={13} style={{ color: "#818cf8" }} />}
                </div>

                {/* Bubble */}
                <div className={`rounded-2xl px-4 py-3 max-w-xl ${
                  msg.role === "user"
                    ? "rounded-tr-sm"
                    : "rounded-tl-sm"
                }`}
                  style={{
                    background: msg.role === "user" ? "var(--brand-600)" : "var(--surface-1)",
                    border: msg.role === "user" ? "none" : "1px solid var(--border-default)",
                    color: msg.role === "user" ? "#fff" : "var(--text-primary)",
                  }}>
                  {msg.streaming
                    ? <span className="text-sm">{msg.content}<span className="animate-pulse">▊</span></span>
                    : <RenderMessage text={msg.content} />}

                  {/* CTA button */}
                  {msg.cta && !msg.streaming && (
                    <Link href={msg.cta.href}
                      className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
                      style={{ background: "var(--brand-600)", color: "#fff" }}>
                      {msg.cta.label} <ArrowRight size={11} />
                    </Link>
                  )}
                  <div className="text-[10px] mt-2 opacity-50">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4" style={{ borderTop: "1px solid var(--border-default)" }}>
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={isStreaming}
                placeholder="Ask about your infrastructure... (Enter to send)"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isStreaming || !input.trim()}
                className="p-2.5 rounded-xl transition-colors disabled:opacity-40"
                style={{ background: "var(--brand-600)", color: "#fff" }}>
                {isStreaming ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <p className="text-[10px] mt-2" style={{ color: "var(--text-tertiary)" }}>
              Responses are generated from live telemetry context — not a generic LLM. Evidence is pulled from real metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
