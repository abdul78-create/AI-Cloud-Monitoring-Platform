/**
 * Live Monitoring Engine
 * Momentum-based smooth metric simulation with correlated anomaly injection.
 */

export interface LiveMetric {
  timestamp: string;
  cpu: number;
  memory: number;
  network: number;
  disk: number;
  requestsPerSec: number;
  errorRate: number;
  latencyMs: number;
  activeThreats: number;
}

export interface LiveIncident {
  id: string;
  type: 'warning' | 'critical' | 'info' | 'recovery' | 'security' | 'scaling';
  title: string;
  message: string;
  service: string;
  timestamp: string;
}

export interface LiveLogEntry {
  id: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL' | 'DEBUG' | 'RECOVERY';
  service: string;
  message: string;
  timestamp: string;
  traceId?: string;
}

export interface AIInsight {
  id: string;
  type: 'anomaly' | 'prediction' | 'recommendation' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  detail: string;
  confidence: number;
  timestamp: string;
  action?: string;
}

// Smooth momentum-based value
class SmoothValue {
  private value: number;
  private velocity = 0;
  constructor(initial: number, private min: number, private max: number, private noise = 2) {
    this.value = initial;
  }
  next(spikeMult = 1): number {
    const n = (Math.random() - 0.5) * this.noise * spikeMult;
    const attract = (this.value - (this.min + this.max) / 2) * -0.04;
    this.velocity = this.velocity * 0.82 + n + attract;
    this.value = Math.max(this.min, Math.min(this.max, this.value + this.velocity));
    return Math.round(this.value * 10) / 10;
  }
  spike(amount: number) { this.velocity += amount; }
  get current() { return this.value; }
}

const cpu = new SmoothValue(45, 5, 95, 3);
const mem = new SmoothValue(60, 20, 92, 2);
const net = new SmoothValue(180, 10, 900, 18);
const disk = new SmoothValue(42, 20, 85, 0.4);
const rps = new SmoothValue(1200, 50, 9000, 90);
const err = new SmoothValue(0.3, 0, 18, 0.12);
const lat = new SmoothValue(45, 8, 900, 6);
const thr = new SmoothValue(0, 0, 12, 0.25);

let tick = 0;
let anomalyUntil = 0;

export function generateNextMetric(): LiveMetric {
  tick++;
  if (tick > anomalyUntil && Math.random() < 0.025) {
    anomalyUntil = tick + Math.floor(Math.random() * 12) + 4;
    const t = Math.floor(Math.random() * 4);
    if (t === 0) { cpu.spike(28); mem.spike(12); }
    else if (t === 1) { net.spike(500); rps.spike(3000); err.spike(4); }
    else if (t === 2) { lat.spike(300); err.spike(6); }
    else { thr.spike(5); }
  }
  const sm = tick <= anomalyUntil ? 2.2 : 1;
  return {
    timestamp: new Date().toISOString(),
    cpu: cpu.next(sm),
    memory: mem.next(sm * 0.6),
    network: Math.round(net.next(sm * 1.4)),
    disk: disk.next(0.3),
    requestsPerSec: Math.round(rps.next(sm)),
    errorRate: Math.max(0, Math.round(err.next(sm) * 100) / 100),
    latencyMs: Math.round(lat.next(sm)),
    activeThreats: Math.max(0, Math.round(thr.next(sm * 0.5))),
  };
}

const SVCS = ['api-gateway','auth-service','db-primary','cache-redis','worker-queue','analytics-svc','storage-blob','ml-inference','event-bus','metrics-collector'];
const REGIONS = ['us-east-1','us-west-2','eu-central-1','ap-southeast-1'];

let incN = 0;
export function maybeGenerateIncident(): LiveIncident | null {
  if (Math.random() > 0.10) return null;
  incN++;
  const svc = SVCS[Math.floor(Math.random() * SVCS.length)];
  const reg = REGIONS[Math.floor(Math.random() * REGIONS.length)];
  const tpls: Omit<LiveIncident, 'id'|'timestamp'|'service'>[] = [
    { type:'warning',   title:'High CPU Threshold',          message:`${svc} CPU crossed 85% in ${reg}` },
    { type:'critical',  title:'Service Degraded',            message:`${svc} p99 latency >2000ms — SLA breach in ${reg}` },
    { type:'security',  title:'Brute-Force Detected',        message:`47 failed auth attempts on ${svc} from same subnet` },
    { type:'scaling',   title:'Auto-Scale Triggered',        message:`${svc} scaled to ${Math.floor(Math.random()*4)+2} replicas — traffic spike` },
    { type:'warning',   title:'Memory Pressure',             message:`${svc} heap at 89% — GC pressure increasing` },
    { type:'info',      title:'Deployment Complete',         message:`${svc} v${Math.floor(Math.random()*5)}.${Math.floor(Math.random()*20)}.${Math.floor(Math.random()*10)} live in ${reg}` },
    { type:'recovery',  title:'Incident Resolved',           message:`${svc} returned healthy after 3m12s degradation` },
    { type:'critical',  title:'Connection Pool Exhausted',   message:`${svc} cannot acquire DB connections` },
    { type:'security',  title:'DDoS Pattern Detected',       message:`Unusual flood pattern from 192.${Math.floor(Math.random()*255)}.x.x` },
    { type:'warning',   title:'Disk I/O Saturation',         message:`${svc} disk write throughput at 94% capacity` },
  ];
  const t = tpls[Math.floor(Math.random() * tpls.length)];
  return { id:`inc-${Date.now()}-${incN}`, timestamp:new Date().toISOString(), service:svc, ...t };
}

