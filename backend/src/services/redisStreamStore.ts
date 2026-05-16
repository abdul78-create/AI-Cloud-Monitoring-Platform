/**
 * Redis Streams Metric Store
 *
 * Uses Redis Streams (XADD/XREAD) for time-series metric storage.
 * - Writes every metric snapshot to stream "metrics:live"
 * - Writes incidents to "incidents:stream"
 * - Provides XREVRANGE queries for historical data
 * - Trims streams to last 10,000 entries (MAXLEN ~)
 *
 * If Redis is unavailable, operations silently no-op so the
 * platform keeps working in offline/demo mode.
 */

import { createClient, RedisClientType } from "redis";

const METRICS_STREAM  = "metrics:live";
const INCIDENTS_STREAM = "incidents:stream";
const LOGS_STREAM      = "logs:stream";
const MAX_STREAM_LEN   = 10000;

let client: RedisClientType | null = null;
let isConnected = false;

async function getClient(): Promise<RedisClientType | null> {
  if (client && isConnected) return client;

  const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
  try {
    const c = createClient({ 
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          const delay = Math.min(retries * 500, 5000);
          console.log(`[REDIS-STREAMS] Reconnecting in ${delay}ms...`);
          return delay;
        }
      }
    }) as RedisClientType;

    c.on("error", (err) => {
      if (!String(err).includes("ECONNREFUSED") && !String(err).includes("Socket closed")) {
        console.error("[REDIS-STREAMS] Error:", err.message);
      }
      isConnected = false;
    });

    c.on("connect", () => {
      isConnected = true;
      console.log("[REDIS-STREAMS] Connected to Redis — streams active");
    });

    c.on("reconnecting", () => {
      console.log("[REDIS-STREAMS] Attempting to reconnect...");
    });

    await c.connect();
    client = c;
    return c;
  } catch (err: any) {
    console.warn("[REDIS-STREAMS] Redis unavailable — running in memory-only mode");
    return null;
  }
}

// ─── Write metric snapshot to Redis stream ────────────────────────────────────
export async function storeMetricSnapshot(snapshot: Record<string, any>): Promise<void> {
  const c = await getClient();
  if (!c) return;

  try {
    // Convert all values to strings for Redis stream
    const fields: Record<string, string> = {};
    for (const [k, v] of Object.entries(snapshot)) {
      if (v !== undefined && v !== null) fields[k] = String(v);
    }
    await c.xAdd(METRICS_STREAM, "*", fields, {
      TRIM: { strategy: "MAXLEN", strategyModifier: "~", threshold: MAX_STREAM_LEN },
    });
  } catch (err: any) {
    // Swallow storage errors to not interrupt streaming
  }
}

// ─── Write incident to Redis stream ──────────────────────────────────────────
export async function storeIncident(incident: Record<string, any>): Promise<void> {
  const c = await getClient();
  if (!c) return;

  try {
    const fields: Record<string, string> = {};
    for (const [k, v] of Object.entries(incident)) {
      if (v !== undefined && v !== null) fields[k] = String(v);
    }
    await c.xAdd(INCIDENTS_STREAM, "*", fields, {
      TRIM: { strategy: "MAXLEN", strategyModifier: "~", threshold: 1000 },
    });
  } catch (_) {}
}

// ─── Write log entry to Redis stream ─────────────────────────────────────────
export async function storeLog(entry: Record<string, any>): Promise<void> {
  const c = await getClient();
  if (!c) return;

  try {
    const fields: Record<string, string> = {};
    for (const [k, v] of Object.entries(entry)) {
      if (v !== undefined && v !== null) fields[k] = String(v);
    }
    await c.xAdd(LOGS_STREAM, "*", fields, {
      TRIM: { strategy: "MAXLEN", strategyModifier: "~", threshold: 5000 },
    });
  } catch (_) {}
}

// ─── Read historical metrics ──────────────────────────────────────────────────
export async function getMetricHistory(count = 60): Promise<Record<string, string>[]> {
  const c = await getClient();
  if (!c) return [];

  try {
    const results = await c.xRevRange(METRICS_STREAM, "+", "-", { COUNT: count });
    return results.map(r => r.message as Record<string, string>).reverse();
  } catch {
    return [];
  }
}

// ─── Read recent incidents ────────────────────────────────────────────────────
export async function getIncidentHistory(count = 50): Promise<Record<string, string>[]> {
  const c = await getClient();
  if (!c) return [];

  try {
    const results = await c.xRevRange(INCIDENTS_STREAM, "+", "-", { COUNT: count });
    return results.map(r => r.message as Record<string, string>);
  } catch {
    return [];
  }
}

// ─── Read recent logs ─────────────────────────────────────────────────────────
export async function getLogHistory(count = 100): Promise<Record<string, string>[]> {
  const c = await getClient();
  if (!c) return [];

  try {
    const results = await c.xRevRange(LOGS_STREAM, "+", "-", { COUNT: count });
    return results.map(r => r.message as Record<string, string>);
  } catch {
    return [];
  }
}

// ─── Stream stats (for /api/telemetry/stats endpoint) ────────────────────────
export async function getStreamStats(): Promise<Record<string, number>> {
  const c = await getClient();
  if (!c) return { connected: 0 };

  try {
    const [mLen, iLen, lLen] = await Promise.all([
      c.xLen(METRICS_STREAM).catch(() => 0),
      c.xLen(INCIDENTS_STREAM).catch(() => 0),
      c.xLen(LOGS_STREAM).catch(() => 0),
    ]);
    return {
      connected: 1,
      metricsStored: mLen,
      incidentsStored: iLen,
      logsStored: lLen,
    };
  } catch {
    return { connected: 0 };
  }
}

// Initialize on module load
getClient().catch(() => {});
