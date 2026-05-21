/**
 * Incident Timeline Service
 *
 * Manages the full lifecycle of incidents:
 * - creation from alert engine
 * - timeline event recording
 * - deployment correlation
 * - AI summary generation
 * - remediation tracking
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type IncidentSeverity = "warning" | "high" | "critical";
export type IncidentStatus   = "open" | "acknowledged" | "investigating" | "resolved";

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: "alert_fired" | "deployment" | "metric_spike" | "user_action" | "ai_insight" | "recovery" | "escalation";
  actor: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface DeploymentCorrelation {
  version: string;
  deployedAt: Date;
  deployedBy: string;
  confidence: number;  // 0-100
  affectedService: string;
  regressionSignal: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedServices: string[];
  startedAt: Date;
  acknowledgedAt: Date | null;
  resolvedAt: Date | null;
  assignedTo: string | null;
  timeline: TimelineEvent[];
  deploymentCorrelation: DeploymentCorrelation | null;
  aiSummary: string;
  aiRecommendations: string[];
  metrics: {
    peakCpu: number;
    peakMemory: number;
    peakLatency: number;
    errorRate: number;
  };
  runbook: string[];
}

// ─── Deployment Log ───────────────────────────────────────────────────────────

export interface Deployment {
  id: string;
  version: string;
  service: string;
  deployedAt: Date;
  deployedBy: string;
  status: "success" | "failed" | "rolling-back";
  commitSha: string;
  changelog: string[];
}

const deployments: Deployment[] = [
  {
    id: "dep-001",
    version: "v2.4.1",
    service: "api-gateway",
    deployedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    deployedBy: "ci-bot@enterprise.com",
    status: "success",
    commitSha: "a3f8b2c",
    changelog: [
      "Increase connection pool size to 200",
      "Add retry logic for downstream timeouts",
      "Migrate auth middleware to JWT RS256",
    ],
  },
  {
    id: "dep-002",
    version: "v2.4.0",
    service: "auth-service",
    deployedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    deployedBy: "ops-admin@enterprise.com",
    status: "success",
    commitSha: "d7e4f9a",
    changelog: [
      "Implement OAuth2 PKCE flow",
      "Add rate limiting on /login endpoint",
      "Upgrade bcrypt to v5.1.1",
    ],
  },
  {
    id: "dep-003",
    version: "v2.3.9",
    service: "db-primary",
    deployedAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
    deployedBy: "sre-lead@enterprise.com",
    status: "success",
    commitSha: "c1d2e3b",
    changelog: [
      "Tune autovacuum for write-heavy tables",
      "Enable pg_stat_statements extension",
      "Increase shared_buffers to 4GB",
    ],
  },
  {
    id: "dep-004",
    version: "v2.3.8",
    service: "worker-queue",
    deployedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    deployedBy: "dev-01@enterprise.com",
    status: "failed",
    commitSha: "e5f6a1c",
    changelog: [
      "Increase celery worker concurrency to 16",
      "Add dead-letter queue handling",
    ],
  },
];

// ─── Incident Store ───────────────────────────────────────────────────────────

const incidents: Map<string, Incident> = new Map();
let incidentCounter = 1;

// Seed with realistic production incidents
const SEEDED_INCIDENTS: Incident[] = [
  {
    id: "INC-001",
    title: "CPU Saturation — worker-node-1 (89%)",
    severity: "critical",
    status: "acknowledged",
    affectedServices: ["worker-node-1.us-east.internal", "worker-queue", "celery"],
    startedAt: new Date(Date.now() - 12 * 60 * 1000),
    acknowledgedAt: new Date(Date.now() - 8 * 60 * 1000),
    resolvedAt: null,
    assignedTo: "sre-lead@enterprise.com",
    deploymentCorrelation: {
      version: "v2.4.1",
      deployedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      deployedBy: "ci-bot@enterprise.com",
      confidence: 82,
      affectedService: "api-gateway",
      regressionSignal: "CPU utilization increased 42% within 15 minutes of deployment v2.4.1. Increased connection pool size (200) may be amplifying load on downstream workers.",
    },
    aiSummary: "CPU saturation on worker-node-1 is consistent with a compute cascade triggered by api-gateway v2.4.1's increased connection pool. The pool expansion (100→200) is routing 2× the concurrent requests to celery workers, exhausting CPU capacity. Recommend scaling worker replicas before the next deployment window.",
    aiRecommendations: [
      "Scale worker-node Celery concurrency from 8 to 16 replicas immediately.",
      "Reduce api-gateway connection pool to 120 as a temporary mitigation.",
      "Rollback api-gateway to v2.4.0 if CPU does not recover within 10 minutes.",
      "Set a CPU autoscaling trigger at 75% to prevent recurrence.",
    ],
    metrics: { peakCpu: 89, peakMemory: 92, peakLatency: 340, errorRate: 2.1 },
    timeline: [
      { id: "t1", timestamp: new Date(Date.now() - 12 * 60 * 1000), type: "alert_fired", actor: "Alert Engine", message: "CPU Saturation alert fired — worker-node-1 at 89% (threshold: 85%)", metadata: { value: 89 } },
      { id: "t2", timestamp: new Date(Date.now() - 11 * 60 * 1000), type: "ai_insight", actor: "AI Engine", message: "AI correlated CPU spike with deployment v2.4.1 (api-gateway). Confidence: 82%." },
      { id: "t3", timestamp: new Date(Date.now() - 10 * 60 * 1000), type: "escalation", actor: "Alert Engine", message: "Incident auto-escalated to P1 — Critical severity sustained for >5 minutes." },
      { id: "t4", timestamp: new Date(Date.now() - 8 * 60 * 1000), type: "user_action", actor: "sre-lead@enterprise.com", message: "Incident acknowledged. Investigating celery worker resource usage." },
      { id: "t5", timestamp: new Date(Date.now() - 5 * 60 * 1000), type: "metric_spike", actor: "Telemetry", message: "Memory peaked at 92% simultaneously — possible OOM risk if CPU not resolved.", metadata: { value: 92 } },
    ],
    runbook: [
      "SSH into worker-node-1: `ssh ops@10.0.2.10`",
      "Check top processes: `top -b -n1 | head -20`",
      "Inspect celery workers: `celery -A app inspect active`",
      "If stuck tasks: `celery -A app purge`",
      "Scale replicas: `kubectl scale deployment worker --replicas=6`",
      "Monitor recovery: CPU should return to <75% within 2 minutes of scaling.",
    ],
  },
  {
    id: "INC-002",
    title: "API Latency SLA Breach — prod-api-1 (2340ms)",
    severity: "critical",
    status: "resolved",
    affectedServices: ["prod-api-1.us-east.internal", "db-primary"],
    startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    acknowledgedAt: new Date(Date.now() - 2.9 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
    assignedTo: "ops-admin@enterprise.com",
    deploymentCorrelation: null,
    aiSummary: "P99 latency breach on prod-api-1 was caused by connection pool exhaustion on db-primary (PgBouncer max_client_conn reached). High volume of slow queries triggered a cascading wait state across all API workers. Root fix: increased pgbouncer pool_size and optimized N+1 query pattern in user-service.",
    aiRecommendations: [
      "Increase PgBouncer pool_size from 20 to 50.",
      "Add query result caching for /api/users endpoint.",
      "Set statement_timeout = 5000ms in PostgreSQL to kill runaway queries.",
      "Add database query latency monitoring alert at 500ms threshold.",
    ],
    metrics: { peakCpu: 45, peakMemory: 78, peakLatency: 2340, errorRate: 8.4 },
    timeline: [
      { id: "t1", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), type: "alert_fired", actor: "Alert Engine", message: "Latency SLA breach — P99 at 2340ms (SLA: 2000ms)", metadata: { value: 2340 } },
      { id: "t2", timestamp: new Date(Date.now() - 2.95 * 60 * 60 * 1000), type: "ai_insight", actor: "AI Engine", message: "AI detected connection pool exhaustion pattern on db-primary. 95% of API timeouts traced to database waits." },
      { id: "t3", timestamp: new Date(Date.now() - 2.9 * 60 * 60 * 1000), type: "user_action", actor: "ops-admin@enterprise.com", message: "Acknowledged. Checked PgBouncer stats — pool at 100% capacity." },
      { id: "t4", timestamp: new Date(Date.now() - 2.8 * 60 * 60 * 1000), type: "user_action", actor: "ops-admin@enterprise.com", message: "Increased PgBouncer pool_size from 20 to 50. Restarted pgbouncer." },
      { id: "t5", timestamp: new Date(Date.now() - 2.6 * 60 * 60 * 1000), type: "metric_spike", actor: "Telemetry", message: "Latency recovering — P99 dropping from 2340ms to 890ms.", metadata: { value: 890 } },
      { id: "t6", timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000), type: "recovery", actor: "ops-admin@enterprise.com", message: "Incident resolved. Latency returned to baseline (45ms P99). RCA in progress." },
    ],
    runbook: [
      "Check PgBouncer status: `psql -p 6432 -U pgbouncer pgbouncer -c 'SHOW POOLS;'`",
      "Identify slow queries: `SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;`",
      "Kill long-running queries: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '30 seconds';`",
      "Increase pool size in /etc/pgbouncer/pgbouncer.ini: pool_size = 50",
    ],
  },
  {
    id: "INC-003",
    title: "Failed Login Spike — auth-service (180 attempts/90s)",
    severity: "high",
    status: "investigating",
    affectedServices: ["auth-service", "api-gateway"],
    startedAt: new Date(Date.now() - 22 * 60 * 1000),
    acknowledgedAt: new Date(Date.now() - 19 * 60 * 1000),
    resolvedAt: null,
    assignedTo: "sre-lead@enterprise.com",
    deploymentCorrelation: null,
    aiSummary: "Potential credential stuffing attack detected. 180 failed login attempts in 90 seconds originating from 3 IP ranges (185.220.x.x, 45.141.x.x, 198.54.x.x) known to be associated with Tor exit nodes and proxy services. Pattern is consistent with automated credential validation attacks.",
    aiRecommendations: [
      "Block IP ranges 185.220.0.0/16, 45.141.0.0/16, 198.54.0.0/16 via WAF rules immediately.",
      "Enable CAPTCHA on /auth/login for IPs with >5 failed attempts in 60 seconds.",
      "Force password reset for any accounts that successfully authenticated from these IPs in past 24h.",
      "Enable account lockout after 10 failed attempts.",
    ],
    metrics: { peakCpu: 28, peakMemory: 64, peakLatency: 180, errorRate: 62 },
    timeline: [
      { id: "t1", timestamp: new Date(Date.now() - 22 * 60 * 1000), type: "alert_fired", actor: "AI Engine", message: "Security anomaly detected: 180 failed auth attempts in 90 seconds from 3 distinct IP ranges." },
      { id: "t2", timestamp: new Date(Date.now() - 21 * 60 * 1000), type: "ai_insight", actor: "AI Engine", message: "IPs classified as Tor exit nodes and residential proxy services. High confidence: credential stuffing attack (87%)." },
      { id: "t3", timestamp: new Date(Date.now() - 19 * 60 * 1000), type: "user_action", actor: "sre-lead@enterprise.com", message: "Acknowledged. Applied WAF rule to block IP ranges. Reviewing affected accounts." },
      { id: "t4", timestamp: new Date(Date.now() - 15 * 60 * 1000), type: "user_action", actor: "sre-lead@enterprise.com", message: "Blocked 3 CIDR ranges. Attack rate reduced from 120/min to 8/min. Monitoring for new source IPs." },
    ],
    runbook: [
      "Apply WAF IP block: `aws wafv2 update-ip-set --name AttackIPs --id ... --addresses 185.220.0.0/16`",
      "Check auth logs: `grep 'failed login' /var/log/auth-service/app.log | tail -200`",
      "Force session invalidation for compromised accounts",
      "Enable CloudWatch alarm for failed auth rate >50/min",
    ],
  },
];

SEEDED_INCIDENTS.forEach(i => incidents.set(i.id, i));

// ─── Public API ───────────────────────────────────────────────────────────────

export function getAllIncidents(): Incident[] {
  return Array.from(incidents.values()).sort(
    (a, b) => b.startedAt.getTime() - a.startedAt.getTime()
  );
}

export function getIncidentById(id: string): Incident | undefined {
  return incidents.get(id);
}

export function acknowledgeIncident(id: string, by: string): Incident | null {
  const inc = incidents.get(id);
  if (!inc) return null;
  inc.status = "acknowledged";
  inc.acknowledgedAt = new Date();
  inc.assignedTo = by;
  inc.timeline.push({
    id: `t-${Date.now()}`,
    timestamp: new Date(),
    type: "user_action",
    actor: by,
    message: `Incident acknowledged by ${by}.`,
  });
  return inc;
}

export function resolveIncident(id: string, by: string): Incident | null {
  const inc = incidents.get(id);
  if (!inc) return null;
  inc.status = "resolved";
  inc.resolvedAt = new Date();
  inc.timeline.push({
    id: `t-${Date.now()}`,
    timestamp: new Date(),
    type: "recovery",
    actor: by,
    message: `Incident resolved by ${by}. Post-mortem RCA pending.`,
  });
  return inc;
}

export function addTimelineEvent(
  incidentId: string,
  event: Omit<TimelineEvent, "id">
): Incident | null {
  const inc = incidents.get(incidentId);
  if (!inc) return null;
  inc.timeline.push({ id: `t-${Date.now()}`, ...event });
  return inc;
}

export function getAllDeployments(): Deployment[] {
  return deployments.sort((a, b) => b.deployedAt.getTime() - a.deployedAt.getTime());
}

export function createIncidentFromAlert(alertId: string, alert: {
  ruleName: string;
  severity: "warning" | "critical";
  affectedService: string;
  message: string;
}): Incident {
  const id = `INC-${String(incidentCounter++).padStart(3, "0")}`;
  const incident: Incident = {
    id,
    title: `${alert.ruleName} — ${alert.affectedService}`,
    severity: alert.severity === "critical" ? "critical" : "high",
    status: "open",
    affectedServices: [alert.affectedService],
    startedAt: new Date(),
    acknowledgedAt: null,
    resolvedAt: null,
    assignedTo: null,
    deploymentCorrelation: correlateWithDeployment(alert.affectedService),
    aiSummary: alert.message,
    aiRecommendations: ["Investigate recent deployments.", "Check system metrics for correlated spikes.", "Review alert history for recurring patterns."],
    metrics: { peakCpu: 0, peakMemory: 0, peakLatency: 0, errorRate: 0 },
    timeline: [
      {
        id: "t1",
        timestamp: new Date(),
        type: "alert_fired",
        actor: "Alert Engine",
        message: alert.message,
      },
    ],
    runbook: ["SSH to affected server", "Check system metrics", "Review application logs"],
  };
  incidents.set(id, incident);
  return incident;
}

function correlateWithDeployment(service: string): DeploymentCorrelation | null {
  // Find the most recent deployment within 4 hours
  const cutoff = new Date(Date.now() - 4 * 60 * 60 * 1000);
  const recent = deployments.find(
    d => d.deployedAt >= cutoff && (d.service === service || d.status === "failed")
  );
  if (!recent) return null;

  const minutesSince = Math.round((Date.now() - recent.deployedAt.getTime()) / 60000);
  const confidence = Math.max(40, Math.min(95, 100 - minutesSince * 0.5));

  return {
    version: recent.version,
    deployedAt: recent.deployedAt,
    deployedBy: recent.deployedBy,
    confidence: Math.round(confidence),
    affectedService: recent.service,
    regressionSignal: `${recent.service} deployment ${recent.version} occurred ${minutesSince} minutes before the incident. ${recent.changelog[0] ?? "Review changelog for breaking changes."}`,
  };
}
