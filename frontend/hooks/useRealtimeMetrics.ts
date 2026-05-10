"use client";

import { useEffect } from "react";
import { useMonitoringStore } from "@/store/useMonitoringStore";

export const useRealtimeMetrics = () => {
  const fetchDashboardData = useMonitoringStore((state) => state.fetchDashboardData);

  useEffect(() => {
    const timer = setInterval(() => fetchDashboardData(false), 5000);

    return () => clearInterval(timer);
  }, [fetchDashboardData]);
};
