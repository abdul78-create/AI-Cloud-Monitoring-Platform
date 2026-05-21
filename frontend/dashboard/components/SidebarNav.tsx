"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, AlertTriangle, BarChart3, BrainCircuit, FileSearch,
  LayoutDashboard, Server, Settings, Shield, Zap, Box, Network, X,
  BookOpen, Plug2, Bell, Cpu, GitBranch, ChevronDown, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLiveEngineStore } from "@/hooks/useLiveEngine";
import { useState } from "react";

type NavItem = {
  name: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  badgeVariant?: "live" | "count" | "new";
};

type NavSection = {
  id: string;
  label: string;
  icon: React.ElementType;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    items: [
      { name: "Global Health", icon: Activity, href: "/dashboard", badge: "LIVE", badgeVariant: "live" },
      { name: "Live Monitoring", icon: BarChart3, href: "/dashboard/live", badge: "LIVE", badgeVariant: "live" },
    ],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    icon: Server,
    items: [
      { name: "Servers & VMs", icon: Server, href: "/dashboard/infrastructure" },
      { name: "Topology Map", icon: Network, href: "/dashboard/topology" },
      { name: "Connect Source", icon: Plug2, href: "/dashboard/connect", badge: "NEW", badgeVariant: "new" },
    ],
  },
  {
    id: "incidents",
    label: "Incidents",
    icon: Zap,
    items: [
      { name: "Active Incidents", icon: Zap, href: "/dashboard/incidents" },
      { name: "Incident Analytics", icon: BarChart3, href: "/dashboard/incident-analytics" },
      { name: "Deployment Tracking", icon: GitBranch, href: "/dashboard/deployment" },
    ],
  },
  {
    id: "monitoring",
    label: "Monitoring",
    icon: Activity,
    items: [
      { name: "Telemetry & Metrics", icon: Activity, href: "/dashboard/monitoring" },
      { name: "AI Log Analyzer", icon: FileSearch, href: "/ai" },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Plug2,
    items: [
      { name: "Cloud & Services", icon: Plug2, href: "/dashboard/integrations" },
    ],
  },
  {
    id: "alerts",
    label: "Alerts",
    icon: Bell,
    items: [
      { name: "Alert Rules", icon: Bell, href: "/dashboard/alerts" },
      { name: "Security Center", icon: Shield, href: "/dashboard/security" },
    ],
  },
  {
    id: "ai-ops",
    label: "AI Operations",
    icon: BrainCircuit,
    items: [
      { name: "AI Anomaly Detection", icon: BrainCircuit, href: "/dashboard/ai-ops" },
      { name: "AI Insights", icon: Cpu, href: "/dashboard/ai-insights", badge: "LIVE", badgeVariant: "live" },
    ],
  },
  {
    id: "docs",
    label: "Documentation",
    icon: BookOpen,
    items: [
      { name: "Setup Guides", icon: BookOpen, href: "/docs" },
      { name: "API Reference", icon: FileSearch, href: "/docs/api" },
      { name: "Agent Install", icon: Server, href: "/docs/agent" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    items: [
      { name: "Workspace Settings", icon: Settings, href: "/dashboard/settings" },
    ],
  },
];

export const SidebarNav = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const pathname = usePathname();
  const { incidents } = useLiveEngineStore();
  const unresolved = incidents.filter(i => i.type === "critical" || i.type === "security").length;

  // Track which sections are collapsed; default all open
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.button
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-label="Close menu"
            className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        style={{ background: "var(--surface-0)", borderRight: "1px solid var(--border-default)" }}
        className={`
          fixed left-0 top-0 z-30 h-full w-56 flex flex-col
          transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]
          lg:static lg:z-10 lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div
          style={{ borderBottom: "1px solid var(--border-default)" }}
          className="flex items-center justify-between px-3 py-3"
        >
          <div className="flex items-center gap-2">
            <div
              style={{ background: "var(--brand-600)", borderRadius: "6px" }}
              className="h-6 w-6 flex items-center justify-center flex-shrink-0"
            >
              <Activity size={13} className="text-white" />
            </div>
            <div>
              <p className="text-[12px] font-semibold leading-none" style={{ color: "var(--text-primary)" }}>
                CloudAI Monitor
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                Enterprise Observability
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 lg:hidden"
            style={{ color: "var(--text-secondary)" }}
          >
            <X size={13} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: "none" }}>
          {NAV_SECTIONS.map(section => {
            const isCollapsed = collapsed[section.id];
            const SectionIcon = section.icon;
            const hasActiveChild = section.items.some(item => isActive(item.href));
            const incidentSection = section.id === "incidents";

            return (
              <div key={section.id} className="mb-0.5">
                {/* Section header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-3 py-1.5 group transition-colors"
                  style={{ color: hasActiveChild ? "var(--brand-600)" : "var(--text-tertiary)" }}
                >
                  <div className="flex items-center gap-1.5">
                    <SectionIcon size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{section.label}</span>
                    {incidentSection && unresolved > 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}>
                        {unresolved}
                      </span>
                    )}
                  </div>
                  {isCollapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
                </button>

                {/* Section items */}
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      {section.items.map(item => {
                        const active = isActive(item.href);
                        return (
                          <Link
                            key={item.name + item.href}
                            href={item.href}
                            onClick={onClose}
                            className="block px-2 mx-1 my-0.5"
                          >
                            <div
                              className="relative flex items-center justify-between gap-2 px-2 py-[6px] rounded-md transition-all duration-100 cursor-pointer"
                              style={{
                                background: active ? "var(--brand-50)" : "transparent",
                                color: active ? "var(--brand-600)" : "var(--text-secondary)",
                              }}
                              onMouseEnter={e => {
                                if (!active) {
                                  (e.currentTarget as HTMLDivElement).style.background = "var(--surface-2)";
                                  (e.currentTarget as HTMLDivElement).style.color = "var(--text-primary)";
                                }
                              }}
                              onMouseLeave={e => {
                                if (!active) {
                                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                                  (e.currentTarget as HTMLDivElement).style.color = "var(--text-secondary)";
                                }
                              }}
                            >
                              {active && (
                                <motion.div
                                  layoutId="sidebar-active-bar"
                                  className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 w-0.5 h-4 rounded-r-full"
                                  style={{ background: "var(--brand-600)" }}
                                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                              )}
                              <div className="flex items-center gap-2 min-w-0">
                                <item.icon
                                  size={13}
                                  style={{ color: active ? "var(--brand-600)" : "var(--text-tertiary)", flexShrink: 0 }}
                                />
                                <span className="text-[12px] font-medium truncate">{item.name}</span>
                              </div>
                              {item.badge && (
                                <span
                                  className="text-[8px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                                  style={{
                                    background: item.badgeVariant === "live"
                                      ? "var(--color-success-bg)"
                                      : item.badgeVariant === "new"
                                        ? "var(--brand-50)"
                                        : "var(--color-error-bg)",
                                    color: item.badgeVariant === "live"
                                      ? "var(--color-success)"
                                      : item.badgeVariant === "new"
                                        ? "var(--brand-600)"
                                        : "var(--color-error)",
                                  }}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Footer status */}
        <div
          style={{ borderTop: "1px solid var(--border-default)" }}
          className="px-3 py-3 space-y-1"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>All systems operational</span>
          </div>
          <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>v2.4.1 · Production</p>
        </div>
      </aside>
    </>
  );
};
