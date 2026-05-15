import { ApiAlert, ApiInfrastructure, ApiMetricPoint } from "@/types";

export type SimulationResult = {
  metrics?: Partial<ApiMetricPoint>;
  infraUpdates?: Partial<ApiInfrastructure>[];
  newAlerts?: ApiAlert[];
  timelineEvents?: any[];
  rootCause?: string;
  playbook?: string[];
  isRecovery?: boolean;
};

export function parseLogForSimulation(logContent: string): SimulationResult {
  const result: SimulationResult = {};
  const newAlerts: ApiAlert[] = [];
  const infraUpdates: Partial<ApiInfrastructure>[] = [];
  const timelineEvents: any[] = [];
  
  // Default metrics to update if found
  const metrics: Partial<ApiMetricPoint> = {};

  const lines = logContent.split('\n');
  
  lines.forEach(line => {
    // Detect CPU spikes
    if (/CPU.*9\d%|CPU.*100%|high CPU/i.test(line)) {
      metrics.cpu = 95 + Math.random() * 5; // 95-100
      newAlerts.push({
        id: `alert-${Date.now()}-${Math.random()}`,
        severity: "critical",
        category: "performance",
        message: "Critical CPU usage detected above 95%",
        createdAt: new Date().toISOString(),
        details: line
      });
      infraUpdates.push({ service: "api-gateway", status: "warning" });
      result.rootCause = "High CPU usage on api-gateway causing cascading latency.";
      result.playbook = ["Scale api-gateway cluster", "Restart container"];
    }
    
    // Detect Memory pressure
    if (/memory.*9\d%|memory.*pressure|OOM/i.test(line)) {
      metrics.memory = 90 + Math.random() * 10; // 90-100
      newAlerts.push({
        id: `alert-${Date.now()}-${Math.random()}`,
        severity: "critical",
        category: "resource",
        message: "Memory pressure detected",
        createdAt: new Date().toISOString(),
        details: line
      });
      infraUpdates.push({ service: "auth-service", status: "warning" });
      result.rootCause = "Memory pressure on auth-service causing slow responses.";
      result.playbook = ["Clear cache", "Scale auth-service", "Check memory leaks"];
    }
    
    // Detect DDoS or traffic spike
    if (/DDoS|traffic.*spike|requests.*high/i.test(line)) {
      metrics.networkTrafficMbps = 800 + Math.random() * 200; // 800-1000
      metrics.requestRateRps = 5000 + Math.random() * 1000;
      newAlerts.push({
        id: `alert-${Date.now()}-${Math.random()}`,
        severity: "critical",
        category: "network",
        message: "Potential DDoS attack or traffic spike detected",
        createdAt: new Date().toISOString(),
        details: line
      });
      result.rootCause = "Potential DDoS attack causing traffic spike.";
      result.playbook = ["Enable rate limiting", "Block attacking IPs", "Enable Cloudflare under attack mode"];
    }
    
    // Detect Unauthorized access
    if (/unauthorized|forbidden|login.*fail|attack/i.test(line)) {
      newAlerts.push({
        id: `alert-${Date.now()}-${Math.random()}`,
        severity: "warning",
        category: "security",
        message: "Unauthorized access attempt blocked",
        createdAt: new Date().toISOString(),
        details: line
      });
    }
    
    // Detect Node failure
    if (/timeout|fail|down|error.*500/i.test(line)) {
      infraUpdates.push({ service: "payment-service", status: "down" });
      newAlerts.push({
        id: `alert-${Date.now()}-${Math.random()}`,
        severity: "critical",
        category: "performance",
        message: "Service failure or timeout detected",
        createdAt: new Date().toISOString(),
        details: line
      });
      result.rootCause = "Database timeout causing payment-service failure.";
      result.playbook = ["Restart payment-service", "Check database connection pool"];
    }
    
    // Detect Scaling events
    if (/scaling|scale.*up|added.*node/i.test(line)) {
      timelineEvents.push({
        id: `event-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        type: "ai",
        message: "Auto-scaling triggered: Adding new instances to handle load."
      });
    }
    
    // Detect Recovery
    if (/recovered|resolved|back.*normal|stable/i.test(line)) {
      result.isRecovery = true;
      infraUpdates.push({ service: "payment-service", status: "healthy" });
      infraUpdates.push({ service: "api-gateway", status: "healthy" });
      infraUpdates.push({ service: "auth-service", status: "healthy" });
      metrics.cpu = 45 + Math.random() * 10;
      metrics.memory = 50 + Math.random() * 10;
      timelineEvents.push({
        id: `event-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        type: "info",
        message: "System recovered: All services returned to healthy state."
      });
    }
  });
  
  if (Object.keys(metrics).length > 0) result.metrics = metrics as ApiMetricPoint;
  if (infraUpdates.length > 0) result.infraUpdates = infraUpdates as ApiInfrastructure[];
  if (newAlerts.length > 0) result.newAlerts = newAlerts;
  if (timelineEvents.length > 0) result.timelineEvents = timelineEvents;
  
  return result;
}
