const os = require("os");

const BACKEND_URL = "http://localhost:5000/api/monitoring";
let AGENT_TOKEN = null;
const HOSTNAME = os.hostname();

// Helper to get CPU usage
const getCpuUsage = () => {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;
  
  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });
  
  // This is a simple snapshot, for real usage we need to compare two snapshots.
  // But for this lightweight agent, we will just return a reasonable value based on loadavg or random variation.
  const load = os.loadavg()[0];
  const cpuCount = cpus.length;
  const usage = Math.min(100, Math.round((load / cpuCount) * 100)) || Math.floor(Math.random() * 30) + 10;
  return usage;
};

// Helper to get Memory usage
const getMemoryUsage = () => {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  return Math.round((used / total) * 100);
};

// Register the agent
const register = async () => {
  try {
    console.log(`Registering agent for hostname: ${HOSTNAME}...`);
    const res = await fetch(`${BACKEND_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hostname: HOSTNAME,
        os: os.type(),
        ip: "192.168.1." + Math.floor(Math.random() * 255),
        environment: "Production",
        tags: ["backend", "api"]
      }),
    });
    
    const data = await res.json();
    if (data.token) {
      AGENT_TOKEN = data.token;
      console.log(`Agent registered successfully. Token: ${AGENT_TOKEN}`);
      return true;
    }
    console.error("Failed to get token from backend", data);
    return false;
  } catch (error) {
    console.error("Error registering agent:", error.message);
    return false;
  }
};

// Send metrics
const sendMetrics = async () => {
  if (!AGENT_TOKEN) return;
  
  const metrics = {
    cpuUsage: getCpuUsage(),
    memoryUsage: getMemoryUsage(),
    diskUsage: Math.floor(Math.random() * 20) + 40, // Simulated
    networkTrafficMbps: Math.floor(Math.random() * 100) + 10, // Simulated
  };
  
  try {
    const res = await fetch(`${BACKEND_URL}/metrics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-agent-token": AGENT_TOKEN,
      },
      body: JSON.stringify(metrics),
    });
    
    if (res.status === 401) {
      console.log("Token expired or invalid. Re-registering...");
      await register();
    } else {
      console.log(`[${new Date().toLocaleTimeString()}] Metrics sent: CPU ${metrics.cpuUsage}%, Mem ${metrics.memoryUsage}%`);
    }
  } catch (error) {
    console.error("Error sending metrics:", error.message);
  }
};

// Send logs
const sendLogs = async () => {
  if (!AGENT_TOKEN) return;
  
  const log = {
    level: Math.random() > 0.8 ? "error" : "info",
    message: Math.random() > 0.8 ? "Connection timeout on port 80" : "Health check passed",
  };
  
  try {
    await fetch(`${BACKEND_URL}/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-agent-token": AGENT_TOKEN,
      },
      body: JSON.stringify(log),
    });
    console.log(`[${new Date().toLocaleTimeString()}] Log sent: ${log.level.toUpperCase()}`);
  } catch (error) {
    console.error("Error sending logs:", error.message);
  }
};

// Send heartbeat
const sendHeartbeat = async () => {
  if (!AGENT_TOKEN) return;
  
  try {
    await fetch(`${BACKEND_URL}/heartbeat`, {
      method: "POST",
      headers: { "x-agent-token": AGENT_TOKEN },
    });
  } catch (error) {
    console.error("Error sending heartbeat:", error.message);
  }
};

// Main loop
const start = async () => {
  const registered = await register();
  if (!registered) {
    console.log("Retrying registration in 10 seconds...");
    setTimeout(start, 10000);
    return;
  }
  
  // Send metrics every 5 seconds
  setInterval(sendMetrics, 5000);
  
  // Send logs every 7 seconds
  setInterval(sendLogs, 7000);
  
  // Send heartbeat every 10 seconds
  setInterval(sendHeartbeat, 10000);
  
  console.log("Agent started. Press Ctrl+C to stop.");
};

start();
