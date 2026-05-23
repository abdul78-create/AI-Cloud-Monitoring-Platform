import React from "react";
import { Activity } from "lucide-react";

export default function MonitoringDoc() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Monitoring Guide</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Understand telemetry data, topology maps, and the incident lifecycle.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Real-Time Telemetry</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The dashboard uses WebSocket connections to stream metrics at sub-second latency. The data is temporarily persisted in Redis Streams before being aggressively aggregated into long-term storage, keeping the UI fast without blowing up the database.
        </p>
        <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-1">
          <li><strong>CPU & Memory:</strong> Sampled every 5 seconds.</li>
          <li><strong>Network I/O:</strong> Aggregated on edge nodes.</li>
          <li><strong>Process Stats:</strong> Filtered to only include high-impact processes.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">The Incident Lifecycle</h2>
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">When a threshold is breached, CloudAI follows a deterministic state machine for incident management:</p>
          <div className="space-y-3 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
            <div className="relative">
              <div className="absolute -left-[23px] top-1 w-3 h-3 bg-red-500 rounded-full border-4 border-white dark:border-slate-900"></div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">1. Triggered (Open)</h4>
              <p className="text-xs text-slate-500">Alert fires. PagerDuty/Slack notifications are sent based on escalation policies.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[23px] top-1 w-3 h-3 bg-amber-500 rounded-full border-4 border-white dark:border-slate-900"></div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">2. Acknowledged</h4>
              <p className="text-xs text-slate-500">An engineer acknowledges the incident via UI or Slack, pausing further escalations.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[23px] top-1 w-3 h-3 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900"></div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">3. Resolved</h4>
              <p className="text-xs text-slate-500">The metrics return to normal or the engineer manually resolves the incident. A postmortem is generated.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
