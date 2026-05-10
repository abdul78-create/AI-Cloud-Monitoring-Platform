import { Router } from "express";
import { monitoringRoutes } from "./monitoringRoutes";
import { logRoutes } from "./logRoutes";
import { aiRoutes } from "./aiRoutes";

export const apiRoutes = Router();

apiRoutes.use("/", monitoringRoutes);
apiRoutes.use("/", logRoutes);
apiRoutes.use("/", aiRoutes);
