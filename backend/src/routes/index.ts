import { Router } from "express";
import { monitoringRoutes } from "./monitoringRoutes";
import { logRoutes } from "./logRoutes";
import { aiRoutes } from "./aiRoutes";
import { telemetryRouter } from "./telemetryRoutes";
import { infrastructureRouter } from "./infrastructureRoutes";
import { analyticsRoutes } from "./analyticsRoutes";
import { opsRoutes } from "./opsRoutes";
import { agentRouter } from "./agentRoutes";
import scenarioRouter from "./scenarioRoutes";
import { createAiAgentRouter } from "./aiAgentRoutes";
import { createAiAgentService } from "../services/aiAgentService";

export const apiRoutes = Router();

// initAiAgent must be called after io is available (called from server.ts)
let _aiAgentRouterMounted = false;
export function initAiAgentRoutes(io: import("socket.io").Server) {
  if (_aiAgentRouterMounted) return;
  const agentSvc = createAiAgentService(io);
  apiRoutes.use("/ai-agent", createAiAgentRouter(agentSvc));
  _aiAgentRouterMounted = true;
}

apiRoutes.use("/", monitoringRoutes);
apiRoutes.use("/", logRoutes);
apiRoutes.use("/", aiRoutes);
apiRoutes.use("/telemetry", telemetryRouter);
apiRoutes.use("/infrastructure", infrastructureRouter);
apiRoutes.use("/analytics", analyticsRoutes);
apiRoutes.use("/ops", opsRoutes);
apiRoutes.use("/agent", agentRouter);
apiRoutes.use("/scenarios", scenarioRouter);
