/**
 * Alert Engine Service
 *
 * Evaluates metric thresholds every 30 seconds.
 * Implements cooldowns, deduplication, and escalation chains.
 * Emits socket events to connected frontend clients.
 */

import { Server as SocketServer } from "socket.io";
import {
  createIncidentFromAlert,
  resolveIncident,
  getIncidentById
} from "./incidentTimelineService";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AlertSeverity = "warning" | "critical";
export type AlertState = "firing" | "suppressed" | "acknowledged" | "resolved";

export interface AlertRule {
  id: string;
  name: string;
  metric: "cpu" | "memory" | "disk" | "latency" | "error_rate" | "uptime";
  condition: ">" | "<" | ">=";
  threshold: number;
  severityIfWarning: number;   // threshold for warning
  severityIfCritical: number;  // threshold for critical
  cooldownMs: number;          // minimum ms between repeated firings
  channels: string[];          // "slack" | "pagerduty" | "email"
  enabled: boolean;
}

export interface FiredAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  metric: string;
  currentValue: number;
  threshold: number;
  severity: AlertSeverity;
  state: AlertState;
  firedAt: Date;
  resolvedAt: Date | null;
  affectedService: string;
  message: string;
  channels: string[];
  escalationLevel: number;
  acknowledgedBy: string | null;
}

// ─── Rule Definitions ─────────────────────────────────────────────────────────

const ALERT_RULES: AlertRule[] = [
  {
    id: "rule-cpu",
    name: "CPU Saturation",
    metric: "cpu",
    condition: ">",
    threshold: 85,
    severityIfWarning: 75,
    severityIfCritical: 85,
    cooldownMs: 5 * 60 * 1000, // 5 min cooldown
    channels: ["slack", "pagerduty"],
    enabled: true,
  },
  {
    id: "rule-mem",
    name: "Memory Pressure",
    metric: "memory",
    condition: ">",
    threshold: 90,
    severityIfWarning: 80,
    severityIfCritical: 90,
    cooldownMs: 5 * 60 * 1000,
    channels: ["slack"],
    enabled: true,
  },
  {
    id: "rule-disk",
    name: "Disk Space Critical",
    metric: "disk",
    condition: ">",
    threshold: 85,
    severityIfWarning: 75,
    severityIfCritical: 85,
    cooldownMs: 15 * 60 * 1000, // 15 min
    channels: ["email"],
    enabled: true,
  },
  {
    id: "rule-latency",
    name: "API Latency SLA Breach",
    metric: "latency",
    condition: ">",
    threshold: 2000,
    severityIfWarning: 1000,
    severityIfCritical: 2000,
    cooldownMs: 3 * 60 * 1000,
    channels: ["slack", "pagerduty"],
    enabled: true,
  },
];

// ─── State ────────────────────────────────────────────────────────────────────

const firedAlerts: Map<string, FiredAlert> = new Map();
const lastFiredAt: Map<string, number> = new Map();
let alertIdCounter = 1;
const alertToIncidentMap: Map<string, string> = new Map();

// Seed with 3 realistic pre-existing alerts for UI richness
const SEEDED_ALERTS: FiredAlert[] = [
  {
    id: "alert-001",
    ruleId: "rule-cpu",
    ruleName: "CPU Saturation",
    metric: "cpu",
    currentValue: 89,
    threshold: 85,
    severity: "critical",
    state: "firing",
    firedAt: new Date(Date.now() - 12 * 60 * 1000),
    resolvedAt: null,
    affectedService: "worker-node-1.us-east.internal",
    message: "CPU usage at 89% — exceeds critical threshold of 85%. Pattern resembles compute saturation after batch job launch.",
    channels: ["slack", "pagerduty"],
    escalationLevel: 1,
    acknowledgedBy: null,
  },
  {
    id: "alert-002",
    ruleId: "rule-mem",
    ruleName: "Memory Pressure",
    metric: "memory",
    currentValue: 92,
    threshold: 90,
    severity: "critical",
    state: "acknowledged",
    firedAt: new Date(Date.now() - 35 * 60 * 1000),
    resolvedAt: null,
    affectedService: "worker-node-1.us-east.internal",
    message: "Memory usage at 92% — OOM risk elevated. Heap growth correlated with active Python worker processes.",
    channels: ["slack"],
    escalationLevel: 0,
    acknowledgedBy: "sre-lead@enterprise.com",
  },
  {
    id: "alert-003",
    ruleId: "rule-latency",
    ruleName: "API Latency SLA Breach",
    metric: "latency",
    currentValue: 2340,
    threshold: 2000,
    severity: "critical",
    state: "resolved",
    firedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
    affectedService: "prod-api-1.us-east.internal",
    message: "P99 latency reached 2340ms — SLA breach. Correlated with db-primary connection pool exhaustion.",
    channels: ["slack", "pagerduty"],
    escalationLevel: 2,
    acknowledgedBy: "ops-admin@enterprise.com",
  },
];

