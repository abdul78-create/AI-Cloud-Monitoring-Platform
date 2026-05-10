import { Worker, Job } from 'bullmq';
import * as dotenv from 'dotenv';

dotenv.config();

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379');

async function start() {
  console.log(`Log Processing Worker starting. Connecting to Redis at ${redisHost}:${redisPort}`);

  const worker = new Worker('logs', async (job: Job) => {
    console.log(`[WORKER] Processing log job ${job.id}`);
    const { level, message, token } = job.data;

    // Simulate processing
    console.log(`[WORKER] Parsed log: [${level.toUpperCase()}] from ${token}: ${message}`);

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 500));

    if (level === 'error') {
      console.log(`[WORKER] Error log detected, creating incident or alert...`);
      // Here we could publish an event to Redis
    }

    return { processed: true };
  }, {
    connection: {
      host: redisHost,
      port: redisPort
    },
    concurrency: 5 // Process 5 logs concurrently
  });

  worker.on('completed', (job) => {
    console.log(`[WORKER] Job ${job.id} completed!`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[WORKER] Job ${job?.id} failed with error:`, err);
    // BullMQ handles retries based on queue configuration
  });

  console.log('Log Worker is ready and waiting for jobs.');
}

start().catch(console.error);
