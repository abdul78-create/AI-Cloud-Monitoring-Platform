import React from 'react';
import { ShieldCheck, Server, Zap, Brain, Activity } from 'lucide-react';

export function LiveStatusBar() {
  const statusItems = [
    { label: "API", status: "Operational", icon: Server },
    { label: "Telemetry", status: "Operational", icon: Activity },
    { label: "Alert Engine", status: "Operational", icon: Zap },
    { label: "AI Correlation", status: "Operational", icon: Brain },
  ];

  return (
    <div 
      className="w-full flex items-center justify-between px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider z-30 relative"
      style={{ 
        background: "var(--surface-0)", 
        borderBottom: "1px solid var(--border-default)",
        color: "var(--text-tertiary)"
      }}
    >
      <div className="flex items-center gap-2 max-w-[1600px] w-full mx-auto">
        <div className="flex items-center gap-1.5 mr-6 text-slate-700 dark:text-slate-300">
          <ShieldCheck size={12} className="text-emerald-500" />
          CloudAI Platform Status
        </div>
        
        <div className="flex items-center gap-6 overflow-x-auto custom-scrollbar">
          {statusItems.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 shrink-0">
              <item.icon size={10} style={{ color: "var(--text-secondary)" }} />
              <span style={{ color: "var(--text-secondary)" }}>{item.label}:</span>
              <span className="text-emerald-500 flex items-center gap-1">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
