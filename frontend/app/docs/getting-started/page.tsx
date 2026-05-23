import React from "react";
import { Terminal } from "lucide-react";

export default function GettingStartedDoc() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Getting Started</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Welcome to the CloudAI Observability Platform. Learn about the architecture and how telemetry flows through the system.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Platform Overview</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          CloudAI Monitor is an enterprise-grade observability platform designed to give SRE teams real-time visibility into their distributed infrastructure. It combines standard metrics collection with an intelligent AI Root Cause Analysis (RCA) engine.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Architecture</h2>
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">1. Data Collection (Agents)</h3>
              <p className="text-xs text-slate-500">Lightweight daemon processes run on your servers, sending high-frequency heartbeats and metrics to the ingestion pipeline.</p>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">2. Ingestion (Express + Socket.io)</h3>
              <p className="text-xs text-slate-500">The Edge API terminates connections and multiplexes streams. Websocket connections are utilized for millisecond latency on UI updates.</p>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">3. Processing (BullMQ & Redis Streams)</h3>
              <p className="text-xs text-slate-500">A decentralized set of worker nodes evaluate threshold rules in real-time. Incident correlations are pushed into Redis streams.</p>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">4. Intelligence (AI Engine)</h3>
              <p className="text-xs text-slate-500">When an incident fires, the LLM-powered engine summarizes log streams, metrics, and deployment history to perform RCA.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Supported Integrations</h2>
        <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-1">
          <li><strong>Linux (Systemd):</strong> Native deb/rpm packages or one-line bash installer.</li>
          <li><strong>Docker:</strong> Containerized agent accessing the docker socket.</li>
          <li><strong>Kubernetes:</strong> DaemonSet deployments for full cluster observability.</li>
          <li><strong>AWS EC2:</strong> Native metadata fetching and tagging.</li>
        </ul>
      </section>
    </div>
  );
}
