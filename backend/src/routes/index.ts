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

export const apiRoutes = Router();

apiRoutes.use("/", monitoringRoutes);
apiRoutes.use("/", logRoutes);
apiRoutes.use("/", aiRoutes);
apiRoutes.use("/telemetry", telemetryRouter);
apiRoutes.use("/infrastructure", infrastructureRouter);
apiRoutes.use("/analytics", analyticsRoutes);
apiRoutes.use("/ops", opsRoutes);
apiRoutes.use("/agent", agentRouter);
apiRoutes.use("/scenarios", scenarioRouter);
