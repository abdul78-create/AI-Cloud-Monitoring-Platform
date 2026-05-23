import React from "react";
import { Terminal } from "lucide-react";

export default function ConnectInfraDoc() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Connect Infrastructure</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Learn how to install the monitoring agent on different types of environments.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">1-Line Bash Installer (Linux/Ubuntu)</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The fastest way to get started on any Linux host. This script automatically detects your OS, downloads the correct binary, and registers the systemd service.
        </p>
        <div className="bg-slate-950 p-4 rounded-lg relative overflow-hidden group">
          <pre className="text-sm text-green-400 font-mono">
            <code>curl -fsSL https://app.cloudai.monitor/install.sh | bash</code>
          </pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Docker Container</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Run the agent as a sidecar to monitor host metrics without installing packages on the host. You must mount the docker socket for container-level metrics.
        </p>
        <div className="bg-slate-950 p-4 rounded-lg">
          <pre className="text-sm text-blue-400 font-mono">
            <code>docker run -d \{"\n"}  --name cloudai-agent \{"\n"}  -v /var/run/docker.sock:/var/run/docker.sock \{"\n"}  -e API_KEY=YOUR_KEY \{"\n"}  cloudai/agent:latest</code>
          </pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Kubernetes DaemonSet</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Apply our pre-configured YAML to automatically monitor all nodes and pods in your cluster.
        </p>
        <div className="bg-slate-950 p-4 rounded-lg">
          <pre className="text-sm text-purple-400 font-mono">
            <code>kubectl apply -f https://app.cloudai.monitor/k8s/daemonset.yaml</code>
          </pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Troubleshooting</h2>
        <div className="space-y-3">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg">
            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">Agent fails to start?</h4>
            <p className="text-xs text-amber-700 dark:text-amber-400">Check the systemd logs using: <code>journalctl -u cloudai-agent -f</code></p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-lg">
            <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">Missing Docker metrics?</h4>
            <p className="text-xs text-blue-700 dark:text-blue-400">Ensure the agent container was started with the volume mount <code>-v /var/run/docker.sock:/var/run/docker.sock</code>.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
