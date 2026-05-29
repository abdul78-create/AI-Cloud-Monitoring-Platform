import { Server } from "socket.io";
import { randomUUID } from "crypto";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LiveMetric {
  cpu: number;             // percentage 0-100
  memory: number;          // percentage 0-100
  latencyMs: number;       // milliseconds
  errorRate: number;       // percentage 0-100
  activeThreats: number;   // count
  requestsPerSec: number;  // rps
}

export type ActionType =
  | "restart_service"
  | "flush_cache"
  | "scale_replicas"
  | "rollout_restart"
  | "alert_only";

export interface AgentAction {
  type: ActionType;
  command: string;
  target: string;
  requiresAdmin: boolean;
  estimatedImpact: string;
}

export type DecisionStatus =
  | "analyzing"
  | "deciding"
  | "executing"
  | "verifying"
  | "resolved"
  | "escalated"
  | "failed"
  | "pending_approval"
  | "rejected";

export interface AgentDecision {
  id: string;
  ruleId: string;
  triggeredBy: string;
  metric: string;
  rootCause: string;
  confidence: number;
  action: AgentAction;
  status: DecisionStatus;
  startedAt: string;
  resolvedAt?: string;
  executionLog: string[];
  verified: boolean;
  outcome?: string;
  previousAttempts: number;
}

export interface DecisionRule {
  id: string;
  name: string;
  condition: (m: LiveMetric) => boolean;
  rootCause: string;
  confidence: number;
  action: AgentAction;
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

const RULES: DecisionRule[] = [
  {
    id: "cpu_spike",
    name: "CPU Spike Detected",
    condition: (m) => m.cpu > 85,
    rootCause:
      "Sustained CPU utilisation above 85% indicates a runaway process or insufficient replica capacity.",
    confidence: 0.91,
    action: {
      type: "rollout_restart",
      command: "kubectl rollout restart deployment/api-gateway",
      target: "k8s-cluster-prod",
      requiresAdmin: true,
      estimatedImpact: "~30s rolling restart, zero downtime with PodDisruptionBudget",
    },
  },
  {
    id: "redis_memory",
    name: "Redis Memory Pressure",
    condition: (m) => m.memory > 88,
    rootCause:
      "Redis is approaching its maxmemory limit. Volatile keys have not been evicted, causing OOM risk.",
    confidence: 0.87,
    action: {
      type: "flush_cache",
      command: "redis-cli FLUSHDB ASYNC",
      target: "redis-prod-01",
      requiresAdmin: false,
      estimatedImpact: "Cache cold-start ~45s; hit ratio recovers within 3 minutes",
    },
  },
  {
    id: "api_latency",
    name: "API Latency Threshold Exceeded",
    condition: (m) => m.latencyMs > 1200,
    rootCause:
      "p99 latency above 1200 ms. Root cause is likely connection pool saturation or upstream dependency slowdown.",
    confidence: 0.83,
    action: {
      type: "scale_replicas",
      command: "kubectl scale deployment/api-gateway --replicas=6",
      target: "k8s-cluster-prod",
      requiresAdmin: true,
      estimatedImpact: "Adds 2 replicas; load balanced within 60s",
    },
  },
  {
    id: "memory_leak",
    name: "Memory Leak Suspected",
    condition: (m) => m.memory > 92 && m.cpu < 60,
    rootCause:
      "High memory with low CPU suggests a heap leak. Service restart will reclaim memory and restore operation.",
    confidence: 0.78,
    action: {
      type: "restart_service",
      command: "sudo systemctl restart api-gateway",
      target: "prod-app-01",
      requiresAdmin: true,
      estimatedImpact: "~5s service restart; health check re-registers within 10s",
    },
  },
  {
    id: "security_threat",
    name: "Elevated Security Threat Level",
    condition: (m) => m.activeThreats >= 3,
    rootCause:
      "Multiple concurrent threat signatures detected. Immediate service isolation or WAF rule update required.",
    confidence: 0.95,
    action: {
      type: "alert_only",
      command: "sudo systemctl reload nginx",
      target: "prod-nginx-01",
      requiresAdmin: true,
      estimatedImpact: "Reloads WAF / rate-limit config with zero downtime",
    },
  },
];

// ---------------------------------------------------------------------------
// Log line templates
// ---------------------------------------------------------------------------

function buildLogLines(action: AgentAction): string[] {
  const { type, command, target } = action;

  switch (type) {
    case "restart_service":
      return [
        `Connecting to ${target}...`,
        "SSH handshake established",
        `Running: ${command}`,
        "Service stopping...",
        "Service started successfully",
        "Verifying health check...",
      ];

    case "flush_cache":
      return [
        `Connecting to ${target}...`,
        `Running: ${command}`,
        "Keys flushed: 14,382",
        "Cache memory released: 1.2 GB",
        "Hit ratio recovering...",
      ];

    case "scale_replicas":
      return [
        "Connecting to cluster...",
        `Running: ${command}`,
        "Replica 3 starting...",
        "Replica 4 starting...",
        "All replicas healthy",
      ];

    case "rollout_restart":
      return [
        "Connecting to cluster...",
        `Running: ${command}`,
        "Rolling restart initiated",
        "Pod api-gw-7d9f terminating...",
        "Pod api-gw-8b3c starting...",
        "Rollout complete",
      ];

    case "alert_only":
    default:
      return [
        `Connecting to ${target}...`,
        `Running: ${command}`,
        "Config reloaded successfully",
        "Threat signatures updated",
        "Security rules applied",
      ];
  }
}

// ---------------------------------------------------------------------------
// AgentMemory
// ---------------------------------------------------------------------------

interface MemoryEntry {
  successes: number;
  failures: number;
  lastCommand: string;
  lastOutcome: string;
}

export class AgentMemory {
  private store = new Map<string, MemoryEntry>();

