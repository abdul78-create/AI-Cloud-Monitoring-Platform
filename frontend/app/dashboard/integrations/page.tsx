"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, AlertTriangle, ExternalLink, X, ArrowRight, Settings,
  Server, Box, Network, Cloud, GitBranch, Bell, Database, Activity,
  MessageSquare, Terminal, BarChart2, Code, Lock, RefreshCw
} from "lucide-react";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import toast from "react-hot-toast";

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  status: "connected" | "not_connected" | "coming_soon";
  tags: string[];
  setupTime?: string;
}

const INTEGRATIONS: Integration[] = [
  // Cloud
  { id: "aws", name: "Amazon Web Services", category: "Cloud", description: "Monitor EC2, RDS, ECS, Lambda, and 50+ AWS services via CloudWatch metrics and AWS SDK.", icon: Cloud, iconColor: "text-orange-500", status: "connected", tags: ["EC2", "RDS", "Lambda", "CloudWatch"], setupTime: "5 min" },
  { id: "gcp", name: "Google Cloud Platform", category: "Cloud", description: "Integrate with GKE, Compute Engine, Cloud Run, and Cloud SQL for unified visibility.", icon: Cloud, iconColor: "text-blue-500", status: "not_connected", tags: ["GKE", "BigQuery", "Cloud Run"], setupTime: "5 min" },
  { id: "azure", name: "Microsoft Azure", category: "Cloud", description: "Connect Azure Monitor, AKS, Virtual Machines, and Azure Blob Storage telemetry.", icon: Cloud, iconColor: "text-sky-500", status: "not_connected", tags: ["AKS", "Azure Monitor", "VMs"], setupTime: "8 min" },
  // Infrastructure
  { id: "docker", name: "Docker", category: "Infrastructure", description: "Monitor container health, resource usage, restart counts, and image versions via Docker API.", icon: Box, iconColor: "text-blue-600", status: "connected", tags: ["Containers", "Compose", "Swarm"], setupTime: "2 min" },
  { id: "kubernetes", name: "Kubernetes", category: "Infrastructure", description: "Full cluster visibility — nodes, pods, namespaces, deployments, and cluster events.", icon: Network, iconColor: "text-indigo-500", status: "connected", tags: ["Pods", "Nodes", "HPA", "kubectl"], setupTime: "10 min" },
  { id: "linux", name: "Linux Servers", category: "Infrastructure", description: "SSH-based monitoring for bare-metal and VM fleets. Collects CPU, memory, disk, and processes.", icon: Server, iconColor: "text-slate-600", status: "connected", tags: ["SSH", "systemd", "Agent"], setupTime: "2 min" },
  // CI/CD & DevOps
  { id: "github", name: "GitHub", category: "CI/CD", description: "Correlate deployments with incident timelines. Trigger alerts on failed workflows.", icon: Code, iconColor: "text-slate-900 dark:text-white", status: "connected", tags: ["Actions", "Deployments", "PRs"], setupTime: "3 min" },
  { id: "jenkins", name: "Jenkins", category: "CI/CD", description: "Track build pipelines, deployment status, and correlate releases with performance regressions.", icon: GitBranch, iconColor: "text-red-500", status: "not_connected", tags: ["Pipelines", "Builds", "Webhooks"], setupTime: "5 min" },
  // Databases
  { id: "postgres", name: "PostgreSQL", category: "Database", description: "Monitor query performance, connection pools, replication lag, and transaction throughput.", icon: Database, iconColor: "text-blue-700", status: "connected", tags: ["Queries", "Replication", "pgBouncer"], setupTime: "5 min" },
  { id: "redis", name: "Redis", category: "Database", description: "Track hit rate, memory usage, eviction policies, and slow log entries in real-time.", icon: Database, iconColor: "text-red-600", status: "connected", tags: ["Cache", "Streams", "Pub/Sub"], setupTime: "2 min" },
  // Alerting
  { id: "slack", name: "Slack", category: "Alerting", description: "Deliver incident alerts directly to Slack channels with rich message formatting and actions.", icon: MessageSquare, iconColor: "text-emerald-600", status: "connected", tags: ["Webhooks", "Bot", "Channels"], setupTime: "2 min" },
  { id: "pagerduty", name: "PagerDuty", category: "Alerting", description: "Route critical alerts through PagerDuty escalation policies with on-call scheduling.", icon: Bell, iconColor: "text-emerald-500", status: "not_connected", tags: ["On-Call", "Escalation", "Incidents"], setupTime: "5 min" },
  // Observability
  { id: "prometheus", name: "Prometheus", category: "Observability", description: "Scrape Prometheus metrics endpoints and correlate with our AI anomaly detection engine.", icon: BarChart2, iconColor: "text-orange-600", status: "not_connected", tags: ["PromQL", "Scraping", "Alertmanager"], setupTime: "10 min" },
  { id: "grafana", name: "Grafana Cloud", category: "Observability", description: "Forward metrics and logs to Grafana Cloud for additional long-term retention and dashboarding.", icon: Activity, iconColor: "text-orange-500", status: "coming_soon", tags: ["Loki", "Tempo", "Mimir"] },
  { id: "datadog", name: "Datadog", category: "Observability", description: "Bi-directional integration — ingest Datadog metrics or export to Datadog APM.", icon: Terminal, iconColor: "text-violet-600", status: "coming_soon", tags: ["APM", "Traces", "Metrics"] },
];

