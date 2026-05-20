import React from "react";
import { Copy, Terminal } from "lucide-react";

export default function ApiDocsPage() {
  return (
    <div className="max-w-3xl prose prose-slate dark:prose-invert">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
          API Reference
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Programmatically interact with CloudAI Monitor using our REST API. All endpoints are prefixed with <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-sm text-pink-500">/api</code>.
        </p>
      </div>

      <h2>Authentication</h2>
      <p>
        Most endpoints require a valid API key passed via the <code>Authorization</code> header:
      </p>
      <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300 not-prose mb-6 overflow-x-auto">
        Authorization: Bearer YOUR_API_KEY
      </div>

      <hr className="my-10 border-slate-200 dark:border-slate-800" />

      <h2>Analytics & AI</h2>

      <div className="not-prose mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="badge badge-success text-[10px] font-bold px-2 py-1">GET</span>
          <code className="text-sm font-bold text-slate-900 dark:text-white">/api/analytics/rca/:incidentId</code>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Generate or retrieve a full root cause analysis (RCA) report for a specific incident.
        </p>
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Query Parameters</h4>
          <ul className="text-sm space-y-2 mb-4 text-slate-600 dark:text-slate-400">
            <li><code className="text-pink-500">type</code> (optional): Hint for the incident pattern (e.g. "memory-leak").</li>
            <li><code className="text-pink-500">service</code> (optional): The affected service name.</li>
          </ul>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Response</h4>
          <pre className="text-xs bg-slate-900 text-slate-300 p-3 rounded-lg overflow-x-auto m-0">
{`{
  "success": true,
  "data": {
    "incidentId": "inc-001",
    "title": "Memory Leak Detected",
    "severity": "critical",
    "rootCauseChain": [...],
    "remediationSteps": [...]
  }
}`}
          </pre>
        </div>
      </div>

      <div className="not-prose mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="badge badge-success text-[10px] font-bold px-2 py-1">GET</span>
          <code className="text-sm font-bold text-slate-900 dark:text-white">/api/analytics/outage-probability</code>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Returns predictive outage probability scores for all monitored services based on recent anomaly signals.
        </p>
      </div>

      <hr className="my-10 border-slate-200 dark:border-slate-800" />

      <h2>Infrastructure & Telemetry</h2>

      <div className="not-prose mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="badge badge-success text-[10px] font-bold px-2 py-1">GET</span>
          <code className="text-sm font-bold text-slate-900 dark:text-white">/api/analytics/system-metrics</code>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Fetch real-time metrics (CPU, RAM, Disk, Network, Processes) from the local machine running the agent.
        </p>
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Response Shape</h4>
          <pre className="text-xs bg-slate-900 text-slate-300 p-3 rounded-lg overflow-x-auto m-0">
{`{
  "success": true,
  "data": {
    "hostname": "prod-api-01",
    "cpu": { "usage": 45.2, "cores": 16 },
    "memory": { "total": 17179869184, "used": 8589934592 },
    "processes": [
      { "pid": 1, "name": "systemd", "cpu": 0.1 }
    ]
  }
}`}
          </pre>
        </div>
      </div>

    </div>
  );
}
