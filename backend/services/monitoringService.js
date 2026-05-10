const crypto = require("crypto");

// In-memory store
const servers = new Map(); // token -> serverInfo
const metrics = new Map(); // token -> array of metrics
const logs = new Map(); // token -> array of logs

const registerServer = (hostname) => {
  const token = crypto.randomBytes(16).toString("hex");
  servers.set(token, {
    hostname,
    status: "online",
    lastHeartbeat: new Date(),
    registeredAt: new Date(),
  });
  metrics.set(token, []);
  logs.set(token, []);
  return token;
};

const addMetrics = (token, data) => {
  if (!servers.has(token)) return false;
  servers.get(token).lastHeartbeat = new Date();
  servers.get(token).status = "online";
  
  const serverMetrics = metrics.get(token);
  serverMetrics.push({ ...data, timestamp: new Date() });
  
  // Keep last 100 entries
  if (serverMetrics.length > 100) {
    serverMetrics.shift();
  }
  return true;
};

const addLogs = (token, data) => {
  if (!servers.has(token)) return false;
  const serverLogs = logs.get(token);
  serverLogs.push({ ...data, timestamp: new Date() });
  
  // Keep last 100 entries
  if (serverLogs.length > 100) {
    serverLogs.shift();
  }
  return true;
};

const updateHeartbeat = (token) => {
  if (!servers.has(token)) return false;
  servers.get(token).lastHeartbeat = new Date();
  servers.get(token).status = "online";
  return true;
};

// Check for offline servers (no heartbeat for 15 seconds)
setInterval(() => {
  const now = new Date();
  servers.forEach((info, token) => {
    if (now - info.lastHeartbeat > 15000) {
      info.status = "offline";
    }
  });
}, 5000);

const getMonitoringSnapshot = () => {
  // If we have real data, return it. Otherwise return mock data.
  if (servers.size > 0) {
    const serverList = Array.from(servers.values());
    const allMetrics = Array.from(metrics.values()).flat();
    
    // Calculate average CPU/Mem from real metrics if available
    const latestMetrics = Array.from(metrics.values()).map(arr => arr[arr.length - 1]).filter(Boolean);
    const avgCpu = latestMetrics.reduce((acc, m) => acc + m.cpuUsage, 0) / (latestMetrics.length || 1);
    const avgMem = latestMetrics.reduce((acc, m) => acc + m.memoryUsage, 0) / (latestMetrics.length || 1);

    return {
      timestamp: new Date().toISOString(),
      cpuUsage: Math.round(avgCpu) || 45,
      memoryUsage: Math.round(avgMem) || 60,
      networkTraffic: 500, // Hardcoded for now
      serverStatus: serverList.map(s => ({ id: s.hostname, status: s.status })),
      alerts: [
        ...serverList.filter(s => s.status === "offline").map(s => ({ type: "critical", message: `Server ${s.hostname} is offline.` }))
      ]
    };
  }

  // Fallback to mock data
  const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
  return {
    timestamp: new Date().toISOString(),
    cpuUsage: randomRange(20, 95),
    memoryUsage: randomRange(35, 92),
    networkTraffic: randomRange(120, 950),
    serverStatus: [
      { id: "compute-node-1", status: "healthy" },
      { id: "compute-node-2", status: "healthy" },
      { id: "compute-node-3", status: randomRange(1, 10) > 7 ? "degraded" : "healthy" }
    ],
    alerts: [
      { type: "warning", message: "Network latency increased in one region." },
      { type: "critical", message: "CPU usage above threshold on compute-node-3." }
    ]
  };
};

module.exports = {
  registerServer,
  addMetrics,
  addLogs,
  updateHeartbeat,
  getMonitoringSnapshot,
  servers,
  metrics,
  logs
};
