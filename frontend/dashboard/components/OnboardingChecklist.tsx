import React, { useState } from "react";
import { CheckCircle2, Circle, Server, Bell, BrainCircuit, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface OnboardingChecklistProps {
  hasInfrastructure: boolean;
  hasAlerts: boolean;
  hasViewedAI: boolean;
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  hasInfrastructure,
  hasAlerts,
  hasViewedAI,
}) => {
  const [dismissed, setDismissed] = useState(false);

  const steps = [
    {
      id: "infra",
      title: "Connect Infrastructure",
      description: "Install the lightweight daemon to stream live telemetry.",
      icon: Server,
      completed: hasInfrastructure,
      href: "/dashboard/connect",
    },
    {
      id: "alerts",
      title: "Configure Alerts",
      description: "Set up anomaly detection rules and notification channels.",
      icon: Bell,
      completed: hasAlerts,
      href: "/dashboard/alerts",
    },
    {
      id: "ai",
      title: "Explore AI Insights",
      description: "Run an AI diagnostic scan on your telemetry data.",
      icon: BrainCircuit,
      completed: hasViewedAI,
      href: "/dashboard/ai-ops",
    },
  ];

  const progress = steps.filter((s) => s.completed).length;
  const total = steps.length;

  if (dismissed || progress === total) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
        className="card p-5 mb-6 relative overflow-hidden"
        style={{ border: "1px solid var(--brand-500)", background: "var(--brand-50)" }}
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          aria-label="Dismiss onboarding"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col md:flex-row gap-6 md:items-center">
          <div className="flex-1">
            <h2 className="text-lg font-bold mb-1" style={{ color: "var(--brand-700)" }}>
              Welcome to CloudAI Monitor
            </h2>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              You're almost ready to monitor your infrastructure. Complete these steps to get started.
            </p>
            
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-600 dark:bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(progress / total) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-xs font-bold tabular-nums" style={{ color: "var(--brand-700)" }}>
                {progress} / {total}
              </span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Link key={step.id} href={step.href} className="block group">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg h-full transition-all group-hover:border-blue-500 dark:group-hover:border-blue-500/50 group-hover:shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-1.5 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                        <Icon size={14} />
                      </div>
                      {step.completed ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : (
                        <Circle size={16} className="text-slate-300 dark:text-slate-600" />
                      )}
                    </div>
                    <h3 className="text-xs font-bold mb-1 text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                      {step.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
