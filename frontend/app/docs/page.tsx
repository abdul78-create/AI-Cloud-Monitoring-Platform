import React from "react";
import Link from "next/link";
import { Terminal, Zap, Compass, ArrowRight } from "lucide-react";

export default function DocsOverviewPage() {
  return (
    <div className="max-w-3xl prose prose-slate dark:prose-invert">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
          CloudAI Monitor Documentation
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Learn how to monitor your infrastructure, analyze telemetry, detect incidents, and automate cloud operations using our enterprise-grade AI observability platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-12">
        <Link href="/docs/agent" className="group block p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors shadow-sm">
          <Terminal className="text-indigo-500 mb-4" size={24} />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Agent Installation</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">Deploy our lightweight monitoring agent on your Linux servers in under 60 seconds.</p>
          <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 uppercase tracking-wide">
            Read guide <ArrowRight size={14} />
          </div>
        </Link>

        <Link href="/docs/api" className="group block p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors shadow-sm">
          <Zap className="text-indigo-500 mb-4" size={24} />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">API Reference</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">Integrate directly with our telemetry ingestion pipelines and AI incident engine.</p>
          <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 uppercase tracking-wide">
            Explore API <ArrowRight size={14} />
          </div>
        </Link>
      </div>

      <h2>Quick Start</h2>
      <p>
        Getting started with CloudAI Monitor takes less than a minute. You can either deploy our agent on your existing infrastructure or connect your AWS account directly.
      </p>

      <h3>1. Get your API Key</h3>
      <p>
        Navigate to <strong>Settings &gt; API Keys</strong> in your dashboard and generate a new ingress key. You will need this to authenticate your agents.
      </p>

      <h3>2. Install the Agent</h3>
      <p>Run the following command on your target server:</p>
      <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300 not-prose mb-6 overflow-x-auto">
        <div><span className="text-green-400"># Install the CloudAI monitoring agent</span></div>
        <div>curl -sSL https://cloudai.monitor/install.sh | bash</div>
        <br/>
        <div><span className="text-green-400"># Start the agent with your API key</span></div>
        <div>cloudai-agent start --api-key="YOUR_API_KEY"</div>
      </div>

      <h3>3. View your Dashboard</h3>
      <p>
        Once the agent is running, metrics will stream to your dashboard immediately. Navigate to the <strong>Infrastructure</strong> tab to see live CPU, Memory, and Network telemetry.
      </p>

      <hr className="my-10 border-slate-200 dark:border-slate-800" />

      <h2>Core Concepts</h2>
      <ul className="space-y-2">
        <li><strong>Telemetry Streams:</strong> Real-time WebSocket connections that broadcast metrics at sub-second latency.</li>
        <li><strong>AI Incident Engine:</strong> Our deterministic + LLM-based engine that correlates metrics, logs, and deployments to identify root causes.</li>
        <li><strong>Topology Mapping:</strong> Automated dependency graphing based on network traffic between nodes.</li>
      </ul>
    </div>
  );
}
