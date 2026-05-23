import React from "react";
import { ShieldCheck, Activity, Globe } from "lucide-react";

export const TrustBadge = () => {
  return (
    <div className="px-4 pb-4">
      <div 
        className="rounded-lg p-3"
        style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">All Systems Operational</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-[9px] text-slate-500">
              <Activity size={10} /> Uptime
            </div>
            <span className="text-[11px] font-semibold font-mono text-slate-900 dark:text-white">99.99%</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-[9px] text-slate-500">
              <ShieldCheck size={10} /> Compliance
            </div>
            <span className="text-[11px] font-semibold text-slate-900 dark:text-white">SOC2 Ready</span>
          </div>
          <div className="flex flex-col gap-0.5 col-span-2 mt-1 pt-1 border-t border-slate-200 dark:border-slate-800">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[9px] text-slate-500">
                  <Globe size={10} /> Region
                </div>
                <span className="text-[9px] font-medium text-slate-700 dark:text-slate-300">us-east-1 (Primary)</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
