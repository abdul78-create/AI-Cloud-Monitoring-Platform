import React from 'react';
import { Check, X } from 'lucide-react';

export function ComparisonTable() {
  const comparisons = [
    { feature: "AI-driven RCA", cloudai: true, traditional: false, cloudaiText: "Autonomously identify root causes", traditionalText: "Manual log hunting" },
    { feature: "Real-time topology", cloudai: true, traditional: false, cloudaiText: "Live dependency mapping", traditionalText: "Static dashboards" },
    { feature: "Incident simulation", cloudai: true, traditional: false, cloudaiText: "Deterministic failure testing", traditionalText: "Wait for real outages" },
    { feature: "Agent-first telemetry", cloudai: true, traditional: true, cloudaiText: "eBPF zero-instrumentation", traditionalText: "Heavy manual instrumentation" },
    { feature: "Guided remediation", cloudai: true, traditional: false, cloudaiText: "Actionable SSH playbooks", traditionalText: "Alert spam" },
  ];

  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Why CloudAI Monitor?</h2>
          <p className="text-slate-500 dark:text-slate-400">The next generation of observability, built for modern distributed systems.</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="w-1/3 p-6 text-sm font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">Feature</th>
                <th className="w-1/3 p-6 text-base font-bold text-violet-600 dark:text-violet-400 border-b border-slate-200 dark:border-slate-800 bg-violet-50/50 dark:bg-violet-900/10">CloudAI Monitor</th>
                <th className="w-1/3 p-6 text-base font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">Traditional Monitoring</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {comparisons.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-6 text-sm font-medium text-slate-900 dark:text-white">
                    {row.feature}
                  </td>
                  <td className="p-6 bg-violet-50/30 dark:bg-violet-900/5">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-400">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{row.cloudaiText}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3 opacity-70">
                      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-slate-400">
                        {row.traditional ? <Check size={14} /> : <X size={14} />}
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">{row.traditionalText}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
