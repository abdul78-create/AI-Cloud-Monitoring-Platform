import React from 'react';
import { ShieldCheck, Activity, Users, Database } from 'lucide-react';

export function TrustMetrics() {
  const metrics = [
    { label: "Uptime SLA", value: "99.99%", icon: ShieldCheck, color: "text-emerald-500" },
    { label: "Telemetry/sec", value: "12M+", icon: Activity, color: "text-violet-500" },
    { label: "Enterprise Users", value: "10,000+", icon: Users, color: "text-blue-500" },
    { label: "Data Retention", value: "15 Months", icon: Database, color: "text-amber-500" },
  ];

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {metrics.map((metric, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <metric.icon size={28} className={`mb-3 ${metric.color}`} />
              <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                {metric.value}
              </p>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 mt-1">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
