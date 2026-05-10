import { DetailedAlert, InfraStatus, Recommendation, StatsCardData } from "@/types";

export const statsCards: StatsCardData[] = [
  { id: "cpu", label: "CPU Usage", value: 82, unit: "%", trend: 4.8, points: [65, 70, 72, 68, 75, 79, 82], tone: "rose" },
  { id: "memory", label: "Memory Usage", value: 67, unit: "%", trend: -1.2, points: [58, 60, 62, 64, 66, 65, 67], tone: "violet" },
  {
    id: "network",
    label: "Network Traffic",
    value: 730,
    unit: "Mbps",
    trend: 6.1,
    points: [420, 510, 590, 605, 640, 705, 730],
    tone: "cyan"
  },
  {
    id: "servers",
    label: "Active Servers",
    value: 24,
    unit: "",
    trend: 2.3,
    points: [20, 20, 21, 22, 22, 23, 24],
    tone: "emerald"
  }
];

export const cpuLineSeries = [
  { time: "10:00", cpu: 42 },
  { time: "10:10", cpu: 55 },
  { time: "10:20", cpu: 49 },
  { time: "10:30", cpu: 67 },
  { time: "10:40", cpu: 73 },
  { time: "10:50", cpu: 62 },
  { time: "11:00", cpu: 79 }
];

export const networkAreaSeries = [
  { time: "10:00", traffic: 320 },
  { time: "10:10", traffic: 420 },
  { time: "10:20", traffic: 380 },
  { time: "10:30", traffic: 560 },
  { time: "10:40", traffic: 610 },
  { time: "10:50", traffic: 705 },
  { time: "11:00", traffic: 690 }
];

export const requestBarSeries = [
  { zone: "US-EAST", requests: 4100 },
  { zone: "US-WEST", requests: 3600 },
  { zone: "EU", requests: 2900 },
  { zone: "APAC", requests: 3300 }
];

export const errorAnalyticsSeries = [
  { day: "Mon", errorRate: 1.1 },
  { day: "Tue", errorRate: 1.6 },
  { day: "Wed", errorRate: 2.2 },
  { day: "Thu", errorRate: 1.8 },
  { day: "Fri", errorRate: 1.4 },
  { day: "Sat", errorRate: 1.0 },
  { day: "Sun", errorRate: 0.9 }
];

export const aiRecommendations: Recommendation[] = [
  {
    id: "ai-1",
    title: "Auto-scaling advisory",
    detail: "CPU usage exceeded 85%. Consider auto-scaling additional instances during peak loads."
  },
  {
    id: "ai-2",
    title: "Anomaly warning",
    detail: "Request spikes from one region suggest potential traffic imbalance or bot activity."
  },
  {
    id: "ai-3",
    title: "Database optimization",
    detail: "Increase read replica capacity and enable query caching for frequent aggregate endpoints."
  },
  {
    id: "ai-4",
    title: "Suspicious activity",
    detail: "Repeated unauthorized attempts detected. Enforce stricter IP throttling and MFA checks."
  }
];

export const infrastructureStatus: InfraStatus[] = [
  { id: "infra-1", service: "EC2 Cluster", status: "healthy", uptime: "99.98%", responseTime: "42 ms" },
  { id: "infra-2", service: "PostgreSQL DB", status: "warning", uptime: "99.91%", responseTime: "98 ms" },
  { id: "infra-3", service: "Load Balancer", status: "healthy", uptime: "99.99%", responseTime: "27 ms" },
  { id: "infra-4", service: "Core API", status: "critical", uptime: "99.72%", responseTime: "182 ms" },
  { id: "infra-5", service: "CDN Edge", status: "healthy", uptime: "99.97%", responseTime: "24 ms" }
];

export const recentAlerts: DetailedAlert[] = [
  {
    id: "alt-1",
    level: "critical",
    message: "High CPU usage on compute-node-3",
    source: "compute-node-3",
    time: "2 min ago",
    category: "performance",
    details: "CPU remained above 90% for 5 minutes. Workload scaling threshold crossed."
  },
  {
    id: "alt-2",
    level: "warning",
    message: "Memory spike detected in analytics service",
    source: "analytics-api",
    time: "7 min ago",
    category: "resource",
    details: "Memory consumption jumped from 58% to 81% after new query workload."
  },
  {
    id: "alt-3",
    level: "warning",
    message: "Network anomaly in eu-gateway",
    source: "eu-gateway",
    time: "11 min ago",
    category: "network",
    details: "Packet retransmits increased 3x compared to baseline in EU region."
  },
  {
    id: "alt-4",
    level: "critical",
    message: "Unauthorized access attempt blocked",
    source: "auth-service",
    time: "17 min ago",
    category: "security",
    details: "Multiple invalid token attempts detected from single source IP and blocked."
  }
];
