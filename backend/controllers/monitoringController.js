const { getMonitoringSnapshot, registerServer, addMetrics, addLogs, updateHeartbeat } = require("../services/monitoringService");

const getMockMetrics = (req, res) => {
  res.json(getMonitoringSnapshot());
};

const registerAgent = (req, res) => {
  const { hostname } = req.body;
  if (!hostname) {
    return res.status(400).json({ error: "Hostname is required" });
  }
  const token = registerServer(hostname);
  res.json({ token, message: "Agent registered successfully" });
};

const submitMetrics = (req, res) => {
  const token = req.headers["x-agent-token"];
  if (!token) {
    return res.status(401).json({ error: "Agent token required" });
  }
  const success = addMetrics(token, req.body);
  if (!success) {
    return res.status(401).json({ error: "Invalid agent token" });
  }
  res.json({ message: "Metrics received" });
};

const submitLogs = (req, res) => {
  const token = req.headers["x-agent-token"];
  if (!token) {
    return res.status(401).json({ error: "Agent token required" });
  }
  const success = addLogs(token, req.body);
  if (!success) {
    return res.status(401).json({ error: "Invalid agent token" });
  }
  res.json({ message: "Logs received" });
};

const submitHeartbeat = (req, res) => {
  const token = req.headers["x-agent-token"];
  if (!token) {
    return res.status(401).json({ error: "Agent token required" });
  }
  const success = updateHeartbeat(token);
  if (!success) {
    return res.status(401).json({ error: "Invalid agent token" });
  }
  res.json({ message: "Heartbeat received" });
};

module.exports = {
  getMockMetrics,
  registerAgent,
  submitMetrics,
  submitLogs,
  submitHeartbeat
};