  recall(ruleId: string): { successRate: number; previousFix: string | null } {
    const entry = this.store.get(ruleId);
    if (!entry) return { successRate: 0, previousFix: null };

    const total = entry.successes + entry.failures;
    const successRate = total === 0 ? 0 : Math.round((entry.successes / total) * 100);
    return {
      successRate,
      previousFix: entry.lastOutcome || null,
    };
  }

  record(ruleId: string, outcome: "success" | "failure", command: string): void {
    const existing = this.store.get(ruleId) ?? {
      successes: 0,
      failures: 0,
      lastCommand: "",
      lastOutcome: "",
    };

    if (outcome === "success") {
      existing.successes += 1;
      existing.lastOutcome = `Command succeeded: ${command}`;
    } else {
      existing.failures += 1;
      existing.lastOutcome = `Command failed: ${command}`;
    }
    existing.lastCommand = command;
    this.store.set(ruleId, existing);
  }

  entries(): Array<{ ruleId: string } & MemoryEntry> {
    return Array.from(this.store.entries()).map(([ruleId, entry]) => ({
      ruleId,
      ...entry,
    }));
  }
}

// ---------------------------------------------------------------------------
// AiAgentService
// ---------------------------------------------------------------------------

export class AiAgentService {
  public decisions = new Map<string, AgentDecision>();
  public memory = new AgentMemory();
  public isEnabled = true;
  public mode: "autonomous" | "supervised" = "autonomous";

  private io: Server;
  private stats = {
    totalActions: 0,
    successCount: 0,
    escalations: 0,
    totalResolutionMs: 0,
    lastActionAt: null as string | null,
  };

  constructor(io: Server) {
    this.io = io;
  }

