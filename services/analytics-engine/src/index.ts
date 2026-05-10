import { createClient } from 'redis';
import * as dotenv from 'dotenv';

dotenv.config();

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';

async function start() {
  const subscriber = createClient({ url: `redis://${redisHost}:${redisPort}` });
  const publisher = createClient({ url: `redis://${redisHost}:${redisPort}` });
  const redis = createClient({ url: `redis://${redisHost}:${redisPort}` });

  await subscriber.connect();
  await publisher.connect();
  await redis.connect();

  console.log(`Analytics Engine connected to Redis at ${redisHost}:${redisPort}`);

  await subscriber.subscribe('metrics.received', async (message) => {
    try {
      const data = JSON.parse(message);
      const { token, metrics } = data;

      // Calculate simple infrastructure score (100 - average of CPU and Mem)
      const avgUsage = (metrics.cpuUsage + metrics.memoryUsage) / 2;
      const score = Math.max(0, 100 - avgUsage);

      console.log(`[ANALYTICS] Calculated score for ${token}: ${score.toFixed(2)}`);

      // Store in Redis
      await redis.hSet(`analytics:${token}`, {
        score: score.toString(),
        timestamp: Date.now().toString()
      });

      // Emit analytics.updated
      await publisher.publish('analytics.updated', JSON.stringify({
        token,
        score,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error('[ANALYTICS] Error processing message:', error);
    }
  });

  console.log('Subscribed to metrics.received');
}

start().catch(console.error);
