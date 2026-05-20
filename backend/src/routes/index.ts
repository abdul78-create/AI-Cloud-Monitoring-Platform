import { Router } from "express";
import { monitoringRoutes } from "./monitoringRoutes";
import { logRoutes } from "./logRoutes";
import { aiRoutes } from "./aiRoutes";
import { telemetryRouter } from "./telemetryRoutes";
import { infrastructureRouter } from "./infrastructureRoutes";
import { analyticsRoutes } from "./analyticsRoutes";

export const apiRoutes = Router();

apiRoutes.use("/", monitoringRoutes);
apiRoutes.use("/", logRoutes);
apiRoutes.use("/", aiRoutes);
apiRoutes.use("/telemetry", telemetryRouter);
apiRoutes.use("/infrastructure", infrastructureRouter);
apiRoutes.use("/analytics", analyticsRoutes);
