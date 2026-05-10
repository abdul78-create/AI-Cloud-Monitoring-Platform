import { generateAlerts, generateAnalytics, generateInfrastructure, generateMetrics } from "../mock/monitoringEngine";
import crypto from "crypto";
import { alertService } from "./alertService";
import { io } from "../server";

// In-memory store
const servers = new Map<string, any>(); // token -> serverInfo
const metrics = new Map<string, any[]>(); // token -> array of metrics
const logs = new Map<string, any[]>(); // token -> array of logs

export const monitoringService = {
  getMetrics() {
    // If we have real data, return the history for charts.
    if (servers.size > 0) {
      const firstServerToken = Array.from(servers.keys())[0];
      const serverMetrics = metrics.get(firstServerToken);
      if (serverMetrics && serverMetrics.length > 0) {
        return serverMetrics.map(m => ({
          timestamp: m.timestamp,
          cpuUsage: m.cpuUsage,
          memoryUsage: m.memoryUsage,
          networkTraffic: m.networkTrafficMbps || 0, // Fallback
        }));
      }
    }
    return generateMetrics();
  },
  getInfrastructure() {
    if (servers.size > 0) {
      return Array.from(servers.values()).map(s => ({
        service: s.hostname,
        status: s.status,
        os: s.os,
        ip: s.ip,
        environment: s.environment,
        tags: s.tags,
        uptimePercent: 100,
        responseTimeMs: 10,
      }));
    }
    return generateInfrastructure();
  },
  getAlerts() {
    return generateAlerts();
  },
  getAnalytics() {
    const metrics = generateMetrics();
    return generateAnalytics(metrics);
  },
  
  // Agent methods
  registerServer(data: any): string {
    const token = crypto.randomBytes(16).toString("hex");
    servers.set(token, {
      hostname: data.hostname,
      os: data.os || "Unknown",
      ip: data.ip || "0.0.0.0",
      environment: data.environment || "Development",
      tags: data.tags || [],
      status: "online",
      lastHeartbeat: new Date(),
      registeredAt: new Date(),
    });
    metrics.set(token, []);
    logs.set(token, []);
    
    // Emit infrastructure change via socket
    io.emit("infrastructure", Array.from(servers.values()));
    
    return token;
  },
  
  addMetrics(token: string, data: any): boolean {
    if (!servers.has(token)) return false;
    servers.get(token).lastHeartbeat = new Date();
    servers.get(token).status = "online";
    
    const serverMetrics = metrics.get(token);
    if (serverMetrics) {
      serverMetrics.push({ ...data, timestamp: new Date() });
      if (serverMetrics.length > 100) serverMetrics.shift();
      
      // Check alerts
      alertService.checkMetrics(servers.get(token).hostname, data);
      
      // Emit metrics via socket
      io.emit("metrics", { hostname: servers.get(token).hostname, ...data });
    }
    return true;
  },
  
  addLogs(token: string, data: any): boolean {
    if (!servers.has(token)) return false;
    const serverLogs = logs.get(token);
    if (serverLogs) {
      serverLogs.push({ ...data, timestamp: new Date() });
      if (serverLogs.length > 100) serverLogs.shift();
    }
    return true;
  },
  
  updateHeartbeat(token: string): boolean {
    if (!servers.has(token)) return false;
    servers.get(token).lastHeartbeat = new Date();
    servers.get(token).status = "online";
    return true;
  }
};

// Check for offline servers (no heartbeat for 15 seconds)
setInterval(() => {
  const now = new Date();
  let changed = false;
  servers.forEach((info, token) => {
    if (info.status === "online" && now.getTime() - info.lastHeartbeat.getTime() > 15000) {
      info.status = "offline";
      changed = true;
    }
  });
  
  if (changed) {
    io.emit("infrastructure", Array.from(servers.values()));
  }
}, 5000);
