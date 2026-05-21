import { Router, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { agentRegistry, AgentHeartbeat } from "./opsRoutes";
import { evaluateThresholds } from "../services/alertEngineService";

export const agentRouter = Router();

/** POST /api/agent/heartbeat — receive heartbeat from monitoring agent */
agentRouter.post("/heartbeat", asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body as AgentHeartbeat;
  if (!payload.agentId || !payload.hostname) {
    res.status(400).json({ success: false, message: "agentId and hostname required" });
    return;
  }
  agentRegistry.set(payload.agentId, {
    heartbeat: payload,
    lastSeen: new Date(),
    status: "healthy",
  });
  console.log(`[AGENT] Heartbeat received from ${payload.hostname} (${payload.agentId})`);

  if (payload.metrics) {
    const io = req.app.get("io");
    const metricsToEval = {
      cpu: payload.metrics.cpu,
      memory: payload.metrics.memory,
      disk: payload.metrics.disk,
      latency: 0
    };
    evaluateThresholds(metricsToEval, payload.hostname, io);
  }

  res.json({ success: true, message: "Heartbeat registered", interval: 5 });
}));

/** GET /api/agent/metrics — get metrics of all connected agents */
agentRouter.get("/metrics", asyncHandler(async (_req: Request, res: Response) => {
  const agentsMetrics = Array.from(agentRegistry.values()).map(entry => ({
    agentId: entry.heartbeat.agentId,
    hostname: entry.heartbeat.hostname,
    lastSeen: entry.lastSeen,
    status: entry.status,
    metrics: entry.heartbeat.metrics,
  }));
  res.json({ success: true, data: agentsMetrics });
}));
