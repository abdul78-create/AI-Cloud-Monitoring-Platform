import { Router, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  getAllAlerts, getAlertById, acknowledgeAlert, resolveAlert, suppressAlert, getRules,
  evaluateThresholds
} from "../services/alertEngineService";
import {
  getAllIncidents, getIncidentById, acknowledgeIncident, resolveIncident,
  addTimelineEvent, getAllDeployments
} from "../services/incidentTimelineService";

export const opsRoutes = Router();

// ─── Alert Engine Endpoints ───────────────────────────────────────────────────

/** GET /api/ops/alerts — list all fired alerts */
opsRoutes.get("/alerts", asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: getAllAlerts() });
}));

/** GET /api/ops/alerts/rules — list configured alert rules */
opsRoutes.get("/alerts/rules", asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: getRules() });
}));

/** GET /api/ops/alerts/:id */
opsRoutes.get("/alerts/:id", asyncHandler(async (req: Request, res: Response) => {
  const alert = getAlertById(req.params.id);
  if (!alert) { res.status(404).json({ success: false, message: "Alert not found" }); return; }
  res.json({ success: true, data: alert });
}));

/** POST /api/ops/alerts/:id/acknowledge */
opsRoutes.post("/alerts/:id/acknowledge", asyncHandler(async (req: Request, res: Response) => {
  const { acknowledgedBy = "ops-user" } = req.body as { acknowledgedBy?: string };
  const alert = acknowledgeAlert(req.params.id, acknowledgedBy);
  if (!alert) { res.status(404).json({ success: false, message: "Alert not found" }); return; }
  res.json({ success: true, data: alert });
}));

/** POST /api/ops/alerts/:id/resolve */
opsRoutes.post("/alerts/:id/resolve", asyncHandler(async (req: Request, res: Response) => {
  const alert = resolveAlert(req.params.id);
  if (!alert) { res.status(404).json({ success: false, message: "Alert not found" }); return; }
  res.json({ success: true, data: alert });
}));

/** POST /api/ops/alerts/:id/suppress */
opsRoutes.post("/alerts/:id/suppress", asyncHandler(async (req: Request, res: Response) => {
  const alert = suppressAlert(req.params.id);
  if (!alert) { res.status(404).json({ success: false, message: "Alert not found" }); return; }
  res.json({ success: true, data: alert });
}));

// ─── Incident Endpoints ───────────────────────────────────────────────────────

/** GET /api/ops/incidents — list all incidents */
opsRoutes.get("/incidents", asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: getAllIncidents() });
}));

/** GET /api/ops/incidents/:id */
opsRoutes.get("/incidents/:id", asyncHandler(async (req: Request, res: Response) => {
  const inc = getIncidentById(req.params.id);
  if (!inc) { res.status(404).json({ success: false, message: "Incident not found" }); return; }
  res.json({ success: true, data: inc });
}));

/** POST /api/ops/incidents/:id/acknowledge */
opsRoutes.post("/incidents/:id/acknowledge", asyncHandler(async (req: Request, res: Response) => {
  const { by = "ops-user" } = req.body as { by?: string };
  const inc = acknowledgeIncident(req.params.id, by);
  if (!inc) { res.status(404).json({ success: false, message: "Incident not found" }); return; }
  const io = req.app.get("io");
  if (io) {
    io.emit("incident:acknowledged", inc);
  }
  res.json({ success: true, data: inc });
}));

/** POST /api/ops/incidents/:id/resolve */
opsRoutes.post("/incidents/:id/resolve", asyncHandler(async (req: Request, res: Response) => {
  const { by = "ops-user" } = req.body as { by?: string };
  const inc = resolveIncident(req.params.id, by);
  if (!inc) { res.status(404).json({ success: false, message: "Incident not found" }); return; }
  const io = req.app.get("io");
  if (io) {
    io.emit("incident:resolved", inc);
  }
  res.json({ success: true, data: inc });
}));

/** POST /api/ops/incidents/:id/timeline */
opsRoutes.post("/incidents/:id/timeline", asyncHandler(async (req: Request, res: Response) => {
  const { message, actor, type } = req.body as { message: string; actor: string; type: string };
  const inc = addTimelineEvent(req.params.id, {
    timestamp: new Date(),
    type: type as any,
    actor,
    message,
  });
  if (!inc) { res.status(404).json({ success: false, message: "Incident not found" }); return; }
  const io = req.app.get("io");
  if (io) {
    io.emit("incident:updated", inc);
  }
  res.json({ success: true, data: inc });
}));

// ─── Deployment Tracking ──────────────────────────────────────────────────────

/** GET /api/ops/deployments */
opsRoutes.get("/deployments", asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: getAllDeployments() });
}));

// ─── Agent Heartbeat ──────────────────────────────────────────────────────────