const CATEGORIES = ["All", "Cloud", "Infrastructure", "CI/CD", "Database", "Alerting", "Observability"];

function StatusBadge({ status }: { status: Integration["status"] }) {
  if (status === "connected") return (
    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
      <CheckCircle2 size={12} /> Connected
    </span>
  );
  if (status === "coming_soon") return (
    <span className="text-[11px] font-semibold text-slate-400">Coming soon</span>
  );
  return (
    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Not connected</span>
  );
}

export default function IntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const integrationStates = useMonitoringStore(s => s.integrationStates);
  const toggleIntegration = useMonitoringStore(s => s.toggleIntegration);
  const currentUserRole = useMonitoringStore(s => s.currentUserRole);

  const mappedIntegrations = useMemo(() => {
    return INTEGRATIONS.map(integration => {
      // Keep "coming_soon" as is, otherwise resolve dynamically from Zustand store
      const status = integration.status === "coming_soon" 
        ? "coming_soon" 
        : (integrationStates[integration.id] || "not_connected");
      return { ...integration, status };
    });
  }, [integrationStates]);

  const filtered = mappedIntegrations.filter(i => activeCategory === "All" || i.category === activeCategory);
  const selected = mappedIntegrations.find(i => i.id === selectedId);
  const connectedCount = mappedIntegrations.filter(i => i.status === "connected").length;

  const handleConnect = (id: string) => {
    if (currentUserRole === "Developer") {
      toast.error("Access Denied: Admin or SRE role required to connect integrations.");
      return;
    }
    setConnectingId(id);
    setTimeout(() => {
      toggleIntegration(id, "connected");
      setConnectingId(null);
      setSelectedId(null);
      toast.success(`${INTEGRATIONS.find(i => i.id === id)?.name} integration configured and connected!`);
    }, 1500);
  };

  const handleDisconnect = (id: string) => {
    if (currentUserRole === "Developer") {
      toast.error("Access Denied: Admin or SRE role required to modify integrations.");
      return;
    }
    toggleIntegration(id, "not_connected");
    setSelectedId(null);
    toast.success(`${INTEGRATIONS.find(i => i.id === id)?.name} integration disconnected.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Integrations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Connect your cloud providers, services, and notification channels.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-bold text-slate-900 dark:text-white">{connectedCount}</span> of {INTEGRATIONS.filter(i => i.status !== "coming_soon").length} active connected
          </div>
          <div className="h-1.5 w-32 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${(connectedCount / INTEGRATIONS.filter(i => i.status !== "coming_soon").length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeCategory === cat
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((integration, i) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`bg-white dark:bg-slate-900 rounded-xl border shadow-sm p-5 flex flex-col gap-4 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors ${
              integration.status === "connected"
                ? "border-slate-200 dark:border-slate-800"
                : integration.status === "coming_soon"
                  ? "border-slate-100 dark:border-slate-800/50 opacity-60"
                  : "border-slate-200 dark:border-slate-800"
            }`}
            onClick={() => integration.status !== "coming_soon" && setSelectedId(integration.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <integration.icon size={20} className={integration.iconColor} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    {integration.name}
                    {currentUserRole === "Developer" && integration.status !== "coming_soon" && (
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-400 px-1 rounded font-normal select-none" title="Requires SRE or Admin to modify">
                        Read-only
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-500">{integration.category}</p>
                </div>
              </div>
              {integration.status === "connected" && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
              {integration.description}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {integration.tags.map(tag => (
                <span key={tag} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
              <StatusBadge status={integration.status} />
              {integration.status !== "coming_soon" && (
                <button className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  {integration.status === "connected" ? "Manage" : "Configure"}
                  <ArrowRight size={11} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setSelectedId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.18 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl z-50 p-6 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <selected.icon size={22} className={selected.iconColor} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{selected.name}</h3>
                    <p className="text-xs text-slate-500">{selected.category} · {selected.setupTime} setup</p>
                  </div>
                </div>
                <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X size={16} />
                </button>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">{selected.description}</p>

              <div className="space-y-3 mb-5">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Features</h4>
                {selected.tags.map(tag => (
                  <div key={tag} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    {tag} monitoring and alerting
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                {selected.status === "connected" ? (
                  <>
                    <button 
                      onClick={() => toast.success(`Configuration settings open for ${selected.name}`)}
                      className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Settings size={14} /> Settings
                    </button>
                    <button 
                      onClick={() => handleDisconnect(selected.id)}
                      title={currentUserRole === "Developer" ? "Requires Admin or SRE permissions" : undefined}
                      className="flex-1 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-sm font-semibold text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                      Disconnect {currentUserRole === "Developer" && <Lock size={12} className="text-red-500/80 dark:text-red-400/80" />}
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => handleConnect(selected.id)}
                      disabled={connectingId === selected.id}
                      title={currentUserRole === "Developer" ? "Requires Admin or SRE permissions" : undefined}
                      className="flex-1 px-4 py-2 bg-blue-600 text-sm font-semibold text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {connectingId === selected.id ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" /> Connecting...
                        </>
                      ) : (
                        <span className="flex items-center gap-1">
                          Connect Integration {currentUserRole === "Developer" && <Lock size={12} className="text-white/80" />}
                        </span>
                      )}
                    </button>
                    <button className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 transition-colors">
                      <ExternalLink size={14} />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
