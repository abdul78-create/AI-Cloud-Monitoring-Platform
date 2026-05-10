import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all for simplicity, or specify frontend URL
    methods: ['GET', 'POST']
  }
});

const port = process.env.PORT || 3001;
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';

let isReady = false;

app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'websocket-gateway',
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
  const subscriber = createClient({ url: `redis://${redisHost}:${redisPort}` });
  
  subscriber.on('error', (err) => {
    console.error('[WS] Redis Subscriber Error', err);
    isReady = false;
  });
  
  subscriber.on('ready', () => {
    console.log('[WS] Redis Subscriber Ready');
    isReady = true;
  });

  await subscriber.connect();
  console.log(`WebSocket Gateway connected to Redis at ${redisHost}:${redisPort}`);

  io.on('connection', (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
      console.log(`[WS] Client disconnected: ${socket.id}`);
    });
  });

  // Subscribe to Redis channels and broadcast to WS clients
  const channels = ['metrics.received', 'alert.triggered', 'incident.created', 'node.offline', 'ai.analysis.completed'];
  
  for (const channel of channels) {
    await subscriber.subscribe(channel, (message) => {
      console.log(`[WS] Broadcasting event from channel ${channel}`);
      io.emit(channel, JSON.parse(message));
    });
  }

  httpServer.listen(port, () => {
    console.log(`WebSocket Gateway listening on port ${port}`);
  });
}

start().catch(console.error);