export interface AgentHeartbeat {
  agentId: string;
  hostname: string;
  ip: string;
  version: string;
  metrics?: {
    cpu: number;
    memory: number;
    disk: number;
    networkIn?: number;
    networkOut?: number;
    networkInBytes?: number;
    networkOutBytes?: number;
    uptime?: number;
    [key: string]: any;
  };
  processes?: any[];
}

export const agentRegistry = new Map<string, { heartbeat: AgentHeartbeat; lastSeen: Date; status: string }>();

/** POST /api/ops/agent/heartbeat — receive heartbeat from monitoring agent */
opsRoutes.post("/agent/heartbeat", asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body as AgentHeartbeat;
  if (!payload.agentId || !payload.hostname) {
    res.status(400).json({ success: false, message: "agentId and hostname required" });
    return;
  }
  
  const existing = agentRegistry.get(payload.agentId);
  const status = existing?.status === "draining" ? "draining" : "healthy";

  agentRegistry.set(payload.agentId, {
    heartbeat: payload,
    lastSeen: new Date(),
    status,
  });
  console.log(`[AGENT] Heartbeat received from ${payload.hostname} (${payload.agentId})`);

  if (payload.metrics) {
    const io = req.app.get("io");
    const metricsToEval = {
      cpu: payload.metrics.cpu,
      memory: payload.metrics.memory,
      disk: payload.metrics.disk,
      latency: 0 // Server metrics don't have default API latency, we keep it 0
    };
    evaluateThresholds(metricsToEval, payload.hostname, io);
    
    // Broadcast live telemetry data over socket
    if (io) {
      io.emit("agent:telemetry", {
        agentId: payload.agentId,
        hostname: payload.hostname,
        metrics: payload.metrics,
        processes: payload.processes || [],
        timestamp: new Date()
      });
    }
  }

  res.json({ success: true, message: "Heartbeat registered", interval: 5 });
}));

/** GET /api/ops/agents — list all registered agents with real-time status correlation */
opsRoutes.get("/agents", asyncHandler(async (_req: Request, res: Response) => {
  const now = Date.now();
  const alerts = getAllAlerts().filter(a => a.state === "firing");
  
  const agents = Array.from(agentRegistry.entries()).map(([id, entry]) => {
    const hostAlerts = alerts.filter(a => a.affectedService === entry.heartbeat.hostname);
    
    let status = "healthy";
    if (now - entry.lastSeen.getTime() > 30000) {
      status = "offline";
    } else if (entry.status === "draining") {
      status = "draining";
    } else if (hostAlerts.some(a => a.severity === "critical")) {
      status = "critical";
    } else if (hostAlerts.some(a => a.severity === "warning")) {
      status = "warning";
    }
    
    return {
      agentId: id,
      hostname: entry.heartbeat.hostname,
      ip: entry.heartbeat.ip,
      version: entry.heartbeat.version,
      lastSeen: entry.lastSeen,
      status,
      metrics: entry.heartbeat.metrics,
      processes: entry.heartbeat.processes || [],
      uptime: entry.heartbeat.metrics?.uptime || 0,
    };
  });
  res.json({ success: true, data: agents });
}));

/** POST /api/ops/agents/:id/restart — simulate restarting agent */
opsRoutes.post("/agents/:id/restart", asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const entry = agentRegistry.get(id);
  if (!entry) {
    res.status(404).json({ success: false, message: "Agent not found" });
    return;
  }
  entry.lastSeen = new Date();
  entry.status = "healthy";
  const io = req.app.get("io");
  if (io) {
    io.emit("agent:updated", { agentId: id, status: "healthy", lastSeen: entry.lastSeen });
  }
  console.log(`[AGENT] Restart requested for agent ${id}`);
  res.json({ success: true, message: `Restart request sent to agent ${id}` });
}));

/** POST /api/ops/agents/:id/disconnect — disconnect agent from server */
opsRoutes.post("/agents/:id/disconnect", asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const entry = agentRegistry.get(id);
  if (!entry) {
    res.status(404).json({ success: false, message: "Agent not found" });
    return;
  }
  agentRegistry.delete(id);
  const io = req.app.get("io");
  if (io) {
    io.emit("agent:deleted", { agentId: id });
  }
  console.log(`[AGENT] Agent ${id} disconnected manually`);
  res.json({ success: true, message: `Agent ${id} successfully disconnected` });
}));

/** POST /api/ops/agents/:id/drain — set agent status to draining */
opsRoutes.post("/agents/:id/drain", asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const entry = agentRegistry.get(id);
  if (!entry) {
    res.status(404).json({ success: false, message: "Agent not found" });
    return;
  }
  entry.status = "draining";
  const io = req.app.get("io");
  if (io) {
    io.emit("agent:updated", { agentId: id, status: "draining" });
  }
  console.log(`[AGENT] Agent ${id} marked as draining`);
  res.json({ success: true, message: `Agent ${id} marked as draining` });
}));
