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
  
  fetchDashboardData: (initial?: boolean) => Promise<void>;
  fetchServiceHealth: () => Promise<void>;
  runLogAnalysis: (file: File) => Promise<void>;
  clearAiResult: () => void;
  initSocket: () => void;
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
        metrics: unwrap<ApiMetricPoint[]>(metricsRes),
        infrastructure: unwrap<ApiInfrastructure[]>(infraRes),
        alerts: unwrap<ApiAlert[]>(alertsRes),
        analytics: analyticsRes,
        serviceHealth: unwrap<any[]>(healthRes),
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
        headers: { "Content-Type": "multipart/form-data" },
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

  initSocket: () => {
    const currentSocket = get().socket;
    if (currentSocket) return; // Already initialized

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    console.log(`[STORE] Connecting to socket at ${socketUrl}`);
    const socket = io(socketUrl);

    socket.on('metrics.received', (data) => {
      console.log('[STORE] Socket: metrics.received', data);
      // Update metrics in state
      set((state) => ({
        metrics: [...state.metrics, data.metrics].slice(-50) // Keep last 50
      }));
    });

    socket.on('alert.triggered', (data) => {
      console.log('[STORE] Socket: alert.triggered', data);
      set((state) => ({
        alerts: [data, ...state.alerts].slice(0, 20) // Keep latest 20
      }));
    });

    socket.on('node.offline', (data) => {
      console.log('[STORE] Socket: node.offline', data);
      set((state) => ({
        infrastructure: state.infrastructure.map(node => 
          node.token === data.token ? { ...node, status: 'down' } : node
        )
      }));
    });

    socket.on('ai.analysis.completed', (data) => {
      console.log('[STORE] Socket: ai.analysis.completed', data);
      // Handle AI result update if needed
    });

    set({ socket });
  }
}));
