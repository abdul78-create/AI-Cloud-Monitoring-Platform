"use client";

import React, { useState } from "react";
import { Shield, Zap, Sparkles, ArrowRight, Github } from "lucide-react";
import Link from "next/link";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock login delay for polish
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-500">
        {/* Subtle Background Orbs */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-500/5 dark:bg-indigo-500/5 blur-3xl" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-violet-500/5 dark:bg-violet-500/5 blur-3xl" />

        {/* Content */}
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-8 relative z-10 transition-colors duration-500">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 mb-4">
              <Sparkles size={12} className="text-indigo-600 dark:text-indigo-400" />
              <span>AI-Powered Observability</span>
            </div>
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Welcome Back</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to monitor your stack.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Password</label>
                <Link href="#" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">Forgot?</Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="remember" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-200 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500" 
              />
              <label htmlFor="remember" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase cursor-pointer">Remember me</label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing In..." : "Sign In"} <ArrowRight size={16} />
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-slate-900 px-2 text-slate-400 dark:text-slate-500 font-medium">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl py-2 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300">
              <Github size={16} /> GitHub
            </button>
            <button className="flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl py-2 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300">
               Google
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-6">
            Don&apos;t have an account? <Link href="/onboarding" className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 dark:hover:text-indigo-300">Start for free</Link>
          </p>

        </div>
      </div>
    </ErrorBoundary>
  );
}
