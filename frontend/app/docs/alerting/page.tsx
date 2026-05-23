import React from "react";
import { Bell } from "lucide-react";

export default function AlertingDoc() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Alerting Guide</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Configure robust alert rules with cooldowns to prevent alert fatigue.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Rule Evaluation</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Alert rules are evaluated deterministically by the <code>telemetryWorker</code> using BullMQ. When a metric payload is received, it is checked against active rules.
        </p>
        <div className="bg-slate-950 p-4 rounded-lg">
          <pre className="text-sm text-slate-300 font-mono">
            <code>{"{"}
  "metric": "cpu",
  "condition": "&gt;",
  "threshold": 90,
  "duration": "5m"
{"}"}</code>
          </pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Deduplication & Cooldowns</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          To prevent PagerDuty spam, CloudAI uses a deduplication engine. If a server's CPU spikes to 95% multiple times in a 10-minute window, it groups those into a single incident rather than creating 5 separate incidents.
        </p>
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 rounded-lg">
          <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 mb-1">Cooldown Window</h4>
          <p className="text-xs text-indigo-700 dark:text-indigo-400">By default, alerts for the same service and metric type have a 15-minute cooldown window before a new incident is created.</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Maintenance Mode</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          During scheduled deployments, you can toggle Maintenance Mode. This mutes PagerDuty escalations while still tracking metrics and logging potential incidents visually in the dashboard.
        </p>
      </section>
    </div>
  );
}