  // -------------------------------------------------------------------------
  // evaluate — called whenever new metrics arrive
  // -------------------------------------------------------------------------
  evaluate(metrics: LiveMetric): void {
    if (!this.isEnabled) return;

    for (const rule of RULES) {
      if (!rule.condition(metrics)) continue;

      // Skip if there is already an active (non-terminal) decision for this rule
      const existingActive = Array.from(this.decisions.values()).find(
        (d) =>
          d.ruleId === rule.id &&
          !["resolved", "escalated", "failed", "rejected"].includes(d.status)
      );
      if (existingActive) continue;

      const id = randomUUID();
      const mem = this.memory.recall(rule.id);

      // Build a human-readable metric string
      const metricStr = this._buildMetricString(rule.id, metrics);

      const decision: AgentDecision = {
        id,
        ruleId: rule.id,
        triggeredBy: rule.name,
        metric: metricStr,
        rootCause: rule.rootCause,
        confidence: rule.confidence,
        action: rule.action,
        status: "analyzing",
        startedAt: new Date().toISOString(),
        executionLog: [],
        verified: false,
        previousAttempts: mem.successRate > 0 ? 1 : 0,
      };

      this._capDecisions();
      this.decisions.set(id, decision);

      this.io.emit("agent:new_decision", decision);
      console.log(`[AI-AGENT] Rule triggered: ${rule.name} → decision ${id}`);

      if (this.mode === "autonomous") {
        // Analyze phase → then decide → then execute
        setTimeout(() => {
          this._updateStatus(id, "deciding");
          setTimeout(() => {
            this._executeDecision(id);
          }, 1500);
        }, 3000);
      } else {
        // Supervised: wait for human approval
        setTimeout(() => {
          this._updateStatus(id, "pending_approval");
          this.io.emit("agent:pending_approval", { decision });
        }, 3000);
      }
    }
  }

  // -------------------------------------------------------------------------
  // approve — for supervised mode
  // -------------------------------------------------------------------------
  approve(id: string): void {
    const decision = this.decisions.get(id);
    if (!decision || decision.status !== "pending_approval") {
      throw new Error(`Decision ${id} is not awaiting approval`);
    }
    this._executeDecision(id);
  }

  // -------------------------------------------------------------------------
  // reject — for supervised mode
  // -------------------------------------------------------------------------
  reject(id: string): void {
    const decision = this.decisions.get(id);
    if (!decision) throw new Error(`Decision ${id} not found`);
    decision.status = "rejected";
    decision.resolvedAt = new Date().toISOString();
    decision.outcome = "Rejected by operator";
    this.decisions.set(id, decision);
    this.io.emit("agent:rejected", { id, decision });
  }

  // -------------------------------------------------------------------------
  // getDecisions — sorted by startedAt descending, max 50
  // -------------------------------------------------------------------------
  getDecisions(): AgentDecision[] {
    return Array.from(this.decisions.values())
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, 50);
  }

  // -------------------------------------------------------------------------
  // getStats
  // -------------------------------------------------------------------------
  getStats(): {
    totalActions: number;
    successRate: number;
    avgResolutionMs: number;
    escalations: number;
    lastActionAt: string | null;
  } {
    const { totalActions, successCount, escalations, totalResolutionMs, lastActionAt } =
      this.stats;

    return {
      totalActions,
      successRate:
        totalActions === 0 ? 0 : Math.round((successCount / totalActions) * 100),
      avgResolutionMs:
        successCount === 0 ? 0 : Math.round(totalResolutionMs / successCount),
      escalations,
      lastActionAt,
    };
  }

  // -------------------------------------------------------------------------
  // getMemory
  // -------------------------------------------------------------------------
  getMemory(): Array<{ ruleId: string; successes: number; failures: number; lastCommand: string; lastOutcome: string }> {
    return this.memory.entries();
  }

  // -------------------------------------------------------------------------
  // setEnabled / setMode
  // -------------------------------------------------------------------------
  setEnabled(val: boolean): void {
    this.isEnabled = val;
  }

