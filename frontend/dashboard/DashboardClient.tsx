"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { AIRecommendationPanel } from "@/dashboard/components/AIRecommendationPanel";
import { InfrastructureStatus } from "@/dashboard/components/InfrastructureStatus";
import { RecentAlertsPanel } from "@/dashboard/components/RecentAlertsPanel";
import { SidebarNav } from "@/dashboard/components/SidebarNav";
import { DashboardSkeleton } from "@/dashboard/components/SkeletonBlocks";
import { StatsCards } from "@/dashboard/components/StatsCards";
import { TopNavbar } from "@/dashboard/components/TopNavbar";
import { aiRecommendations } from "@/dashboard/mockData";
import { useMonitoringPolling } from "@/hooks/useMonitoringPolling";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { DetailedAlert, InfraStatus, StatsCardData } from "@/types";

const MonitoringCharts = dynamic(() => import("@/dashboard/components/MonitoringCharts").then((mod) => mod.MonitoringCharts), {
  ssr: false
});

export const DashboardClient = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  useMonitoringPolling();

  const dashboardLoading = useMonitoringStore((state) => state.dashboardLoading);
  const dashboardRefreshing = useMonitoringStore((state) => state.dashboardRefreshing);
  const dashboardError = useMonitoringStore((state) => state.dashboardError);
  const metrics = useMonitoringStore((state) => state.metrics);
  const infrastructure = useMonitoringStore((state) => state.infrastructure);
  const alerts = useMonitoringStore((state) => state.alerts);
  const analytics = useMonitoringStore((state) => state.analytics);
  const aiResult = useMonitoringStore((state) => state.aiResult);
  const fetchDashboardData = useMonitoringStore((state) => state.fetchDashboardData);

  const cards = useMemo<StatsCardData[]>(() => {
    if (!metrics.length) return [];
    const latest = metrics[metrics.length - 1];
    const prev = metrics[metrics.length - 2] ?? latest;
    const healthyNodes = infrastructure.filter((item) => item.status !== "down").length;

    const trend = (curr: number, old: number) => Number(((curr - old) / Math.max(old, 1) * 100).toFixed(1));
    return [
      { id: "cpu", label: "CPU Usage", value: latest.cpu, unit: "%", trend: trend(latest.cpu, prev.cpu), points: metrics.map((m) => m.cpu), tone: "rose" },
      {
        id: "memory",
        label: "Memory Usage",
        value: latest.memory,
        unit: "%",
        trend: trend(latest.memory, prev.memory),
        points: metrics.map((m) => m.memory),
        tone: "violet"
      },
      {
        id: "network",
        label: "Network Traffic",
        value: latest.networkTrafficMbps,
        unit: "Mbps",
        trend: trend(latest.networkTrafficMbps, prev.networkTrafficMbps),
        points: metrics.map((m) => m.networkTrafficMbps),
        tone: "cyan"
      },
      {
        id: "servers",
        label: "Active Servers",
        value: healthyNodes,
        unit: "",
        trend: 0.8,
        points: metrics.map(() => healthyNodes),
        tone: "emerald"
      }
    ];
  }, [infrastructure, metrics]);

  const infraCards = useMemo<InfraStatus[]>(
    () =>
      infrastructure.map((item, index) => ({
        id: `${item.service}-${index}`,
        service: item.service,
        status: item.status === "down" ? "critical" : item.status,
        uptime: `${item.uptimePercent.toFixed(2)}%`,
        responseTime: `${item.responseTimeMs} ms`
      })),
    [infrastructure]
  );

  const alertCards = useMemo<DetailedAlert[]>(
    () =>
      alerts.map((alert) => ({
        id: alert.id,
        level: alert.severity,
        message: alert.message,
        source: alert.category,
        time: new Date(alert.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        category: alert.category,
        details: alert.details
      })),
    [alerts]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="lg:flex">
        <SidebarNav isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

        <div className="min-w-0 flex-1">
          <TopNavbar onMenuToggle={() => setMenuOpen(true)} />

          <main className="space-y-6 px-4 py-6 sm:px-6">
            <section>
              <h1 className="text-2xl font-semibold sm:text-3xl">Cloud Monitoring Dashboard</h1>
              <p className="mt-1 text-sm text-slate-400">Real-time observability, AI insights, and infrastructure health in one workspace.</p>
              {dashboardRefreshing && <p className="mt-2 text-xs text-cyan-300">Refreshing live data...</p>}
            </section>

            {dashboardError && (
              <div className="rounded-xl border border-rose-300/30 bg-rose-500/10 p-3 text-sm">
                <p className="mb-2 text-rose-200">{dashboardError}</p>
                <button
                  className="rounded-md border border-rose-200/40 px-3 py-1 text-rose-100"
                  onClick={async () => {
                    await fetchDashboardData(false);
                    toast.success("Retry completed");
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {dashboardLoading ? (
              <DashboardSkeleton />
            ) : (
              <>
                <StatsCards cards={cards} />
                <MonitoringCharts metrics={metrics} analytics={analytics} />
                <InfrastructureStatus items={infraCards} />
                <section className="grid gap-5 xl:grid-cols-2">
                  <AIRecommendationPanel recommendations={aiRecommendations} analysis={aiResult} />
                  <RecentAlertsPanel alerts={alertCards} />
                </section>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
