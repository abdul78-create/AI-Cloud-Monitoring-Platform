"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  Activity, Brain, CloudCog, ShieldAlert, Sparkles, ArrowRight, Check, Star, 
  Users, Globe, Zap, MessageSquare, Box, Lock, Server, BarChart3, Terminal, 
  Cpu, Network, Database, Sun, Moon, Eye, Share2, Layers, HardDrive, Cpu as CpuIcon
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import gsap from "gsap";

// Mock data for charts
const chartData = [
  { name: "00:00", value: 30, value2: 40 },
  { name: "04:00", value: 45, value2: 55 },
  { name: "08:00", value: 35, value2: 50 },
  { name: "12:00", value: 65, value2: 75 },
  { name: "16:00", value: 40, value2: 60 },
  { name: "20:00", value: 85, value2: 90 },
  { name: "24:00", value: 50, value2: 70 },
];

const analyticsData = Array.from({ length: 20 }, (_, i) => ({
  time: i,
  requests: Math.floor(Math.random() * 100) + 50,
  latency: Math.floor(Math.random() * 50) + 10,
}));

export default function LandingRedesign() {
  const containerRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark"); // Default to dark for premium feel

  // Theme handling
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      // Default to dark as requested for premium observability aesthetic
      setTheme("dark");
      document.documentElement.classList.toggle("dark", true);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Mouse follow effect using GSAP
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (blobRef.current) {
        gsap.to(blobRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.8,
          ease: "power2.out",
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 overflow-hidden font-sans transition-colors duration-500">
      {/* Glow effect background (Made subtle) */}
      <div ref={blobRef} className="pointer-events-none fixed -left-20 -top-20 h-96 w-96 rounded-full bg-slate-400/5 dark:bg-indigo-500/5 opacity-50 blur-3xl" style={{ transform: 'translate(-50%, -50%)' }} />
      <div className="pointer-events-none fixed right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-slate-400/5 dark:bg-violet-500/5 opacity-30 blur-3xl" />
      
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_00%,#000_70%,transparent_100%)] opacity-20 dark:opacity-30" />

      <Navbar theme={theme} toggleTheme={toggleTheme} />
      
      <main>
        <Hero theme={theme} />
        <PlatformFeatures />
        <ArchitectureOverview />
        <HowItWorks />
        <QuickStartDocs />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}

// Navbar Component
const Navbar = ({ theme, toggleTheme }: { theme: "light" | "dark", toggleTheme: () => void }) => (
  <header className="sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl shadow-sm">
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
          <Activity size={18} />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">CloudAI</span>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
        <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group">
          Features
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
        </a>
        <a href="#architecture" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group">
          Architecture
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
        </a>
        <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group">
          How It Works
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
        </a>
        <a href="#docs" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group">
          Docs
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
        </a>
      </div>

      <div className="flex gap-4 items-center">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        <Link href="/dashboard" className="hidden sm:inline-flex text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors">
          Log in
        </Link>
        <Link href="/dashboard" className="rounded-xl bg-slate-900 dark:bg-slate-100 px-4 py-2 text-sm font-semibold text-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:text-white transition-all shadow-sm">
          Open Dashboard
        </Link>
      </div>
    </nav>
  </header>
);

// Hero Section Component (Simplified & Centered)
const Hero = ({ theme }: { theme: "light" | "dark" }) => {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-32 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        <div className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-full px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 mb-6">
          <Sparkles size={12} className="text-indigo-600 dark:text-indigo-400" />
          <span>AI Infrastructure Intelligence Platform</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
          Observability for the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">Next Generation of Cloud</span>
        </h1>
        
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
          A professional, enterprise-grade platform for AI operations, topology intelligence, and incident monitoring. Built for modern infrastructure teams.
        </p>
        
        <div className="flex justify-center gap-4 mb-20">
          <Link href="/dashboard" className="rounded-lg bg-slate-900 dark:bg-slate-50 px-6 py-3 font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm flex items-center gap-2 group">
            Get Started <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="#docs" className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-3 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            View Documentation
          </Link>
        </div>

        {/* Elegant Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-violet-500/5 rounded-2xl blur-2xl -z-10" />
          
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                </div>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 ml-2">dashboard.cloudai.io</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">All systems operational</span>
              </div>
            </div>
            
            <div className="grid grid-cols-12 gap-4">
              {/* Sidebar Minimized */}
              <div className="col-span-1 border-r border-slate-100 dark:border-slate-800 pr-2 flex flex-col gap-4 items-center">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">C</div>
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg" />
              </div>
              
              {/* Main Content Area */}
              <div className="col-span-11 space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Cluster Health", val: "99.8%", status: "Good" },
                    { label: "Active Nodes", val: "1,240", status: "Stable" },
                    { label: "Avg Latency", val: "14ms", status: "Optimal" },
                    { label: "Error Rate", val: "0.02%", status: "Low" },
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800 text-left">
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.label}</div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white">{item.val}</div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{item.status}</div>
                    </div>
                  ))}
                </div>
                
                <div className="h-40 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={1.5} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

