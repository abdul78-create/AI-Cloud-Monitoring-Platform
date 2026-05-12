"use client";

import { create } from "zustand";
import { api, getWithCache, unwrap } from "@/services/api";
import { ApiAlert, ApiAnalytics, ApiInfrastructure, ApiMetricPoint, LogAnalysisResult } from "@/types";
import { io, Socket } from "socket.io-client";

type MonitoringState = {
  metrics: ApiMetricPoint[];
  infrastructure: ApiInfrastructure[];
  alerts: ApiAlert[];
  analytics: ApiAnalytics | null;
  serviceHealth: any[];
  aiResult: LogAnalysisResult | null;
  dashboardLoading: boolean;
  dashboardRefreshing: boolean;
  dashboardError: string | null;
  isUploading: boolean;
  uploadProgress: number;
  isAnalyzing: boolean;
  socket: Socket | null;
  theme: "light" | "dark";
  timeline: any[];
  connectionStatus: "connected" | "disconnected" | "reconnecting";
  
  fetchDashboardData: (initial?: boolean) => Promise<void>;
  fetchServiceHealth: () => Promise<void>;
  runLogAnalysis: (file: File) => Promise<void>;
  clearAiResult: () => void;

  setTheme: (theme: "light" | "dark") => void;
  addTimelineEvent: (event: any) => void;
  setConnectionStatus: (status: "connected" | "disconnected" | "reconnecting") => void;
};

export const useMonitoringStore = create<MonitoringState>((set, get) => ({
  metrics: [],
  infrastructure: [],
  alerts: [],
  analytics: null,
  serviceHealth: [],
  aiResult: null,
  dashboardLoading: true,
  dashboardRefreshing: false,
  dashboardError: null,
  isUploading: false,
  uploadProgress: 0,
  isAnalyzing: false,
  socket: null,
  theme: "dark", // Default to dark as requested
  connectionStatus: "disconnected",
  timeline: [
    { id: "1", type: "info", message: "Service 'api-gateway' health check passed.", timestamp: new Date(Date.now() - 5000) },
    { id: "2", type: "ai", message: "Analyzing log stream for pattern anomaly in cluster-B...", timestamp: new Date(Date.now() - 15000) },
    { id: "3", type: "warning", message: "High latency (1.2s) detected on 'db-write' replica.", timestamp: new Date(Date.now() - 30000) },
    { id: "4", type: "info", message: "Deploy 'v1.2.4' started by user 'ops_admin'.", timestamp: new Date(Date.now() - 45000) },
  ],

  addTimelineEvent: (event) => {
    set((state) => ({
      timeline: [
        { id: Date.now().toString(), timestamp: new Date(), ...event },
        ...state.timeline
      ].slice(0, 50) // Keep last 50
    }));
  },

  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("theme", theme);
    }
  },

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  fetchDashboardData: async (initial = false) => {
    set((state) => ({
      dashboardLoading: initial ? true : state.dashboardLoading,
      dashboardRefreshing: !initial,
      dashboardError: null
    }));
    try {
      const [metricsRes, infraRes, alertsRes, analyticsRes, healthRes] = await Promise.all([
        api.get("/metrics"),
        api.get("/infrastructure"),
        api.get("/alerts"),
        getWithCache<ApiAnalytics>("/analytics", 10_000),
        api.get("/service-health")
      ]);

      set({
        metrics: unwrap<ApiMetricPoint[]>(metricsRes) || [],
        infrastructure: unwrap<ApiInfrastructure[]>(infraRes) || [],
        alerts: unwrap<ApiAlert[]>(alertsRes) || [],
        analytics: analyticsRes,
        serviceHealth: unwrap<any[]>(healthRes) || [],
        dashboardLoading: false,
        dashboardRefreshing: false
      });
    } catch (error) {
      set({
        dashboardLoading: false,
        dashboardRefreshing: false,
        dashboardError: error instanceof Error ? error.message : "Failed to fetch dashboard data"
      });
    }
  },

  fetchServiceHealth: async () => {
    try {
      const res = await api.get("/service-health");
      set({ serviceHealth: unwrap<any[]>(res) });
    } catch (error) {
      console.error('Error fetching service health:', error);
    }
  },

  runLogAnalysis: async (file) => {
    set({ isUploading: true, isAnalyzing: false, uploadProgress: 0, aiResult: null });
    try {
      const formData = new FormData();
      formData.append("logFile", file);

      const uploadRes = await api.post("/logs/upload", formData, {
        onUploadProgress: (event) => {
          const total = event.total || 1;
          set({ uploadProgress: Math.round((event.loaded * 100) / total) });
        }
      });

      const uploaded = unwrap<{ fileName: string; size: number; content: string }>(uploadRes);
      set({ isUploading: false, isAnalyzing: true, uploadProgress: 100 });

      const aiRes = await api.post("/ai/analyze", { logs: uploaded.content });
      const analysis = unwrap<LogAnalysisResult>(aiRes);

      set({
        aiResult: analysis,
        isAnalyzing: false
      });
    } catch (error) {
      set({
        isUploading: false,
        isAnalyzing: false
      });
      throw error;
    }
  },

  clearAiResult: () => set({ aiResult: null }),


}));
