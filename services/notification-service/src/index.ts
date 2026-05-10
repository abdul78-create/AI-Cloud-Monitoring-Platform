import { createClient } from 'redis';
import * as dotenv from 'dotenv';

dotenv.config();

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';

async function start() {
  const subscriber = createClient({ url: `redis://${redisHost}:${redisPort}` });

  await subscriber.connect();

  console.log(`Notification Service connected to Redis at ${redisHost}:${redisPort}`);

  const handleNotification = async (channel: string, message: string) => {
    try {
      const data = JSON.parse(message);
      console.log(`[NOTIFICATION] Received event on channel ${channel}`);

      // Simulate different channels
      console.log(`[SLACK] Sending alert to #ops channel: ${data.message || 'Incident created'}`);
      console.log(`[EMAIL] Sending email to admin@example.com: ${data.message || 'Incident created'}`);
      console.log(`[DISCORD] Sending webhook: ${data.message || 'Incident created'}`);

    } catch (error) {
      console.error('[NOTIFICATION] Error processing message:', error);
    }
  };

  await subscriber.subscribe('alert.triggered', (message) => handleNotification('alert.triggered', message));
  await subscriber.subscribe('incident.created', (message) => handleNotification('incident.created', message));

  console.log('Subscribed to alert.triggered and incident.created');
}

start().catch(console.error);
