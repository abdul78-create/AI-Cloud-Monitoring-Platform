import { Request, Response } from 'express';
import { createClient } from 'redis';
import { Queue } from 'bullmq';
import axios from 'axios';

// Initialize Redis Client for Pub/Sub
const redisClient = createClient({ 
  url: process.env.REDIS_URL || 'redis://localhost:6379' 
});
redisClient.connect().catch((err) => {
  if (err?.message?.includes('ECONNREFUSED')) {
    // console.warn('[Redis] Connection refused (fallback mode active)');
  } else {
    console.error(err);
  }
});

// Initialize BullMQ Queue for Logs
const logQueue = new Queue('logs', {
  connection: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  }
});

logQueue.on('error', (err) => {
  if (!err.message.includes('ECONNREFUSED')) {
    console.warn('[BullMQ] Queue error:', err.message);
  }
});

const INFRASTRUCTURE_REGISTRY_URL = process.env.INFRASTRUCTURE_REGISTRY_URL || 'http://localhost:5002';

export const monitoringController = {
  // Agent endpoints (POST)
  
  submitMetrics: async (req: Request, res: Response) => {
    const token = req.headers['x-agent-token'] as string;
    const metrics = req.body;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token required' });
    }

    try {
      // Publish to event bus
      await redisClient.publish('metrics.raw', JSON.stringify({ token, metrics }));
      res.json({ success: true, message: 'Metrics queued' });
    } catch (error) {
      console.error('Error publishing metrics:', error);
      res.status(500).json({ success: false, message: 'Internal error' });
    }
  },

  submitLogs: async (req: Request, res: Response) => {
    const token = req.headers['x-agent-token'] as string;
    const log = req.body;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token required' });
    }

    try {
      // Add to BullMQ
      await logQueue.add('process_log', { ...log, token });
      res.json({ success: true, message: 'Log queued' });
    } catch (error) {
      console.error('Error queueing log:', error);
      res.status(500).json({ success: false, message: 'Internal error' });
    }
  },

  submitHeartbeat: async (req: Request, res: Response) => {
    const token = req.headers['x-agent-token'] as string;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token required' });
    }

    try {
      // Forward to Infrastructure Registry
      const response = await axios.post(`${INFRASTRUCTURE_REGISTRY_URL}/heartbeat`, {}, {
        headers: { 'x-agent-token': token }
      });
      res.json(response.data);
    } catch (error) {
      console.error('Error forwarding heartbeat:', error instanceof Error ? error.message : error);
      res.status(500).json({ success: false, message: 'Infrastructure Registry unreachable' });
    }
  },

  registerAgent: async (req: Request, res: Response) => {
    try {
      // Forward to Infrastructure Registry
      const response = await axios.post(`${INFRASTRUCTURE_REGISTRY_URL}/register`, req.body);
      res.json(response.data);
    } catch (error) {
      console.error('Error forwarding registration:', error instanceof Error ? error.message : error);
      res.status(500).json({ success: false, message: 'Infrastructure Registry unreachable' });
    }
  },

  // Frontend endpoints (GET) - Fetch from Redis or specific services
  
  getMetrics: async (req: Request, res: Response) => {
    try {
      if (!redisClient.isReady) {
        throw new Error('Redis client is not ready');
      }
      const keys = await redisClient.keys('latest_metrics:*');
      const metrics: any[] = [];
      
      for (const key of keys) {
        const data = await redisClient.hGetAll(key);
        const token = key.split(':')[1];
        metrics.push({ token, ...data });
      }
      
      res.json({ success: true, data: metrics });
    } catch (error) {
      console.warn('[Redis] getMetrics failed or not ready, using fallback data:', error instanceof Error ? error.message : error);
      res.json({ 
        success: true, 
        data: [
          { token: 'agent-aws-east', cpu: 32, memory: 58, networkTrafficMbps: 145 },
          { token: 'agent-gcp-west', cpu: 24, memory: 42, networkTrafficMbps: 89 }
        ],
        fallback: true
      });
    }
  },

  getInfrastructure: async (req: Request, res: Response) => {
    try {
      if (!redisClient.isReady) {
        throw new Error('Redis client is not ready');
      }
      const keys = await redisClient.keys('agent:*');
      const agents: any[] = [];
      
      for (const key of keys) {
        const data = await redisClient.hGetAll(key);
        agents.push(data);
      }
      
      res.json({ success: true, data: agents });
    } catch (error) {
      console.warn('[Redis] getInfrastructure failed or not ready, using fallback data:', error instanceof Error ? error.message : error);
      res.json({ 
        success: true, 
        data: [
          { service: 'aws-east-1', name: 'aws-east-1', status: 'online', region: 'us-east-1', type: 't3.medium', token: 'agent-aws-east' },
          { service: 'gcp-west-2', name: 'gcp-west-2', status: 'online', region: 'us-west-2', type: 'n2-standard-2', token: 'agent-gcp-west' }
        ],
        fallback: true
      });
    }
  },

  getServiceHealth: async (req: Request, res: Response) => {
    try {
      if (!redisClient.isReady) {
        throw new Error('Redis client is not ready');
      }
      const keys = await redisClient.keys('service_health:*');
      const services: any[] = [];
      
      for (const key of keys) {
        const data = await redisClient.hGetAll(key);
        const name = key.split(':')[1];
        services.push({ name, ...data });
      }
      
      res.json({ success: true, data: services });
    } catch (error) {
      console.warn('[Redis] getServiceHealth failed or not ready, using fallback data:', error instanceof Error ? error.message : error);
      res.json({ 
        success: true, 
        data: [
          { name: 'api-gateway', status: 'UP', redis: 'connected' },
          { name: 'metrics-service', status: 'UP', redis: 'connected' },
          { name: 'alert-engine', status: 'UP', redis: 'connected' },
          { name: 'ai-analysis', status: 'UP', redis: 'connected' }
        ],
        fallback: true
      });
    }
  },

  getAlerts: async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Use WebSockets for real-time alerts or implement alert storage fetch here.' });
  },

  getAnalytics: async (req: Request, res: Response) => {
    try {
      if (!redisClient.isReady) {
        throw new Error('Redis client is not ready');
      }
      const keys = await redisClient.keys('analytics:*');
      const analytics: any[] = [];
      
      for (const key of keys) {
        const data = await redisClient.hGetAll(key);
        const token = key.split(':')[1];
        analytics.push({ token, ...data });
      }
      
      res.json({ success: true, data: analytics });
    } catch (error) {
      console.warn('[Redis] getAnalytics failed or not ready, using fallback data:', error instanceof Error ? error.message : error);
      res.json({ 
        success: true, 
        data: [
          { token: 'agent-aws-east', anomalies: 0, uptime: '99.9%', errorRate: '0.1%' },
          { token: 'agent-gcp-west', anomalies: 1, uptime: '99.5%', errorRate: '0.3%' }
        ],
        fallback: true
      });
    }
  },

  getQueueMetrics: async (req: Request, res: Response) => {
    res.json({ success: true, data: { queueLength: 0 } }); // Mock
  },

  analyzeRootCause: async (req: Request, res: Response) => {
    res.json({ success: true, message: 'AI Analysis is triggered by events. Check event stream.' });
  }
};
