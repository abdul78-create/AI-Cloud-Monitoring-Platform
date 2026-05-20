"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, AlertTriangle, BarChart3, BrainCircuit, FileSearch,
  LayoutDashboard, Server, Settings, Shield, Zap, Box, Network, X,
  ChevronRight, Plus, BookOpen, PlusCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLiveEngineStore } from "@/hooks/useLiveEngine";

type NavItem = {
  name: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  badgeVariant?: "live" | "count";
  section?: string;
};

const items: NavItem[] = [
  /* ── Overview ── */
  { name: "Dashboard",              section: "Overview",        icon: LayoutDashboard, href: "/dashboard" },
  { name: "Live Monitoring",        section: "Overview",        icon: Activity,        href: "/dashboard/live",                     badge: "LIVE", badgeVariant: "live" },

  /* ── Intelligence ── */
  { name: "AI Insights",            section: "Intelligence",    icon: BrainCircuit,    href: "/dashboard/ai-insights",              badge: "LIVE", badgeVariant: "live" },
  { name: "Logs Analyzer",          section: "Intelligence",    icon: FileSearch,      href: "/ai" },

  /* ── Infrastructure ── */
  { name: "Connect Infrastructure", section: "Infrastructure",  icon: PlusCircle,      href: "/dashboard/connect",                  badge: "NEW",  badgeVariant: "live" },
  { name: "Topology",               section: "Infrastructure",  icon: Network,         href: "/dashboard/topology" },
  { name: "Infra Analytics",        section: "Infrastructure",  icon: Server,          href: "/dashboard/infrastructure-analytics" },
  { name: "Deployment Analytics",   section: "Infrastructure",  icon: Box,             href: "/dashboard/deployment" },

  /* ── Incidents ── */
  { name: "Incidents",              section: "Incidents",       icon: Zap,             href: "/dashboard/incidents" },
  { name: "Incident Analytics",     section: "Incidents",       icon: BarChart3,       href: "/dashboard/incident-analytics" },
  { name: "Alerts",                 section: "Incidents",       icon: AlertTriangle,   href: "/dashboard/incidents" },

  /* ── Security ── */
  { name: "Security Center",        section: "Security",        icon: Shield,          href: "/dashboard/security" },

  /* ── Settings ── */
  { name: "Settings",               section: "Settings",        icon: Settings,        href: "/dashboard/settings" },
  { name: "Documentation",          section: "Settings",        icon: BookOpen,        href: "/docs" },
];

const SECTIONS = ["Overview", "Intelligence", "Infrastructure", "Incidents", "Security", "Settings"];

export const SidebarNav = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const pathname = usePathname();
  const { incidents } = useLiveEngineStore();
  const unresolved = incidents.filter(i => i.type === "critical" || i.type === "security").length;

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
          fixed left-0 top-0 z-30 h-full w-60 flex flex-col
          transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]
          lg:static lg:z-10 lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* ── Brand ── */}
        <div
          style={{ borderBottom: "1px solid var(--border-default)" }}
          className="flex items-center justify-between px-4 py-[13px]"
        >
          <div className="flex items-center gap-2.5">
            <div
              style={{ background: "var(--brand-600)", borderRadius: "var(--radius-md)" }}
              className="h-7 w-7 flex items-center justify-center flex-shrink-0"
            >
              <Activity size={14} className="text-white" />
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                AI Cloud Monitor
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                Enterprise Observability
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 lg:hidden transition-colors"
            style={{ color: "var(--text-secondary)" }}
            aria-label="Close sidebar"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar py-3">
          {SECTIONS.map(section => {
            const sectionItems = items.filter(i => i.section === section);
            if (!sectionItems.length) return null;
            return (
              <div key={section} className="mb-1">
                {/* Section label */}
                <p
                  className="text-label px-4 pt-3 pb-1"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {section}
                </p>
                {sectionItems.map(item => {
                  const active =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);
                  const isIncidentItem =
                    item.href === "/dashboard/incidents" && item.name !== "Incident Analytics";
                  const badgeCount = isIncidentItem && unresolved > 0 ? unresolved : 0;

                  return (
                    <Link
                      key={item.name + item.href}
                      href={item.href}
                      onClick={onClose}
                      className="block px-2 mx-2 my-0.5"
                    >
                      <div
                        className="relative flex items-center justify-between gap-2 px-2 py-[7px] rounded-md transition-all duration-100 cursor-pointer group"
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
                        {/* Active left accent */}
                        {active && (
                          <motion.div
                            layoutId="sidebar-active-bar"
                            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 w-0.5 h-5 rounded-r-full"
                            style={{ background: "var(--brand-600)" }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}

                        <div className="flex items-center gap-2.5 min-w-0">
                          <item.icon
                            size={15}
                            style={{ color: active ? "var(--brand-600)" : "var(--text-tertiary)", flexShrink: 0 }}
                          />
                          <span className="text-[13px] font-medium truncate">{item.name}</span>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {item.badge && badgeCount === 0 && (
                            <span className="badge badge-live text-[9px] px-1.5 py-0.5">
                              {item.badge}
                            </span>
                          )}
                          {badgeCount > 0 && (
                            <span className="badge badge-critical text-[9px] px-1.5 py-0.5">
                              {badgeCount > 99 ? "99+" : badgeCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* ── Footer status ── */}
        <div
          style={{ borderTop: "1px solid var(--border-default)" }}
          className="px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <span className="live-dot text-[11px]">All systems operational</span>
          </div>
        </div>
      </aside>
    </>
  );
};
