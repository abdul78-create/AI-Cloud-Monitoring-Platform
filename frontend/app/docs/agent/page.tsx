import React from "react";
import { Terminal, Copy, Check } from "lucide-react";

export default function AgentDocsPage() {
  return (
    <div className="max-w-3xl prose prose-slate dark:prose-invert">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
          Agent Installation
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Deploy the CloudAI Monitoring agent to start streaming real-time telemetry from your Linux servers and containers.
        </p>
      </div>

      <h2>Quick Install (Linux)</h2>
      <p>
        The easiest way to install the agent on a Linux server is via our automated bash script. 
        It will download the binary, register a systemd service, and start monitoring immediately.
      </p>

      <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300 not-prose mb-6 overflow-x-auto relative group">
        <div><span className="text-green-400"># 1. Download and run the installer</span></div>
        <div>curl -sSL https://cloudai.monitor/install.sh | bash</div>
        <br/>
        <div><span className="text-green-400"># 2. Configure with your API key</span></div>
        <div>sudo cloudai-agent configure --api-key="your_api_key_here"</div>
        <br/>
        <div><span className="text-green-400"># 3. Start the service</span></div>
        <div>sudo systemctl enable --now cloudai-agent</div>
      </div>

      <h2>Docker Deployment</h2>
      <p>
        If you prefer running the agent as a container (useful for monitoring Docker hosts), you can use our official image.
        Make sure to mount the necessary volumes so the agent can read host metrics.
      </p>

      <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300 not-prose mb-6 overflow-x-auto relative group">
        <div>docker run -d \</div>
        <div>  --name cloudai-agent \</div>
        <div>  --pid=host \</div>
        <div>  --network=host \</div>
        <div>  -v /var/run/docker.sock:/var/run/docker.sock:ro \</div>
        <div>  -v /proc:/host/proc:ro \</div>
        <div>  -v /sys:/host/sys:ro \</div>
        <div>  -e API_KEY="your_api_key_here" \</div>
        <div>  cloudai/agent:latest</div>
      </div>

      <h2>Kubernetes DaemonSet</h2>
      <p>
        To monitor an entire Kubernetes cluster, deploy the agent as a DaemonSet so it runs on every node automatically.
      </p>

      <ol>
        <li>
          Create a secret for your API key:
          <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-300 not-prose my-3 overflow-x-auto">
            kubectl create secret generic cloudai-secrets --from-literal=api-key="your_api_key_here" -n monitoring
          </div>
        </li>
        <li>
          Apply the DaemonSet manifest:
          <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-300 not-prose my-3 overflow-x-auto">
            kubectl apply -f https://cloudai.monitor/k8s/daemonset.yaml
          </div>
        </li>
      </ol>

      <hr className="my-10 border-slate-200 dark:border-slate-800" />

      <h2>Configuration Options</h2>
      <p>
        The agent can be configured via a YAML file (default <code>/etc/cloudai/agent.yaml</code>) or environment variables.
      </p>

      <div className="overflow-x-auto not-prose my-6">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-4 py-3 font-bold">Environment Variable</th>
              <th className="px-4 py-3 font-bold">Description</th>
              <th className="px-4 py-3 font-bold">Default</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            <tr>
              <td className="px-4 py-3 font-mono text-xs text-pink-500">CLOUDAI_API_KEY</td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Your ingress API key</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-500">Required</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs text-pink-500">CLOUDAI_ENDPOINT</td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">WebSocket ingest endpoint</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-500">wss://ingest.cloudai.monitor</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs text-pink-500">CLOUDAI_INTERVAL</td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Metrics collection interval (seconds)</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-500">5</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs text-pink-500">CLOUDAI_TAGS</td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Comma-separated custom tags</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-500">""</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
