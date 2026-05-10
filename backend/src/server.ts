import express from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import { Server } from "socket.io";
import { env } from "./config/env";
import { apiRoutes } from "./routes";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import { HttpError } from "./utils/httpError";

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
    origin: (origin, callback) => {
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

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "AI Cloud Monitoring backend is running."
  });
});

app.use("/api", apiRoutes);

app.use((_req, _res, next) => {
  next(new HttpError(404, "Route not found."));
});

app.use(errorHandler);

// Socket.io connection
io.on("connection", (socket) => {
  console.log(`[SOCKET] Client connected: ${socket.id}`);
  
  socket.on("disconnect", () => {
    console.log(`[SOCKET] Client disconnected: ${socket.id}`);
  });
});

// Export io instance to use in services
export { io };

server.listen(env.port, () => {
  console.log(`Backend listening on http://localhost:${env.port}`);
});
