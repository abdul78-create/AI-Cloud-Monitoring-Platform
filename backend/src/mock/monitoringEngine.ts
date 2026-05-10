import { AnalyticsSummary, InfrastructureNode, MonitoringAlert, MonitoringMetricPoint } from "../types";

const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number): number => Number((Math.random() * (max - min) + min).toFixed(2));

const maybeSpike = (base: number, spikeChancePercent: number, spikeAmount: number): number => {
  const chance = randomInt(1, 100);
  return chance <= spikeChancePercent ? Math.min(100, base + spikeAmount) : base;
};

export const generateMetrics = (): MonitoringMetricPoint[] => {
  return Array.from({ length: 12 }, (_, index) => {
    const cpuBase = randomInt(35, 80);
    const memoryBase = randomInt(42, 78);
    const network = randomInt(220, 900);
    const requests = randomInt(900, 4600);

    return {
      timestamp: new Date(Date.now() - (11 - index) * 60_000).toISOString(),
      cpu: maybeSpike(cpuBase, 20, randomInt(8, 18)),
      memory: maybeSpike(memoryBase, 15, randomInt(6, 14)),
      networkTrafficMbps: network,
      requestRateRps: requests
    };
  });
};

export const generateInfrastructure = (): InfrastructureNode[] => {
  return [
    { service: "EC2", status: "healthy", uptimePercent: randomFloat(99.8, 99.99), responseTimeMs: randomInt(22, 50) },
    {
      service: "Database",
      status: randomInt(1, 100) > 82 ? "warning" : "healthy",
      uptimePercent: randomFloat(99.5, 99.95),
      responseTimeMs: randomInt(60, 130)
    },
    {
      service: "LoadBalancer",
      status: randomInt(1, 100) > 90 ? "down" : "healthy",
      uptimePercent: randomFloat(99.6, 99.99),
      responseTimeMs: randomInt(20, 46)
    },
    { service: "API", status: randomInt(1, 100) > 75 ? "warning" : "healthy", uptimePercent: randomFloat(99.4, 99.93), responseTimeMs: randomInt(80, 190) },
    { service: "CDN", status: "healthy", uptimePercent: randomFloat(99.7, 99.99), responseTimeMs: randomInt(12, 35) }
  ];
};

export const generateAlerts = (): MonitoringAlert[] => {
  const now = new Date().toISOString();

  const alerts: MonitoringAlert[] = [
    {
      id: `cpu-${Date.now()}`,
      severity: "critical",
      category: "performance",
      message: "High CPU usage detected on compute-node-3.",
      createdAt: now,
      details: "CPU remained above 88% for over 3 minutes."
    },
    {
      id: `mem-${Date.now() + 1}`,
      severity: "warning",
      category: "resource",
      message: "Memory spike on analytics worker.",
      createdAt: now,
      details: "Memory climbed 20% in 2 minutes after batch process."
    }
  ];

  if (randomInt(1, 100) > 70) {
    alerts.push({
      id: `sec-${Date.now() + 2}`,
      severity: "critical",
      category: "security",
      message: "Unauthorized access attempt blocked.",
      createdAt: now,
      details: "Multiple token failures from a single IP."
    });
  }

  return alerts;
};

export const generateAnalytics = (metrics: MonitoringMetricPoint[]): AnalyticsSummary => {
  const totalCpu = metrics.reduce((sum, point) => sum + point.cpu, 0);
  const totalMemory = metrics.reduce((sum, point) => sum + point.memory, 0);
  const totalRequests = metrics.reduce((sum, point) => sum + point.requestRateRps, 0);

  return {
    avgCpu: Number((totalCpu / metrics.length).toFixed(2)),
    avgMemory: Number((totalMemory / metrics.length).toFixed(2)),
    peakTrafficMbps: Math.max(...metrics.map((point) => point.networkTrafficMbps)),
    totalRequests,
    errorRatePercent: randomFloat(0.5, 2.3)
  };
};
