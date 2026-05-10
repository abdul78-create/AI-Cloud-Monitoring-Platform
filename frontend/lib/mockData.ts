import { MonitoringAlert, Recommendation } from "@/types";

export const initialAlerts: MonitoringAlert[] = [
  {
    id: "a-1",
    level: "critical",
    message: "CPU spike detected on compute-node-3",
    source: "compute-node-3",
    time: "2 mins ago"
  },
  {
    id: "a-2",
    level: "warning",
    message: "Network latency is above threshold",
    source: "gateway-edge-1",
    time: "5 mins ago"
  },
  {
    id: "a-3",
    level: "info",
    message: "Backup completed successfully",
    source: "storage-cluster",
    time: "12 mins ago"
  }
];

export const initialRecommendations: Recommendation[] = [
  {
    id: "r-1",
    title: "Scale high-load node",
    detail: "Increase resources for compute-node-3 during peak traffic windows."
  },
  {
    id: "r-2",
    title: "Optimize log retention",
    detail: "Archive low-priority logs every 24h to reduce storage overhead."
  },
  {
    id: "r-3",
    title: "Tune autoscaling policy",
    detail: "Lower cooldown period from 8m to 5m for faster workload balancing."
  }
];
