import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import { Server } from "socket.io";
import { env } from "./config/env";
import { apiRoutes } from "./routes";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import { HttpError } from "./utils/httpError";
import { startTelemetryBroadcaster } from "./services/telemetryBroadcaster";

// Global process safeguards to prevent crash on Redis socket errors or other unhandled issues
process.on("uncaughtException", (err) => {
  console.error("[CRITICAL] Uncaught Exception:", err.message);
  // Keep process alive for Railway
});

process.on("unhandledRejection", (reason) => {
  console.error("[CRITICAL] Unhandled Rejection:", reason);
  // Keep process alive for Railway
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.clientOrigin.split(",").map((item) => item.trim()),
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      const allowed = env.clientOrigin.split(",").map((item) => item.trim());
      if (allowed.includes(origin)) return callback(null, true);
      return callback(new Error("CORS origin blocked."));
    },
    methods: ["GET", "POST"],
    credentials: true
  })
);
app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(requestLogger);

app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "AI Cloud Monitoring backend is running.",
    telemetry: "live — streaming at 3s intervals"
  });
});

app.use("/api", apiRoutes);

app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new HttpError(404, "Route not found."));
});

app.use(errorHandler);

// Socket.io — agent events
io.on("connection", (socket) => {
  console.log(`[SOCKET] Client connected: ${socket.id}`);
  
  socket.on("simulation_event", (data) => {
    console.log(`[SOCKET] Simulation event received`);
    io.emit("simulation_update", data);
  });

  socket.on("disconnect", () => {
    console.log(`[SOCKET] Client disconnected: ${socket.id}`);
  });
});

// Start real-time telemetry broadcaster
startTelemetryBroadcaster(io);

// Export io instance to use in services
export { io };

server.listen(env.port, () => {
  console.log(`Backend listening on http://localhost:${env.port}`);
  console.log(`[TELEMETRY] Live streaming active — socket.io ready`);
});

