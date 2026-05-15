import { Router, Request, Response } from "express";
import { getMetricHistory, getIncidentHistory, getLogHistory, getStreamStats } from "../services/redisStreamStore";

export const telemetryRouter = Router();

/** GET /api/telemetry/metrics?count=60
 * Returns up to `count` historical metric snapshots from Redis Streams */
telemetryRouter.get("/metrics", async (req: Request, res: Response) => {
  const count = Math.min(Number(req.query.count) || 60, 500);
  const data = await getMetricHistory(count);
  res.json({ success: true, data, count: data.length });
});

/** GET /api/telemetry/incidents?count=50 */
telemetryRouter.get("/incidents", async (req: Request, res: Response) => {
  const count = Math.min(Number(req.query.count) || 50, 200);
  const data = await getIncidentHistory(count);
  res.json({ success: true, data, count: data.length });
});

/** GET /api/telemetry/logs?count=100 */
telemetryRouter.get("/logs", async (req: Request, res: Response) => {
  const count = Math.min(Number(req.query.count) || 100, 500);
  const data = await getLogHistory(count);
  res.json({ success: true, data, count: data.length });
});

/** GET /api/telemetry/stats
 * Returns Redis stream stats and connection status */
telemetryRouter.get("/stats", async (_req: Request, res: Response) => {
  const stats = await getStreamStats();
  res.json({ success: true, data: stats });
});
