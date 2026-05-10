import { io } from "../server";

// Alert Service

type AlertRule = {
  id: string;
  metric: "cpuUsage" | "memoryUsage" | "diskUsage";
  threshold: number;
  condition: "gt" | "lt";
  severity: "critical" | "warning" | "info";
  channels: ("email" | "slack" | "discord")[];
};

const rules: AlertRule[] = [
  { id: "cpu-high", metric: "cpuUsage", threshold: 80, condition: "gt", severity: "critical", channels: ["slack"] },
  { id: "mem-high", metric: "memoryUsage", threshold: 85, condition: "gt", severity: "warning", channels: ["email"] },
];

const notificationHistory: any[] = [];

const checkMetrics = (hostname: string, metrics: any) => {
  rules.forEach(rule => {
    const value = metrics[rule.metric];
    if (value !== undefined) {
      const triggered = rule.condition === "gt" ? value > rule.threshold : value < rule.threshold;
      
      if (triggered) {
        triggerAlert(hostname, rule, value);
      }
    }
  });
};

const triggerAlert = (hostname: string, rule: AlertRule, value: number) => {
  const alert = {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    hostname,
    ruleId: rule.id,
    metric: rule.metric,
    value,
    threshold: rule.threshold,
    severity: rule.severity,
    timestamp: new Date(),
  };
  
  notificationHistory.push(alert);
  if (notificationHistory.length > 100) notificationHistory.shift();
  
  console.log(`[ALERT] [${rule.severity.toUpperCase()}] ${hostname} ${rule.metric} is ${value} (threshold ${rule.threshold})`);
  
  // Emit alert via socket
  io.emit("alert", alert);
  
  // Simulate sending to channels
  rule.channels.forEach(channel => {
    sendToChannel(channel, alert);
  });
};

const sendToChannel = (channel: string, alert: any) => {
  console.log(`Sending alert to ${channel}: ${alert.hostname} ${alert.metric} exceeded threshold.`);
  // Here we would use fetch to send to Slack/Discord webhooks if configured.
};

export const alertService = {
  checkMetrics,
  getHistory() {
    return notificationHistory;
  },
  getRules() {
    return rules;
  },
  addRule(rule: AlertRule) {
    rules.push(rule);
  }
};
