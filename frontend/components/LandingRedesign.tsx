"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Activity,
  Brain,
  Cloud,
  ShieldCheck,
  Zap,
  Server,
  ArrowRight,
  Check,
  Sun,
  Moon,
  Terminal,
  Network,
  Lock,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Cpu,
  Globe,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// ─────────────────────────────────────────────────────────────
//  Static chart data (stable across renders)
// ─────────────────────────────────────────────────────────────
const HERO_CHART_DATA = [
  { t: "00:00", cpu: 42, mem: 61 },
  { t: "04:00", cpu: 55, mem: 70 },
  { t: "08:00", cpu: 38, mem: 58 },
  { t: "12:00", cpu: 72, mem: 82 },
  { t: "16:00", cpu: 67, mem: 84 },
  { t: "20:00", cpu: 88, mem: 91 },
  { t: "24:00", cpu: 53, mem: 74 },
];

const PREVIEW_CHART_DATA = [
  { t: "1m", v: 45 },
  { t: "2m", v: 62 },
  { t: "3m", v: 55 },
  { t: "4m", v: 78 },
  { t: "5m", v: 67 },
  { t: "6m", v: 84 },
  { t: "7m", v: 73 },
  { t: "8m", v: 90 },
  { t: "9m", v: 81 },
  { t: "10m", v: 95 },
];

// ─────────────────────────────────────────────────────────────
//  Animation variants
// ─────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

// ─────────────────────────────────────────────────────────────
//  Root Component
// ─────────────────────────────────────────────────────────────
export default function LandingRedesign() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const resolved = saved ?? "dark";
    setTheme(resolved);
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);

  return (
    <div className="relative min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 overflow-x-hidden font-sans transition-colors duration-300">
      {/* Subtle radial glow — top right */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 right-0 w-[600px] h-[600px] rounded-full opacity-30 dark:opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
        }}
      />

      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <main>
        <Hero />
        <TrustBar />
        <HowItWorks />
        <LiveDashboardPreview />
        <EnterpriseFeatures />
        <AgentInstaller />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  NAVBAR
