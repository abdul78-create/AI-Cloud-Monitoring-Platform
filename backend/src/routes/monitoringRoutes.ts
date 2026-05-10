import { Router } from "express";
import { monitoringController } from "../controllers/monitoringController";

export const monitoringRoutes = Router();

monitoringRoutes.get("/metrics", monitoringController.getMetrics);
monitoringRoutes.get("/infrastructure", monitoringController.getInfrastructure);
monitoringRoutes.get("/alerts", monitoringController.getAlerts);
monitoringRoutes.get("/analytics", monitoringController.getAnalytics);
monitoringRoutes.get("/service-health", monitoringController.getServiceHealth);

// Compatibility routes for existing frontend endpoints.
monitoringRoutes.get("/monitoring/metrics", monitoringController.getMetrics);
monitoringRoutes.get("/monitoring/infrastructure", monitoringController.getInfrastructure);
monitoringRoutes.get("/monitoring/alerts", monitoringController.getAlerts);
monitoringRoutes.get("/monitoring/analytics", monitoringController.getAnalytics);
monitoringRoutes.get("/monitoring/service-health", monitoringController.getServiceHealth);
monitoringRoutes.get("/monitoring/queue-metrics", monitoringController.getQueueMetrics);
monitoringRoutes.get("/monitoring/analyze-root-cause", monitoringController.analyzeRootCause);

// Agent routes
monitoringRoutes.post("/monitoring/register", monitoringController.registerAgent);
monitoringRoutes.post("/monitoring/metrics", monitoringController.submitMetrics);
monitoringRoutes.post("/monitoring/logs", monitoringController.submitLogs);
monitoringRoutes.post("/monitoring/heartbeat", monitoringController.submitHeartbeat);
