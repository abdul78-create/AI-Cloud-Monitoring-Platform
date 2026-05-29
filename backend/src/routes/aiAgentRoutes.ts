import { Router, Request, Response } from "express";
import { AiAgentService } from "../services/aiAgentService";

/**
 * AI Agent Routes
 * Mount at /api/ai-agent
 *
 * GET  /decisions               – list decisions (most recent first, max 50)
 * GET  /decisions/:id           – single decision by id
 * POST /decisions/:id/approve   – approve a supervised pending decision
 * POST /decisions/:id/reject    – reject a supervised pending decision
 * GET  /stats                   – agent performance stats
 * GET  /memory                  – agent rule memory entries
 * POST /mode                    – set operating mode { mode: "autonomous"|"supervised" }
 * POST /toggle                  – enable/disable agent   { enabled: boolean }
 */
export function createAiAgentRouter(agentService: AiAgentService): Router {
  const router = Router();

  // ---------------------------------------------------------------------------
  // GET /decisions
  // ---------------------------------------------------------------------------
  router.get("/decisions", (_req: Request, res: Response) => {
    try {
      const decisions = agentService.getDecisions(); // already sorted, max 50
      res.json({ success: true, count: decisions.length, decisions });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ---------------------------------------------------------------------------
  // GET /decisions/:id
  // ---------------------------------------------------------------------------
  router.get("/decisions/:id", (req: Request, res: Response) => {
    try {
      const decision = agentService.decisions.get(req.params.id);
      if (!decision) {
        res.status(404).json({ success: false, message: "Decision not found" });
        return;
      }
      res.json({ success: true, decision });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ---------------------------------------------------------------------------
  // POST /decisions/:id/approve
  // ---------------------------------------------------------------------------
  router.post("/decisions/:id/approve", (req: Request, res: Response) => {
    try {
      agentService.approve(req.params.id);
      res.json({ success: true, message: "Decision approved — execution started" });
    } catch (err: any) {
      const status = err.message.includes("not found") ? 404 : 400;
      res.status(status).json({ success: false, message: err.message });
    }
  });

  // ---------------------------------------------------------------------------
  // POST /decisions/:id/reject
  // ---------------------------------------------------------------------------
  router.post("/decisions/:id/reject", (req: Request, res: Response) => {
    try {
      agentService.reject(req.params.id);
      res.json({ success: true, message: "Decision rejected" });
    } catch (err: any) {
      const status = err.message.includes("not found") ? 404 : 400;
      res.status(status).json({ success: false, message: err.message });
    }
  });

  // ---------------------------------------------------------------------------
  // GET /stats
  // ---------------------------------------------------------------------------
  router.get("/stats", (_req: Request, res: Response) => {
    try {
      const stats = agentService.getStats();
      res.json({ success: true, stats });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ---------------------------------------------------------------------------
  // GET /memory
  // ---------------------------------------------------------------------------
  router.get("/memory", (_req: Request, res: Response) => {
    try {
      const memory = agentService.getMemory();
      res.json({ success: true, count: memory.length, memory });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ---------------------------------------------------------------------------
  // POST /mode
  // ---------------------------------------------------------------------------
  router.post("/mode", (req: Request, res: Response) => {
    const { mode } = req.body as { mode?: string };

    if (mode !== "autonomous" && mode !== "supervised") {
      res.status(400).json({
        success: false,
        message: 'Invalid mode. Must be "autonomous" or "supervised".',
      });
      return;
    }

    try {
      agentService.setMode(mode);
      res.json({ success: true, message: `Agent mode set to "${mode}"`, mode });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ---------------------------------------------------------------------------
  // POST /toggle
  // ---------------------------------------------------------------------------
  router.post("/toggle", (req: Request, res: Response) => {
    const { enabled } = req.body as { enabled?: unknown };

    if (typeof enabled !== "boolean") {
      res.status(400).json({
        success: false,
        message: '"enabled" must be a boolean value.',
      });
      return;
    }

    try {
      agentService.setEnabled(enabled);
      res.json({
        success: true,
        message: `Agent ${enabled ? "enabled" : "disabled"}`,
        isEnabled: enabled,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  return router;
}
