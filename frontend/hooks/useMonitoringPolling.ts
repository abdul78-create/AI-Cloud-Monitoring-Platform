"use client";

import { useEffect } from "react";
import { useMonitoringStore } from "@/store/useMonitoringStore";

export const useMonitoringPolling = () => {
  const fetchDashboardData = useMonitoringStore((state) => state.fetchDashboardData);
  const intervalMs = Number(process.env.NEXT_PUBLIC_POLLING_INTERVAL_MS || 5000);

  useEffect(() => {
    fetchDashboardData(true);
    // Polling replaced by WebSockets in useSocket hook
  }, [fetchDashboardData, intervalMs]);
};
