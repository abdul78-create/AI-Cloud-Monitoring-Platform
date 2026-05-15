"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, AlertTriangle, BarChart3, BrainCircuit, FileSearch,
  LayoutDashboard, Server, Settings, Shield, Zap, Box, Network, X
} from "lucide-react";
import { motion } from "framer-motion";
import { useLiveEngineStore } from "@/hooks/useLiveEngine";

const items = [
  { name: "Dashboard",                icon: LayoutDashboard, href: "/dashboard" },
  { name: "AI Insights",              icon: BrainCircuit,    href: "/dashboard/ai-insights",              badge: "LIVE" },
  { name: "Logs Analyzer",            icon: FileSearch,      href: "/ai" },
  { name: "Live Monitoring",          icon: Activity,        href: "/dashboard/live",                     badge: "LIVE" },
  { name: "Topology",                 icon: Network,         href: "/dashboard/topology" },
  { name: "Security Center",          icon: Shield,          href: "/dashboard/security" },
  { name: "Infra Analytics",          icon: Server,          href: "/dashboard/infrastructure-analytics" },
  { name: "Deployment Analytics",     icon: Box,             href: "/dashboard/deployment" },
  { name: "Incident Analytics",       icon: BarChart3,       href: "/dashboard/incident-analytics" },
  { name: "Incidents",                icon: Zap,             href: "/dashboard/incidents" },
  { name: "Alerts",                   icon: AlertTriangle,   href: "/dashboard/incidents" },
  { name: "Settings",                 icon: Settings,        href: "/dashboard/settings" },
];

export const SidebarNav = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const pathname = usePathname();
  const { incidents } = useLiveEngineStore();
  const unresolved = incidents.filter(i => i.type === 'critical' || i.type === 'security').length;

  return (
    <>
      {isOpen && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`fixed left-0 top-0 z-30 h-full w-64 border-r border-white/5 bg-white/80 dark:bg-[#080c14]/90 backdrop-blur-xl p-4 transition-transform duration-300 ease-out lg:static lg:z-10 lg:translate-x-0 flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Brand */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-slate-900 dark:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Activity size={14} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide uppercase">Control Panel</h2>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" /> Live
              </div>
            </div>
          </div>
          <button className="rounded-lg border border-slate-200 dark:border-white/10 p-1.5 lg:hidden" onClick={onClose}>
            <X size={14} className="text-slate-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto custom-scrollbar">
          {items.map((item) => {
            const active = pathname === item.href;
            const isIncident = item.href === "/dashboard/incidents";
            return (
              <Link key={item.name + item.href} href={item.href} className="block" onClick={onClose}>
                <motion.div
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.15 }}
                  className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-all duration-150 ${
                    active
                      ? "bg-slate-900 dark:bg-white/10 text-white dark:text-white border border-white/10 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      active
                        ? "bg-white/10 text-white"
                        : "bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400"
                    }`}>
                      <item.icon size={13} />
                    </div>
                    <span className="font-medium text-[13px]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {isIncident && unresolved > 0 && (
                      <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-full">
                        {unresolved}
                      </span>
                    )}
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 px-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-slate-400">All systems operational</span>
          </div>
        </div>
      </aside>
    </>
  );
};
