import { collectOsMetrics } from "./collectors/osMetrics";
import { collectDockerMetrics } from "./collectors/dockerMetrics";
import { sendHeartbeat, getCurrentBackoff, AgentPayload } from "./network/heartbeatClient";
import os from "os";

// Configuration (can be overridden by env vars)
const API_URL = process.env.CLOUDAI_API_URL || "http://localhost:8000";
const API_KEY = process.env.CLOUDAI_API_KEY || "dev-key-123";
const AGENT_ID = process.env.CLOUDAI_AGENT_ID || `node-${os.hostname()}-${Math.random().toString(36).substr(2, 6)}`;
const BASE_INTERVAL = 5000;

console.log(`
=========================================
🚀 CloudAI Monitor Agent Starting...
=========================================
Agent ID: ${AGENT_ID}
Endpoint: ${API_URL}
=========================================
`);

async function runLoop() {
  try {
    const osMetrics = await collectOsMetrics();
    const dockerMetrics = await collectDockerMetrics();

    const payload: AgentPayload = {
      agentId: AGENT_ID,
      hostname: osMetrics.system.hostname,
      ip: getPrimaryIp(),
      version: "1.0.0",
      metrics: {
        cpu: osMetrics.cpu,
        memory: osMetrics.memory,
        disk: osMetrics.disk,
        networkInBytes: osMetrics.networkInBytes,
        networkOutBytes: osMetrics.networkOutBytes,
        uptime: osMetrics.uptime,
      },
      processes: osMetrics.processes,
      docker: dockerMetrics,
      system: osMetrics.system,
    };

    const success = await sendHeartbeat(API_URL, API_KEY, payload);
    
    // Schedule next run
    const nextInterval = success ? BASE_INTERVAL : BASE_INTERVAL + getCurrentBackoff();
    setTimeout(runLoop, nextInterval);

  } catch (err) {
    console.error("[AGENT] Fatal error in collection loop:", err);
    setTimeout(runLoop, BASE_INTERVAL * 2);
  }
}

function getPrimaryIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1)
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return "127.0.0.1";
}

// Start the daemon loop
runLoop();
