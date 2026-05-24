"use client";

import React from "react";
import Link from "next/link";
import { Terminal, Check, Zap, ArrowRight, Server, Shield } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-violet-500/30 selection:text-white pb-24">
      {/* Navbar (simplified version of Landing navbar) */}
      <nav className="border-b border-white/5 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Terminal size={16} />
            </div>
            CloudAI
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/#product" className="hover:text-white transition-colors">Product</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            <Link href="/pricing" className="text-white">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-white transition-colors">Log In</Link>
            <Link href="/login?demo=true" className="text-sm font-bold bg-white text-slate-900 px-4 py-2 rounded-md hover:bg-slate-100 transition-colors">
              Try Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="relative pt-32 pb-20 text-center px-6">
        <div className="absolute inset-0 top-0 h-[500px] w-full bg-gradient-to-b from-violet-900/20 to-transparent pointer-events-none" />
        <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6 relative z-10">
          Predictable pricing for <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-sky-400">
            production scale.
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto relative z-10">
          Start for free, upgrade when you need advanced AI correlations, extended log retention, and multi-team RBAC.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 relative z-10">
        
        {/* FREE */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 flex flex-col hover:border-slate-700 transition-colors">
          <h3 className="text-xl font-bold text-white mb-2">Hobby</h3>
          <p className="text-slate-400 text-sm h-10">Perfect for side projects and learning observability.</p>
          <div className="my-6">
            <span className="text-4xl font-extrabold text-white">$0</span>
            <span className="text-slate-500"> / forever</span>
          </div>
          <Link href="/login" className="w-full py-2.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-center text-sm font-bold text-white transition-colors mb-8">
            Start for Free
          </Link>
          <ul className="space-y-4 flex-1">
            <li className="flex gap-3 text-sm"><Check size={18} className="text-slate-600 shrink-0" /> 10M Events / month</li>
            <li className="flex gap-3 text-sm"><Check size={18} className="text-slate-600 shrink-0" /> 1 Day Log Retention</li>
            <li className="flex gap-3 text-sm"><Check size={18} className="text-slate-600 shrink-0" /> Basic Dashboards</li>
            <li className="flex gap-3 text-sm"><Check size={18} className="text-slate-600 shrink-0" /> Community Support</li>
          </ul>
        </div>

        {/* PRO */}
        <div className="rounded-2xl border-2 border-violet-500 bg-slate-900 p-8 flex flex-col relative shadow-[0_0_50px_-12px_rgba(139,92,246,0.25)] scale-105 z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-violet-500 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full">
            Most Popular
          </div>
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            Pro <Zap size={18} className="text-violet-400 fill-violet-400/20" />
          </h3>
          <p className="text-slate-400 text-sm h-10">For engineering teams running production workloads.</p>
          <div className="my-6">
            <span className="text-4xl font-extrabold text-white">$49</span>
            <span className="text-slate-500"> / user / mo</span>
          </div>
          <Link href="/login" className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-center text-sm font-bold text-white transition-colors mb-8">
            Start 14-Day Free Trial
          </Link>
          <ul className="space-y-4 flex-1">
            <li className="flex gap-3 text-sm text-slate-200"><Check size={18} className="text-violet-500 shrink-0" /> 100M Events / month</li>
            <li className="flex gap-3 text-sm text-slate-200"><Check size={18} className="text-violet-500 shrink-0" /> 30 Day Log Retention</li>
            <li className="flex gap-3 text-sm text-slate-200"><Check size={18} className="text-violet-500 shrink-0" /> AI Root Cause Analysis</li>
            <li className="flex gap-3 text-sm text-slate-200"><Check size={18} className="text-violet-500 shrink-0" /> Auto-remediation actions</li>
            <li className="flex gap-3 text-sm text-slate-200"><Check size={18} className="text-violet-500 shrink-0" /> Slack & PagerDuty Alerts</li>
          </ul>
        </div>

        {/* ENTERPRISE */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 flex flex-col hover:border-slate-700 transition-colors">
          <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
          <p className="text-slate-400 text-sm h-10">For large organizations with custom compliance needs.</p>
          <div className="my-6">
            <span className="text-4xl font-extrabold text-white">Custom</span>
          </div>
          <Link href="/contact" className="w-full py-2.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-center text-sm font-bold text-white transition-colors mb-8">
            Contact Sales
          </Link>
          <ul className="space-y-4 flex-1">
            <li className="flex gap-3 text-sm"><Check size={18} className="text-slate-600 shrink-0" /> Unlimited Events</li>
            <li className="flex gap-3 text-sm"><Check size={18} className="text-slate-600 shrink-0" /> 1-Year Log Retention</li>
            <li className="flex gap-3 text-sm"><Check size={18} className="text-slate-600 shrink-0" /> Custom RBAC & SAML/SSO</li>
            <li className="flex gap-3 text-sm"><Check size={18} className="text-slate-600 shrink-0" /> Dedicated Success Manager</li>
            <li className="flex gap-3 text-sm"><Check size={18} className="text-slate-600 shrink-0" /> SOC2 & HIPAA Compliance</li>
          </ul>
        </div>

      </section>

      {/* Trust */}
      <section className="max-w-4xl mx-auto mt-32 text-center border-t border-slate-800 pt-16">
        <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-8">
          Enterprise Grade Infrastructure
        </h4>
        <div className="flex flex-wrap justify-center gap-12 text-slate-400">
          <div className="flex items-center gap-2"><Server size={20} /> <span className="font-semibold text-sm">99.99% SLA</span></div>
          <div className="flex items-center gap-2"><Shield size={20} /> <span className="font-semibold text-sm">SOC 2 Type II</span></div>
          <div className="flex items-center gap-2"><Terminal size={20} /> <span className="font-semibold text-sm">OpenTelemetry Native</span></div>
        </div>
      </section>
    </div>
  );
}
