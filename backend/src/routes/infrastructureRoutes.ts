/**
 * Infrastructure Routes
 *
 * POST   /api/infrastructure/connect              — validate & simulate a connection
 * GET    /api/infrastructure/servers              — list all connected servers
 * GET    /api/infrastructure/servers/:id          — single server details
 * GET    /api/infrastructure/servers/:id/metrics  — 1-hour time-series metrics
 * GET    /api/infrastructure/servers/:id/processes — running process list
 * GET    /api/infrastructure/servers/:id/services  — systemd service list
 * POST   /api/infrastructure/servers/:id/ping     — simulate ping / health-check
 */

import { Router, Request, Response, NextFunction } from "express";
import {
  getMockServers,
  getServerById,
  getServerMetrics,
  getServerProcesses,
  getServerServices,
  simulateConnection,
  pingServer,
  ConnectionConfig,
} from "../services/infrastructureService";

export const infrastructureRouter = Router();

// ─── POST /connect ─────────────────────────────────────────────────────────────

infrastructureRouter.post(
  "/connect",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const config: ConnectionConfig = req.body;

      if (!config || !config.provider) {
        res.status(400).json({
          success: false,
          message: "Request body must include a valid 'provider' field.",
        });
        return;
      }

      const result = await simulateConnection(config);

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /servers ──────────────────────────────────────────────────────────────

infrastructureRouter.get(
  "/servers",
  (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const servers = getMockServers();
      res.json({
        success: true,
        data: {
          servers,
          total: servers.length,
          healthy: servers.filter((s) => s.status === "healthy").length,
          warning: servers.filter((s) => s.status === "warning").length,
          critical: servers.filter((s) => s.status === "critical").length,
          offline: servers.filter((s) => s.status === "offline").length,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /servers/:id ──────────────────────────────────────────────────────────

infrastructureRouter.get(
  "/servers/:id",
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const server = getServerById(req.params.id);
      if (!server) {
        res.status(404).json({ success: false, message: "Server not found." });
        return;
      }
      res.json({ success: true, data: server });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /servers/:id/metrics ──────────────────────────────────────────────────

infrastructureRouter.get(
  "/servers/:id/metrics",
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const metrics = getServerMetrics(req.params.id);
      if (!metrics.length) {
        res.status(404).json({ success: false, message: "Server not found." });
        return;
      }
      res.json({
        success: true,
        data: {
          serverId: req.params.id,
          resolution: "1m",
          points: metrics,
          total: metrics.length,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /servers/:id/processes ────────────────────────────────────────────────

infrastructureRouter.get(
  "/servers/:id/processes",
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const processes = getServerProcesses(req.params.id);
      if (!processes.length) {
        res.status(404).json({ success: false, message: "Server not found." });
        return;
      }
      res.json({
        success: true,
        data: {
          serverId: req.params.id,
          processes,
          total: processes.length,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /servers/:id/services ─────────────────────────────────────────────────

infrastructureRouter.get(
  "/servers/:id/services",
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const services = getServerServices(req.params.id);
      if (!services.length) {
        res.status(404).json({ success: false, message: "Server not found." });
        return;
      }
      res.json({
        success: true,
        data: {
          serverId: req.params.id,
          services,
          total: services.length,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /servers/:id/ping ────────────────────────────────────────────────────

infrastructureRouter.post(
  "/servers/:id/ping",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await pingServer(req.params.id);
      if (!result.alive && !getMockServers().find((s) => s.id === req.params.id)) {
        res.status(404).json({ success: false, message: "Server not found." });
        return;
      }
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);
