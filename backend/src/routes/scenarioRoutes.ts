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
        firedAt: new Date().toISOString(),
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
      firedAt: new Date().toISOString(),
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
  }

  return res.status(400).json({ error: "Unknown scenario" });
});

export default router;
