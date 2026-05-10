import express from 'express';
import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5002;
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';

app.use(express.json());

const redisClient = createClient({
  url: `redis://${redisHost}:${redisPort}`
});

let isReady = false;

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
  isReady = false;
});

redisClient.on('ready', () => {
  console.log('Redis Client Ready');
  isReady = true;
});

app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'infrastructure-registry',
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
  await redisClient.connect();
  console.log(`Infrastructure Registry connected to Redis at ${redisHost}:${redisPort}`);

  // Endpoint for agent registration
  app.post('/register', async (req, res) => {
    const { hostname, os, ip, environment, tags } = req.body;
    
    if (!hostname) {
      return res.status(400).json({ success: false, message: 'Hostname is required' });
    }

    const token = uuidv4();
    const agentData = {
      token,
      hostname,
      os,
      ip,
      environment: environment || 'Production',
      tags: JSON.stringify(tags || []),
      status: 'online',
      lastHeartbeat: Date.now()
    };

    // Store agent data in Redis
    await redisClient.hSet(`agent:${token}`, agentData);
    // Also store by hostname for easy lookup
    await redisClient.set(`agent_token:${hostname}`, token);

    console.log(`[REGISTRY] Registered agent: ${hostname} with token: ${token}`);

    // Emit event
    await redisClient.publish('agent.registered', JSON.stringify({ token, hostname }));

    res.json({ success: true, token });
  });

  // Endpoint for heartbeat
  app.post('/heartbeat', async (req, res) => {
    const token = req.headers['x-agent-token'] as string;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token required' });
    }

    const agentExists = await redisClient.exists(`agent:${token}`);
    if (!agentExists) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    await redisClient.hSet(`agent:${token}`, 'lastHeartbeat', Date.now());
    await redisClient.hSet(`agent:${token}`, 'status', 'online');

    console.log(`[REGISTRY] Heartbeat received from agent token: ${token}`);

    res.json({ success: true });
  });

  // Background job to check for offline nodes
  setInterval(async () => {
    const keys = await redisClient.keys('agent:*');
    const now = Date.now();
    
    for (const key of keys) {
      const agent = await redisClient.hGetAll(key);
      const lastHeartbeat = parseInt(agent.lastHeartbeat);
      
      if (now - lastHeartbeat > 30000 && agent.status === 'online') { // 30 seconds timeout
        await redisClient.hSet(key, 'status', 'offline');
        console.log(`[REGISTRY] Agent ${agent.hostname} is offline.`);
        
        // Emit node.offline event
        await redisClient.publish('node.offline', JSON.stringify({ 
          token: agent.token, 
          hostname: agent.hostname 
        }));
      }
    }
  }, 10000); // Check every 10 seconds

  // Background job to check for service health
  const services = [
    { name: 'metrics-service', url: 'http://metrics-service:5003/health' },
    { name: 'alert-engine', url: 'http://alert-engine:5004/health' },
    { name: 'ai-analysis', url: 'http://ai-analysis:5005/health' },
    { name: 'websocket-gateway', url: 'http://websocket-gateway:3001/health' },
    { name: 'infrastructure-registry', url: 'http://localhost:5002/health' } // Check self
  ];

  setInterval(async () => {
    for (const service of services) {
      try {
        const response = await fetch(service.url);
        if (response.ok) {
          const data = await response.json();
          await redisClient.hSet(`service_health:${service.name}`, {
            status: data.status,
            redis: data.redis,
            timestamp: data.timestamp
          });
        } else {
          await redisClient.hSet(`service_health:${service.name}`, {
            status: 'DOWN',
            redis: 'unknown',
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        await redisClient.hSet(`service_health:${service.name}`, {
          status: 'DOWN',
          redis: 'disconnected',
          timestamp: new Date().toISOString()
        });
      }
    }
    console.log('[REGISTRY] Polled service health');
  }, 15000); // Check every 15 seconds

  app.listen(port, () => {
    console.log(`Infrastructure Registry listening on port ${port}`);
  });
}

start().catch(console.error);
