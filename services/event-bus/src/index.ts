import { createClient } from 'redis';
import * as dotenv from 'dotenv';

dotenv.config();

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';

async function start() {
  const subscriber = createClient({
    url: `redis://${redisHost}:${redisPort}`
  });

  subscriber.on('error', (err) => console.error('Redis Subscriber Error', err));

  await subscriber.connect();

  console.log(`Event Bus Service connected to Redis at ${redisHost}:${redisPort}`);

  // Subscribe to all channels
  await subscriber.pSubscribe('*', (message, channel) => {
    console.log(`[EVENT RECEIVED] Channel: ${channel} | Message:`, message);
    
    // Here we could persist the event to a database for replay
    // or forward it to an analytics engine
  });

  console.log('Subscribed to all channels (*)');
}

start().catch(console.error);
