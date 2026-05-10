"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, Brain, CloudCog, Database, Layers3, ServerCog, ShieldAlert, Sparkles, Workflow } from "lucide-react";
import { GlassCard } from "./GlassCard";

const features = [
  { title: "Live Monitoring", icon: Activity, text: "Track CPU, memory, and network in real time." },
  { title: "AI Insights", icon: Brain, text: "Analyze infrastructure logs with local Ollama models." },
  { title: "Auto Suggestions", icon: CloudCog, text: "Get optimization actions for better reliability." },
  { title: "Threat Alerts", icon: ShieldAlert, text: "Detect unusual behavior and reduce incident time." }
];

export const Navbar = () => (
  <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      <h1 className="text-lg font-semibold">AI Cloud Monitoring Platform</h1>
      <div className="flex gap-3">
        <Link href="/dashboard" className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">
          Open Dashboard
        </Link>
      </div>
    </nav>
  </header>
);

export const Hero = () => (
  <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2">
    <div>
      <p className="mb-3 text-cyan-300">Production-grade AI observability platform</p>
      <h2 className="text-4xl font-bold leading-tight md:text-5xl">Monitor, predict, and optimize your cloud with AI.</h2>
      <p className="mt-5 max-w-xl text-slate-300">
        A recruiter-ready full-stack SaaS showcasing real-time monitoring, anomaly detection, and AI-driven optimization
        workflows.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/dashboard" className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950">
          Launch Dashboard
        </Link>
        <Link href="/ai" className="rounded-xl border border-white/20 px-5 py-3 font-semibold">
          Analyze Logs
        </Link>
      </div>
      <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-center text-sm">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xl font-bold text-cyan-300">5s</p>
          <p className="text-slate-400">Polling</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xl font-bold text-cyan-300">6+</p>
          <p className="text-slate-400">Live APIs</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xl font-bold text-cyan-300">TS</p>
          <p className="text-slate-400">Full Stack</p>
        </div>
      </div>
    </div>
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card rounded-3xl p-6"
    >
      <p className="mb-4 flex items-center gap-2 text-sm text-cyan-300">
        <Sparkles size={14} /> Dashboard Preview
      </p>
      <div className="space-y-3">
        <div className="h-3 rounded-full bg-cyan-400/50" />
        <div className="h-3 w-2/3 rounded-full bg-indigo-400/50" />
        <div className="grid grid-cols-3 gap-3 pt-3">
          <div className="h-20 rounded-xl bg-white/10" />
          <div className="h-20 rounded-xl bg-white/10" />
          <div className="h-20 rounded-xl bg-white/10" />
        </div>
      </div>
    </motion.div>
  </section>
);

export const FeatureCards = () => (
  <section className="mx-auto max-w-7xl px-6 pb-20">
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {features.map((feature) => (
        <GlassCard key={feature.title}>
          <feature.icon className="mb-4 text-cyan-300" />
          <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
          <p className="text-sm text-slate-300">{feature.text}</p>
        </GlassCard>
      ))}
    </div>
  </section>
);

export const BuiltWith = () => (
  <section className="mx-auto max-w-7xl px-6 pb-16">
    <h3 className="mb-5 text-2xl font-semibold">Built With</h3>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[
        "Next.js 14 + TypeScript",
        "Express + Node.js Backend",
        "Ollama (llama3) + Demo AI Mode",
        "Zustand + Recharts + Framer Motion"
      ].map((item) => (
        <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          {item}
        </div>
      ))}
    </div>
  </section>
);

export const ArchitectureSection = () => (
  <section className="mx-auto max-w-7xl px-6 pb-16">
    <h3 className="mb-5 text-2xl font-semibold">Deployment Architecture</h3>
    <div className="grid gap-4 lg:grid-cols-3">
      <GlassCard>
        <div className="mb-2 flex items-center gap-2 text-cyan-300">
          <Layers3 size={16} /> Frontend (Vercel)
        </div>
        <p className="text-sm text-slate-300">Next.js dashboard, SEO metadata, optimized static + dynamic routes.</p>
      </GlassCard>
      <GlassCard>
        <div className="mb-2 flex items-center gap-2 text-cyan-300">
          <ServerCog size={16} /> Backend (Render)
        </div>
        <p className="text-sm text-slate-300">Express API for metrics, alerts, analytics, uploads, and AI analysis.</p>
      </GlassCard>
      <GlassCard>
        <div className="mb-2 flex items-center gap-2 text-cyan-300">
          <Database size={16} /> AI Layer
        </div>
        <p className="text-sm text-slate-300">Ollama local model in dev, intelligent Demo AI mode in public production.</p>
      </GlassCard>
    </div>
    <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-xs text-slate-300">
      {"Browser -> Vercel Frontend -> Render API -> Ollama (dev) or Demo AI mode (prod)"}
    </div>
  </section>
);

export const WorkflowSection = () => (
  <section className="mx-auto max-w-7xl px-6 pb-16">
    <h3 className="mb-5 text-2xl font-semibold">AI Workflow</h3>
    <div className="grid gap-4 md:grid-cols-4">
      {[
        { label: "Collect", desc: "Polling fetches metrics, infra health, alerts, and analytics." },
        { label: "Upload", desc: "Drag-and-drop log files with progress and validation." },
        { label: "Analyze", desc: "Logs sent to Ollama or smart fallback generator." },
        { label: "Act", desc: "Dashboard surfaces anomalies, threats, and recommendations." }
      ].map((item, idx) => (
        <motion.div key={item.label} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-cyan-300">
            <Workflow size={14} /> {item.label}
          </div>
          <p className="text-sm text-slate-300">{item.desc}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

export const ScreenshotsSection = () => (
  <section className="mx-auto max-w-7xl px-6 pb-16">
    <h3 className="mb-5 text-2xl font-semibold">Screenshots Carousel</h3>
    <div className="grid gap-4 md:grid-cols-3">
      {["Dashboard Overview", "AI Log Analysis", "Infrastructure Health"].map((title) => (
        <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 h-40 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900" />
          <p className="text-sm text-slate-300">{title} (replace with actual screenshot)</p>
        </div>
      ))}
    </div>
  </section>
);

export const TechStackSection = () => (
  <section className="mx-auto max-w-7xl px-6 pb-20">
    <h3 className="mb-5 text-2xl font-semibold">Tech Stack</h3>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[
        { title: "Frontend", text: "Next.js 14, TypeScript, Tailwind CSS" },
        { title: "State + UX", text: "Zustand, Framer Motion, React Hot Toast" },
        { title: "Observability", text: "Recharts + polling + smart caching" },
        { title: "Backend + AI", text: "Express, Multer, Ollama, Demo AI mode" }
      ].map((item) => (
        <GlassCard key={item.title}>
          <p className="mb-1 font-semibold">{item.title}</p>
          <p className="text-sm text-slate-300">{item.text}</p>
        </GlassCard>
      ))}
    </div>
  </section>
);

export const Footer = () => (
  <footer className="border-t border-white/10 py-6 text-center text-sm text-slate-400">
    AI Cloud Monitoring Platform - Built with Next.js, Express, and Ollama
  </footer>
);
