import React from 'react';
import Link from 'next/link';
import { Terminal, Book, Server, Shield, Zap, Search, ChevronRight, Activity } from 'lucide-react';
import { CodeBlock } from '@/components/CodeBlock';

export default function DocsPage() {
  const sections = [
    {
      title: "Getting Started",
      icon: Zap,
      links: ["Quickstart Guide", "Architecture Overview", "Agent Installation", "Supported Environments"]
    },
    {
      title: "Core Concepts",
      icon: Book,
      links: ["Services & Topologies", "Telemetry Data Types", "AI Correlation Engine", "Alert Routing"]
    },
    {
      title: "Integrations",
      icon: Server,
      links: ["Kubernetes", "AWS CloudWatch", "Docker", "PostgreSQL", "Redis"]
    },
    {
      title: "Security & Compliance",
      icon: Shield,
      links: ["Data Residency", "RBAC Policies", "SSO Configuration", "Audit Logs"]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-bold text-slate-900 dark:text-white flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white">
                <Terminal size={16} />
              </div>
              CloudAI Docs
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search documentation..." 
                className="pl-10 pr-4 py-1.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 w-64"
              />
            </div>
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex gap-12">
        {/* Sidebar Nav */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <nav className="space-y-8 sticky top-24">
            {sections.map((section, i) => (
              <div key={i}>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <section.icon size={16} className="text-violet-500" />
                  {section.title}
                </h3>
                <ul className="space-y-2 border-l border-slate-200 dark:border-slate-800 ml-2 pl-4">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className={`text-sm ${i === 0 && j === 0 ? 'text-violet-600 dark:text-violet-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'} transition-colors`}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <article className="flex-1 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">Quickstart Guide</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Deploy the CloudAI Monitor agent to your infrastructure and start receiving real-time telemetry in under 60 seconds.
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold mt-12 mb-4 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              1. Get your API Key
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Navigate to your <Link href="/dashboard/settings" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">Settings Panel</Link> to generate an ingestion key. You will need this to authenticate the agent.
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-4 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              2. Install the Agent
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Run our automated installation script on your Linux machine or Kubernetes cluster. The script automatically detects your environment.
            </p>
            
            <CodeBlock 
              language="bash" 
              code={`curl -sL https://install.cloudai.dev | CLOUDAI_KEY="your_api_key" bash`} 
            />

            <h2 className="text-2xl font-bold mt-12 mb-4 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              3. Verify Connection
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Once installed, the agent will automatically begin discovering services using eBPF. Head over to your <Link href="/dashboard" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">Mission Control Dashboard</Link> to see live telemetry flowing in.
            </p>

            {/* Architecture Diagram Area */}
            <div className="my-10 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
              <h3 className="font-bold text-sm text-slate-500 uppercase tracking-widest mb-6 text-center">Data Flow Architecture</h3>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center max-w-2xl mx-auto">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-3 border-2 border-slate-300 dark:border-slate-700">
                    <Server size={24} className="text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Your Servers</span>
                  <span className="text-xs text-slate-500">eBPF Agent</span>
                </div>
                
                <div className="flex-1 flex items-center justify-center">
                  <div className="h-0.5 w-full bg-gradient-to-r from-slate-200 via-violet-500 to-slate-200 dark:from-slate-800 dark:via-violet-500 dark:to-slate-800 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-slate-50 dark:bg-slate-900/30 text-[10px] font-bold text-violet-500 tracking-widest uppercase">
                      gRPC
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-3 border-2 border-violet-200 dark:border-violet-800">
                    <Activity size={24} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">CloudAI Cloud</span>
                  <span className="text-xs text-slate-500">Ingestion API</span>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 rounded-xl border border-violet-200 dark:border-violet-900/50 bg-violet-50/50 dark:bg-violet-900/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center flex-shrink-0 text-violet-600 dark:text-violet-400">
                <Book size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">What&apos;s Next?</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Learn how to set up intelligent alert routing to page your team when AI detects an anomaly.</p>
                <a href="#" className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 transition-colors">
                  Configure Alerts <ChevronRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
