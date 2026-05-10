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

  console.log(`Incident Correlation Engine connected to Redis at ${redisHost}:${redisPort}`);

  await subscriber.subscribe('alert.triggered', async (message) => {
    try {
      const alert = JSON.parse(message);
      const { token, type, timestamp } = alert;

      const incidentKey = `active_incident:${token}`;
      
      // Check if there is an active incident for this host
      const existingIncident = await redis.get(incidentKey);

      if (existingIncident) {
        const incident = JSON.parse(existingIncident);
        incident.alerts.push(alert);
        incident.updatedAt = Date.now();
        
        console.log(`[CORRELATION] Appending alert to existing incident for ${token}`);
        
        await redis.set(incidentKey, JSON.stringify(incident), { EX: 300 }); // Reset TTL to 5 mins
        
        // Emit update event if needed
      } else {
        // Create new incident
        const incident = {
          id: `inc_${timestamp}`,
          token,
          alerts: [alert],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: 'open'
        };

        console.log(`[CORRELATION] Creating new incident for ${token}`);
        
        await redis.set(incidentKey, JSON.stringify(incident), { EX: 300 }); // 5 mins TTL
        
        // Emit incident.created
        await publisher.publish('incident.created', JSON.stringify(incident));
      }

    } catch (error) {
      console.error('[CORRELATION] Error processing message:', error);
    }
  });

  console.log('Subscribed to alert.triggered');
}

start().catch(console.error);
