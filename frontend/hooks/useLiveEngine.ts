"use client";

import { useEffect, useRef, useCallback } from "react";
import { generateNextMetric, maybeGenerateIncident, generateLogEntry, generateAIInsight, LiveMetric, LiveIncident, LiveLogEntry, AIInsight } from "@/lib/liveEngine";
import { useMonitoringStore } from "@/store/useMonitoringStore";

/**
 * useLiveEngine — The core real-time simulation hook.
 * Drives all live metric updates, incident generation, log streaming, and AI insights.
 * Designed to be mounted once in the dashboard layout.
 */
export function useLiveEngine() {
  const addTimelineEvent = useMonitoringStore(s => s.addTimelineEvent);
  const intervalRefs = useRef<NodeJS.Timeout[]>([]);

  const clearAll = useCallback(() => {
    intervalRefs.current.forEach(clearInterval);
    intervalRefs.current = [];
  }, []);

  const { socket, connectionStatus } = useMonitoringStore();

  useEffect(() => {
    // If socket is available and connected, listen to real events from backend
    if (socket && connectionStatus === "connected") {
      console.log("[LIVE ENGINE] Real socket connected, using live stream");
      
      const onMetrics = (data: LiveMetric) => {
        useLiveEngineStore.setState(s => ({ liveMetrics: [...s.liveMetrics.slice(-59), data] }));
      };
      
      const onIncident = (incident: LiveIncident) => {
        useLiveEngineStore.setState(s => ({ incidents: [incident, ...s.incidents].slice(0, 50) }));
        addTimelineEvent({
          type: incident.type === 'critical' ? 'critical' :
                incident.type === 'security' ? 'warning' :
                incident.type === 'recovery' ? 'info' : 'info',
          message: `[${incident.service}] ${incident.title}: ${incident.message}`,
        });
      };
      
      const onLog = (entry: LiveLogEntry) => {
        useLiveEngineStore.setState(s => ({ logs: [entry, ...s.logs].slice(0, 200) }));
      };
      
      const onInsight = (insight: AIInsight) => {
        useLiveEngineStore.setState(s => ({ aiInsights: [insight, ...s.aiInsights].slice(0, 20) }));
      };

      socket.on("live:metrics", onMetrics);
      socket.on("live:incident", onIncident);
      socket.on("live:log", onLog);
      socket.on("live:insight", onInsight);

      return () => {
        socket.off("live:metrics", onMetrics);
        socket.off("live:incident", onIncident);
        socket.off("live:log", onLog);
        socket.off("live:insight", onInsight);
      };
    }

    // ─── LOCAL SIMULATION FALLBACK (when disconnected) ─────────────────────────
    console.log("[LIVE ENGINE] Socket disconnected, using local simulation");
    // — Metrics tick every 2.5s
    const metricInterval = setInterval(() => {
      const metric = generateNextMetric();
      useLiveEngineStore.setState(s => ({
        liveMetrics: [...s.liveMetrics.slice(-59), metric],
      }));
    }, 2500);
    intervalRefs.current.push(metricInterval);

    // — Incident generation every 8s
    const incidentInterval = setInterval(() => {
      const incident = maybeGenerateIncident();
      if (incident) {
        useLiveEngineStore.setState(s => ({
          incidents: [incident, ...s.incidents].slice(0, 50),
        }));
        // Also push to global timeline
        addTimelineEvent({
          type: incident.type === 'critical' ? 'critical' :
                incident.type === 'security' ? 'warning' :
                incident.type === 'recovery' ? 'info' : 'info',
          message: `[${incident.service}] ${incident.title}: ${incident.message}`,
        });
      }
    }, 8000);
    intervalRefs.current.push(incidentInterval);

    // — Log streaming every 1.2s
    const logInterval = setInterval(() => {
      const entry = generateLogEntry();
      useLiveEngineStore.setState(s => ({
        logs: [entry, ...s.logs].slice(0, 200),
      }));
    }, 1200);
    intervalRefs.current.push(logInterval);

    // — AI insight refresh every 18s
    const insightInterval = setInterval(() => {
      const insight = generateAIInsight();
      useLiveEngineStore.setState(s => ({
        aiInsights: [insight, ...s.aiInsights].slice(0, 20),
      }));
    }, 18000);
    intervalRefs.current.push(insightInterval);

    // Seed immediately
    for (let i = 0; i < 30; i++) {
      const metric = generateNextMetric();
      useLiveEngineStore.setState(s => ({
        liveMetrics: [...s.liveMetrics, metric],
      }));
    }
    // Seed initial insights
    for (let i = 0; i < 4; i++) {
      const insight = generateAIInsight();
      useLiveEngineStore.setState(s => ({
        aiInsights: [...s.aiInsights, insight],
      }));
    }
    // Seed initial logs
    for (let i = 0; i < 20; i++) {
      const log = generateLogEntry();
      useLiveEngineStore.setState(s => ({
        logs: [...s.logs, log],
      }));
    }

    return clearAll;
  }, [clearAll, addTimelineEvent, socket, connectionStatus]);
}

// Lightweight store for live engine data (separate from heavy monitoring store)
import { create } from "zustand";

interface LiveEngineState {
  liveMetrics: LiveMetric[];
  incidents: LiveIncident[];
  logs: LiveLogEntry[];
  aiInsights: AIInsight[];
}

export const useLiveEngineStore = create<LiveEngineState>(() => ({
  liveMetrics: [],
  incidents: [],
  logs: [],
  aiInsights: [],
}));
