export type MetricPoint = {
  time: string;
  cpu: number;
  memory: number;
  network: number;
};

export type AlertLevel = "warning" | "critical" | "info";

export type MonitoringAlert = {
  id: string;
  level: AlertLevel;
  message: string;
  source: string;
  time: string;
};

export type Recommendation = {
  id: string;
  title: string;
  detail: string;
};

export type LogAnalysisResult = {
  summary: string;
  anomalies: string[];
  recommendations: string[];
  threats: string[];
};

export type StatsCardData = {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: number;
  points: number[];
  tone: "cyan" | "violet" | "emerald" | "rose";
};

export type InfraStatus = {
  id: string;
  service: string;
  status: "healthy" | "warning" | "critical";
  uptime: string;
  responseTime: string;
};

export type DetailedAlert = MonitoringAlert & {
  category: "performance" | "security" | "network" | "resource";
  details: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type ApiMetricPoint = {
  timestamp: string;
  cpu: number;
  memory: number;
  networkTrafficMbps: number;
  requestRateRps: number;
};

export type ApiInfrastructure = {
  token?: string;
  hostname?: string;
  service: string;
  status: "healthy" | "warning" | "down";
  uptimePercent: number;
  responseTimeMs: number;
  replicas?: number;
};

export type ApiAlert = {
  id: string;
  severity: AlertLevel;
  category: "performance" | "security" | "network" | "resource";
  message: string;
  createdAt: string;
  details: string;
};

export type ApiAnalytics = {
  avgCpu: number;
  avgMemory: number;
  peakTrafficMbps: number;
  totalRequests: number;
  errorRatePercent: number;
};
