"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Shield, Zap, BarChart3, Globe, Cpu, CheckCircle } from "lucide-react";
import { TurnstileMock } from "@/components/TurnstileMock";

/* ── Google Brand Icon ── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FEATURES = [
  { icon: Activity,  label: "Live Telemetry",     desc: "Real-time streaming metrics from all nodes" },
  { icon: Shield,    label: "Threat Detection",    desc: "AI-powered security & anomaly monitoring" },
  { icon: Zap,       label: "Auto-Remediation",    desc: "Intelligent incident response automation" },
  { icon: BarChart3, label: "Deep Analytics",      desc: "Historical trends and predictive insights" },
];

const TRUST_ITEMS = [
  "SOC 2 Type II",
  "99.97% uptime SLA",
  "GDPR compliant",
  "3 global regions",
];

export default function LoginClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace(callbackUrl);
  }, [status, router, callbackUrl]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl });
  };

  const handleGuestSignIn = async () => {
    setLoading(true);
    await signIn("credentials", { username: "guest", callbackUrl });
  };


  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{ background: "var(--surface-1)" }}
    >
      {/* ════════════════════════════════════════
          Left panel — branding (desktop only)
      ════════════════════════════════════════ */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] p-12 relative overflow-hidden"
        style={{
          background: "var(--surface-0)",
          borderRight: "1px solid var(--border-default)",
        }}
      >
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: "radial-gradient(var(--border-default) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Gradient accent — top right */}
        <div
          className="absolute -top-32 -right-32 h-64 w-64 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(26,115,232,0.08) 0%, transparent 70%)",
          }}
        />

        {/* ── Brand lockup ── */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--brand-600)" }}
          >
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              AI Cloud Monitor
            </h2>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Enterprise Observability Platform
            </p>
          </div>
        </div>

        {/* ── Hero text + features ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
          {/* Live status chip */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              background: "var(--color-success-bg)",
              border: "1px solid var(--color-success-border)",
              color: "var(--color-success)",
            }}
          >
            <span className="live-dot" />
            Platform online · 12 nodes healthy
          </div>

          <h1
            className="text-4xl font-bold leading-tight mb-4"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            Real-time AI<br />
            <span style={{ color: "var(--brand-600)" }}>Observability</span>
          </h1>

          <p className="text-base leading-relaxed max-w-md" style={{ color: "var(--text-secondary)" }}>
            Monitor your entire infrastructure with AI-powered anomaly detection,
            predictive scaling, and automated incident remediation.
          </p>

          {/* Feature grid */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-start gap-3 p-4 rounded-xl transition-all"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <div
                  className="p-1.5 rounded-lg flex-shrink-0"
                  style={{ background: "var(--brand-50)", color: "var(--brand-600)" }}
                >
                  <Icon size={13} />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    {label}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Footer trust row ── */}
        <div className="relative z-10 flex items-center gap-5 flex-wrap">
          {TRUST_ITEMS.map(item => (
            <div key={item} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              <CheckCircle size={11} style={{ color: "var(--color-success)" }} />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════
          Right panel — login card
      ════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="w-full max-w-[360px]"
        >
          {/* Mobile brand */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--brand-600)" }}
            >
              <Activity size={16} className="text-white" />
            </div>
            <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              AI Cloud Monitor
            </span>
          </div>

          {/* Sign-in card */}
          <div
            className="card p-8"
            style={{ boxShadow: "var(--shadow-2)" }}
          >
            {/* Header */}
            <div className="mb-6">
              <h2
                className="text-xl font-bold mb-1"
                style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}
              >
                Sign in
              </h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Access your observability dashboard
              </p>
            </div>

            {/* Login Options / Human Verification */}
            {!isVerified ? (
              <div className="flex justify-center my-6">
                <TurnstileMock onVerify={() => setIsVerified(true)} />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Google sign-in button */}
                <button
                  id="google-signin-btn"
                  onClick={handleGoogleSignIn}
                  disabled={loading || status === "loading"}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-150"
                  style={{
                    background: "var(--surface-0)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-primary)",
                    boxShadow: "var(--shadow-1)",
                  }}
                  onMouseEnter={e => {
                    if (!loading) {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-2)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)";
                    }
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-1)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-default)";
                  }}
                >
                  {loading ? (
                    <div
                      className="h-4 w-4 rounded-full border-2"
                      style={{
                        borderColor: "var(--border-strong)",
                        borderTopColor: "var(--brand-600)",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                  ) : (
                    <GoogleIcon />
                  )}
                  {loading ? "Redirecting to Google…" : "Continue with Google"}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px" style={{ background: "var(--border-default)" }} />
                  <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>or</span>
                  <div className="flex-1 h-px" style={{ background: "var(--border-default)" }} />
                </div>

                {/* Demo access */}
                <div
                  className="rounded-lg p-4"
                  style={{
                    background: "var(--brand-50)",
                    border: "1px solid var(--color-info-border)",
                  }}
                >
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--brand-600)" }}>
                    Demo Mode Available
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    Explore the full dashboard without a Google account.
                    Sign in unlocks persistent sessions and team features.
                  </p>
                  <button
                    id="demo-access-btn"
                    onClick={handleGuestSignIn}
                    disabled={loading}
                    className="mt-3 text-xs font-semibold transition-colors disabled:opacity-50"
                    style={{ color: "var(--brand-600)" }}
                    onMouseEnter={e => {
                      if (!loading) (e.currentTarget as HTMLButtonElement).style.color = "var(--brand-700)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--brand-600)";
                    }}
                  >
                    {loading ? "Accessing guest mode..." : "Continue as guest →"}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Terms */}
          <p className="text-center text-[11px] mt-5" style={{ color: "var(--text-tertiary)" }}>
            By signing in, you agree to our{" "}
            <button className="underline underline-offset-2 transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)")}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)")}
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button className="underline underline-offset-2 transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)")}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)")}
            >
              Privacy Policy
            </button>
          </p>
        </motion.div>
      </div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
