"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Shield, Zap, Sparkles, ArrowRight, Github } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-400/10 opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-violet-400/10 opacity-30 blur-3xl" />

      {/* Content */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-premium p-8 relative z-10">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 text-xs font-medium text-indigo-600 mb-4">
            <Sparkles size={12} />
            <span>AI-Powered Observability</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Welcome Back</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to monitor your stack.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm bg-white/50 transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase">Password</label>
              <Link href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Forgot?</Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm bg-white/50 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-100"
          >
            Sign In <ArrowRight size={16} />
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-medium">Or continue with</span></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 border border-slate-200 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50 transition-all text-slate-700">
            <Github size={16} /> GitHub
          </button>
          <button className="flex items-center justify-center gap-2 border border-slate-200 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50 transition-all text-slate-700">
             Google
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-6">
          Don&apos;t have an account? <Link href="/onboarding" className="text-indigo-600 font-bold hover:text-indigo-700">Start for free</Link>
        </p>

      </div>
    </div>
  );
}
