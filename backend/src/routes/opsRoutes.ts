import { Router, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  getAllAlerts, getAlertById, acknowledgeAlert, resolveAlert, suppressAlert, getRules,
  triggerAgentOfflineAlert, resolveAgentOfflineAlert
} from "../services/alertEngineService";
import { enqueueTelemetry } from "../services/telemetryWorker";
import {
  getAllIncidents, getIncidentById, acknowledgeIncident, resolveIncident,
  addTimelineEvent, getAllDeployments
} from "../services/incidentTimelineService";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { verifySshConnection, installAgentViaSsh } from "../services/sshService";

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

const HeartbeatSchema = z.object({
  agentId: z.string().min(1),
  hostname: z.string().min(1),
  ip: z.string(),
  version: z.string(),
  metrics: z.object({
    cpu: z.number().min(0).max(100),
    memory: z.number().min(0).max(100),
    disk: z.number().min(0).max(100),
    networkIn: z.number().optional(),
    networkOut: z.number().optional(),
    networkInBytes: z.number().optional(),
    networkOutBytes: z.number().optional(),
    uptime: z.number().optional()
  }).passthrough().optional(),
  processes: z.array(z.any()).optional()
});

/** POST /api/ops/agent/heartbeat — receive heartbeat from monitoring agent */
opsRoutes.post("/agent/heartbeat", asyncHandler(async (req: Request, res: Response) => {
  const result = HeartbeatSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, message: "Invalid payload", errors: result.error.errors });
    return;
  }
  const payload = result.data as AgentHeartbeat;
  
  const existing = agentRegistry.get(payload.agentId);
  const wasOffline = existing?.status === "offline";
  const status = existing?.status === "draining" ? "draining" : "healthy";

  agentRegistry.set(payload.agentId, {
    heartbeat: payload,
    lastSeen: new Date(),
    status,
  });
  console.log(`[AGENT] Heartbeat received from ${payload.hostname} (${payload.agentId})`);

  const io = req.app.get("io");

  if (wasOffline && io) {
    resolveAgentOfflineAlert(payload.hostname, io);
    io.emit("agent:updated", {
      agentId: payload.agentId,
      hostname: payload.hostname,
      status,
      lastSeen: new Date(),
    });
  }

  if (payload.metrics) {
    const metricsToEval = {
      cpu: payload.metrics.cpu,
      memory: payload.metrics.memory,
      disk: payload.metrics.disk,
      latency: 0 // Server metrics don't have default API latency, we keep it 0
    };
    enqueueTelemetry(payload.hostname, metricsToEval, true).catch(err => console.error("BullMQ Enqueue Error:", err));
    
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

// ─── Ops Installer Endpoints ──────────────────────────────────────────────────

/** GET /api/ops/install.sh — dynamic shell installer */
opsRoutes.get("/install.sh", (req: Request, res: Response) => {
  const protocol = req.protocol;
  const host = req.get("host");
  const apiBaseUrl = (req.query.apiBaseUrl as string) || `${protocol}://${host}`;
  const apiKey = (req.query.apiKey as string) || "dev-key";

  const script = `#!/bin/bash
set -e

echo "=================================================="
echo "      CloudAI Monitor Agent Installation          "
echo "=================================================="
echo "[1/5] Checking environment..."

INSTALL_DIR="/opt/cloudai-agent"
USE_SUDO=""
if [ "\$EUID" -ne 0 ]; then
  if sudo -n true 2>/dev/null; then
    USE_SUDO="sudo"
  else
    echo "⚠️ Warning: Not running as root and no passwordless sudo. Installing to home directory."
    INSTALL_DIR="\$HOME/.cloudai-agent"
  fi
fi

echo "Installing to: \$INSTALL_DIR"
\$USE_SUDO mkdir -p "\$INSTALL_DIR"
\$USE_SUDO chmod 755 "\$INSTALL_DIR" 2>/dev/null || true

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "[2/5] Node.js not found. Attempting to install..."
  if [ -f /etc/debian_version ]; then
    echo "Installing Node.js via NodeSource on Debian/Ubuntu..."
    \$USE_SUDO apt-get update -y
    \$USE_SUDO apt-get install -y curl gnupg
    curl -fsSL https://deb.nodesource.com/setup_18.x | \$USE_SUDO bash -
    \$USE_SUDO apt-get install -y nodejs
  elif [ -f /etc/redhat-release ]; then
    echo "Installing Node.js on CentOS/RHEL..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | \$USE_SUDO bash -
    \$USE_SUDO yum install -y nodejs
  else
    echo "❌ Error: Node.js is required but not installed, and OS is unsupported for auto-install."
    exit 1
  fi
else
  echo "[2/5] Node.js is already installed: \$(node -v)"
fi

# Check npm
if ! command -v npm &> /dev/null; then
  echo "npm not found. Installing..."
  if [ -f /etc/debian_version ]; then
    \$USE_SUDO apt-get install -y npm
  elif [ -f /etc/redhat-release ]; then
    \$USE_SUDO yum install -y npm
  fi
fi

echo "[3/5] Downloading agent source..."
# Download files from backend API
\$USE_SUDO curl -fsSL "${apiBaseUrl}/api/ops/agent/package.json" -o "\$INSTALL_DIR/package.json"
\$USE_SUDO curl -fsSL "${apiBaseUrl}/api/ops/agent/agent.js" -o "\$INSTALL_DIR/agent.js"

echo "[4/5] Installing agent dependencies..."
cd "\$INSTALL_DIR"
\$USE_SUDO npm install --production

echo "[5/5] Configuring agent service daemon..."
# Try to install systemd service if systemctl is available
if command -v systemctl &> /dev/null; then
  echo "Creating systemd service..."
  SERVICE_FILE="[Unit]
Description=CloudAI Monitoring Agent
After=network.target

[Service]
Type=simple
WorkingDirectory=\$INSTALL_DIR
ExecStart=\$(command -v node) agent.js --api-key=${apiKey} --endpoint=${apiBaseUrl}
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=cloudai-agent

[Install]
WantedBy=multi-user.target"

  echo "\$SERVICE_FILE" | \$USE_SUDO tee /etc/systemd/system/cloudai-agent.service > /dev/null
  \$USE_SUDO systemctl daemon-reload
  \$USE_SUDO systemctl enable cloudai-agent
  \$USE_SUDO systemctl restart cloudai-agent
  echo "✓ Systemd service 'cloudai-agent' started and enabled."
else
  echo "⚠️ systemd not detected. Starting agent in the background via nohup..."
  \$USE_SUDO nohup node agent.js --api-key=${apiKey} --endpoint=${apiBaseUrl} > agent.log 2>&1 &
  echo "✓ Agent started in the background (PID: \$!)."
fi

echo "=================================================="
echo "✓ Installation completed successfully!"
echo "=================================================="
`;

  res.setHeader("Content-Type", "application/x-sh");
  res.send(script);
});

/** GET /api/ops/agent/agent.js — serve agent.js code */
opsRoutes.get("/agent/agent.js", (req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), "../agent/agent.js");
  const altPath = path.join(__dirname, "../../../agent/agent.js");
  const actualPath = fs.existsSync(filePath) ? filePath : altPath;

  if (fs.existsSync(actualPath)) {
    res.sendFile(actualPath);
  } else {
    res.status(404).send("agent.js not found on server");
  }
});

