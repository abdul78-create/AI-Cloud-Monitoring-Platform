"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { DetailedAlert } from "@/types";

const levelBadge = {
  critical: "bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300",
  warning: "bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300",
  info: "bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300"
};

export const RecentAlertsPanel = ({ alerts }: { alerts: DetailedAlert[] }) => {
  const [expanded, setExpanded] = useState<string | null>(alerts[0]?.id ?? null);

  if (!alerts.length) {
    return (
      <GlassCard>
        <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Recent Alerts</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">No active alerts. Your system is stable.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Recent Alerts</h3>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const isOpen = expanded === alert.id;
          return (
            <div key={alert.id} className="rounded-xl border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 transition-colors">
              <button
                className="flex w-full items-center justify-between gap-3 p-3 text-left"
                onClick={() => setExpanded(isOpen ? null : alert.id)}
              >
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${levelBadge[alert.level]}`}>{alert.level}</span>
                    <span className="text-xs uppercase text-slate-500 dark:text-slate-400">{alert.category}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{alert.time}</span>
                  </div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{alert.message}</p>
                </div>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="border-t border-slate-100 dark:border-white/10 p-3 pt-2 text-sm text-slate-600 dark:text-slate-300">
                  <p className="mb-1 text-slate-500 dark:text-slate-400">Source: {alert.source}</p>
                  <p>{alert.details}</p>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};
