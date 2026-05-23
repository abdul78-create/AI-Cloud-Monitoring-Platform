"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TurnstileMockProps {
  onVerify: () => void;
}

export const TurnstileMock: React.FC<TurnstileMockProps> = ({ onVerify }) => {
  const [status, setStatus] = useState<"checking" | "verified">("checking");

  useEffect(() => {
    // Simulate a network/verification delay
    const timer = setTimeout(() => {
      setStatus("verified");
      setTimeout(onVerify, 500); // Give user a moment to see the success check
    }, 1500);
    return () => clearTimeout(timer);
  }, [onVerify]);

  return (
    <div className="w-full max-w-[300px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative w-6 h-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {status === "checking" ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Loader2 size={18} className="animate-spin text-slate-400" />
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, type: "spring" }}
              >
                <CheckCircle2 size={20} className="text-emerald-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {status === "checking" ? "Verifying you are human..." : "Success!"}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <ShieldCheck size={16} className="text-slate-400 mb-0.5" />
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Protected</span>
      </div>
    </div>
  );
};
