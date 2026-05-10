import axios from "axios";
import { env } from "../config/env";
import { AiAnalysisResponse } from "../types";

const buildPrompt = (logs: string): string => `
Analyze these cloud infrastructure logs and provide:
1. Summary
2. Anomalies
3. Security threats
4. Optimization recommendations

Respond strictly in valid JSON with this shape:
{
  "summary": "string",
  "anomalies": ["string"],
  "recommendations": ["string"],
  "threats": ["string"]
}

Logs:
${logs.slice(0, 8000)}
`;

const fallbackResponse: AiAnalysisResponse = {
  summary: "Fallback analysis returned because Ollama was unavailable.",
  anomalies: ["Potential service degradation detected from repeated error and timeout patterns."],
  recommendations: [
    "Enable autoscaling thresholds for sustained CPU above 80%.",
    "Apply retry with exponential backoff for unstable network calls."
  ],
  threats: ["Repeated authentication failures may indicate suspicious access attempts."]
};

const buildDemoResponse = (logs: string): AiAnalysisResponse => {
  const lower = logs.toLowerCase();
  const hasTimeout = lower.includes("timeout");
  const hasError = lower.includes("error");
  const hasUnauthorized = lower.includes("unauthorized") || lower.includes("auth fail") || lower.includes("invalid token");
  const hasCpu = lower.includes("cpu");
  const hasMemory = lower.includes("memory");

  const anomalies = [
    hasError ? "Error bursts indicate degraded service reliability." : "Intermittent warning spikes observed in app logs.",
    hasTimeout ? "Network timeout pattern detected between internal services." : "Latency trend remains stable with short-lived spikes.",
    hasCpu ? "CPU pressure events suggest capacity stress during peak windows." : "CPU remains mostly stable with occasional load increases."
  ];

  const threats = [
    hasUnauthorized
      ? "Potential credential abuse detected from repeated unauthorized attempts."
      : "No high-confidence breach signal, but unusual access sequences should be monitored."
  ];

  const recommendations = [
    hasMemory ? "Increase memory allocation for analytics workers or tune garbage collection." : "Enable autoscaling policy based on CPU and request saturation.",
    "Add structured trace IDs across gateway and API logs for faster incident triage.",
    "Use rate limiting + WAF rules to reduce suspicious request bursts."
  ];

  return {
    summary:
      "Demo AI mode generated this analysis for portfolio hosting. The infrastructure shows moderate pressure with identifiable optimization opportunities.",
    anomalies,
    recommendations,
    threats
  };
};

export const ollamaService = {
  async analyzeLogs(logs: string): Promise<AiAnalysisResponse> {
    if (env.demoAiMode || env.nodeEnv === "production") {
      return buildDemoResponse(logs);
    }

    try {
      const response = await axios.post(
        `${env.ollamaBaseUrl}/api/generate`,
        {
          model: env.ollamaModel,
          prompt: buildPrompt(logs),
          stream: false
        },
        { timeout: env.ollamaTimeoutMs }
      );

      const text = String(response.data?.response ?? "").trim();
      const parsed = JSON.parse(text) as AiAnalysisResponse;

      return {
        summary: parsed.summary || fallbackResponse.summary,
        anomalies: parsed.anomalies?.length ? parsed.anomalies : fallbackResponse.anomalies,
        recommendations: parsed.recommendations?.length ? parsed.recommendations : fallbackResponse.recommendations,
        threats: parsed.threats?.length ? parsed.threats : fallbackResponse.threats
      };
    } catch (_error) {
      return fallbackResponse;
    }
  }
};
