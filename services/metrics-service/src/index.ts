import express from 'express';
import { createClient } from 'redis';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5003;

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';

let isReady = false;

const subscriber = createClient({ url: `redis://${redisHost}:${redisPort}` });
const publisher = createClient({ url: `redis://${redisHost}:${redisPort}` });

subscriber.on('error', (err) => {
  console.error('[METRICS] Redis Subscriber Error', err);
  isReady = false;
});
publisher.on('error', (err) => {
  console.error('[METRICS] Redis Publisher Error', err);
  isReady = false;
});

subscriber.on('connect', () => console.log('[METRICS] Redis Subscriber Connected'));
publisher.on('connect', () => console.log('[METRICS] Redis Publisher Connected'));

subscriber.on('ready', () => {
  console.log('[METRICS] Redis Subscriber Ready');
  isReady = true;
});

app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'metrics-service',
    redis: isReady ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.get('/readiness', (req, res) => {
  if (isReady) {
    res.json({ status: 'READY' });
  } else {
    res.status(503).json({ status: 'NOT_READY' });
  }
});

async function start() {
  await subscriber.connect();
  await publisher.connect();

  console.log(`Metrics Service connected to Redis at ${redisHost}:${redisPort}`);

  // Subscribe to raw metrics
  await subscriber.subscribe('metrics.raw', async (message) => {
    console.log('[METRICS] Received raw metrics');
    try {
      const data = JSON.parse(message);
      const { token, metrics } = data;

      // 1. Normalize data
      const normalizedMetrics = {
        cpuUsage: Math.min(100, Math.max(0, metrics.cpuUsage)),
        memoryUsage: Math.min(100, Math.max(0, metrics.memoryUsage)),
        diskUsage: metrics.diskUsage,
        networkTrafficMbps: metrics.networkTrafficMbps,
        timestamp: Date.now()
      };

      // 2. Detect spikes
      if (normalizedMetrics.cpuUsage > 90) {
        console.log(`[METRICS] High CPU detected for token ${token}: ${normalizedMetrics.cpuUsage}%`);
        await publisher.publish('alert.triggered', JSON.stringify({
          type: 'CPU_SPIKE',
          severity: 'critical',
          message: `High CPU usage detected: ${normalizedMetrics.cpuUsage}%`,
          token,
          timestamp: Date.now()
        }));
      }

      // 3. Emit processed metrics event
      await publisher.publish('metrics.received', JSON.stringify({
        token,
        metrics: normalizedMetrics
      }));

      // 4. Store in Redis for aggregation (e.g., time series or simple hash)
      await publisher.hSet(`latest_metrics:${token}`, {
        cpu: normalizedMetrics.cpuUsage.toString(),
        memory: normalizedMetrics.memoryUsage.toString(),
        timestamp: normalizedMetrics.timestamp.toString()
      });

    } catch (error) {
      console.error('[METRICS] Error processing message:', error);
    }
  });

  console.log('Subscribed to metrics.raw');

  app.listen(port, () => {
    console.log(`Metrics Service health check listening on port ${port}`);
  });
}

start().catch(console.error);