/** GET /api/ops/agent/package.json — serve agent package.json */
opsRoutes.get("/agent/package.json", (req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), "../agent/package.json");
  const altPath = path.join(__dirname, "../../../agent/package.json");
  const actualPath = fs.existsSync(filePath) ? filePath : altPath;

  if (fs.existsSync(actualPath)) {
    res.sendFile(actualPath);
  } else {
    res.status(404).send("package.json not found on server");
  }
});

/** POST /api/ops/ssh/install-agent — deploy agent via SSH */
opsRoutes.post("/ssh/install-agent", asyncHandler(async (req: Request, res: Response) => {
  const { config, apiKey = "dev-key", socketId } = req.body;
  if (!config || !config.host || !config.username) {
    res.status(400).json({ success: false, message: "SSH host and username configuration required." });
    return;
  }

  const io = req.app.get("io");
  const targetSocket = socketId && io ? io.sockets.sockets.get(socketId) : null;

  const onProgress = (msg: string) => {
    if (targetSocket) {
      targetSocket.emit("ssh:install-progress", { message: msg });
    } else if (io) {
      io.emit("ssh:install-progress", { message: msg });
    }
    console.log(`[SSH Progress] ${msg}`);
  };

  const protocol = req.protocol;
  const host = req.get("host");
  const apiBaseUrl = `${protocol}://${host}`;

  onProgress("Initializing agent remote deployment sequence...");

  try {
    await verifySshConnection(config);
  } catch (err: any) {
    onProgress(`❌ Connection verification failed: ${err.message}`);
    res.status(400).json({ success: false, message: `SSH authentication failed: ${err.message}` });
    return;
  }

  res.json({ success: true, message: "Authentication verified. Installation started in background." });

  (async () => {
    try {
      await installAgentViaSsh(config, apiBaseUrl, apiKey, onProgress);
    } catch (err: any) {
      onProgress(`❌ Agent installation sequence failed: ${err.message}`);
    }
  })();
}));

// ─── Agent Status Background Sweeper ──────────────────────────────────────────

let sweeperInterval: NodeJS.Timeout | null = null;

export function startAgentStatusSweeper(io: any) {
  if (sweeperInterval) {
    clearInterval(sweeperInterval);
  }

  sweeperInterval = setInterval(() => {
    const now = Date.now();
    for (const [id, entry] of agentRegistry.entries()) {
      if (entry.status !== "offline" && now - entry.lastSeen.getTime() > 30000) {
        entry.status = "offline";
        console.log(`[AGENT SWEEPER] Agent ${entry.heartbeat.hostname} (${id}) is offline (last seen ${entry.lastSeen.toISOString()})`);
        
        triggerAgentOfflineAlert(entry.heartbeat.hostname, io);
        
        io.emit("agent:updated", {
          agentId: id,
          hostname: entry.heartbeat.hostname,
          status: "offline",
          lastSeen: entry.lastSeen,
        });
      }
    }
  }, 10000);
}

