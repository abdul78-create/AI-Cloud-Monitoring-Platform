"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, AlertTriangle, BarChart3, BrainCircuit, FileSearch, LayoutDashboard, Server, Settings, Shield, Zap, MessageSquare, Box, X } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "AI Insights", icon: BrainCircuit, href: "/dashboard/ai-insights" },
  { name: "Logs Analyzer", icon: FileSearch, href: "/ai" },
  { name: "Live Monitoring", icon: Activity, href: "/dashboard/live" },
  { name: "Security Center", icon: Shield, href: "/dashboard/security" },
  { name: "Infrastructure Analytics", icon: Server, href: "/dashboard/infrastructure-analytics" },
  { name: "Deployment Analytics", icon: Box, href: "/dashboard/deployment" },
  { name: "Incidents", icon: Zap, href: "/dashboard/incidents" },
  { name: "Alerts", icon: AlertTriangle, href: "/dashboard/alerts" },
  { name: "Settings", icon: Settings, href: "/settings" }
];

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const SidebarNav = ({ isOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <>
      {isOpen && <button aria-label="Close menu" className="fixed inset-0 z-20 bg-slate-900/20 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed left-0 top-0 z-30 h-full w-72 border-r border-white/80 bg-white/70 p-5 backdrop-blur-xl transition-transform duration-300 lg:static lg:z-10 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
              <Activity size={16} />
            </div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800">Control Panel</h2>
          </div>
          <button className="rounded-lg border border-slate-200 p-1.5 lg:hidden" onClick={onClose}>
            <X size={16} className="text-slate-600" />
          </button>
        </div>

        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-100px)] custom-scrollbar">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className="block" onClick={onClose}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-1.5 text-sm transition-all duration-200 ${
                    active
                      ? "border-slate-200/60 bg-white shadow-sm text-indigo-600 font-medium"
                      : "border-transparent text-slate-600 hover:bg-white/50 hover:text-slate-900"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500 group-hover:bg-white'}`}>
                    <item.icon size={14} />
                  </div>
                  <span>{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
