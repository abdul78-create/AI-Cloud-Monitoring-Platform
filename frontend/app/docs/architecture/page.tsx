import React from "react";

export default function ArchitectureDocsPage() {
  return (
    <div className="max-w-3xl prose prose-slate dark:prose-invert">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
          System Architecture
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Learn how CloudAI Monitor is built for scale, reliability, and real-time observability.
        </p>
      </div>

      <h2>High-Level Architecture</h2>
      <p>
        CloudAI Monitor is a modern Next.js / Express application backed by a real-time WebSocket telemetry engine.
        It is designed to ingest high volumes of infrastructure metrics without blocking the main Node.js event loop.
      </p>

      {/* SVG Diagram representing architecture */}
      <div className="my-10 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden not-prose flex items-center justify-center">
        <svg viewBox="0 0 800 500" className="w-full max-w-2xl font-sans" preserveAspectRatio="xMidYMid meet">
          {/* Backgrounds */}
          <rect x="50" y="50" width="200" height="400" rx="16" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" className="dark:fill-slate-800 dark:stroke-slate-700" />
          <rect x="350" y="50" width="400" height="400" rx="16" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" className="dark:fill-slate-800 dark:stroke-slate-700" />
          
          <text x="150" y="90" textAnchor="middle" className="text-sm font-bold fill-slate-500 dark:fill-slate-400 uppercase tracking-widest">Client Layer</text>
          <text x="550" y="90" textAnchor="middle" className="text-sm font-bold fill-slate-500 dark:fill-slate-400 uppercase tracking-widest">Platform Layer</text>

          {/* Client Nodes */}
          <rect x="80" y="140" width="140" height="60" rx="8" fill="#fff" stroke="#cbd5e1" strokeWidth="2" className="dark:fill-slate-900 dark:stroke-slate-600 shadow-sm" />
          <text x="150" y="175" textAnchor="middle" className="text-sm font-bold fill-slate-800 dark:fill-white">Next.js Frontend</text>

          <rect x="80" y="240" width="140" height="60" rx="8" fill="#fff" stroke="#cbd5e1" strokeWidth="2" className="dark:fill-slate-900 dark:stroke-slate-600 shadow-sm" />
          <text x="150" y="275" textAnchor="middle" className="text-sm font-bold fill-slate-800 dark:fill-white">CloudAI Agents</text>

          <rect x="80" y="340" width="140" height="60" rx="8" fill="#fff" stroke="#cbd5e1" strokeWidth="2" className="dark:fill-slate-900 dark:stroke-slate-600 shadow-sm" />
          <text x="150" y="375" textAnchor="middle" className="text-sm font-bold fill-slate-800 dark:fill-white">External APIs</text>

          {/* Server Nodes */}
          <rect x="400" y="140" width="300" height="60" rx="8" fill="#eef2ff" stroke="#a5b4fc" strokeWidth="2" className="dark:fill-indigo-950/40 dark:stroke-indigo-800 shadow-sm" />
          <text x="550" y="175" textAnchor="middle" className="text-sm font-bold fill-indigo-900 dark:fill-indigo-100">API Gateway (Express)</text>

          <rect x="400" y="240" width="130" height="60" rx="8" fill="#ecfdf5" stroke="#6ee7b7" strokeWidth="2" className="dark:fill-emerald-950/40 dark:stroke-emerald-800 shadow-sm" />
          <text x="465" y="275" textAnchor="middle" className="text-sm font-bold fill-emerald-900 dark:fill-emerald-100">WebSocket Hub</text>

          <rect x="570" y="240" width="130" height="60" rx="8" fill="#fffbeb" stroke="#fcd34d" strokeWidth="2" className="dark:fill-amber-950/40 dark:stroke-amber-800 shadow-sm" />
          <text x="635" y="275" textAnchor="middle" className="text-sm font-bold fill-amber-900 dark:fill-amber-100">AI Analytics</text>

          <rect x="400" y="340" width="300" height="60" rx="8" fill="#fdf2f8" stroke="#f9a8d4" strokeWidth="2" className="dark:fill-pink-950/40 dark:stroke-pink-800 shadow-sm" />
          <text x="550" y="375" textAnchor="middle" className="text-sm font-bold fill-pink-900 dark:fill-pink-100">Redis Stream / Persistence</text>

          {/* Connections */}
          <path d="M 220 170 C 310 170 310 170 390 170" fill="none" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" strokeDasharray="5,5" className="dark:stroke-slate-600" />
          <path d="M 220 270 C 310 270 310 270 390 270" fill="none" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" className="dark:stroke-slate-600" />
          <path d="M 220 370 C 310 370 310 170 390 170" fill="none" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" className="dark:stroke-slate-600" />
          
          <path d="M 550 200 L 550 230" fill="none" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" className="dark:stroke-slate-600" />
          <path d="M 465 300 L 465 330" fill="none" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" className="dark:stroke-slate-600" />
          <path d="M 635 300 L 635 330" fill="none" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" className="dark:stroke-slate-600" />

          {/* Arrow Definition */}
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" className="dark:fill-slate-600" />
            </marker>
          </defs>
        </svg>
      </div>

      <h2>Data Flow</h2>
      <ol>
        <li>
          <strong>Ingestion:</strong> CloudAI Agents push infrastructure metrics (CPU, memory, disk, network) every 5 seconds to the WebSocket Hub or via REST API endpoints.
        </li>
        <li>
          <strong>Stream Processing:</strong> The WebSocket Hub validates the incoming payload and immediately broadcasts it to connected dashboard clients for zero-latency monitoring.
        </li>
        <li>
          <strong>AI Analysis:</strong> Metrics are asynchronously pushed into a Redis stream. The AI Analytics engine polls this stream, calculating outage probabilities and triggering root cause analysis (using Ollama/Llama3) if anomalies are detected.
        </li>
        <li>
          <strong>Persistence:</strong> Processed metrics, incidents, and logs are durably stored in PostgreSQL for historical querying and postmortem generation.
        </li>
      </ol>

      <h2>Tech Stack</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose my-6">
        <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
          <h4 className="font-bold text-slate-900 dark:text-white mb-2">Frontend</h4>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
            <li>Next.js (App Router)</li>
            <li>React 18 + TypeScript</li>
            <li>Tailwind CSS + Framer Motion</li>
            <li>Recharts & React Flow</li>
            <li>Zustand (State Management)</li>
          </ul>
        </div>
        <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
          <h4 className="font-bold text-slate-900 dark:text-white mb-2">Backend</h4>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
            <li>Node.js + Express</li>
            <li>Socket.IO</li>
            <li>Ollama (Local LLM Integration)</li>
            <li>systeminformation</li>
            <li>node-ssh</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
