import { Router, Request, Response } from "express";
import { generateRCA, calculateOutageProbabilities, generatePostmortem } from "../services/aiAnalyticsService";
import { collectRealMetrics, getLocalMachineSummary } from "../services/systemInfoService";

export const analyticsRoutes = Router();
import { getIncidentById } from "../services/incidentTimelineService";

/**
 * GET /api/analytics/rca/:incidentId
 * Generate a full root cause analysis for an incident.
 */
analyticsRoutes.get("/rca/:incidentId", (req: Request, res: Response): void => {
  const { incidentId } = req.params;
  const { type, service } = req.query as { type?: string; service?: string };
  
  const inc = getIncidentById(incidentId);
  let deploymentCorrelation: any = undefined;
  if (inc?.deploymentCorrelation) {
    deploymentCorrelation = {
      version: inc.deploymentCorrelation.version,
      deployedAt: inc.deploymentCorrelation.deployedAt.toISOString(),
      minutesBefore: Math.round((Date.now() - inc.deploymentCorrelation.deployedAt.getTime()) / 60000),
      confidence: inc.deploymentCorrelation.confidence,
      changes: [inc.deploymentCorrelation.regressionSignal]
    };
  }

  const rca = generateRCA(incidentId, type ?? "high cpu memory", service, deploymentCorrelation);
  res.json({ success: true, data: rca });
});

/**
 * POST /api/analytics/rca
 * Generate RCA from incident body data.
 */
analyticsRoutes.post("/rca", (req: Request, res: Response): void => {
  const { incidentId, type, service } = req.body;
  if (!incidentId) {
    res.status(400).json({ success: false, message: "incidentId required" });
    return;
  }
  
  const inc = getIncidentById(incidentId);
  let deploymentCorrelation: any = undefined;
  if (inc?.deploymentCorrelation) {
    deploymentCorrelation = {
      version: inc.deploymentCorrelation.version,
      deployedAt: inc.deploymentCorrelation.deployedAt.toISOString(),
      minutesBefore: Math.round((Date.now() - inc.deploymentCorrelation.deployedAt.getTime()) / 60000),
      confidence: inc.deploymentCorrelation.confidence,
      changes: [inc.deploymentCorrelation.regressionSignal]
    };
  }

  const rca = generateRCA(incidentId, type ?? "general", service, deploymentCorrelation);
  res.json({ success: true, data: rca });
});

/**
 * GET /api/analytics/outage-probability
 * Return outage probability scores for all monitored services.
 */
analyticsRoutes.get("/outage-probability", (_req: Request, res: Response): void => {
  const probabilities = calculateOutageProbabilities();
  res.json({ success: true, data: probabilities });
});

/**
 * POST /api/analytics/postmortem
 * Generate a postmortem document from an RCA.
 */
analyticsRoutes.post("/postmortem", (req: Request, res: Response): void => {
  const { incidentId, type, service } = req.body;
  if (!incidentId) {
    res.status(400).json({ success: false, message: "incidentId required" });
    return;
  }
  const rca = generateRCA(incidentId, type ?? "general", service);
  const postmortem = generatePostmortem(rca);
  res.json({ success: true, data: { postmortem, rca } });
});

/**
 * GET /api/analytics/system-metrics
 * Return REAL system metrics from the local machine.
 */
analyticsRoutes.get("/system-metrics", async (_req: Request, res: Response): Promise<void> => {
  try {
    const metrics = await collectRealMetrics();
    res.json({ success: true, data: metrics });
  } catch {
    res.status(500).json({ success: false, message: "Failed to collect system metrics" });
  }
});

/**
 * GET /api/analytics/local-machine
 * Return a simplified server card summary for the local machine.
 */
analyticsRoutes.get("/local-machine", async (_req: Request, res: Response): Promise<void> => {
  try {
    const summary = await getLocalMachineSummary();
    res.json({ success: true, data: summary });
  } catch {
    res.status(500).json({ success: false, message: "Failed to collect local machine info" });
  }
});
