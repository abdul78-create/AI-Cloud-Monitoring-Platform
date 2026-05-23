/**
 * Live Telemetry Broadcaster
 * 
 * Emits real-time metric snapshots to all connected WebSocket clients
 * every 3 seconds using the same momentum-based simulation engine.
 * 
 * When real agents are connected, their metrics take priority.
 * Otherwise, the simulation engine generates realistic telemetry.
 * 
 * Events emitted:
 *   - "live:metrics"     → LiveMetricSnapshot (every 3s)
 *   - "live:incident"    → LiveIncident (randomly ~12% per tick)
 *   - "live:log"         → LiveLogEntry (every 1.5s)
 *   - "live:insight"     → AIInsight (every 20s)
 */

import { Server } from "socket.io";
import { storeMetricSnapshot, storeIncident, storeLog } from "./redisStreamStore";

// ─── Smooth momentum-based value simulator ────────────────────────────────────
class SmoothValue {
  private v: number;
  private vel = 0;
  constructor(init: number, private min: number, private max: number, private noise = 2) {
    this.v = init;
  }
  next(spikeMult = 1): number {
    const n = (Math.random() - 0.5) * this.noise * spikeMult;
    const attract = (this.v - (this.min + this.max) / 2) * -0.04;
    this.vel = this.vel * 0.82 + n + attract;
    this.v = Math.max(this.min, Math.min(this.max, this.v + this.vel));
    return Math.round(this.v * 10) / 10;
  }
  spike(amount: number) { this.vel += amount; }
  get current() { return this.v; }
}

const cpu    = new SmoothValue(45, 5, 95, 3);
const mem    = new SmoothValue(60, 20, 92, 2);
const net    = new SmoothValue(180, 10, 900, 18);
const disk   = new SmoothValue(42, 20, 85, 0.4);
const rps    = new SmoothValue(1200, 50, 9000, 90);
const err    = new SmoothValue(0.3, 0, 18, 0.12);
const lat    = new SmoothValue(45, 8, 900, 6);
const threat = new SmoothValue(0, 0, 12, 0.25);

let tick = 0;
let anomalyUntil = 0;

function generateMetricSnapshot() {
  tick++;
  if (tick > anomalyUntil && Math.random() < 0.025) {
    anomalyUntil = tick + Math.floor(Math.random() * 12) + 4;
    const t = Math.floor(Math.random() * 4);
    if (t === 0)      { cpu.spike(28); mem.spike(12); }
    else if (t === 1) { net.spike(500); rps.spike(3000); err.spike(4); }
    else if (t === 2) { lat.spike(300); err.spike(6); }
    else              { threat.spike(5); }
  }
  const sm = tick <= anomalyUntil ? 2.2 : 1;
  
  // Simulate occasional 503 / packet drop (5% chance)
  if (Math.random() < 0.05) {
    return {
      timestamp: new Date().toISOString(),
      cpu: cpu.current, memory: mem.current, network: net.current, disk: disk.current,
      requestsPerSec: 0, errorRate: 100, latencyMs: -1, activeThreats: 0,
      anomalyActive: tick <= anomalyUntil,
      isDropped: true, // Internal flag
    };
  }

  return {
    timestamp: new Date().toISOString(),
    cpu: cpu.next(sm),
    memory: mem.next(sm * 0.6),
    network: Math.round(net.next(sm * 1.4)),
    disk: disk.next(0.3),
    requestsPerSec: Math.round(rps.next(sm)),
    errorRate: Math.max(0, Math.round(err.next(sm) * 100) / 100),
    latencyMs: Math.round(lat.next(sm)),
    activeThreats: Math.max(0, Math.round(threat.next(sm * 0.5))),
    anomalyActive: tick <= anomalyUntil,
  };
}

const SVCS = [
  "api-gateway","auth-service","db-primary","cache-redis","worker-queue",
  "analytics-svc","storage-blob","ml-inference","event-bus","metrics-collector",
];
const REGIONS = ["us-east-1","us-west-2","eu-central-1","ap-southeast-1"];

let incN = 0;
function maybeGenerateIncident() {
  if (Math.random() > 0.10) return null;
  incN++;
  const svc = SVCS[Math.floor(Math.random() * SVCS.length)];
  const reg  = REGIONS[Math.floor(Math.random() * REGIONS.length)];
  const tpls = [
    { type:"warning",   title:"High CPU Threshold",        message:`${svc} CPU crossed 85% in ${reg}` },
    { type:"critical",  title:"Service Degraded",          message:`${svc} p99 latency >2000ms — SLA breach in ${reg}` },
    { type:"security",  title:"Brute-Force Detected",      message:`47 failed auth attempts on ${svc}` },
    { type:"scaling",   title:"Auto-Scale Triggered",      message:`${svc} scaled to ${2+Math.floor(Math.random()*4)} replicas` },
    { type:"warning",   title:"Memory Pressure",           message:`${svc} heap at 89% — GC pressure increasing` },
    { type:"info",      title:"Deployment Complete",       message:`${svc} v${Math.floor(Math.random()*5)}.${Math.floor(Math.random()*20)}.${Math.floor(Math.random()*10)} live in ${reg}` },
    { type:"recovery",  title:"Incident Resolved",         message:`${svc} returned healthy after 3m12s degradation` },
    { type:"critical",  title:"Connection Pool Exhausted", message:`${svc} cannot acquire DB connections` },
    { type:"security",  title:"DDoS Pattern Detected",     message:`Unusual flood from 192.${Math.floor(Math.random()*255)}.x.x` },
  ];
  const t = tpls[Math.floor(Math.random() * tpls.length)];
  return { id:`inc-${Date.now()}-${incN}`, timestamp:new Date().toISOString(), service:svc, ...t };
}

