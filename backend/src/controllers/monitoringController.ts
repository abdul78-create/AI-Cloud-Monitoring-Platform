import { Request, Response } from 'express';
import { createClient } from 'redis';
import { Queue } from 'bullmq';
import axios from 'axios';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';

// Initialize Redis Client for Pub/Sub
const redisClient = createClient({ url: `redis://${redisHost}:${redisPort}` });
redisClient.connect().catch(console.error);

// Initialize BullMQ Queue for Logs
const logQueue = new Queue('logs', {
  connection: {
    host: redisHost,
    port: parseInt(redisPort)
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
    // In a real system, we would query a time-series DB or the metrics service.
    // Here we can read the latest metrics from Redis.
    try {
      const keys = await redisClient.keys('latest_metrics:*');
      const metrics: any[] = [];
      
      for (const key of keys) {
        const data = await redisClient.hGetAll(key);
        const token = key.split(':')[1];
        metrics.push({ token, ...data });
      }
      
      res.json({ success: true, data: metrics });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching metrics' });
    }
  },

  getInfrastructure: async (req: Request, res: Response) => {
    try {
      const keys = await redisClient.keys('agent:*');
      const agents: any[] = [];
      
      for (const key of keys) {
        const data = await redisClient.hGetAll(key);
        agents.push(data);
      }
      
      res.json({ success: true, data: agents });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching infrastructure' });
    }
  },

  getServiceHealth: async (req: Request, res: Response) => {
    try {
      const keys = await redisClient.keys('service_health:*');
      const services: any[] = [];
      
      for (const key of keys) {
        const data = await redisClient.hGetAll(key);
        const name = key.split(':')[1];
        services.push({ name, ...data });
      }
      
      res.json({ success: true, data: services });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching service health' });
    }
  },

  getAlerts: async (req: Request, res: Response) => {
    // Fetch active alerts or incidents
    res.json({ success: true, message: 'Use WebSockets for real-time alerts or implement alert storage fetch here.' });
  },

  getAnalytics: async (req: Request, res: Response) => {
    try {
      const keys = await redisClient.keys('analytics:*');
      const analytics: any[] = [];
      
      for (const key of keys) {
        const data = await redisClient.hGetAll(key);
        const token = key.split(':')[1];
        analytics.push({ token, ...data });
      }
      
      res.json({ success: true, data: analytics });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching analytics' });
    }
  },

  getQueueMetrics: async (req: Request, res: Response) => {
    res.json({ success: true, data: { queueLength: 0 } }); // Mock
  },

  analyzeRootCause: async (req: Request, res: Response) => {
    res.json({ success: true, message: 'AI Analysis is triggered by events. Check event stream.' });
  }
};
