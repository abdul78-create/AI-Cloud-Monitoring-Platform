"use client";

import { create } from "zustand";
import { api } from "@/services/api";
import { toast } from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AgentDecisionStatus =
  | "analyzing"
  | "deciding"
  | "pending_approval"
  | "executing"
  | "verifying"
  | "resolved"
  | "escalated"
  | "failed"
  | "rejected";

export type AgentActionType =
  | "restart_service"
  | "scale_replicas"
  | "flush_cache"
  | "kill_process"
  | "rollout_restart";

export interface AgentAction {
  type: AgentActionType;
  command: string;
  target: string;
  requiresAdmin: boolean;
  estimatedImpact: string;
}

export interface AgentDecision {
  id: string;
  ruleId: string;
  triggeredBy: string;
  metric: string;
  rootCause: string;
  confidence: number;
  action: AgentAction;
  status: AgentDecisionStatus;
  startedAt: string;
  resolvedAt?: string;
  executionLog: string[];
  verified: boolean;
  outcome?: "success" | "partial" | "failed";
  previousAttempts: number;
  previousFix?: string;
  previousSuccessRate?: number;
}

export interface AgentStats {
  totalActions: number;
  successRate: number;
  avgResolutionMs: number;
  escalations: number;
  lastActionAt: string | null;
}

export interface AgentMemoryEntry {
  ruleId: string;
  name: string;
  successRate: number;
  totalRuns: number;
  lastFix: string;
  lastOutcome: "success" | "failed";
}

// ─── Decision rules (deterministic frontend simulation) ───────────────────────

export const RULES = [
  {
    id: "cpu_spike",
    name: "Worker CPU Spike",
    triggerDesc: "CPU > 92% sustained",
    condition: (m: { cpu: number; latencyMs: number; errorRate: number; memory: number; activeThreats: number }) =>
      m.cpu > 92,
    rootCause: "Runaway worker process consuming all CPU cores — likely infinite loop or leaked goroutine",
    confidence: 89,
    action: {
      type: "restart_service" as AgentActionType,
      command: "sudo systemctl restart worker",
      target: "worker-queue",
      requiresAdmin: false,
      estimatedImpact: "~15s service restart, queue drain pauses",
    },
  },
  {
    id: "redis_memory",
    name: "Redis Memory Saturation",
    triggerDesc: "Memory > 90% + Error rate > 3%",
    condition: (m: { cpu: number; latencyMs: number; errorRate: number; memory: number; activeThreats: number }) =>
      m.memory > 90 && m.errorRate > 3,
    rootCause: "Redis memory saturation causing LRU eviction storm — cache hit ratio collapsing",
    confidence: 94,
    action: {
      type: "flush_cache" as AgentActionType,
      command: "redis-cli FLUSHDB ASYNC",
      target: "cache-redis",
      requiresAdmin: false,
      estimatedImpact: "Cache cold start ~30s, DB load spike expected",
    },
  },
  {
    id: "api_latency",
    name: "API Gateway SLA Breach",
    triggerDesc: "Latency > 1800ms + Error rate > 5%",
    condition: (m: { cpu: number; latencyMs: number; errorRate: number; memory: number; activeThreats: number }) =>
      m.latencyMs > 1800 && m.errorRate > 5,
    rootCause: "API gateway overloaded — downstream cache miss cascade amplifying DB load",
    confidence: 91,
    action: {
      type: "scale_replicas" as AgentActionType,
      command: "kubectl scale deployment api-gateway --replicas=4",
      target: "api-gateway",
      requiresAdmin: false,
      estimatedImpact: "New replicas online in ~45s, traffic redistributed",
    },
  },
  {
    id: "memory_leak",
    name: "Memory Leak — Rolling Restart",
    triggerDesc: "Memory > 94%",
    condition: (m: { cpu: number; latencyMs: number; errorRate: number; memory: number; activeThreats: number }) =>
      m.memory > 94,
    rootCause: "Process heap growing without GC recovery — classic memory leak signature, no OOM yet",
    confidence: 87,
    action: {
      type: "rollout_restart" as AgentActionType,
      command: "kubectl rollout restart deployment/worker",
      target: "worker-queue",
      requiresAdmin: false,
      estimatedImpact: "Zero-downtime rolling restart, ~90s total",
    },
  },
  {
    id: "security_threat",
    name: "Active Security Threat",
    triggerDesc: "Active threats > 3",
    condition: (m: { cpu: number; latencyMs: number; errorRate: number; memory: number; activeThreats: number }) =>
      m.activeThreats > 3,
    rootCause: "Brute-force / DDoS pattern detected on auth surface — rate limit threshold crossed",
    confidence: 96,
    action: {
      type: "restart_service" as AgentActionType,
      command: "sudo systemctl reload nginx",
      target: "auth-service",
      requiresAdmin: true,
      estimatedImpact: "Graceful nginx reload, no downtime",
    },
  },
];

