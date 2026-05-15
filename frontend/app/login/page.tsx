"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Activity, Shield, Zap, BarChart3, Globe, Cpu } from "lucide-react";

// Google icon SVG
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FEATURES = [
  { icon: Activity, label: "Live Telemetry", desc: "Real-time streaming metrics" },
  { icon: Shield, label: "Threat Detection", desc: "AI-powered security monitoring" },
  { icon: Zap, label: "Auto-Remediation", desc: "Intelligent incident response" },
  { icon: BarChart3, label: "Analytics", desc: "Deep infrastructure insights" },
];

const TICKER_ITEMS = [
  "CPU: 54.2% ↑", "Memory: 62.1%", "RPS: 4,312", "Latency: 42ms ✓",
  "Incidents: 2 active", "Nodes: 12 healthy", "Threats: 0 critical",
];

function LoginForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [tickerIdx, setTickerIdx] = useState(0);

  // Already authenticated → redirect
  useEffect(() => {
    if (status === "authenticated") router.replace(callbackUrl);
  }, [status, router, callbackUrl]);

  // Ticker animation
  useEffect(() => {
    const id = setInterval(() => setTickerIdx(i => (i + 1) % TICKER_ITEMS.length), 2000);
    return () => clearInterval(id);
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex overflow-hidden">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] p-12 relative overflow-hidden bg-[#060a10] border-r border-white/[0.04]">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-violet-600/8 blur-3xl" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
            <Activity size={20} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">AI Cloud Monitor</h2>
            <p className="text-[10px] text-slate-500">Enterprise Observability</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1 text-xs text-emerald-400 font-medium mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live platform — 12 nodes online
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Real-time AI<br/>
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Observability
              </span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-md">
              Monitor your entire infrastructure in real-time with AI-powered anomaly detection, predictive scaling, and automated remediation.
            </p>
          </motion.div>

          {/* Live ticker */}
          <div className="mt-8 flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Cpu size={12} />
              <span>Live metrics</span>
            </div>
            <div className="h-px flex-1 bg-white/[0.05]" />
            <motion.span
              key={tickerIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-xs font-mono text-indigo-400"
            >
              {TICKER_ITEMS[tickerIdx]}
            </motion.span>
          </div>

          {/* Feature grid */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex-shrink-0">
                  <Icon size={13} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{label}</p>
                  <p className="text-[11px] text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-4 text-[11px] text-slate-600">
          <Globe size={12} />
          <span>3 regions active</span>
          <span>·</span>
          <span>99.97% uptime SLA</span>
          <span>·</span>
          <span>SOC 2 Type II</span>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="w-full max-w-sm"
        >
          {/* Mobile brand */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
              <Activity size={18} className="text-indigo-400" />
            </div>
            <span className="font-bold text-white">AI Cloud Monitor</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Sign in</h2>
            <p className="text-sm text-slate-400">
              Access your observability dashboard
            </p>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading || status === "loading"}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm py-3.5 px-5 rounded-2xl transition-all duration-200 hover:shadow-lg hover:shadow-black/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {loading ? "Redirecting to Google..." : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs text-slate-600">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Demo access note */}
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4">
            <p className="text-xs font-semibold text-indigo-400 mb-1">Demo Mode Available</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              The dashboard runs fully in demo mode without a Google account.
              Sign in unlocks persistent sessions and user avatars.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-3 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2"
            >
              Continue without signing in →
            </button>
          </div>

          {/* Terms */}
          <p className="text-center text-[11px] text-slate-600 mt-6">
            By signing in, you agree to our{" "}
            <span className="text-slate-400 cursor-pointer hover:text-white transition-colors">Terms of Service</span>{" "}
            and{" "}
            <span className="text-slate-400 cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080c14]" />}>
      <LoginForm />
    </Suspense>
  );
}