  setMode(mode: "autonomous" | "supervised"): void {
    this.mode = mode;
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private _executeDecision(id: string): void {
    const decision = this.decisions.get(id);
    if (!decision) return;

    decision.status = "executing";
    this.decisions.set(id, decision);
    this.io.emit("agent:status_update", { id, status: "executing" });

    const logLines = buildLogLines(decision.action);
    let lineIndex = 0;

    const streamNextLine = (): void => {
      if (lineIndex >= logLines.length) {
        // All log lines streamed — move to verify
        this._verifyDecision(id);
        return;
      }
      const line = logLines[lineIndex++];
      decision.executionLog.push(line);
      this.decisions.set(id, decision);
      this.io.emit("agent:log", { id, line });
      setTimeout(streamNextLine, 600);
    };

    streamNextLine();
  }

  private _verifyDecision(id: string): void {
    const decision = this.decisions.get(id);
    if (!decision) return;

    decision.status = "verifying";
    this.decisions.set(id, decision);
    this.io.emit("agent:status_update", { id, status: "verifying" });

    setTimeout(() => {
      // Simulate verification: success unless random < 0.12
      const succeeded = Math.random() >= 0.12;
      const resolvedAt = new Date().toISOString();
      const startedMs = new Date(decision.startedAt).getTime();
      const resolutionMs = new Date(resolvedAt).getTime() - startedMs;

      if (succeeded) {
        decision.status = "resolved";
        decision.verified = true;
        decision.resolvedAt = resolvedAt;
        decision.outcome = `Remediation successful. Issue resolved in ${(resolutionMs / 1000).toFixed(1)}s.`;
        decision.executionLog.push("✓ Health check passed — issue resolved");

        this.stats.totalActions += 1;
        this.stats.successCount += 1;
        this.stats.totalResolutionMs += resolutionMs;
        this.stats.lastActionAt = resolvedAt;

        this.memory.record(decision.ruleId, "success", decision.action.command);
        this.decisions.set(id, decision);
        this.io.emit("agent:resolved", { id, decision });
      } else {
        decision.status = "escalated";
        decision.verified = false;
        decision.resolvedAt = resolvedAt;
        decision.outcome =
          "Automated remediation did not resolve the issue. Escalated to on-call engineer.";
        decision.executionLog.push("✗ Health check failed — escalating to on-call");

        this.stats.totalActions += 1;
        this.stats.escalations += 1;
        this.stats.lastActionAt = resolvedAt;

        this.memory.record(decision.ruleId, "failure", decision.action.command);
        this.decisions.set(id, decision);
        this.io.emit("agent:escalated", { id, decision });
      }
    }, 2000);
  }

  private _updateStatus(id: string, status: DecisionStatus): void {
    const decision = this.decisions.get(id);
    if (!decision) return;
    decision.status = status;
    this.decisions.set(id, decision);
    this.io.emit("agent:status_update", { id, status });
  }

  private _buildMetricString(ruleId: string, metrics: LiveMetric): string {
    switch (ruleId) {
      case "cpu_spike":
        return `CPU at ${metrics.cpu.toFixed(1)}% (threshold: 85%)`;
      case "redis_memory":
        return `Memory at ${metrics.memory.toFixed(1)}% (threshold: 88%)`;
      case "api_latency":
        return `Latency at ${metrics.latencyMs.toFixed(0)} ms (threshold: 1200 ms)`;
      case "memory_leak":
        return `Memory at ${metrics.memory.toFixed(1)}%, CPU at ${metrics.cpu.toFixed(1)}%`;
      case "security_threat":
        return `${metrics.activeThreats} active threats detected (threshold: 3)`;
      default:
        return `cpu=${metrics.cpu}%, mem=${metrics.memory}%`;
    }
  }

  /** Keep the decisions Map capped at 100 entries — drop oldest resolved/terminal ones first */
  private _capDecisions(): void {
    if (this.decisions.size < 100) return;

    const terminal: DecisionStatus[] = ["resolved", "escalated", "failed", "rejected"];
    const sorted = Array.from(this.decisions.values()).sort(
      (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    );

    // Drop oldest terminal decisions first
    for (const d of sorted) {
      if (terminal.includes(d.status)) {
        this.decisions.delete(d.id);
        if (this.decisions.size < 100) return;
      }
    }

    // Fallback: drop absolute oldest
    for (const d of sorted) {
      this.decisions.delete(d.id);
      if (this.decisions.size < 100) return;
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton factory
// ---------------------------------------------------------------------------

let _instance: AiAgentService | null = null;

export function createAiAgentService(io: Server): AiAgentService {
  if (!_instance) {
    _instance = new AiAgentService(io);
  }
  return _instance;
}

export function getAiAgentService(): AiAgentService {
  if (!_instance) {
    throw new Error(
      "AiAgentService has not been initialised yet. Call createAiAgentService(io) first."
    );
  }
  return _instance;
}
