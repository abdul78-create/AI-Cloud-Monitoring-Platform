import React from "react";
import { BrainCircuit } from "lucide-react";

export default function AIOpsDoc() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">AI Ops Guide</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Leverage LLMs for Root Cause Analysis (RCA), anomaly detection, and predictive alerting.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Anomaly Detection</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Standard thresholds (like CPU &gt; 90%) are deterministic but often noisy. CloudAI utilizes an intelligent anomaly detection model to identify unexpected deviations from baseline telemetry patterns, such as a slow memory leak that never triggers a static threshold but will inevitably cause an OOM kill.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Root Cause Analysis (RCA)</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          When a critical incident fires, CloudAI automatically builds a contextual prompt containing:
        </p>
        <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-1">
          <li>The last 10 minutes of server metrics (CPU, Mem, Network).</li>
          <li>Recent application logs and kernel messages.</li>
          <li>Correlated deployments or Git commits that occurred in the last hour.</li>
          <li>Topology maps showing upstream/downstream affected services.</li>
        </ul>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          This prompt is sent to the LLM (e.g., GPT-4 or Gemini) which generates a human-readable postmortem and a list of recommended remediation steps, dramatically reducing Mean Time To Resolution (MTTR).
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Predictive Outage Scoring</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The Predictive Outage model runs continuously in the background, scoring each connected node from 0 to 100% on its likelihood of failure in the next 6 hours based on historical telemetry patterns.
        </p>
      </section>
    </div>
  );
}
