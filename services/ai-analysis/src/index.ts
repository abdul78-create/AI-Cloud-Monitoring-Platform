import express from 'express';
import { createClient } from 'redis';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5005;

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';
const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';

let isReady = false;

const subscriber = createClient({ url: `redis://${redisHost}:${redisPort}` });
const publisher = createClient({ url: `redis://${redisHost}:${redisPort}` });

subscriber.on('error', (err) => {
  console.error('[AI] Redis Subscriber Error', err);
  isReady = false;
});
publisher.on('error', (err) => {
  console.error('[AI] Redis Publisher Error', err);
  isReady = false;
});

subscriber.on('ready', () => {
  console.log('[AI] Redis Subscriber Ready');
  isReady = true;
});

app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'ai-analysis',
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

  console.log(`AI Analysis Service connected to Redis at ${redisHost}:${redisPort}`);
  console.log(`Using Ollama at ${ollamaHost}`);

  await subscriber.subscribe('alert.triggered', async (message) => {
    try {
      const alert = JSON.parse(message);
      console.log(`[AI] Analyzing alert: ${alert.type} for ${alert.token}`);

      // Call Ollama
      const prompt = `You are an expert site reliability engineer. Analyze this alert:
Type: ${alert.type}
Message: ${alert.message}
Severity: ${alert.severity}
Host Token: ${alert.token}

Provide a short root cause analysis and a recommendation in 2-3 lines.`;

      try {
        const response = await fetch(`${ollamaHost}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama3',
            prompt: prompt,
            stream: false
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`[AI] Analysis Result:\n${data.response}`);

          // Emit event
          await publisher.publish('ai.analysis.completed', JSON.stringify({
            alertId: alert.timestamp, // Using timestamp as ID for now
            analysis: data.response,
            timestamp: Date.now()
          }));
        } else {
          console.error(`[AI] Ollama returned status ${response.status}`);
          // Fallback analysis if Ollama is not running
          const fallback = `Fallback Analysis: The alert ${alert.type} on host ${alert.token} indicates potential resource exhaustion. Recommend checking running processes.`;
          await publisher.publish('ai.analysis.completed', JSON.stringify({
            alertId: alert.timestamp,
            analysis: fallback,
            timestamp: Date.now()
          }));
        }
      } catch (ollamaError: any) {
        console.error('[AI] Error calling Ollama:', ollamaError.message);
        // Fallback
        const fallback = `Fallback Analysis: Could not reach AI engine. The alert ${alert.type} suggests checking system load.`;
        await publisher.publish('ai.analysis.completed', JSON.stringify({
          alertId: alert.timestamp,
          analysis: fallback,
          timestamp: Date.now()
        }));
      }

    } catch (error) {
      console.error('[AI] Error processing message:', error);
    }
  });

  console.log('Subscribed to alert.triggered');

  app.listen(port, () => {
    console.log(`AI Analysis Service health check listening on port ${port}`);
  });
}

start().catch(console.error);