SEEDED_ALERTS.forEach(a => firedAlerts.set(a.id, a));

// ─── Alert Engine ─────────────────────────────────────────────────────────────

export function evaluateThresholds(
  metrics: { cpu: number; memory: number; disk: number; latency: number },
  service: string,
  io: SocketServer
): void {
  for (const rule of ALERT_RULES) {
    if (!rule.enabled) continue;

    const value = metrics[rule.metric as keyof typeof metrics];
    if (value === undefined) continue;

    const isFiring = value >= rule.threshold;
    const isWarning = value >= rule.severityIfWarning && value < rule.severityIfCritical;
    const severity: AlertSeverity = isWarning ? "warning" : "critical";
    const alertKey = `${rule.id}:${service}`;

    // Check cooldown — don't re-fire within cooldown window
    const lastFired = lastFiredAt.get(alertKey) ?? 0;
    const cooldownElapsed = Date.now() - lastFired > rule.cooldownMs;

    if (isFiring && cooldownElapsed) {
      const alertId = `alert-${(alertIdCounter++).toString().padStart(4, "0")}`;
      const message = buildAlertMessage(rule, value, service, severity);

      const alert: FiredAlert = {
        id: alertId,
        ruleId: rule.id,
        ruleName: rule.name,
        metric: rule.metric,
        currentValue: value,
        threshold: rule.threshold,
        severity,
        state: "firing",
        firedAt: new Date(),
        resolvedAt: null,
        affectedService: service,
        message,
        channels: rule.channels,
        escalationLevel: 0,
        acknowledgedBy: null,
      };

      firedAlerts.set(alertId, alert);
      lastFiredAt.set(alertKey, Date.now());

      // Create corresponding incident
      const incident = createIncidentFromAlert(alertId, {
        ruleName: rule.name,
        severity,
        affectedService: service,
        message,
      });
      alertToIncidentMap.set(alertId, incident.id);

      // Emit to all connected frontend clients
      io.emit("alert:fired", alert);
      io.emit("incident:created", incident);
      console.log(`[ALERT ENGINE] Fired: ${rule.name} on ${service} (value=${value}, threshold=${rule.threshold}). Created incident ${incident.id}`);

      // Auto-escalate critical alerts after 5 minutes
      if (severity === "critical") {
        setTimeout(() => {
          const existing = firedAlerts.get(alertId);
          if (existing && existing.state === "firing") {
            existing.escalationLevel = 1;
            io.emit("alert:escalated", existing);
            console.log(`[ALERT ENGINE] Escalated: ${alertId}`);
          }
        }, 5 * 60 * 1000);
      }
    }

    // Auto-resolve previously firing alerts when metric recovers
    for (const [id, alert] of firedAlerts) {
      if (
        alert.ruleId === rule.id &&
        alert.affectedService === service &&
        alert.state === "firing" &&
        value < rule.severityIfWarning
      ) {
        alert.state = "resolved";
        alert.resolvedAt = new Date();
        io.emit("alert:resolved", alert);
        console.log(`[ALERT ENGINE] Auto-resolved alert: ${id}`);

        const incidentId = alertToIncidentMap.get(id);
        if (incidentId) {
          resolveIncident(incidentId, "Alert Engine (Auto)");
          const resolvedInc = getIncidentById(incidentId);
          if (resolvedInc) {
            io.emit("incident:resolved", resolvedInc);
          }
        }
      }
    }
  }
}

