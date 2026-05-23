"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, Bell, BookOpen, BrainCircuit, LayoutDashboard,
  Plug2, Server, Settings, Zap, X, Play, Network,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLiveEngineStore } from "@/hooks/useLiveEngine";
import { TrustBadge } from "./TrustBadge";

type NavItem = {
  name: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  badgeVariant?: "live" | "error" | "default";
};

const FLAT_NAV_ITEMS: NavItem[] = [
  { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Infrastructure", icon: Server, href: "/dashboard/infrastructure" },
  { name: "Monitoring", icon: Activity, href: "/dashboard/monitoring", badge: "LIVE", badgeVariant: "live" },
  { name: "Incidents", icon: Zap, href: "/dashboard/incidents" },
  { name: "Alerts", icon: Bell, href: "/dashboard/alerts" },
  { name: "AI Ops", icon: BrainCircuit, href: "/dashboard/ai-ops" },
  { name: "Integrations", icon: Plug2, href: "/dashboard/integrations" },
  { name: "Architecture", icon: Network, href: "/dashboard/architecture" },
  { name: "Guided Demo", icon: Play, href: "/dashboard/demo", badge: "NEW", badgeVariant: "live" },
  { name: "Docs", icon: BookOpen, href: "/docs" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export const SidebarNav = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const pathname = usePathname();
  const { incidents } = useLiveEngineStore();
  const unresolved = incidents.filter(i => i.type === "critical" || i.type === "security").length;

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
          className="flex items-center justify-between px-4 py-4"
        >
          <div className="flex items-center gap-2">
            <div
              style={{ background: "var(--text-primary)", borderRadius: "6px" }}
              className="h-6 w-6 flex items-center justify-center flex-shrink-0"
            >
              <Activity size={13} style={{ color: "var(--surface-0)" }} />
            </div>
            <div>
              <p className="text-[13px] font-semibold leading-none tracking-tight" style={{ color: "var(--text-primary)" }}>
                CloudAI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 lg:hidden transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5" style={{ scrollbarWidth: "none" }}>
          {FLAT_NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            
            // Dynamic badge for Incidents
            let displayBadge = item.badge;
            let displayVariant = item.badgeVariant;
            if (item.name === "Incidents" && unresolved > 0) {
              displayBadge = String(unresolved);
              displayVariant = "error";
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className="block"
              >
                <div
                  className="relative flex items-center justify-between gap-3 px-3 py-2 rounded-md transition-all duration-150 cursor-pointer group"
                  style={{
                    background: active ? "var(--surface-2)" : "transparent",
                    color: active ? "var(--text-primary)" : "var(--text-secondary)",
                    fontWeight: active ? 500 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLDivElement).style.background = "var(--surface-1)";
                      (e.currentTarget as HTMLDivElement).style.color = "var(--text-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLDivElement).style.background = "transparent";
                      (e.currentTarget as HTMLDivElement).style.color = "var(--text-secondary)";
                    }
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <item.icon
                      size={14}
                      style={{ 
                        color: active ? "var(--text-primary)" : "var(--text-tertiary)", 
                        flexShrink: 0 
                      }}
                      className="group-hover:text-primary transition-colors"
                    />
                    <span className="text-[13px] truncate">{item.name}</span>
                  </div>
                  {displayBadge && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{
                        background: displayVariant === "live"
                          ? "var(--color-success-bg)"
                          : displayVariant === "error"
                            ? "var(--color-error-bg)"
                            : "var(--surface-3)",
                        color: displayVariant === "live"
                          ? "var(--color-success)"
                          : displayVariant === "error"
                            ? "var(--color-error)"
                            : "var(--text-primary)",
                      }}
                    >
                      {displayBadge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Trust Badge */}
        <TrustBadge />

        {/* Footer User Profile / Organization */}
        <div
          style={{ borderTop: "1px solid var(--border-default)" }}
          className="px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 dark:from-slate-700 dark:to-slate-800 border border-black/10 dark:border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium truncate" style={{ color: "var(--text-primary)" }}>Acme Corp</p>
              <p className="text-[10px] truncate" style={{ color: "var(--text-tertiary)" }}>Free Plan</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
