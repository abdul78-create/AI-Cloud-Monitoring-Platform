"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X, Chrome, ArrowRight, Sparkles } from "lucide-react";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { signIn } from "next-auth/react";

export const AuthRequiredModal = () => {
  const isAuthModalOpen = useMonitoringStore((s) => s.isAuthModalOpen);
  const closeAuthModal = useMonitoringStore((s) => s.closeAuthModal);

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            className="absolute inset-0 bg-[#04060a]/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.45 }}
            className="relative w-full max-w-[420px] rounded-2xl overflow-hidden shadow-2xl z-10"
            style={{
              background: "var(--surface-elevated)",
              border: "1px solid var(--border-strong)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            }}
          >
            {/* Glowing Amber Top Bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{
                background: "linear-gradient(90deg, #f2994a 0%, #f2c94c 100%)",
              }}
            />

            {/* Glowing Background Radial Light */}
            <div
              className="absolute -top-24 -left-24 h-48 w-48 rounded-full blur-[80px]"
              style={{
                background: "radial-gradient(circle, rgba(242,153,74,0.15) 0%, transparent 70%)",
              }}
            />

            {/* Close Button */}
            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors hover:bg-[var(--surface-2)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              aria-label="Close modal"
            >
              <X size={15} />
            </button>

            {/* Content Area */}
            <div className="p-6 pt-8 flex flex-col items-center text-center">
              {/* Icon Container */}
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  background: "rgba(242, 153, 74, 0.1)",
                  border: "1px solid rgba(242, 153, 74, 0.25)",
                  color: "#f2994a",
                }}
              >
                <ShieldAlert size={22} className="animate-pulse" />
              </div>

              {/* Title & Badge */}
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(242, 153, 74, 0.12)",
                    color: "#f2994a",
                    border: "1px solid rgba(242, 153, 74, 0.2)",
                  }}
                >
                  Premium Observability
                </span>
              </div>
              <h3 className="text-lg font-bold tracking-tight mb-2 text-[var(--text-primary)]">
                Sign In to Unlock Full Access
              </h3>

              {/* Description */}
              <p className="text-xs leading-relaxed mb-6 text-[var(--text-secondary)] px-2">
                You are currently exploring in <strong className="text-[var(--text-primary)]">Guest Mode</strong>. To run automated AI scans, persist telemetry pipelines, edit settings, and view correlated incidents, please connect your Google account.
              </p>

              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:scale-[1.01]"
                style={{
                  background: "linear-gradient(135deg, #1a73e8 0%, #1557b0 100%)",
                  boxShadow: "0 4px 12px rgba(26, 115, 232, 0.3)",
                }}
              >
                <Chrome size={16} />
                Continue with Google
                <ArrowRight size={14} className="ml-0.5" />
              </button>

              {/* Keep Exploring / Guest Mode Action */}
              <button
                onClick={closeAuthModal}
                className="w-full py-2 mt-2 rounded-xl text-xs font-semibold transition-all hover:bg-[var(--surface-1)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                Keep Exploring in Guest Mode
              </button>

              {/* Uptime Guarantee Tag */}
              <div className="flex items-center gap-1 mt-6 text-[10px] text-[var(--text-tertiary)]">
                <Sparkles size={11} className="text-[#f2c94c]" />
                <span>All core simulated metrics remain 100% free.</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
