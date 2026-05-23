import { Queue, Worker, Job } from "bullmq";
import { evaluateThresholds } from "./alertEngineService";
import { Server as SocketServer } from "socket.io";
import { storeMetricSnapshot } from "./redisStreamStore";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const telemetryQueue = new Queue("telemetry-processing", {
  connection: { url: REDIS_URL },
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 1000,
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 }
  }
});

telemetryQueue.on("error", (err) => {
  // Silent fallback if Redis is down
  if (String(err).includes("ECONNREFUSED")) return;
  console.warn("[BullMQ] Queue error:", err.message);
});

let worker: Worker | null = null;
let ioInstance: SocketServer | null = null;

export function initTelemetryWorker(io: SocketServer) {
  ioInstance = io;
  if (worker) return;

  worker = new Worker("telemetry-processing", async (job: Job) => {
    const { serverId, metrics, isReal } = job.data;
    
    // Evaluate thresholds using the Alert Engine
    if (ioInstance) {
      evaluateThresholds(metrics, serverId, ioInstance);
    }
    
    // If it's a real metric point, store it globally too (or keep the mock stream going)
    await storeMetricSnapshot({
      timestamp: new Date().toISOString(),
      serverId,
      ...metrics
    });
    
  }, {
    connection: { url: REDIS_URL },
    concurrency: 10 // process up to 10 nodes concurrently
  });

  worker.on("completed", (job) => {
    // Silent success for high throughput
  });

  worker.on("failed", (job, err) => {
    console.error(`[BullMQ] Telemetry job failed for server ${job?.data?.serverId}:`, err.message);
  });
  
  worker.on("error", (err) => {
    if (String(err).includes("ECONNREFUSED")) return;
    console.warn("[BullMQ] Worker error:", err.message);
  });
  
  console.log("[TELEMETRY-WORKER] BullMQ worker initialized and listening.");
}

export async function enqueueTelemetry(serverId: string, metrics: any, isReal = false) {
  await telemetryQueue.add("process-metrics", { serverId, metrics, isReal });
}