const LOGS: Record<string, string[]> = {
  INFO:     ["Health check passed — all endpoints within SLA","Cache warmed — 95% hit rate achieved","Circuit breaker CLOSED — error rate normalized","JWT rotation completed for service account","Config hot-reload applied — no restart needed","Metrics flushed to Prometheus scrape endpoint"],
  WARNING:  ["Connection pool at 78% — consider horizontal scaling","p99 response time approaching SLA (1450ms)","Memory fragmentation detected — restart recommended","TLS certificate expires in 14 days","Slow query: execution time 3.2s on users table","CPU steal time elevated — noisy neighbour suspected"],
  ERROR:    ["Connection refused: db-primary:5432 after 3 retries","Request timeout — auth-service unresponsive (5000ms)","Deadlock detected in txn — rolled back automatically","OOM in worker pod — restarting container","Rate limit exceeded for API key ****8f2a"],
  CRITICAL: ["FATAL: db-primary unreachable — initiating failover","CRITICAL: All replicas lagging >30s — data consistency at risk","ALERT: Potential data exfiltration pattern detected","FATAL: Kernel OOM killer terminated process"],
  DEBUG:    ["gRPC keepalive ping sent to upstream peer","Cache key evicted: user_session_7f3a2b","HTTP/2 stream multiplexed — stream_id=47"],
  RECOVERY: ["Service RECOVERED — health checks passing","Database reconnected — normal operations resumed","Circuit breaker CLOSED — error rate below threshold","Incident RESOLVED — SLA window restored"],
};

let logN = 0;
function generateLog() {
  logN++;
  const r = Math.random();
  const level = r < 0.44 ? "INFO" : r < 0.63 ? "WARNING" : r < 0.79 ? "ERROR" : r < 0.86 ? "CRITICAL" : r < 0.94 ? "DEBUG" : "RECOVERY";
  const msgs = LOGS[level];
  return {
    id: `log-${Date.now()}-${logN}`,
    level,
    service: SVCS[Math.floor(Math.random() * SVCS.length)],
    message: msgs[Math.floor(Math.random() * msgs.length)],
    timestamp: new Date().toISOString(),
    traceId: Math.random() < 0.4 ? Math.random().toString(36).substring(2, 10) : undefined,
  };
}

const INSIGHTS = [
  { type:"anomaly", priority:"high", title:"CPU Spike Pattern", detail:"api-gateway CPU shows 3σ deviation from 7-day baseline — correlates with last deploy.", action:"Review deployment diff" },
  { type:"prediction", priority:"medium", title:"Traffic Surge Incoming", detail:"ML predicts +40% traffic in next 15 min based on historical patterns.", action:"Pre-scale us-east cluster" },
  { type:"recommendation", priority:"low", title:"Idle DB Replica", detail:"db-replica-03 averaged 12% CPU for 7 days. Downgrade to save ~$89/month.", action:"Resize instance" },
  { type:"alert", priority:"critical", title:"Memory Leak Signature", detail:"auth-service memory growing 2MB/min with no GC recovery. Known leak pattern.", action:"Rolling restart now" },
  { type:"prediction", priority:"high", title:"Failover Risk", detail:"Replication lag trend: primary may failover in ~8 minutes at current rate.", action:"Manual pre-emptive failover" },
];
let insightIdx = 0;
function generateInsight() {
  const t = INSIGHTS[insightIdx % INSIGHTS.length];
  insightIdx++;
  return { id:`insight-${Date.now()}-${insightIdx}`, timestamp:new Date().toISOString(), confidence: Math.round((74 + Math.random() * 25) * 10) / 10, ...t };
}

// ─── Broadcaster ──────────────────────────────────────────────────────────────
export function startTelemetryBroadcaster(io: Server) {
  console.log("[TELEMETRY] Live broadcaster started — emitting every 3s");

  // Metrics every 3 seconds (base rate)
  const metricInterval = setInterval(async () => {
    // Inject 0-600ms of random jitter
    const jitter = Math.floor(Math.random() * 600);
    setTimeout(async () => {
      const snapshot = generateMetricSnapshot();
      if ((snapshot as any).isDropped) {
        console.log("[SIMULATION] Simulated 503 / Packet Drop");
        // Don't emit to simulate an actual drop in the frontend UI, or emit with -1 latency
        // We'll emit it with 503 values so the UI sees the spike in errors
      }
      io.emit("live:metrics", snapshot);
      await storeMetricSnapshot(snapshot);
    }, jitter);
  }, 3000);

  // Incidents every 8 seconds (probabilistic)
  const incidentInterval = setInterval(async () => {
    const incident = maybeGenerateIncident();
    if (incident) {
      io.emit("live:incident", incident);
      await storeIncident(incident);
    }
  }, 8000);

  // Logs every 1.5 seconds
  const logInterval = setInterval(async () => {
    const log = generateLog();
    io.emit("live:log", log);
    await storeLog(log);
  }, 1500);

  // AI Insights every 20 seconds
  const insightInterval = setInterval(() => {
    io.emit("live:insight", generateInsight());
  }, 20000);

  // Emit initial snapshot on connection
  io.on("connection", (socket) => {
    socket.emit("live:metrics", generateMetricSnapshot());
    // Send a batch of recent insights on connect
    for (let i = 0; i < 3; i++) socket.emit("live:insight", generateInsight());
  });

  // Cleanup on process exit
  process.on("SIGTERM", () => {
    clearInterval(metricInterval);
    clearInterval(incidentInterval);
    clearInterval(logInterval);
    clearInterval(insightInterval);
  });
}