const EXEC_LOGS: Record<AgentActionType, (target: string, command: string) => string[]> = {
  restart_service: (target, cmd) => [
    `Connecting to ${target} via SSH...`,
    `SSH handshake established (12ms)`,
    `Running: ${cmd}`,
    `Stopping ${target} service...`,
    `Service stopped. Starting...`,
    `${target} service started successfully`,
    `Health check: HTTP 200 OK`,
    `Verifying metrics...`,
  ],
  flush_cache: (target, cmd) => [
    `Connecting to ${target}...`,
    `AUTH OK`,
    `Running: ${cmd}`,
    `Keys flushed: 14,382`,
    `Memory released: 1.24 GB`,
    `Hit ratio recovering...`,
    `Cache warming (read-through)...`,
  ],
  scale_replicas: (_target, cmd) => [
    `Connecting to cluster (api-server)...`,
    `Running: ${cmd}`,
    `Replica 3/4 starting... (pod api-gw-a8f2)`,
    `Replica 4/4 starting... (pod api-gw-c3d1)`,
    `All replicas healthy (4/4)`,
    `Load balancer updated`,
  ],
  rollout_restart: (_target, cmd) => [
    `Connecting to cluster...`,
    `Running: ${cmd}`,
    `Rolling restart initiated`,
    `Pod worker-6c8d terminating...`,
    `Pod worker-7e2a starting...`,
    `Rollout complete (1/1 updated)`,
  ],
  kill_process: (target, cmd) => [
    `Connecting to ${target}...`,
    `Running: ${cmd}`,
    `Process terminated`,
    `Verifying clean exit...`,
  ],
};

// ─── Seed memory with realistic history ───────────────────────────────────────

const SEED_MEMORY: Record<string, AgentMemoryEntry> = {
  cpu_spike: {
    ruleId: "cpu_spike",
    name: "Worker CPU Spike",
    successRate: 91,
    totalRuns: 11,
    lastFix: "sudo systemctl restart worker",
    lastOutcome: "success",
  },
  redis_memory: {
    ruleId: "redis_memory",
    name: "Redis Memory Saturation",
    successRate: 94,
    totalRuns: 17,
    lastFix: "redis-cli FLUSHDB ASYNC",
    lastOutcome: "success",
  },
  api_latency: {
    ruleId: "api_latency",
    name: "API Gateway SLA Breach",
    successRate: 88,
    totalRuns: 8,
    lastFix: "kubectl scale deployment api-gateway --replicas=4",
    lastOutcome: "success",
  },
  memory_leak: {
    ruleId: "memory_leak",
    name: "Memory Leak",
    successRate: 79,
    totalRuns: 14,
    lastFix: "kubectl rollout restart deployment/worker",
    lastOutcome: "failed",
  },
  security_threat: {
    ruleId: "security_threat",
    name: "Security Threat",
    successRate: 96,
    totalRuns: 7,
    lastFix: "sudo systemctl reload nginx",
    lastOutcome: "success",
  },
};

// ─── Store ────────────────────────────────────────────────────────────────────

interface AgentStore {
  decisions: AgentDecision[];
  stats: AgentStats;
  memory: Record<string, AgentMemoryEntry>;
  isEnabled: boolean;
  agentMode: "autonomous" | "supervised";

  // Active decision tracking (ruleId → decisionId to prevent duplicates)
  activeRules: Record<string, string>;

