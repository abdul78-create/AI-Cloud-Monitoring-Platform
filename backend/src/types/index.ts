export type AlertSeverity = "info" | "warning" | "critical";

export interface MonitoringMetricPoint {
  timestamp: string;
  cpu: number;
  memory: number;
  networkTrafficMbps: number;
  requestRateRps: number;
}

export interface InfrastructureNode {
  service: "EC2" | "Database" | "LoadBalancer" | "API" | "CDN";
  status: "healthy" | "warning" | "down";
  uptimePercent: number;
  responseTimeMs: number;
}

export interface MonitoringAlert {
  id: string;
  severity: AlertSeverity;
  category: "performance" | "resource" | "network" | "security";
  message: string;
  createdAt: string;
  details: string;
}

export interface AnalyticsSummary {
  avgCpu: number;
  avgMemory: number;
  peakTrafficMbps: number;
  totalRequests: number;
  errorRatePercent: number;
}

export interface AiAnalysisResponse {
  summary: string;
  anomalies: string[];
  recommendations: string[];
  threats: string[];
}