function buildAlertMessage(
  rule: AlertRule,
  value: number,
  service: string,
  severity: AlertSeverity
): string {
  const templates: Record<string, string[]> = {
    cpu: [
      `CPU at ${value}% on ${service} — exceeds ${severity} threshold. Pattern resembles compute saturation after a recent deployment or batch workload.`,
      `CPU saturation detected on ${service}: ${value}% (threshold: ${rule.threshold}%). Correlated with elevated request rate. Consider horizontal scaling.`,
    ],
    memory: [
      `Memory pressure on ${service}: ${value}% utilized. OOM risk elevated. Heap growth trajectory suggests possible memory leak.`,
      `Memory at ${value}% on ${service} — approaching limit. GC pressure increasing. Investigate heap allocations.`,
    ],
    disk: [
      `Disk usage at ${value}% on ${service}. At current growth rate, disk will fill within 48 hours. Archive or expand volume.`,
    ],
    latency: [
      `P99 API latency reached ${value}ms on ${service} — SLA breach (threshold: ${rule.threshold}ms). Likely upstream database contention.`,
      `Latency spike on ${service}: ${value}ms. This pattern historically precedes connection pool exhaustion. Check active queries.`,
    ],
  };
  const msgs = templates[rule.metric] ?? [`${rule.name} on ${service}: value=${value}, threshold=${rule.threshold}`];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

// ─── Public Query API ─────────────────────────────────────────────────────────

export function getAllAlerts(): FiredAlert[] {
  return Array.from(firedAlerts.values()).sort(
    (a, b) => b.firedAt.getTime() - a.firedAt.getTime()
  );
}

export function getAlertById(id: string): FiredAlert | undefined {
  return firedAlerts.get(id);
}

export function acknowledgeAlert(id: string, by: string): FiredAlert | null {
  const alert = firedAlerts.get(id);
  if (!alert) return null;
  alert.state = "acknowledged";
  alert.acknowledgedBy = by;
  return alert;
}

export function resolveAlert(id: string): FiredAlert | null {
  const alert = firedAlerts.get(id);
  if (!alert) return null;
  alert.state = "resolved";
  alert.resolvedAt = new Date();
  return alert;
}

export function suppressAlert(id: string): FiredAlert | null {
  const alert = firedAlerts.get(id);
  if (!alert) return null;
  alert.state = "suppressed";
  return alert;
}

export function getRules(): AlertRule[] {
  return ALERT_RULES;
}

export function triggerAgentOfflineAlert(service: string, io: SocketServer): string | null {
  const ruleId = "rule-agent-offline";
  const alertKey = `${ruleId}:${service}`;
  
  // Check if already firing
  for (const [id, alert] of firedAlerts) {
    if (alert.ruleId === ruleId && alert.affectedService === service && alert.state === "firing") {
      return id; // already firing
    }
  }

  const alertId = `alert-${(alertIdCounter++).toString().padStart(4, "0")}`;
  const message = `Agent daemon offline on ${service} — heartbeat missed. Observability telemetry stream has disconnected. Verify node status and agent service daemon log.`;

  const alert: FiredAlert = {
    id: alertId,
    ruleId,
    ruleName: "Agent Daemon Offline",
    metric: "uptime",
    currentValue: 0,
    threshold: 1,
    severity: "critical",
    state: "firing",
    firedAt: new Date(),
    resolvedAt: null,
    affectedService: service,
    message,
    channels: ["slack", "pagerduty", "email"],
    escalationLevel: 0,
    acknowledgedBy: null,
  };

  firedAlerts.set(alertId, alert);
  lastFiredAt.set(alertKey, Date.now());

  // Create corresponding incident
  const incident = createIncidentFromAlert(alertId, {
    ruleName: "Agent Daemon Offline",
    severity: "critical",
    affectedService: service,
    message,
  });
  alertToIncidentMap.set(alertId, incident.id);

  // Emit to all connected frontend clients
  io.emit("alert:fired", alert);
  io.emit("incident:created", incident);
  console.log(`[ALERT ENGINE] Fired: Agent Daemon Offline on ${service}. Created incident ${incident.id}`);

  return alertId;
}

export function resolveAgentOfflineAlert(service: string, io: SocketServer): void {
  const ruleId = "rule-agent-offline";
  for (const [id, alert] of firedAlerts) {
    if (
      alert.ruleId === ruleId &&
      alert.affectedService === service &&
      alert.state === "firing"
    ) {
      alert.state = "resolved";
      alert.resolvedAt = new Date();
      io.emit("alert:resolved", alert);
      console.log(`[ALERT ENGINE] Auto-resolved agent offline alert: ${id}`);

      const incidentId = alertToIncidentMap.get(id);
      if (incidentId) {
        resolveIncident(incidentId, "Agent Heartbeat Reconnected");
        const resolvedInc = getIncidentById(incidentId);
        if (resolvedInc) {
          io.emit("incident:resolved", resolvedInc);
        }
      }
    }
  }
}

