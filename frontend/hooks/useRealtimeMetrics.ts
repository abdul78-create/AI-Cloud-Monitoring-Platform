"use client";

import { useEffect } from "react";
import { useMonitoringStore } from "@/store/useMonitoringStore";

export const useRealtimeMetrics = () => {
  const fetchDashboardData = useMonitoringStore((state) => state.fetchDashboardData);
  const telemetryRefreshRate = useMonitoringStore((state) => state.telemetryRefreshRate);

  useEffect(() => {
    const timer = setInterval(() => fetchDashboardData(false), telemetryRefreshRate);

    return () => clearInterval(timer);
  }, [fetchDashboardData, telemetryRefreshRate]);
};
