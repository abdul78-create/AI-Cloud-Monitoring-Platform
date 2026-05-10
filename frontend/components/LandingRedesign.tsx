"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Activity, Brain, CloudCog, ShieldAlert, Sparkles, ArrowRight, Check, Star, Users, Globe, Zap, MessageSquare, Box, Lock, Server, BarChart3, Terminal, Cpu, Network, Database } from "lucide-react";
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

// Main Component
export default function LandingRedesign() {
  const containerRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);

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
    <div ref={containerRef} className="relative min-h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Glow effect background */}
      <div ref={blobRef} className="pointer-events-none fixed -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-400/20 opacity-50 blur-3xl" style={{ transform: 'translate(-50%, -50%)' }} />
      <div className="pointer-events-none fixed right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-violet-400/10 opacity-30 blur-3xl" />
      
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_00%,#000_70%,transparent_100%)] opacity-20" />

      <Navbar />
      <Hero />
      <TrustedMetrics />
      <AIMonitoringShowcase />
      <InfrastructureVisualization />
      <FeaturesGrid />
      <AIChatOpsPreview />
      <ArchitectureWorkflow />
      <AnalyticsPreview />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  );
}

// 0. Navbar
const Navbar = () => (
  <header className="sticky top-0 z-50 border-b border-white/80 bg-white/70 backdrop-blur-xl shadow-sm shadow-slate-100/50">
    <nav className="mx-auto flex max-width-7xl items-center justify-between px-6 py-4 max-w-7xl">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
          <Activity size={18} />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900">CloudAI</span>
      </div>
      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
        <a href="#showcase" className="hover:text-indigo-600 transition-colors">Showcase</a>
        <a href="#architecture" className="hover:text-indigo-600 transition-colors">Architecture</a>
        <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
      </div>
      <div className="flex gap-3 items-center">
        <Link href="/dashboard" className="hidden sm:inline-flex text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
          Log in
        </Link>
        <Link href="/dashboard" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 transition-all shadow-sm hover:shadow-indigo-100">
          Open Dashboard
        </Link>
      </div>
    </nav>
  </header>
);

// 1. Hero Section
const Hero = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-32 grid lg:grid-cols-2 gap-12 items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10"
      >
        <div className="inline-flex items-center gap-2 bg-white/80 border border-slate-200/60 shadow-sm rounded-full px-3 py-1 text-xs font-medium text-indigo-600 mb-6">
          <Sparkles size={12} />
          <span>Next-Gen Observability Platform</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold font-display tracking-tight text-slate-900 leading-[1.1]">
          AI-Powered <br />
          <span className="text-gradient">Cloud Intelligence</span><br />
          for Modern Devs.
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-xl leading-relaxed">
          Monitor, predict, and optimize your cloud infrastructure with real-time AI analysis. World-class observability that fits on a floating glass card.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/dashboard" className="rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white hover:bg-indigo-700 transition-all shadow-sm hover:shadow-indigo-100 flex items-center gap-2 group">
            Launch Dashboard <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/ai" className="rounded-xl bg-white border border-slate-200 px-6 py-3.5 font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            Try AI Analyzer
          </Link>
        </div>
        
        <div className="mt-12 flex items-center gap-6">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 border-2 border-white" />
            ))}
          </div>
          <div className="text-xs text-slate-500">
            <p className="font-semibold text-slate-800">Trusted by 2,000+ engineers</p>
            <p>at Stripe, Vercel, and Linear</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        style={{ y }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-3xl blur-3xl -z-10" />
        <div className="glass-card rounded-3xl p-6 border-white/80 shadow-premium">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-semibold text-slate-800">Live Infrastructure Pulse</span>
            </div>
            <div className="text-xs text-slate-400">Updates every 5s</div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">CPU Usage</div>
              <div className="text-2xl font-bold text-slate-900">42%</div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '42%' }} />
              </div>
            </div>
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">Memory</div>
              <div className="text-2xl font-bold text-slate-900">68%</div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-violet-600 h-full rounded-full" style={{ width: '68%' }} />
              </div>
            </div>
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">Latency</div>
              <div className="text-2xl font-bold text-slate-900">14ms</div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </div>

          <div className="h-40 w-full bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="absolute -bottom-6 -left-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-premium flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
              <ShieldAlert size={18} />
            </div>
            <div>
              <div className="text-xs text-slate-500">Security Status</div>
              <div className="text-sm font-bold text-slate-900">0 Active Threats</div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

