import React from "react";
import Link from "next/link";
import { Terminal, Zap, Compass, ArrowRight, PlayCircle, BookOpen, Server, Shield } from "lucide-react";

export default function DocsOverviewPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 pt-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          How It Works
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Learn how to monitor your infrastructure, analyze telemetry, detect incidents, and automate cloud operations using our enterprise-grade AI observability platform.
        </p>
      </div>

      {/* Main Video Tutorial */}
      <div className="card overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl group cursor-pointer">
        <div className="aspect-video bg-slate-900 relative flex items-center justify-center">
          {/* Mock Video Thumbnail */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-slate-900/80 mix-blend-multiply"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-blue-600">
              <PlayCircle size={32} className="text-white ml-1" />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
            <div>
              <span className="px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">Platform Overview</span>
              <h3 className="text-xl font-bold text-white shadow-sm">Getting Started with CloudAI Monitor</h3>
            </div>
            <span className="px-2 py-1 bg-black/50 backdrop-blur-md rounded text-xs font-mono">4:20</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/docs/agent" className="group block p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 transition-colors shadow-sm">
          <Terminal className="text-blue-500 mb-4" size={24} />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Agent Installation</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">Deploy our lightweight monitoring agent on your Linux servers in under 60 seconds.</p>
          <div className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 uppercase tracking-wide">
            Read guide <ArrowRight size={14} />
          </div>
        </Link>

        <Link href="/docs/api" className="group block p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 transition-colors shadow-sm">
          <Zap className="text-blue-500 mb-4" size={24} />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">API Reference</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">Integrate directly with our telemetry ingestion pipelines and AI incident engine.</p>
          <div className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 uppercase tracking-wide">
            Explore API <ArrowRight size={14} />
          </div>
        </Link>
      </div>

      {/* Video Tutorials Grid */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Compass className="text-blue-500" />
          Video Tutorials
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Video 1 */}
          <div className="card overflow-hidden group cursor-pointer border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 transition-colors">
            <div className="aspect-video bg-slate-800 relative flex items-center justify-center">
              <PlayCircle size={24} className="text-white/70 group-hover:text-white group-hover:scale-110 transition-all" />
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white font-mono">2:15</span>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1 group-hover:text-blue-500 transition-colors">Connecting Kubernetes</h4>
              <p className="text-xs text-slate-500 line-clamp-2">Learn how to deploy our DaemonSet to monitor your entire K8s cluster automatically.</p>
            </div>
          </div>
          
          {/* Video 2 */}
          <div className="card overflow-hidden group cursor-pointer border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 transition-colors">
            <div className="aspect-video bg-slate-800 relative flex items-center justify-center">
              <PlayCircle size={24} className="text-white/70 group-hover:text-white group-hover:scale-110 transition-all" />
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white font-mono">3:40</span>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1 group-hover:text-blue-500 transition-colors">Configuring Alert Rules</h4>
              <p className="text-xs text-slate-500 line-clamp-2">Set up dynamic thresholds, standard deviations, and connect Slack webhooks.</p>
            </div>
          </div>

          {/* Video 3 */}
          <div className="card overflow-hidden group cursor-pointer border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 transition-colors">
            <div className="aspect-video bg-slate-800 relative flex items-center justify-center">
              <PlayCircle size={24} className="text-white/70 group-hover:text-white group-hover:scale-110 transition-all" />
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white font-mono">5:12</span>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1 group-hover:text-blue-500 transition-colors">Using AI Root Cause</h4>
              <p className="text-xs text-slate-500 line-clamp-2">Watch the AI automatically detect, correlate, and diagnose a database memory leak.</p>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Core Concepts */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <BookOpen className="text-blue-500" />
          Core Platform Concepts
        </h2>
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-4 items-start">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Server size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Telemetry Streams</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Real-time WebSocket connections that broadcast metrics at sub-second latency from your infrastructure daemons directly to your browser.</p>
            </div>
          </div>
          
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-4 items-start">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">AI Incident Engine</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Our deterministic + LLM-based engine that correlates metrics, logs, and deployments to identify root causes faster than manual debugging.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
