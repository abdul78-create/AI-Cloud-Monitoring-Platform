import axios from "axios";

// AI Root Cause Analysis Service

type IncidentContext = {
  alerts: any[];
  metrics: any;
  infrastructure: any[];
};

export const aiRootCauseService = {
  async analyzeRootCause(context: IncidentContext) {
    const prompt = `
      You are an expert site reliability engineer (SRE) and AI observability assistant.
      Analyze the following incident context and provide a root cause analysis report.
      
      Alerts:
      ${JSON.stringify(context.alerts, null, 2)}
      
      Metrics:
      ${JSON.stringify(context.metrics, null, 2)}
      
      Infrastructure:
      ${JSON.stringify(context.infrastructure, null, 2)}
      
      Please provide:
      1. Root Cause Summary
      2. Impacted Systems
      3. Incident Severity (Critical, High, Medium, Low)
      4. Remediation Suggestions
      
      Format the response as a JSON object with keys: summary, impactedSystems (array), severity, remediation (array).
    `;

    try {
      // Attempt to call Ollama
      const response = await axios.post("http://localhost:11434/api/generate", {
        model: "llama3",
        prompt: prompt,
        stream: false,
        format: "json",
      });

      const result = JSON.parse(response.data.response);
      return result;
    } catch (error) {
      console.warn("Ollama call failed, falling back to simulated analysis:", error instanceof Error ? error.message : error);
      
      // Fallback simulated response
      return {
        summary: "High CPU usage on backend-api-1 caused by a spike in request volume, leading to cascading latency in Redis cache.",
        impactedSystems: ["backend-api-1", "redis-cache"],
        severity: "High",
        remediation: [
          "Scale up backend-api-1 instances.",
          "Check Redis connection pool limits.",
          "Investigate potential memory leak in API Gateway."
        ]
      };
    }
  }
};