  // Actions
  setEnabled: (val: boolean) => void;
  setMode: (mode: "autonomous" | "supervised") => void;
  evaluate: (metrics: {
    cpu: number;
    memory: number;
    latencyMs: number;
    errorRate: number;
    activeThreats: number;
  }) => void;
  approve: (id: string) => void;
  reject: (id: string) => void;
  clearDecision: (id: string) => void;
  clearAll: () => void;
}

let decisionCounter = 0;

export const useAgentStore = create<AgentStore>((set, get) => ({
  decisions: [],
  stats: {
    totalActions: 47,
    successRate: 96.4,
    avgResolutionMs: 252000,
    escalations: 2,
    lastActionAt: new Date(Date.now() - 4 * 60000).toISOString(),
  },
  memory: SEED_MEMORY,
  isEnabled: true,
  agentMode: "autonomous",
  activeRules: {},

  setEnabled: (val: boolean) => {
    set({ isEnabled: val });
    if (!val) {
      toast("AI Agent paused — monitoring only mode", { icon: "⏸" });
    } else {
      toast.success("AI Agent enabled — autonomous healing active");
    }
  },

  setMode: (mode: "autonomous" | "supervised") => {
    set({ agentMode: mode });
    toast(`Agent mode: ${mode === "autonomous" ? "Autonomous (acts immediately)" : "Supervised (waits for approval)"}`, {
      icon: mode === "autonomous" ? "🤖" : "👁",
    });
  },

  evaluate: (metrics) => {
    const { isEnabled, agentMode, activeRules, decisions, memory } = get();
    if (!isEnabled) return;

    for (const rule of RULES) {
      // Skip if rule already has an active (non-terminal) decision
      const existingId = activeRules[rule.id];
      if (existingId) {
        const existing = decisions.find((d) => d.id === existingId);
        if (existing && !["resolved", "escalated", "failed", "rejected"].includes(existing.status)) {
          continue;
        }
      }

      if (rule.condition(metrics)) {
        const id = `dec-${Date.now()}-${++decisionCounter}`;
        const mem = memory[rule.id];

        const decision: AgentDecision = {
          id,
          ruleId: rule.id,
          triggeredBy: rule.triggerDesc,
          metric: `CPU: ${metrics.cpu.toFixed(0)}%  MEM: ${metrics.memory.toFixed(0)}%  Latency: ${metrics.latencyMs}ms  Errors: ${metrics.errorRate.toFixed(1)}%`,
          rootCause: rule.rootCause,
          confidence: rule.confidence,
          action: rule.action,
          status: "analyzing",
          startedAt: new Date().toISOString(),
          executionLog: [],
          verified: false,
          previousAttempts: mem?.totalRuns ?? 0,
          previousFix: mem?.lastFix,
          previousSuccessRate: mem?.successRate,
        };

        set((s) => ({
          decisions: [decision, ...s.decisions].slice(0, 100),
          activeRules: { ...s.activeRules, [rule.id]: id },
        }));

        // Autonomous flow: analyze → decide → execute → verify
        if (agentMode === "autonomous") {
          get()._runDecisionFlow(id, rule.action);
        } else {
          // Supervised: move to pending_approval
          setTimeout(() => {
            set((s) => ({
              decisions: s.decisions.map((d) =>
                d.id === id ? { ...d, status: "pending_approval" as AgentDecisionStatus } : d
              ),
            }));
          }, 2500);
        }
      }
    }
  },

  approve: (id) => {
    const { decisions } = get();
    const decision = decisions.find((d) => d.id === id);
    if (!decision) return;
    set((s) => ({
      decisions: s.decisions.map((d) =>
        d.id === id ? { ...d, status: "executing" as AgentDecisionStatus } : d
      ),
    }));
    get()._runDecisionFlow(id, decision.action);
  },

  reject: (id) => {
    set((s) => ({
      decisions: s.decisions.map((d) =>
        d.id === id
          ? { ...d, status: "rejected" as AgentDecisionStatus, resolvedAt: new Date().toISOString() }
          : d
      ),
    }));
    toast("Decision rejected — escalating to on-call engineer", { icon: "📟" });
  },

  clearDecision: (id) => {
    set((s) => ({
      decisions: s.decisions.filter((d) => d.id !== id),
    }));
  },

  clearAll: () => {
    set({ decisions: [], activeRules: {} });
  },

  // Internal — not exposed in type but callable via get()
  _runDecisionFlow: async (id: string, action: AgentAction) => {
    const appendLog = (line: string) => {
      set((s) => ({
        decisions: s.decisions.map((d) =>
          d.id === id ? { ...d, executionLog: [...d.executionLog, line] } : d
        ),
      }));
    };

    // Analyzing phase
    set((s) => ({
      decisions: s.decisions.map((d) =>
        d.id === id ? { ...d, status: "analyzing" as AgentDecisionStatus } : d
      ),
    }));
    await delay(1800);

    // Deciding phase
    set((s) => ({
      decisions: s.decisions.map((d) =>
        d.id === id ? { ...d, status: "deciding" as AgentDecisionStatus } : d
      ),
    }));
    await delay(1200);

    // Executing phase
    set((s) => ({
      decisions: s.decisions.map((d) =>
        d.id === id ? { ...d, status: "executing" as AgentDecisionStatus } : d
      ),
    }));

    const logs = EXEC_LOGS[action.type](action.target, action.command);
    for (const line of logs) {
      await delay(550);
      appendLog(line);
    }

    // Verifying phase
    set((s) => ({
      decisions: s.decisions.map((d) =>
        d.id === id ? { ...d, status: "verifying" as AgentDecisionStatus } : d
      ),
    }));
    await delay(1500);

    // 88% success rate simulation
    const succeeded = Math.random() > 0.12;
    const resolvedAt = new Date().toISOString();
    const ruleId = get().decisions.find((d) => d.id === id)?.ruleId ?? "";

    if (succeeded) {
      set((s) => ({
        decisions: s.decisions.map((d) =>
          d.id === id
            ? { ...d, status: "resolved" as AgentDecisionStatus, verified: true, outcome: "success", resolvedAt }
            : d
        ),
        stats: {
          ...s.stats,
          totalActions: s.stats.totalActions + 1,
          lastActionAt: resolvedAt,
          successRate: Math.round(
            ((s.stats.successRate * s.stats.totalActions + 100) / (s.stats.totalActions + 1)) * 10
          ) / 10,
        },
        memory: {
          ...s.memory,
          [ruleId]: {
            ...(s.memory[ruleId] ?? { ruleId, name: ruleId, totalRuns: 0, lastFix: action.command }),
            ruleId,
            name: RULES.find((r) => r.id === ruleId)?.name ?? ruleId,
            successRate: Math.min(99, ((s.memory[ruleId]?.successRate ?? 85) * 0.9 + 10)),
            totalRuns: (s.memory[ruleId]?.totalRuns ?? 0) + 1,
            lastFix: action.command,
            lastOutcome: "success",
          },
        },
      }));
      toast.success(`Auto-healed: ${RULES.find((r) => r.id === ruleId)?.name}`, { icon: "✅" });
    } else {
      set((s) => ({
        decisions: s.decisions.map((d) =>
          d.id === id
            ? { ...d, status: "escalated" as AgentDecisionStatus, verified: false, outcome: "failed", resolvedAt }
            : d
        ),
        stats: {
          ...s.stats,
          totalActions: s.stats.totalActions + 1,
          escalations: s.stats.escalations + 1,
          lastActionAt: resolvedAt,
          successRate: Math.round(
            ((s.stats.successRate * s.stats.totalActions) / (s.stats.totalActions + 1)) * 10
          ) / 10,
        },
        memory: {
          ...s.memory,
          [ruleId]: {
            ...(s.memory[ruleId] ?? { ruleId, name: ruleId, totalRuns: 0, lastFix: action.command }),
            ruleId,
            name: RULES.find((r) => r.id === ruleId)?.name ?? ruleId,
            successRate: Math.max(60, ((s.memory[ruleId]?.successRate ?? 85) * 0.95)),
            totalRuns: (s.memory[ruleId]?.totalRuns ?? 0) + 1,
            lastFix: action.command,
            lastOutcome: "failed",
          },
        },
      }));
      toast.error(`Auto-heal failed — escalated to on-call: ${RULES.find((r) => r.id === ruleId)?.name}`, {
        icon: "📟",
      });
    }
  },
} as any));

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
