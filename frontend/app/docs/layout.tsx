import React from "react";
import Link from "next/link";
import { Book, Compass, Shield, Terminal, Zap, ChevronRight, Activity, Server, Bell, BrainCircuit } from "lucide-react";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-950 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Activity className="text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold text-lg">CloudAI Docs</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Home</Link>
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">GitHub</a>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 hidden md:block shrink-0 py-8 px-4 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
          <nav className="space-y-8">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-3">Getting Started</h4>
              <div className="space-y-1">
                <Link href="/docs/getting-started" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Compass size={16} /> Overview & Architecture
                </Link>
                <Link href="/docs/connect-infra" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Server size={16} /> Connect Infrastructure
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-3">Operations</h4>
              <div className="space-y-1">
                <Link href="/docs/monitoring" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Activity size={16} /> Monitoring Guide
                </Link>
                <Link href="/docs/alerting" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Bell size={16} /> Alerting Guide
                </Link>
                <Link href="/docs/ai-ops" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <BrainCircuit size={16} /> AI Ops Guide
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-3">Developer</h4>
              <div className="space-y-1">
                <Link href="/docs/api" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Zap size={16} /> API Reference
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 py-8 px-6 md:px-12 lg:px-16 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
