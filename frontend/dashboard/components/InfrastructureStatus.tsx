"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { InfraStatus } from "@/types";

const statusColor = {
  healthy: "bg-emerald-400",
  warning: "bg-amber-400",
  critical: "bg-rose-400"
};

export const InfrastructureStatus = ({ items }: { items: InfraStatus[] }) => {
  if (!items.length) {
    return (
      <GlassCard>
        <p className="text-sm text-slate-400">Infrastructure status is loading...</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <h3 className="mb-4 text-lg font-semibold">Infrastructure Status</h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-medium">{item.service}</p>
              <div className="flex items-center gap-2">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  className={`h-2.5 w-2.5 rounded-full ${statusColor[item.status]}`}
                />
                <span className="text-xs capitalize text-slate-300">{item.status}</span>
              </div>
            </div>
            <p className="text-sm text-slate-300">Uptime: {item.uptime}</p>
            <p className="text-sm text-slate-300">Response: {item.responseTime}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