// ─────────────────────────────────────────────────────────────
function Navbar({
  theme,
  toggleTheme,
}: {
  theme: "light" | "dark";
  toggleTheme: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-100 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <Cloud size={17} />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            CloudAI Monitor
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-400">
          {[
            { label: "Features", href: "#features" },
            { label: "Architecture", href: "#how-it-works" },
            { label: "How It Works", href: "#how-it-works" },
            { label: "Docs", href: "#install" },
            { label: "Integrations", href: "#features" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-slate-600 dark:text-slate-400"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
          </button>
          <Link
            href="/dashboard"
            className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Open Dashboard
            <ChevronRight size={14} />
          </Link>
        </div>
      </nav>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────
//  HERO
// ─────────────────────────────────────────────────────────────
function Hero() {
  // Live-updating stat values
  const [stats, setStats] = useState({ cpu: 67, mem: 84, rps: 1.2 });

  useEffect(() => {
    const id = setInterval(() => {
      setStats({
        cpu: 60 + Math.floor(Math.random() * 18),
        mem: 78 + Math.floor(Math.random() * 12),
        rps: parseFloat((1.0 + Math.random() * 0.5).toFixed(1)),
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 pt-20 pb-28">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left — text + CTAs */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/50 px-3.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <span className="live-dot">LIVE</span>
              &nbsp;AI-Powered Cloud Observability
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-slate-900 dark:text-white"
          >
            Enterprise AI-Powered
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              Cloud Observability
            </span>{" "}
            Platform
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl"
          >
            Monitor infrastructure, analyze telemetry, detect incidents, and
            automate cloud operations using enterprise-grade AI observability.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center gap-3"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm group"
            >
              Start Monitoring
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors shadow-sm"
            >
              Live Demo
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              View Architecture
              <ChevronRight size={14} />
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-500"
          >
            <div className="flex items-center gap-1.5">
              <Check size={12} className="text-emerald-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-1.5">
              <Check size={12} className="text-emerald-500" />
              Deploy in 60 seconds
            </div>
            <div className="flex items-center gap-1.5">
              <Check size={12} className="text-emerald-500" />
              SOC 2 Ready
            </div>
          </motion.div>
        </motion.div>

        {/* Right — live dashboard panel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Subtle glow behind panel */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-2xl blur-2xl opacity-40"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(99,102,241,0.2), transparent 70%)",
            }}
          />

          <div className="relative bg-slate-900 rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs text-slate-500 ml-2 font-mono">
                  dashboard.cloudai.io
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="badge badge-live text-[10px]">
                  ● LIVE
                </span>
                <span className="badge badge-success text-[10px]">
                  Cluster Health: 99.8%
                </span>
              </div>
            </div>

            {/* Dashboard body */}
            <div className="p-4 space-y-4">
              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "CPU Usage",
                    value: `${stats.cpu}%`,
                    trend: "+2.1%",
                    color: "text-amber-400",
                    bg: "bg-amber-500/10",
                  },
                  {
                    label: "Memory",
                    value: `${stats.mem}%`,
                    trend: "+0.8%",
                    color: "text-rose-400",
                    bg: "bg-rose-500/10",
                  },
                  {
                    label: "Requests/s",
                    value: `${stats.rps}k`,
                    trend: "+12%",
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-3"
                  >
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                      {s.label}
                    </p>
                    <p
                      className={`text-2xl font-bold tabular-nums ${s.color}`}
                    >
                      {s.value}
                    </p>
                    <p className="text-[10px] text-emerald-500 mt-1">
                      ↑ {s.trend}
                    </p>
                  </div>
                ))}
              </div>

              {/* Area chart */}
              <div className="rounded-xl bg-slate-800/40 border border-slate-700/40 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-300">
                    Telemetry Stream
                  </p>
                  <span className="text-[10px] text-slate-500">
                    Last 24h
                  </span>
                </div>
                <div className="h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={HERO_CHART_DATA}
                      margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="heroGrad1"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#818cf8"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="95%"
                            stopColor="#818cf8"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="heroGrad2"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#f472b6"
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="95%"
                            stopColor="#f472b6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="t"
                        stroke="#475569"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: 8,
                          fontSize: 11,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="cpu"
                        name="CPU %"
                        stroke="#818cf8"
                        strokeWidth={1.5}
                        fill="url(#heroGrad1)"
                        dot={false}
                      />
                      <Area
                        type="monotone"
                        dataKey="mem"
                        name="Mem %"
                        stroke="#f472b6"
                        strokeWidth={1.5}
                        fill="url(#heroGrad2)"
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status row */}
              <div className="flex items-center justify-between">
                <span className="live-dot text-[11px]">
                  Streaming live telemetry
                </span>
                <span className="badge badge-warning text-[10px]">
                  ⚠ 3 Active Incidents
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
//  TRUST BAR
// ─────────────────────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: "⚡", label: "Real-Time Telemetry" },
  { icon: "🔴", label: "Live Incident Detection" },
  { icon: "🤖", label: "AI Anomaly Detection" },
  { icon: "📡", label: "WebSocket Streaming" },
  { icon: "🗄️", label: "Redis-Powered Pipelines" },
  { icon: "🔒", label: "SOC2 Ready" },
];

function TrustBar() {
  return (
    <div className="border-y border-slate-100 dark:border-slate-800/70 bg-slate-50/70 dark:bg-slate-900/40 py-5 overflow-hidden">
      <motion.div
        className="flex gap-8 w-max"
        animate={{ x: [0, -600] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        {[...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 px-5 py-2 rounded-full border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap select-none"
          >
            <span role="img" aria-label={item.label} className="text-base">
              {item.icon}
            </span>
            {item.label}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  HOW IT WORKS
// ─────────────────────────────────────────────────────────────
const HOW_STEPS = [
  {
    icon: Server,
    title: "Connect Infrastructure",
    desc: "Install our 2 MB agent on AWS EC2, Docker containers, Kubernetes pods, or bare-metal Linux servers. Auto-discovers services in seconds.",
    tags: ["AWS", "Docker", "K8s", "Linux"],
    step: "01",
  },
  {
    icon: Activity,
    title: "Stream Telemetry",
    desc: "Real-time metrics, logs, distributed traces, and uptime monitoring stream to the platform via encrypted WebSocket connections.",
    tags: ["WebSockets", "OpenTelemetry", "Prometheus"],
    step: "02",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    desc: "LLM-powered root cause analysis, anomaly detection, and intelligent incident grouping surfaces actionable insights instantly.",
    tags: ["Ollama", "LLM", "Anomaly Detection"],
    step: "03",
  },
  {
    icon: Zap,
    title: "Automated Recovery",
    desc: "Restart failing services, trigger runbooks, fire multi-channel alerts, and execute webhook automations — all without manual intervention.",
    tags: ["Slack", "PagerDuty", "Webhooks"],
    step: "04",
  },
];

function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="py-28 bg-white dark:bg-slate-950">
      <div ref={ref} className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">
            How It Works
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            From infrastructure to insight in minutes
          </h2>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
            Four steps from zero visibility to full AI-powered observability.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
          className="grid md:grid-cols-2 gap-6"
        >
          {HOW_STEPS.map((step) => (
            <motion.div
              key={step.step}
              variants={fadeUp}
              className="group relative rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 hover:border-indigo-200 dark:hover:border-indigo-800/60 hover:shadow-lg dark:hover:shadow-indigo-950/30 transition-all duration-300"
            >
              {/* Step number watermark */}
              <span className="absolute top-6 right-7 text-6xl font-black text-slate-50 dark:text-slate-800/80 select-none tabular-nums leading-none">
                {step.step}
              </span>

              {/* Icon */}
              <div className="mb-5 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
                <step.icon size={22} />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2.5">
                {step.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm mb-5">
                {step.desc}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {step.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
//  LIVE DASHBOARD PREVIEW
// ─────────────────────────────────────────────────────────────
const FAKE_INCIDENTS = [
  { id: "INC-1042", title: "High CPU on prod-api-02", sev: "Critical", ts: "2m ago" },
  { id: "INC-1041", title: "Memory leak in worker-pool", sev: "High", ts: "8m ago" },
  { id: "INC-1040", title: "Latency spike: /api/search", sev: "Warning", ts: "14m ago" },
];

const SEV_COLORS: Record<string, string> = {
  Critical: "badge-critical",
  High: "badge-high",
  Warning: "badge-warning",
};

function TopologyDiagram() {
  const nodes = [
    { id: "LB", x: 160, y: 70, label: "Load Balancer" },
    { id: "API1", x: 60, y: 170, label: "API Server 1" },
    { id: "API2", x: 260, y: 170, label: "API Server 2" },
    { id: "DB", x: 60, y: 270, label: "PostgreSQL" },
    { id: "Cache", x: 260, y: 270, label: "Redis Cache" },
  ];
  const edges = [
    ["LB", "API1"],
    ["LB", "API2"],
    ["API1", "DB"],
    ["API2", "Cache"],
    ["API1", "Cache"],
  ];
  const pos: Record<string, { x: number; y: number }> = {};
  nodes.forEach((n) => (pos[n.id] = { x: n.x, y: n.y }));

  return (
    <svg viewBox="0 0 340 340" className="w-full h-full">
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={pos[a].x}
          y1={pos[a].y}
          x2={pos[b].x}
          y2={pos[b].y}
          stroke="#334155"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      ))}
      {nodes.map((n) => (
        <g key={n.id} transform={`translate(${n.x},${n.y})`}>
          <rect
            x={-38}
            y={-18}
            width={76}
            height={36}
            rx={7}
            fill="#1e293b"
            stroke="#334155"
            strokeWidth={1}
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#94a3b8"
            fontSize={9}
            fontFamily="Inter, sans-serif"
            fontWeight={600}
          >
            {n.label}
          </text>
          <circle cx={32} cy={-12} r={4} fill="#34d399" />
        </g>
      ))}
    </svg>
  );
}

function LiveDashboardPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="preview" className="py-28 bg-slate-50 dark:bg-slate-900/40">
      <div ref={ref} className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">
            Platform Preview
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            One dashboard. Total visibility.
          </h2>
        </motion.div>

        {/* Dashboard frame */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl border border-slate-700/70 bg-slate-900 shadow-2xl overflow-hidden"
        >
          {/* Chrome bar */}
          <div className="flex items-center justify-between px-5 py-3 bg-slate-950/70 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs text-slate-500 font-mono ml-2">
                CloudAI Monitor — Production Environment
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="live-dot text-[10px]">Live</span>
              <span className="text-xs text-slate-500">
                Updated just now
              </span>
            </div>
          </div>

          {/* 5-panel grid */}
          <div className="grid grid-cols-5 divide-x divide-slate-800 min-h-[340px]">
            {/* Panel 1: Incidents */}
            <div className="col-span-1 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={13} className="text-rose-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Incidents
                </span>
              </div>
              <div className="space-y-2">
                {FAKE_INCIDENTS.map((inc) => (
                  <div
                    key={inc.id}
                    className="rounded-lg bg-slate-800/60 border border-slate-700/50 p-2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-mono text-slate-500">
                        {inc.id}
                      </span>
                      <span className={`badge ${SEV_COLORS[inc.sev]} text-[9px]`}>
                        {inc.sev}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-snug">
                      {inc.title}
                    </p>
                    <p className="text-[9px] text-slate-500 mt-1">{inc.ts}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel 2: Telemetry chart */}
            <div className="col-span-1 p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={13} className="text-indigo-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Telemetry
                </span>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={PREVIEW_CHART_DATA}
                    margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="previewGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#818cf8"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#818cf8"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="t"
                      stroke="#334155"
                      fontSize={8}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="#818cf8"
                      strokeWidth={1.5}
                      fill="url(#previewGrad)"
                      dot={false}
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Req/s • Last 10m</p>
            </div>

            {/* Panel 3: Uptime */}
            <div className="col-span-1 p-4 flex flex-col items-center justify-center gap-2">
              <Globe size={28} className="text-emerald-400 mb-1" />
              <p className="text-4xl font-black text-white tabular-nums">
                99.98%
              </p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Uptime
              </p>
              <div className="mt-2 flex flex-col gap-1.5 w-full">
                {["api.cloudai.io", "ws.cloudai.io", "dash.cloudai.io"].map(
                  (url) => (
                    <div
                      key={url}
                      className="flex items-center justify-between text-[10px]"
                    >
                      <span className="text-slate-400 truncate">{url}</span>
                      <span className="text-emerald-400 font-semibold ml-1">
                        ✓
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Panel 4: AI Insights */}
            <div className="col-span-1 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <Brain size={13} className="text-violet-400" />
                <span className="text-xs font-semibold text-slate-200">
                  AI Insights
                </span>
              </div>
              {[
                {
                  title: "Memory leak pattern",
                  body: "Worker pool GC pauses correlate with request spikes. Consider increasing heap limit.",
                },
                {
                  title: "Predictive alert",
                  body: "DB connection pool will exhaust in ~18 min at current growth rate.",
                },
              ].map((insight) => (
                <div
                  key={insight.title}
                  className="rounded-lg bg-violet-950/30 border border-violet-800/30 p-2.5"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="badge badge-info text-[9px]">AI</span>
                    <p className="text-[10px] font-semibold text-violet-200">
                      {insight.title}
                    </p>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-relaxed">
                    {insight.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Panel 5: Topology */}
            <div className="col-span-1 p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Network size={13} className="text-sky-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Topology
                </span>
              </div>
              <div className="flex-1 min-h-0">
                <TopologyDiagram />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
//  ENTERPRISE FEATURES GRID
// ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Brain,
    title: "AI Root Cause Analysis",
    desc: "Instantly traces issues to origin with LLM-powered context across logs, metrics, and traces simultaneously.",
  },
  {
    icon: Network,
    title: "Real-Time Topology Mapping",
    desc: "Dynamic visual maps of your distributed system, updating live as services scale up and down.",
  },
  {
    icon: BarChart3,
    title: "Incident Timelines",
    desc: "Full replay with deployment correlation and AI-generated postmortem reports in seconds.",
  },
  {
    icon: Activity,
    title: "Multi-Channel Alerting",
    desc: "Slack, Discord, Email, PagerDuty, and Webhooks — route alerts to the right team instantly.",
  },
  {
    icon: Cpu,
    title: "Infrastructure Health",
    desc: "EC2, Docker, Kubernetes, and Linux fleet monitoring with per-container granularity.",
  },
  {
    icon: AlertTriangle,
    title: "Predictive Failure Detection",
    desc: "ML-powered outage probability scoring surfaces issues before they impact users.",
  },
  {
    icon: Lock,
    title: "Secure API Access",
    desc: "JWT auth, API keys, full audit logs, and per-endpoint rate limiting out of the box.",
  },
  {
    icon: Globe,
    title: "Fleet Monitoring",
    desc: "Manage hundreds of servers, clusters, and services from a single unified dashboard.",
  },
];

function EnterpriseFeatures() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="features" className="py-28 bg-white dark:bg-slate-950">
      <div ref={ref} className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">
            Enterprise Features
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Everything your team needs
          </h2>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
            Production-grade observability built for the teams that can&apos;t afford downtime.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              custom={i}
              className="group rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:border-indigo-200 dark:hover:border-indigo-800/50 hover:shadow-md transition-all duration-300"
            >
              <div className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 group-hover:border-indigo-100 dark:group-hover:border-indigo-900/60 transition-colors">
                <f.icon size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                {f.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
//  AGENT INSTALLER
// ─────────────────────────────────────────────────────────────
const INSTALL_CODE = `# Install CloudAI monitoring agent
curl -sSL https://cloudai.monitor/install.sh | bash

# Or via Docker
docker run -d --name cloudai-agent \\
  -e API_KEY=your_key \\
  cloudai/agent:latest

# Kubernetes
kubectl apply -f https://cloudai.monitor/k8s/agent.yaml`;

function AgentInstaller() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="install" className="py-28 bg-slate-50 dark:bg-slate-900/40">
      <div ref={ref} className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — terminal */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl">
              {/* Terminal chrome */}
              <div className="flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-slate-800">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Terminal size={12} />
                  bash — cloudai-install
                </div>
                <div />
              </div>
              {/* Code */}
              <pre className="font-mono text-sm leading-relaxed p-6 overflow-x-auto custom-scrollbar">
                {INSTALL_CODE.split("\n").map((line, i) => (
                  <div key={i} className="flex">
                    <span className="select-none text-slate-600 w-5 mr-4 text-right flex-shrink-0 tabular-nums">
                      {i + 1}
                    </span>
                    <span
                      className={
                        line.startsWith("#")
                          ? "text-emerald-400"
                          : line.startsWith("  ")
                          ? "text-sky-300"
                          : "text-slate-300"
                      }
                    >
                      {line || "\u00a0"}
                    </span>
                  </div>
                ))}
              </pre>
            </div>
          </motion.div>

          {/* Right — text + steps */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div>
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">
                Quick Deploy
              </p>
              <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
                Deploy in 60 Seconds
              </h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                Install the lightweight monitoring agent on any Linux server. No
                infrastructure changes required.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: Terminal,
                  step: "1",
                  title: "Install agent",
                  desc: "One curl command. Runs in under 30 seconds on any Linux distro.",
                  time: "~30s",
                },
                {
                  icon: RefreshCw,
                  step: "2",
                  title: "Connect to dashboard",
                  desc: "Agent auto-registers and begins service discovery immediately.",
                  time: "~5s",
                },
                {
                  icon: Activity,
                  step: "3",
                  title: "Monitor live",
                  desc: "Instant telemetry stream with AI analysis active from first heartbeat.",
                  time: "Instant",
                },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <s.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {s.title}
                      </h4>
                      <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 px-2 py-0.5 rounded-full">
                        {s.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Start Monitoring
                <ArrowRight size={14} />
              </Link>
              <a
                href="#"
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Read documentation →
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
//  CTA SECTION
// ─────────────────────────────────────────────────────────────
function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="py-28 bg-white dark:bg-slate-950">
      <div ref={ref} className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-900 dark:to-indigo-950/30 p-14 text-center"
        >
          {/* Background pattern */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
            style={{
              backgroundImage: `radial-gradient(circle, #4f46e5 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white mb-6 shadow-lg">
              <ShieldCheck size={22} />
            </div>

            <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
              Ready to Monitor Your Infrastructure?
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
              Deploy in seconds, get full observability instantly. No credit card
              required. Cancel anytime.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm group"
              >
                Start Monitoring
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Read Documentation
                <ChevronRight size={14} />
              </a>
            </div>

            <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
              Trusted by infrastructure teams at scale · SOC 2 Type II Ready
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
//  FOOTER
// ─────────────────────────────────────────────────────────────
const FOOTER_LINKS = {
  Product: ["Features", "Integrations", "Pricing", "Changelog"],
  Developers: ["Documentation", "API Reference", "Status Page", "GitHub"],
  Company: ["About", "Careers", "Blog", "Press"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "DPA"],
};

function Footer() {
  return (
    <footer className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 pt-16 pb-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                <Cloud size={15} />
              </div>
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                CloudAI Monitor
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px]">
              Enterprise AI-powered cloud observability. Built for teams that
              run mission-critical infrastructure.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <span className="badge badge-success text-[10px]">
                ● All Systems Operational
              </span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([col, links]) => (
            <div key={col}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4">
                {col}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 dark:text-slate-600">
            © 2026 CloudAI Monitor. Built with Next.js, Express, Redis, and
            Ollama.
          </p>
          <div className="flex items-center gap-5 text-xs text-slate-400 dark:text-slate-600">
            <a
              href="#"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Status
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
