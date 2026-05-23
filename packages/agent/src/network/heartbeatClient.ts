import axios from "axios";
import { z } from "zod";

const HeartbeatSchema = z.object({
  agentId: z.string(),
  hostname: z.string(),
  ip: z.string(),
  version: z.string(),
  metrics: z.object({
    cpu: z.number(),
    memory: z.number(),
    disk: z.number(),
    networkInBytes: z.number().optional(),
    networkOutBytes: z.number().optional(),
    uptime: z.number().optional()
  }),
  processes: z.array(z.any()).optional(),
  docker: z.array(z.any()).optional(),
  system: z.any().optional()
});

export type AgentPayload = z.infer<typeof HeartbeatSchema>;

// Exponential backoff configuration
let consecutiveFailures = 0;
const MAX_BACKOFF_MS = 60000; // Max 60 seconds

export async function sendHeartbeat(apiUrl: string, apiKey: string, payload: AgentPayload): Promise<boolean> {
  try {
    // Validate payload against schema before sending
    HeartbeatSchema.parse(payload);

    await axios.post(`${apiUrl}/api/ops/agent/heartbeat`, payload, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 5000 // 5 second timeout
    });

    if (consecutiveFailures > 0) {
      console.log(`[NETWORK] Connection recovered after ${consecutiveFailures} failures.`);
      consecutiveFailures = 0;
    }
    return true;

  } catch (error: any) {
    consecutiveFailures++;
    const backoff = Math.min(Math.pow(2, consecutiveFailures) * 1000, MAX_BACKOFF_MS);
    console.error(`[NETWORK] Heartbeat failed. Attempt ${consecutiveFailures}. Next attempt delayed by ${backoff}ms.`);
    return false;
  }
}

export function getCurrentBackoff(): number {
  if (consecutiveFailures === 0) return 0;
  return Math.min(Math.pow(2, consecutiveFailures) * 1000, MAX_BACKOFF_MS);
}