// 2. Trusted Metrics Section
const TrustedMetrics = () => {
  const metrics = [
    { value: "99.99%", label: "Platform Uptime", detail: "Enterprise Grade" },
    { value: "250K+", label: "Events Analyzed", detail: "Per Second" },
    { value: "85%", label: "Faster Detection", detail: "With AI Models" },
    { value: "< 10ms", label: "Query Latency", detail: "Global Edge" },
  ];

  return (
    <section className="bg-white border-y border-slate-100 py-12 relative z-10">
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {metrics.map((metric, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-slate-900 font-display">{metric.value}</div>
            <div className="text-sm font-medium text-slate-600 mt-1">{metric.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{metric.detail}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// 3. AI Monitoring Showcase
const AIMonitoringShowcase = () => {
  const cards = [
    { title: "AI Anomaly Detection", icon: Brain, desc: "Automatically identify deviations in metrics before they become incidents.", color: "bg-indigo-600" },
    { title: "Log Intelligence", icon: Terminal, desc: "Stream and parse millions of log lines with real-time AI pattern matching.", color: "bg-violet-600" },
    { title: "Predictive Analytics", icon: BarChart3, desc: "Forecast resource exhaustion and plan capacity with 95% accuracy.", color: "bg-cyan-600" },
    { title: "Automated Remediation", icon: Zap, desc: "Trigger self-healing workflows based on AI-recommended actions.", color: "bg-emerald-600" },
  ];

  return (
    <section id="showcase" className="mx-auto max-w-7xl px-6 py-32">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3">AI Engine</div>
        <h2 className="text-4xl font-bold tracking-tight text-slate-900 font-display">Smarter Monitoring for Modern Stacks</h2>
        <p className="mt-4 text-lg text-slate-600">
          Move from reactive firefighting to proactive AI-driven cloud management.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {cards.map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-3xl p-8 border-slate-200/60 glass-card-hover group cursor-pointer"
          >
            <div className={`p-3 rounded-2xl inline-flex text-white ${card.color} shadow-lg shadow-slate-100`}>
              <card.icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-6 mb-2 flex items-center gap-2">
              {card.title}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 text-slate-400" />
            </h3>
            <p className="text-slate-600 leading-relaxed">{card.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// 4. Infrastructure Visualization
const InfrastructureVisualization = () => (
  <section id="architecture" className="bg-slate-900 text-white py-32 relative overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
    <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl" />
    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-3xl" />
    
    <div className="mx-auto max-w-7xl px-6 relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <div className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">Architecture</div>
        <h2 className="text-4xl font-bold tracking-tight font-display">Deep Real-Time Integration</h2>
        <p className="mt-4 text-lg text-slate-400">
          Seamlessly connect your entire cloud infrastructure to our AI processing cluster.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 items-center">
        {/* Step 1 */}
        <div className="text-center lg:text-left bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <div className="text-sm font-bold text-cyan-400 mb-1">01. Ingest</div>
          <h3 className="text-lg font-bold mb-2">Multi-Cloud Data</h3>
          <p className="text-xs text-slate-400">Collect metrics, logs, and traces from AWS, GCP, Azure.</p>
          <div className="mt-4 flex gap-2 justify-center lg:justify-start text-slate-500">
            <Server size={18} />
            <Database size={18} />
            <Globe size={18} />
          </div>
        </div>

        {/* Arrow 1 */}
        <div className="hidden lg:flex justify-center text-cyan-500/50">
          <Zap size={32} className="animate-pulse" />
        </div>

        {/* Step 2 */}
        <div className="text-center lg:text-left bg-indigo-600 border border-indigo-500 rounded-2xl p-6 shadow-xl shadow-indigo-900/50">
          <div className="text-sm font-bold text-indigo-200 mb-1">02. Analyze</div>
          <h3 className="text-lg font-bold mb-2">AI Processing</h3>
          <p className="text-xs text-indigo-100">Local LLMs & custom anomaly models score every event.</p>
          <div className="mt-4 flex gap-2 justify-center lg:justify-start text-indigo-200">
            <Brain size={18} />
            <Cpu size={18} />
            <Terminal size={18} />
          </div>
        </div>

        {/* Arrow 2 */}
        <div className="hidden lg:flex justify-center text-cyan-500/50">
          <Zap size={32} className="animate-pulse" />
        </div>

        {/* Step 3 */}
        <div className="col-span-2 lg:col-span-2 text-center lg:text-left bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <div className="text-sm font-bold text-emerald-400 mb-1">03. Deliver</div>
          <h3 className="text-lg font-bold mb-2">Actionable Intelligence</h3>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-start gap-2 text-xs">
              <Check size={14} className="text-emerald-400 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block">Dashboard</span>
                <span className="text-slate-400">Live charts and metrics.</span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <Check size={14} className="text-emerald-400 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block">ChatOps</span>
                <span className="text-slate-400">Slack & Assistant.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// 5. Features Grid
const FeaturesGrid = () => {
  const features = [
    { icon: Activity, title: "Real-Time Engine", desc: "5-second polling and live streaming ensures zero lag." },
    { icon: Brain, title: "Custom LLMs", desc: "Local Ollama models analyze infrastructure with complete privacy." },
    { icon: ShieldAlert, title: "Zero-Day Threats", desc: "Unsupervised learning flags unknown patterns immediately." },
    { icon: Box, title: "Multi-Cloud", desc: "Native integrations for AWS, Vercel, Render, and more." },
    { icon: MessageSquare, title: "ChatOps Ready", desc: "Full terminal and chat assistant for instant interaction." },
    { icon: Lock, title: "Secure & Compliant", desc: "Data processed locally with military-grade encryption." },
  ];

  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-32">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-4xl font-bold tracking-tight text-slate-900 font-display">Everything You Need.</h2>
        <p className="mt-4 text-lg text-slate-600">
          No third-party bloat. Just speed, accuracy, and enterprise capabilities.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-indigo-100 hover:shadow-premium transition-all duration-300">
            <div className="p-2 rounded-lg bg-slate-50 text-indigo-600 inline-flex border border-slate-100">
              <feature.icon size={18} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-4 mb-1">{feature.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

// 6. AI ChatOps Preview
const AIChatOpsPreview = () => (
  <section className="bg-slate-50 border-y border-slate-100 py-32 relative overflow-hidden">
    <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <div className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3">Interactive Assistant</div>
        <h2 className="text-4xl font-bold tracking-tight text-slate-900 font-display">Talk to Your Infrastructure.</h2>
        <p className="mt-4 text-lg text-slate-600 leading-relaxed">
          Our integrated AI Assistant responds to natural language queries. Ask about spikes, security, or costs and get instant, verifiable answers based on live data.
        </p>
        
        <div className="mt-8 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-1 rounded-full bg-emerald-100 text-emerald-600 mt-0.5">
              <Check size={14} />
            </div>
            <p className="text-sm text-slate-600"><span className="font-semibold text-slate-800">&quot;Why is CPU spiking on AWS?&quot;</span> — Contextual analysis in seconds.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-1 rounded-full bg-emerald-100 text-emerald-600 mt-0.5">
              <Check size={14} />
            </div>
            <p className="text-sm text-slate-600"><span className="font-semibold text-slate-800">&quot;Optimize my Vercel spend.&quot;</span> — Actionable reduction reports.</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl border-white/80 shadow-premium p-4 max-h-[400px] overflow-hidden relative">
        <div className="flex items-center gap-2 mb-4 text-xs text-slate-400">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          Assistant Active (Ollama-Llama3)
        </div>
        
        <div className="space-y-4 text-sm">
          {/* User Message */}
          <div className="flex justify-end">
            <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[80%]">
              What caused the API latency spike at 14:20?
            </div>
          </div>
          
          {/* AI Response */}
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-none px-4 py-2.5 max-w-[80%] shadow-sm">
              <p className="font-semibold text-indigo-600 text-xs mb-1">AI Assistant</p>
              I detected a database dead-lock on your production cluster. CPU spiked to 95% causing a 1.2s latency in HTTP responses. 
              <div className="mt-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                Action: I recommend scaling your DB write-replica to 2 nodes.
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[80%]">
              Apply that recommendation now.
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </div>
    </div>
  </section>
);

// 7. Architecture Workflow
const ArchitectureWorkflow = () => (
  <section className="mx-auto max-width-7xl px-6 py-32 max-w-7xl">
    <div className="text-center max-w-3xl mx-auto mb-20">
      <h2 className="text-4xl font-bold tracking-tight text-slate-900 font-display">Intelligent Workflow.</h2>
      <p className="mt-4 text-lg text-slate-600">
        How our platform processes data from collection to resolution.
      </p>
    </div>

    <div className="relative">
      <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 -z-10" />
      
      <div className="grid lg:grid-cols-4 gap-8">
        {[
          { label: "Collect", desc: "Aggregates infrastructure logs and real-time metrics." },
          { label: "Predict", desc: "ML models forecast resource consumption spikes." },
          { label: "Resolve", desc: "Generates step-by-step remediation suggestions." },
          { label: "Verify", desc: "Audits applied fixes and recalibrates parameters." },
        ].map((item, idx) => (
          <div key={idx} className="relative bg-white border border-slate-100 rounded-2xl p-6 text-center lg:text-left hover:border-indigo-100 transition-all">
            <div className="absolute -top-3 left-1/2 lg:left-6 -translate-x-1/2 lg:translate-x-0 h-6 w-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
              {idx + 1}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-2 mb-1">{item.label}</h3>
            <p className="text-sm text-slate-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// 8. Analytics Preview
const AnalyticsPreview = () => (
  <section className="bg-white py-32">
    <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-center">
      <div className="order-2 lg:order-1 h-[350px] bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-bold text-slate-800">Cluster Throughput</div>
          <div className="text-xs text-slate-500">Live Operations</div>
        </div>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={analyticsData}>
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Tooltip />
            <Line type="monotone" dataKey="requests" stroke="#4f46e5" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="latency" stroke="#a78bfa" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="order-1 lg:order-2">
        <div className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3">Live Telemetry</div>
        <h2 className="text-4xl font-bold tracking-tight text-slate-900 font-display">Deep Metric Analysis.</h2>
        <p className="mt-4 text-lg text-slate-600 leading-relaxed">
          Interact with sub-millisecond precision charts. Zoom, scrape, and export massive streams of analytics through our blazing fast edge-powered dashboard.
        </p>
        <div className="mt-6 flex gap-3 text-sm text-slate-600 font-medium">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-indigo-600" /> Requests
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-violet-400" /> Latency
          </div>
        </div>
      </div>
    </div>
  </section>
);

// 9. Testimonials Section
const Testimonials = () => {
  const list = [
    { name: "Alex Chen", role: "VP of Engineering", company: "Stripe", quote: "CloudAI transformed how we track API logs. The AI assistant answers questions faster than our previous search cluster." },
    { name: "Sarah Jenkins", role: "DevOps Lead", company: "Vercel", quote: "We replaced our complex PromQL setup with this clean dashboard. It just works out of the box." },
    { name: "M. Abdul", role: "Full Stack Engineer", company: "Project Owner", quote: "I built this platform to show what's possible with modern React, local LLMs, and high-density visual telemetry." },
  ];

  return (
    <section className="bg-slate-50 border-y border-slate-100 py-32">
      <div className="mx-auto max-width-7xl px-6 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 font-display">What Engineers Say.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {list.map((item, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-premium transition-all duration-300">
              <div className="flex gap-1 text-amber-500 mb-4">
                {[...Array(5)].map((_, idx) => <Star key={idx} size={14} fill="currentColor" />)}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed italic">&quot;{item.quote}&quot;</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500" />
                <div>
                  <div className="text-sm font-bold text-slate-900">{item.name}</div>
                  <div className="text-xs text-slate-500">{item.role} @ {item.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 10. CTA Section
const CTASection = () => (
  <section className="mx-auto max-w-7xl px-6 py-32 text-center relative">
    <div className="absolute inset-0 bg-indigo-600 rounded-[40px] -z-10 shadow-xl shadow-indigo-900/10" />
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem] rounded-[40px] -z-10" />
    
    <div className="py-16 px-6 text-white max-w-3xl mx-auto">
      <h2 className="text-4xl font-bold tracking-tight font-display mb-4">Ready to Optimize Your Infrastructure?</h2>
      <p className="text-indigo-100 text-lg mb-8 leading-relaxed">
        Deploy our lightweight agent and get intelligent, actionable insights in less than 5 minutes. No credit card required.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/dashboard" className="rounded-xl bg-white px-6 py-3.5 font-semibold text-indigo-600 hover:bg-slate-50 transition-all shadow-lg flex items-center gap-2 group">
          Get Started Free <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
        <Link href="/ai" className="rounded-xl border border-white/30 px-6 py-3.5 font-semibold text-white hover:bg-white/10 transition-all">
          Try AI Analyzer
        </Link>
      </div>
      
      <div className="mt-12 flex items-center justify-center gap-8 text-xs text-indigo-100">
        <div className="flex items-center gap-2">
          <Check size={14} className="text-emerald-300" /> No complex setup
        </div>
        <div className="flex items-center gap-2">
          <Check size={14} className="text-emerald-300" /> 14-day free trial
        </div>
        <div className="flex items-center gap-2">
          <Check size={14} className="text-emerald-300" /> SOC2 Compliant
        </div>
      </div>
    </div>
  </section>
);

// 11. Footer
const Footer = () => (
  <footer className="border-t border-slate-100 bg-white py-12">
    <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1 rounded-lg bg-indigo-600 text-white inline-flex">
            <Activity size={14} />
          </div>
          <span className="font-bold tracking-tight text-slate-900">CloudAI</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Premium full-stack observability platform built with React, local LLMs, and high-density visual telemetry.
        </p>
      </div>
      
      <div>
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Product</h4>
        <div className="flex flex-col gap-2 text-xs text-slate-500 font-medium">
          <a href="#" className="hover:text-indigo-600">Features</a>
          <a href="#" className="hover:text-indigo-600">Integrations</a>
          <a href="#" className="hover:text-indigo-600">Pricing</a>
          <a href="#" className="hover:text-indigo-600">Security</a>
        </div>
      </div>
      
      <div>
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Developers</h4>
        <div className="flex flex-col gap-2 text-xs text-slate-500 font-medium">
          <a href="#" className="hover:text-indigo-600">Documentation</a>
          <a href="#" className="hover:text-indigo-600">API Reference</a>
          <a href="#" className="hover:text-indigo-600">Status</a>
          <a href="#" className="hover:text-indigo-600">Changelog</a>
        </div>
      </div>
      
      <div>
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Company</h4>
        <div className="flex flex-col gap-2 text-xs text-slate-500 font-medium">
          <a href="#" className="hover:text-indigo-600">About</a>
          <a href="#" className="hover:text-indigo-600">Careers</a>
          <a href="#" className="hover:text-indigo-600">Blog</a>
          <a href="#" className="hover:text-indigo-600">Contact</a>
        </div>
      </div>
    </div>
    
    <div className="mx-auto max-w-7xl px-6 mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-xs text-slate-400">
        &copy; 2026 CloudAI. Built with Next.js, Express, and Ollama.
      </div>
      <div className="flex gap-4 text-xs text-slate-400 font-medium">
        <a href="#" className="hover:text-indigo-600">Privacy</a>
        <a href="#" className="hover:text-indigo-600">Terms</a>
        <a href="#" className="hover:text-indigo-600">Cookies</a>
      </div>
    </div>
  </footer>
);