// Platform Features Component
const PlatformFeatures = () => {
  const features = [
    { icon: Brain, title: "AI Root Cause Analysis", desc: "Instantly trace issues back to their origin with deep context." },
    { icon: Activity, title: "Real-Time Monitoring", desc: "Sub-second telemetry processing with zero lag." },
    { icon: Network, title: "Infrastructure Topology", desc: "Dynamic visual maps of your entire distributed system." },
    { icon: MessageSquare, title: "AI ChatOps Assistant", desc: "Natural language interface for running queries." },
    { icon: Layers, title: "Distributed Architecture", desc: "Scalable multi-service ingestion without bottlenecks." },
    { icon: Lock, title: "Security Monitoring", desc: "Active threat detection and compliance scoring." },
    { icon: Zap, title: "Event Streaming", desc: "Pub/sub event bus handling millions of events." },
    { icon: Eye, title: "Multi-Service Observability", desc: "Unified dashboard for logs, metrics, and traces." },
  ];

  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-32 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">Platform Features</div>
        <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-display">Enterprise-Grade Capabilities</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Everything you need to monitor, analyze, and secure your cloud infrastructure.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 hover:shadow-premium dark:hover:shadow-indigo-900/10 transition-all duration-300 hover:-translate-y-1">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 inline-flex border border-slate-100 dark:border-slate-700 mb-4">
              <feature.icon size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

// Architecture Overview Component
const ArchitectureOverview = () => (
  <section id="architecture" className="py-32 bg-white dark:bg-slate-950">
    <div className="mx-auto max-w-7xl px-6">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">Architecture Overview</div>
        <h2 className="text-4xl font-bold tracking-tight font-display text-slate-900 dark:text-white">Simplified Data Flow</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          How telemetry data moves through our system in real-time.
        </p>
      </div>

      <div className="relative max-w-4xl mx-auto">
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 -z-10" />
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
          {[
            { step: "1", label: "Agents", icon: Server },
            { step: "2", label: "Metrics Pipeline", icon: Zap },
            { step: "3", label: "AI Analysis", icon: Brain },
            { step: "4", label: "Alert Engine", icon: ShieldAlert },
            { step: "5", label: "Visualization", icon: BarChart3 },
          ].map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm relative hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                {item.step}
              </div>
              <div className="flex justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                <item.icon size={28} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// How It Works Component (Onboarding/Help)
const HowItWorks = () => {
  const steps = [
    { num: "01", title: "What the Platform Does", desc: "Consolidates all your cloud metrics, logs, and traces into a single intelligent dashboard." },
    { num: "02", title: "How Monitoring Works", desc: "Lightweight agents pull data every 5 seconds and stream it via secure WebSockets." },
    { num: "03", title: "How AI Analysis Works", desc: "Local LLMs analyze patterns to detect anomalies and suggest root causes automatically." },
    { num: "04", title: "Topology Visualization", desc: "Interactive graphs show how your services connect and where failures occur." },
    { num: "05", title: "How Alerts Work", desc: "Thresholds and AI triggers fire real-time notifications to Slack, Email, or Webhooks." },
    { num: "06", title: "Infrastructure Control", desc: "View your entire fleet from high-level clusters down to individual container nodes." },
  ];

  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-32 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">Onboarding</div>
        <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-display">How It Works</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          A quick guide to understanding the AI Cloud Monitoring Platform.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 hover:shadow-premium dark:hover:shadow-indigo-900/10 transition-all duration-300">
            <div className="text-3xl font-bold font-display text-indigo-100 dark:text-slate-800 mb-4">{step.num}</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

// Quick Start & Docs Component
const QuickStartDocs = () => (
  <section id="docs" className="mx-auto max-w-7xl px-6 py-32 bg-white dark:bg-slate-950">
    <div className="text-center max-w-3xl mx-auto mb-16">
      <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">Documentation</div>
      <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-display">Quick Start Guide</h2>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
        Get up and running with the platform in minutes.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Platform Workflow</h3>
        {[
          { label: "Open Dashboard", desc: "Access the main UI to see your live infrastructure status." },
          { label: "View Infrastructure", desc: "Check active nodes, health scores, and resource loads." },
          { label: "Analyze Metrics", desc: "Deep dive into time-series data with sub-millisecond zoom." },
          { label: "Use AI Assistant", desc: "Ask the chat interface to explain spikes or resolve errors." },
        ].map((item, idx) => (
          <div key={idx} className="flex items-start gap-4">
            <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-1">
              <Check size={14} />
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">{item.label}</span>
              <span className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 dark:bg-slate-900/50 text-white rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="text-xs text-slate-500">terminal</div>
        </div>
        
        <div className="font-mono text-sm space-y-4">
          <div>
            <span className="text-emerald-400"># Install the platform agent</span> <br />
            <span className="text-slate-400">$</span> npm run install-agent
          </div>
          <div>
            <span className="text-emerald-400"># Start services via Docker</span> <br />
            <span className="text-slate-400">$</span> docker-compose up --build
          </div>
          <div>
            <span className="text-emerald-400"># Launch the Next.js frontend</span> <br />
            <span className="text-slate-400">$</span> npm run dev
          </div>
        </div>
      </div>
    </div>
  </section>
);

// CTA Section Component
const CTASection = () => (
  <section className="mx-auto max-w-4xl px-6 py-24 text-center">
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900 p-12">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
        Ready to Optimize Your Infrastructure?
      </h2>
      <p className="text-slate-600 dark:text-slate-400 text-base mb-8 max-w-xl mx-auto leading-relaxed">
        Deploy our lightweight agent and get intelligent, actionable insights in less than 5 minutes. No credit card required.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/dashboard" className="rounded-lg bg-slate-900 dark:bg-slate-50 px-5 py-2.5 font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm flex items-center gap-2 group text-sm">
          Get Started Free <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </Link>
        <Link href="/dashboard" className="rounded-lg border border-slate-200 dark:border-slate-700 px-5 py-2.5 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm">
          Try AI Assistant
        </Link>
      </div>
    </div>
  </section>
);

// Footer Component
const Footer = () => (
  <footer className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 py-12">
    <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1 rounded-lg bg-indigo-600 text-white inline-flex">
            <Activity size={14} />
          </div>
          <span className="font-bold tracking-tight text-slate-900 dark:text-white">CloudAI</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Premium full-stack observability platform built with React, local LLMs, and high-density visual telemetry.
        </p>
      </div>
      
      <div>
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">Product</h4>
        <div className="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Features</a>
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Integrations</a>
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Pricing</a>
        </div>
      </div>
      
      <div>
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">Developers</h4>
        <div className="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Documentation</a>
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">API Reference</a>
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Status</a>
        </div>
      </div>
      
      <div>
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">Company</h4>
        <div className="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">About</a>
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Careers</a>
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Blog</a>
        </div>
      </div>
    </div>
    
    <div className="mx-auto max-w-7xl px-6 mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-xs text-slate-400 dark:text-slate-600">
        &copy; 2026 CloudAI. Built with Next.js, Express, and Ollama.
      </div>
      <div className="flex gap-4 text-xs text-slate-400 dark:text-slate-600 font-medium">
        <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Privacy</a>
        <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Terms</a>
      </div>
    </div>
  </footer>
);
