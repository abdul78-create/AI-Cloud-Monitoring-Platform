import { Router, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { agentRegistry, AgentHeartbeat } from "./opsRoutes";
import { enqueueTelemetry } from "../services/telemetryWorker";
import { z } from "zod";

const HeartbeatSchema = z.object({
  agentId: z.string().min(1),
  hostname: z.string().min(1),
  ip: z.string(),
  version: z.string(),
  metrics: z.object({
    cpu: z.number().min(0).max(100),
    memory: z.number().min(0).max(100),
    disk: z.number().min(0).max(100),
    networkIn: z.number().optional(),
    networkOut: z.number().optional(),
    networkInBytes: z.number().optional(),
    networkOutBytes: z.number().optional(),
    uptime: z.number().optional()
  }).passthrough().optional(),
  processes: z.array(z.any()).optional(),
  docker: z.array(z.any()).optional(),
  system: z.any().optional()
});

export const agentRouter = Router();

/** POST /api/agent/heartbeat — receive heartbeat from monitoring agent */
agentRouter.post("/heartbeat", asyncHandler(async (req: Request, res: Response) => {
  const result = HeartbeatSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, message: "Invalid payload", errors: result.error.issues });
    return;
  }
  const payload = result.data as AgentHeartbeat;
  agentRegistry.set(payload.agentId, {
    heartbeat: payload,
    lastSeen: new Date(),
    status: "healthy",
  });
  console.log(`[AGENT] Heartbeat received from ${payload.hostname} (${payload.agentId})`);

  if (payload.metrics) {
    const metricsToEval = {
      cpu: payload.metrics.cpu,
      memory: payload.metrics.memory,
      disk: payload.metrics.disk,
      latency: 0
    };
    enqueueTelemetry(payload.hostname, metricsToEval, true).catch(err => console.error("BullMQ Enqueue Error:", err));
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
    docker: entry.heartbeat.docker,
    processes: entry.heartbeat.processes,
    system: entry.heartbeat.system,
  }));
  res.json({ success: true, data: agentsMetrics });
}));
