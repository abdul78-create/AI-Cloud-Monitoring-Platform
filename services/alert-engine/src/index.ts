import express from 'express';
import { createClient } from 'redis';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5004;

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';

let isReady = false;

// In-memory state for cooldowns (should ideally be in Redis for distributed, but simple for now)
const cooldowns = new Map<string, number>();
const COOLDOWN_PERIOD = 60000; // 1 minute

const subscriber = createClient({ url: `redis://${redisHost}:${redisPort}` });
const publisher = createClient({ url: `redis://${redisHost}:${redisPort}` });

subscriber.on('error', (err) => {
  console.error('[ALERT] Redis Subscriber Error', err);
  isReady = false;
});
publisher.on('error', (err) => {
  console.error('[ALERT] Redis Publisher Error', err);
  isReady = false;
});

subscriber.on('ready', () => {
  console.log('[ALERT] Redis Subscriber Ready');
  isReady = true;
});

app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'alert-engine',
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

  console.log(`Alert Engine connected to Redis at ${redisHost}:${redisPort}`);

  await subscriber.subscribe('metrics.received', async (message) => {
    try {
      const data = JSON.parse(message);
      const { token, metrics } = data;

      // Threshold Evaluation
      if (metrics.memoryUsage > 90) {
        const alertKey = `${token}:HIGH_MEMORY`;
        const now = Date.now();

        // Cooldown / Suppression
        const lastAlertTime = cooldowns.get(alertKey);
        if (lastAlertTime && (now - lastAlertTime < COOLDOWN_PERIOD)) {
          console.log(`[ALERT] Suppressed alert for ${token} (cooldown)`);
          return;
        }

        console.log(`[ALERT] High Memory detected for token ${token}: ${metrics.memoryUsage}%`);
        
        cooldowns.set(alertKey, now);

        const alertEvent = {
          type: 'HIGH_MEMORY',
          severity: 'warning',
          message: `High Memory usage detected: ${metrics.memoryUsage}%`,
          token,
          timestamp: now
        };

        // Emit alert.triggered
        await publisher.publish('alert.triggered', JSON.stringify(alertEvent));
      }

      if (metrics.cpuUsage > 85) {
        const alertKey = `${token}:HIGH_CPU`;
        const now = Date.now();
        const lastAlertTime = cooldowns.get(alertKey);
        
        if (lastAlertTime && (now - lastAlertTime < COOLDOWN_PERIOD)) {
          return;
        }

        cooldowns.set(alertKey, now);

        await publisher.publish('alert.triggered', JSON.stringify({
          type: 'HIGH_CPU',
          severity: 'critical',
          message: `High CPU usage detected: ${metrics.cpuUsage}%`,
          token,
          timestamp: now
        }));
      }

    } catch (error) {
      console.error('[ALERT] Error processing message:', error);
    }
  });

  console.log('Subscribed to metrics.received');

  app.listen(port, () => {
    console.log(`Alert Engine health check listening on port ${port}`);
  });
}

start().catch(console.error);
