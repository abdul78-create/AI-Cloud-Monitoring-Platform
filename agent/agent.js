#!/usr/bin/env node
/**
 * CloudAI Monitor — Lightweight Monitoring Agent
 *
 * Collects CPU, memory, disk, network, and process data from the host machine
 * using the `systeminformation` library, then streams telemetry to your
 * CloudAI Monitor backend every 5 seconds.
 *
 * Usage:
 *   node agent.js --api-key=YOUR_KEY --endpoint=https://your-backend.com
 *
 * Environment variables (alternative to CLI flags):
 *   CLOUDAI_API_KEY     — your ingress API key
 *   CLOUDAI_ENDPOINT    — backend base URL (default: http://localhost:5000)
 *   CLOUDAI_INTERVAL    — collection interval in seconds (default: 5)
 *   CLOUDAI_HOSTNAME    — override reported hostname
 */

const os   = require("os");
const si   = require("systeminformation");
const http = require("http");
const https = require("https");

// ─── Config ───────────────────────────────────────────────────────────────────

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith("--"))
    .map(a => {
      const [k, v] = a.slice(2).split("=");
      return [k.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v ?? true];
    })
);

const CONFIG = {
  apiKey:   process.env.CLOUDAI_API_KEY   || args.apiKey    || "dev-key",
  endpoint: process.env.CLOUDAI_ENDPOINT  || args.endpoint  || "http://localhost:5000",
  interval: parseInt(process.env.CLOUDAI_INTERVAL || args.interval || "5", 10) * 1000,
  hostname: process.env.CLOUDAI_HOSTNAME  || args.hostname  || os.hostname(),
  agentId:  `agent-${os.hostname()}-${process.pid}`,
  version:  "2.4.1",
};

const endpoint = new URL(CONFIG.endpoint);
const transport = endpoint.protocol === "https:" ? https : http;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function post(path, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = transport.request({
      hostname: endpoint.hostname,
      port: endpoint.port || (endpoint.protocol === "https:" ? 443 : 80),
      path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        "X-Agent-Id": CONFIG.agentId,
        "X-Api-Key": CONFIG.apiKey,
      },
    }, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function fmt(n, d = 1) { return Math.round(n * 10 ** d) / 10 ** d; }

// ─── Metrics Collection ───────────────────────────────────────────────────────

async function collectMetrics() {
  const [cpu, mem, disk, net, processes, load] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.networkStats(),
    si.processes(),
    si.currentLoad(),
  ]);

  // Primary disk (first mounted filesystem)
  const primaryDisk = disk.find(d => d.mount === "/" || d.mount === "C:\\") || disk[0] || {};
  const diskUsePct = primaryDisk.size > 0
    ? fmt((primaryDisk.used / primaryDisk.size) * 100)
    : 0;

  // Network (aggregate all interfaces)
  const netIn  = net.reduce((s, n) => s + (n.rx_bytes || 0), 0);
  const netOut = net.reduce((s, n) => s + (n.tx_bytes || 0), 0);

  // Top 10 processes by CPU
  const topProcesses = (processes.list || [])
    .sort((a, b) => (b.cpu || 0) - (a.cpu || 0))
    .slice(0, 10)
    .map(p => ({
      pid: p.pid,
      name: p.name,
      cpu: fmt(p.cpu || 0),
      memory: fmt(p.memRss ? p.memRss / 1024 / 1024 : 0),
      status: p.state || "unknown",
    }));

  return {
    agentId: CONFIG.agentId,
    hostname: CONFIG.hostname,
    ip: Object.values(os.networkInterfaces())
      .flat()
      .find(i => i && !i.internal && i.family === "IPv4")?.address || "127.0.0.1",
    version: CONFIG.version,
    collectedAt: new Date().toISOString(),
    uptime: os.uptime(),
    metrics: {
      cpu: fmt(cpu.currentLoad || 0),
      memory: fmt((mem.used / mem.total) * 100),
      memoryUsedGB: fmt(mem.used / 1024 / 1024 / 1024),
      memoryTotalGB: fmt(mem.total / 1024 / 1024 / 1024),
      disk: diskUsePct,
      diskUsedGB: fmt((primaryDisk.used || 0) / 1024 / 1024 / 1024),
      diskTotalGB: fmt((primaryDisk.size || 1) / 1024 / 1024 / 1024),
      networkInBytes: netIn,
      networkOutBytes: netOut,
      loadAvg1m: fmt(load.avgLoad || 0),
    },
    processes: topProcesses,
  };
}

// ─── Main Loop ────────────────────────────────────────────────────────────────

let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 10;

async function tick() {
  try {
    const metrics = await collectMetrics();

    // Send heartbeat with metrics
    const res = await post("/api/ops/agent/heartbeat", metrics);

    if (res.status === 200) {
      consecutiveErrors = 0;
      const cpu = metrics.metrics.cpu;
      const mem = metrics.metrics.memory;
      console.log(
        `[${new Date().toISOString()}] ✓ Heartbeat — CPU: ${cpu}% | MEM: ${mem}% | DISK: ${metrics.metrics.disk}%`
      );
    } else {
      console.warn(`[WARN] Backend responded with status ${res.status}`);
    }
  } catch (err) {
    consecutiveErrors++;
    console.error(`[ERROR] Failed to send heartbeat (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}): ${err.message}`);

    if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      console.error("[FATAL] Too many consecutive errors. Check backend connectivity.");
      consecutiveErrors = 0; // Reset and keep trying
    }
  }
}

// ─── Startup ──────────────────────────────────────────────────────────────────

console.log("╔══════════════════════════════════════════════════════╗");
console.log("║          CloudAI Monitor — Monitoring Agent          ║");
console.log("╚══════════════════════════════════════════════════════╝");
console.log(`  Agent ID  : ${CONFIG.agentId}`);
console.log(`  Hostname  : ${CONFIG.hostname}`);
console.log(`  Endpoint  : ${CONFIG.endpoint}`);
console.log(`  Interval  : ${CONFIG.interval / 1000}s`);
console.log(`  Version   : ${CONFIG.version}`);
console.log("─────────────────────────────────────────────────────────");
console.log("  Starting telemetry collection...\n");

// Initial tick immediately, then on interval
tick();
setInterval(tick, CONFIG.interval);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n[AGENT] Shutting down gracefully...");
  process.exit(0);
});
process.on("SIGTERM", () => {
  console.log("\n[AGENT] Received SIGTERM. Shutting down...");
  process.exit(0);
});
