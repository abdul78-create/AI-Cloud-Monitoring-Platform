import express from "express";
import { getClient as getRedisClient } from "../services/redisStreamStore";
import { deliverAlertNotification } from "../services/notificationService";
import { generateRCA } from "../services/aiAnalyticsService";

const router = express.Router();

/**
 * Trigger a deterministic scenario flow for demo purposes.
 * Scenarios:
 * 1. "agent-lifecycle": Simulate an agent joining, streaming, then an incident occurring.
 * 2. "incident-recovery": Simulate CPU spike -> Alert -> Slack -> Incident -> SSH restart -> Recover.
 */
router.post("/trigger", async (req, res) => {
  const { scenarioId } = req.body;
  const redis = await getRedisClient();

  if (scenarioId === "agent-lifecycle") {
    console.log("[Scenario] Starting Flow 1: Agent Lifecycle");
    
    // Step 1: Agent registers
    setTimeout(async () => {
      console.log("[Scenario] Agent registered: prod-api-cluster");
      if (redis) {
        await redis.xAdd("metrics:live", "*", {
          serverId: "prod-api-cluster",
          cpu: "45", memory: "60", timestamp: new Date().toISOString()
        });
      }
    }, 2000);

    // Step 2: CPU Spike -> Alert fires
    setTimeout(async () => {
      console.log("[Scenario] CPU spiked. Firing alert.");
      if (redis) {
        await redis.xAdd("metrics:live", "*", {
          serverId: "prod-api-cluster",
          cpu: "98", memory: "80", timestamp: new Date().toISOString()
        });
      }
      await deliverAlertNotification({
        id: "ALT-SCENARIO-1",
        ruleId: "demo",
        ruleName: "CRITICAL: CPU Saturation on prod-api-cluster",
        severity: "critical",
        affectedService: "prod-api-cluster",
        currentValue: 98,
        threshold: 90,
        message: "CPU utilization spiked",
        metric: "cpu",
        state: "firing",
        firedAt: new Date(),
        resolvedAt: null,
        escalationLevel: 0,
        acknowledgedBy: null,
        channels: ["slack"]
      });
    }, 5000);

    // Step 3: Incident created & AI RCA
    setTimeout(async () => {
      console.log("[Scenario] Generating AI RCA for incident.");
      const rca = generateRCA("INC-SCENARIO-1", "cpu-spike", "prod-api-cluster");
      if (redis) {
        await redis.xAdd("incidents:stream", "*", {
          id: rca.incidentId,
          title: rca.title,
          severity: rca.severity,
          status: "investigating",
          data: JSON.stringify(rca),
          timestamp: new Date().toISOString()
        });
      }
    }, 8000);

    return res.json({ success: true, message: "Agent Lifecycle scenario started. Check logs and dashboard." });

  } else if (scenarioId === "incident-recovery") {
    console.log("[Scenario] Starting Flow 2: Incident Recovery");
    
    // Step 1: CPU Spike & Alert
    if (redis) {
      await redis.xAdd("metrics:live", "*", {
        serverId: "db-primary",
        cpu: "95", memory: "90", timestamp: new Date().toISOString()
      });
    }
    await deliverAlertNotification({
      id: "ALT-SCENARIO-2",
      ruleId: "demo2",
      ruleName: "CRITICAL: Database Resource Exhaustion",
      severity: "critical",
      affectedService: "db-primary",
      currentValue: 95,
      threshold: 90,
      message: "Database running out of resources",
      metric: "memory",
      state: "firing",
      firedAt: new Date(),
      resolvedAt: null,
      escalationLevel: 0,
      acknowledgedBy: null,
      channels: ["slack"]
    });

    // Step 2: AI RCA Generated
    setTimeout(async () => {
      console.log("[Scenario] AI RCA Generated.");
      const rca = generateRCA("INC-SCENARIO-2", "memory-leak", "db-primary");
      if (redis) {
        await redis.xAdd("incidents:stream", "*", {
          id: rca.incidentId,
          title: rca.title,
          severity: rca.severity,
          status: "active",
          data: JSON.stringify(rca),
          timestamp: new Date().toISOString()
        });
      }
    }, 3000);

    // Step 3: Simulate SSH Restart
    setTimeout(async () => {
      console.log("[Scenario] Simulated SSH execution: systemctl restart postgresql");
      if (redis) {
        // Recover metrics
        await redis.xAdd("metrics:live", "*", {
          serverId: "db-primary",
          cpu: "30", memory: "45", timestamp: new Date().toISOString()
        });
        
        // Resolve incident
        await redis.xAdd("incidents:stream", "*", {
          id: "INC-SCENARIO-2",
          title: "Resolved: Database Resource Exhaustion",
          severity: "critical",
          status: "resolved",
          timestamp: new Date().toISOString()
        });
      }
    }, 8000);

    return res.json({ success: true, message: "Incident Recovery scenario started. Check logs and dashboard." });
  } else if (scenarioId === "redis-failure") {
    console.log("[Scenario] Starting Flow: Redis Failure");
    
    if (redis) {
      await redis.xAdd("metrics:live", "*", {
        serverId: "redis-cache-tier",
        latency: "850", hitRate: "12", timestamp: new Date().toISOString()
      });
    }
    await deliverAlertNotification({
      id: "ALT-SCENARIO-REDIS",
      ruleId: "demo-redis",
      ruleName: "CRITICAL: Redis Cache Latency Spike",
      severity: "critical",
      affectedService: "redis-cache-tier",
      currentValue: 850,
      threshold: 100,
      message: "Cache hit rate dropped to 12%, latency spiked to 850ms.",
      metric: "latency",
      state: "firing",
      firedAt: new Date(),
      resolvedAt: null,
      escalationLevel: 0,
      acknowledgedBy: null,
      channels: ["slack"]
    });

    setTimeout(async () => {
      const rca = generateRCA("INC-REDIS-FAIL", "latency-spike", "redis-cache-tier");
      if (redis) {
        await redis.xAdd("incidents:stream", "*", {
          id: rca.incidentId,
          title: rca.title,
          severity: rca.severity,
          status: "active",
          data: JSON.stringify(rca),
          timestamp: new Date().toISOString()
        });
      }
    }, 3000);
    return res.json({ success: true, message: "Redis Failure scenario started." });

  } else if (scenarioId === "api-latency") {
    console.log("[Scenario] Starting Flow: API Latency");
    
    if (redis) {
      await redis.xAdd("metrics:live", "*", {
        serverId: "api-gateway",
        latency: "2500", errorRate: "8", timestamp: new Date().toISOString()
      });
    }
    await deliverAlertNotification({
      id: "ALT-SCENARIO-API",
      ruleId: "demo-api",
      ruleName: "CRITICAL: API Gateway Degradation",
      severity: "critical",
      affectedService: "api-gateway",
      currentValue: 2500,
      threshold: 500,
      message: "API latency spiked to 2500ms, error rate at 8%.",
      metric: "latency",
      state: "firing",
      firedAt: new Date(),
      resolvedAt: null,
      escalationLevel: 0,
      acknowledgedBy: null,
      channels: ["slack", "pagerduty"]
    });

    setTimeout(async () => {
      const rca = generateRCA("INC-API-LATENCY", "latency-spike", "api-gateway");
      if (redis) {
        await redis.xAdd("incidents:stream", "*", {
          id: rca.incidentId,
          title: rca.title,
          severity: rca.severity,
          status: "investigating",
          data: JSON.stringify(rca),
          timestamp: new Date().toISOString()
        });
      }
    }, 4000);
    return res.json({ success: true, message: "API Latency scenario started." });

  } else if (scenarioId === "memory-leak") {
    console.log("[Scenario] Starting Flow: Memory Leak");
    
    if (redis) {
      await redis.xAdd("metrics:live", "*", {
        serverId: "worker-node-1",
        cpu: "40", memory: "99", timestamp: new Date().toISOString()
      });
    }
    await deliverAlertNotification({
      id: "ALT-SCENARIO-MEM",
      ruleId: "demo-mem",
      ruleName: "CRITICAL: OOM Risk on Worker Node",
      severity: "critical",
      affectedService: "worker-node-1",
      currentValue: 99,
      threshold: 90,
      message: "Memory utilization reached 99%, OOM killer imminent.",
      metric: "memory",
      state: "firing",
      firedAt: new Date(),
      resolvedAt: null,
      escalationLevel: 1,
      acknowledgedBy: null,
      channels: ["slack"]
    });

    setTimeout(async () => {
      const rca = generateRCA("INC-MEM-LEAK", "memory-leak", "worker-node-1");
      if (redis) {
        await redis.xAdd("incidents:stream", "*", {
          id: rca.incidentId,
          title: rca.title,
          severity: rca.severity,
          status: "active",
          data: JSON.stringify(rca),
          timestamp: new Date().toISOString()
        });
      }
    }, 3500);
    return res.json({ success: true, message: "Memory Leak scenario started." });

  } else if (scenarioId === "container-crash") {
    console.log("[Scenario] Starting Flow: Container Crash");
    
    if (redis) {
      await redis.xAdd("metrics:live", "*", {
        serverId: "k8s-cluster-prod",
        activeContainers: "12", restarts: "45", timestamp: new Date().toISOString()
      });
    }
    await deliverAlertNotification({
      id: "ALT-SCENARIO-DOCKER",
      ruleId: "demo-docker",
      ruleName: "CRITICAL: High Container Restart Rate",
      severity: "critical",
      affectedService: "k8s-cluster-prod",
      currentValue: 45,
      threshold: 10,
      message: "45 container restarts detected in the last 5 minutes. CrashLoopBackOff suspected.",
      metric: "error_rate",
      state: "firing",
      firedAt: new Date(),
      resolvedAt: null,
      escalationLevel: 0,
      acknowledgedBy: null,
      channels: ["slack"]
    });

    setTimeout(async () => {
      const rca = generateRCA("INC-DOCKER-CRASH", "deployment-failure", "k8s-cluster-prod");
      if (redis) {
        await redis.xAdd("incidents:stream", "*", {
          id: rca.incidentId,
          title: rca.title,
          severity: rca.severity,
          status: "active",
          data: JSON.stringify(rca),
          timestamp: new Date().toISOString()
        });
      }
    }, 3000);
    return res.json({ success: true, message: "Container Crash scenario started." });

  } else if (scenarioId === "network-degradation") {
    console.log("[Scenario] Starting Flow: Network Degradation");
    
    if (redis) {
      await redis.xAdd("metrics:live", "*", {
        serverId: "network-lb",
        packetLoss: "15", latency: "420", timestamp: new Date().toISOString()
      });
    }
    await deliverAlertNotification({
      id: "ALT-SCENARIO-NET",
      ruleId: "demo-net",
      ruleName: "WARNING: Elevated Packet Loss",
      severity: "warning",
      affectedService: "network-lb",
      currentValue: 15,
      threshold: 5,
      message: "Packet loss at 15% across load balancer ingress.",
      metric: "latency",
      state: "firing",
      firedAt: new Date(),
      resolvedAt: null,
      escalationLevel: 0,
      acknowledgedBy: null,
      channels: ["slack"]
    });

    setTimeout(async () => {
      const rca = generateRCA("INC-NET-DROP", "network-drop", "network-lb");
      if (redis) {
        await redis.xAdd("incidents:stream", "*", {
          id: rca.incidentId,
          title: rca.title,
          severity: rca.severity,
          status: "investigating",
          data: JSON.stringify(rca),
          timestamp: new Date().toISOString()
        });
      }
    }, 4500);
    return res.json({ success: true, message: "Network Degradation scenario started." });
  }

  return res.status(400).json({ error: "Unknown scenario" });
});

export default router;