const LOGS: Record<LiveLogEntry['level'], string[]> = {
  INFO: [
    'Health check passed — all endpoints within SLA',
    'Cache warmed — 95% hit rate achieved',
    'Scheduled backup completed in 4.2s',
    'Circuit breaker CLOSED — error rate normalized',
    'JWT rotation completed for service account',
    'Replica synced — replication lag 12ms',
    'Config hot-reload applied — no restart needed',
    'Metrics flushed to Prometheus scrape endpoint',
    'Rate limiter reset — quota window refreshed',
  ],
  WARNING: [
    'Connection pool at 78% — consider horizontal scaling',
    'p99 response time approaching SLA (1450ms)',
    'Memory fragmentation detected — restart recommended',
    'Retry storm from downstream — circuit tripping',
    'TLS certificate expires in 14 days',
    'Slow query: execution time 3.2s on users table',
    'Queue depth growing — 1,250 messages backlogged',
    'CPU steal time elevated — noisy neighbour suspected',
  ],
  ERROR: [
    'Connection refused: db-primary:5432 after 3 retries',
    'Request timeout — auth-service unresponsive (5000ms)',
    'Deadlock detected in txn — rolled back automatically',
    'Failed to acquire distributed lock after 5s',
    'OOM in worker pod — restarting container',
    'SSL handshake failed — certificate CN mismatch',
    'Rate limit exceeded for API key ****8f2a',
    '500 Internal Server Error on POST /api/v2/events',
  ],
  CRITICAL: [
    'FATAL: db-primary unreachable — initiating failover',
    'CRITICAL: All replicas lagging >30s — data consistency at risk',
    'CRITICAL: Service fully unresponsive — killing process',
    'ALERT: Potential data exfiltration pattern detected',
    'FATAL: Kernel OOM killer terminated process',
    'CRITICAL: Network partition between AZ-A and AZ-B',
  ],
  DEBUG: [
    'gRPC keepalive ping sent to upstream peer',
    'Trace sampling adjusted to 10% for high-load period',
    'Cache key evicted: user_session_7f3a2b',
    'HTTP/2 stream multiplexed — stream_id=47',
    'DNS TTL refreshed for internal service mesh entry',
  ],
  RECOVERY: [
    'Service RECOVERED — health checks passing',
    'Database reconnected — normal operations resumed',
    'Circuit breaker CLOSED — error rate below threshold',
    'Memory pressure resolved — GC pause normalized',
    'Network partition healed — replication resumed',
    'Auto-scaling target capacity reached — stable',
    'Incident RESOLVED — SLA window restored',
  ],
};

let logN = 0;
export function generateLogEntry(): LiveLogEntry {
  logN++;
  const r = Math.random();
  const level: LiveLogEntry['level'] =
    r < 0.44 ? 'INFO' : r < 0.63 ? 'WARNING' : r < 0.79 ? 'ERROR' :
    r < 0.86 ? 'CRITICAL' : r < 0.94 ? 'DEBUG' : 'RECOVERY';
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

const INSIGHTS: Omit<AIInsight,'id'|'timestamp'|'confidence'>[] = [
  { type:'anomaly',       priority:'high',     title:'CPU Spike Pattern',          detail:'api-gateway CPU shows 3σ deviation from 7-day baseline — correlates with last deploy.', action:'Review deployment diff' },
  { type:'prediction',    priority:'medium',   title:'Traffic Surge Incoming',     detail:'ML predicts +40% traffic in next 15 min based on historical patterns.', action:'Pre-scale us-east cluster' },
  { type:'recommendation',priority:'low',      title:'Idle DB Replica',            detail:'db-replica-03 averaged 12% CPU for 7 days. Downgrade to save ~$89/month.', action:'Resize instance' },
  { type:'alert',         priority:'critical', title:'Memory Leak Signature',      detail:'auth-service memory growing 2MB/min with no GC recovery. Known leak pattern.', action:'Rolling restart now' },
  { type:'prediction',    priority:'high',     title:'Failover Risk',              detail:'Replication lag trend: primary may failover in ~8 minutes at current rate.', action:'Manual pre-emptive failover' },
  { type:'anomaly',       priority:'medium',   title:'Error Rate Correlation',     detail:'auth-service errors correlate with api-gateway deploys — API contract mismatch suspected.', action:'Review OpenAPI spec' },
  { type:'recommendation',priority:'medium',   title:'Cache Miss Optimization',   detail:'cache-redis miss rate 34%. L1 in-process cache could reduce latency by ~60ms.', action:'Enable request memoization' },
  { type:'alert',         priority:'high',     title:'Unusual Egress Traffic',     detail:'storage-blob outbound 3x baseline. Possible misconfigured backup or data leak.', action:'Review egress rules' },
  { type:'prediction',    priority:'low',      title:'Disk Capacity Warning',      detail:'At current growth, db-primary exhausts disk in ~11 days.', action:'Schedule volume expansion' },
  { type:'recommendation',priority:'low',      title:'Cold Start Latency',        detail:'ml-inference cold starts at 2.1s. Provisioned concurrency cuts p99 by ~80%.', action:'Enable warm pool' },
];
let insightIdx = 0;
export function generateAIInsight(): AIInsight {
  const t = INSIGHTS[insightIdx % INSIGHTS.length];
  insightIdx++;
  return { id:`insight-${Date.now()}-${insightIdx}`, timestamp:new Date().toISOString(), confidence: Math.round((74+Math.random()*25)*10)/10, ...t };
}
