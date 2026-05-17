"use client";

import { useState } from "react";
import { Bell, Menu, Search, Sun, Moon, Wifi, WifiOff, Activity, LogOut, ChevronDown } from "lucide-react";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { NotificationCenter } from "./NotificationCenter";
import { useLiveEngineStore } from "@/hooks/useLiveEngine";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export const TopNavbar = ({ onMenuToggle }: { onMenuToggle: () => void }) => {
  const { theme, setTheme, connectionStatus } = useMonitoringStore();
  const { data: session } = useSession();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { liveMetrics, incidents } = useLiveEngineStore();

  const latest = liveMetrics[liveMetrics.length - 1];
  const criticalCount = incidents.filter(i => i.type === "critical" || i.type === "security").length;

  const metricPills = latest
    ? [
        { label: "CPU",  value: `${latest.cpu.toFixed(0)}%`,   warn: latest.cpu > 80,    crit: latest.cpu > 90 },
        { label: "MEM",  value: `${latest.memory.toFixed(0)}%`, warn: latest.memory > 80, crit: latest.memory > 90 },
        { label: "RPS",  value: `${latest.requestsPerSec}`,    warn: false,              crit: false },
        { label: "P99",  value: `${latest.latencyMs}ms`,       warn: latest.latencyMs > 200, crit: latest.latencyMs > 500 },
      ]
    : [];

  return (
    <header
      style={{
        background: "var(--surface-0)",
        borderBottom: "1px solid var(--border-default)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div className="flex items-center gap-3 px-4 h-[56px] sm:px-6">

        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          aria-label="Open menu"
          className="lg:hidden p-1.5 rounded-md transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = "var(--surface-2)")}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
        >
          <Menu size={18} />
        </button>

        {/* Live metric pills — desktop only */}
        <div className="hidden xl:flex items-center gap-2 flex-1">
          {metricPills.map(({ label, value, warn, crit }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono tabular-nums"
              style={{
                background: crit
                  ? "var(--color-error-bg)"
                  : warn
                  ? "var(--color-warning-bg)"
                  : "var(--surface-2)",
                border: `1px solid ${
                  crit
                    ? "var(--color-error-border)"
                    : warn
                    ? "var(--color-warning-border)"
                    : "var(--border-default)"
                }`,
                color: crit
                  ? "var(--color-error)"
                  : warn
                  ? "var(--color-warning)"
                  : "var(--text-secondary)",
              }}
            >
              <span className="text-[9px] font-bold uppercase" style={{ opacity: 0.65 }}>
                {label}
              </span>
              <span className="font-semibold">{value}</span>
              {(warn || crit) && (
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: crit ? "var(--color-error)" : "var(--color-warning)",
                    animation: "live-ping 2s ease infinite",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Search — center */}
        <div className="hidden md:flex flex-1 max-w-xs items-center gap-2 px-3 py-1.5 rounded-md transition-all"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border-default)",
          }}
          onFocus={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "var(--brand-600)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 3px var(--brand-50)";
          }}
          onBlur={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-default)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          }}
        >
          <Search size={13} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search metrics, services… (⌘K)"
            className="w-full bg-transparent text-xs outline-none"
            style={{ color: "var(--text-primary)", caretColor: "var(--brand-600)" }}
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 ml-auto">

          {/* Connection status chip */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold"
            style={{
              background: connectionStatus === "connected"
                ? "var(--color-success-bg)"
                : connectionStatus === "reconnecting"
                ? "var(--color-warning-bg)"
                : "var(--color-error-bg)",
              border: `1px solid ${
                connectionStatus === "connected"
                  ? "var(--color-success-border)"
                  : connectionStatus === "reconnecting"
                  ? "var(--color-warning-border)"
                  : "var(--color-error-border)"
              }`,
              color: connectionStatus === "connected"
                ? "var(--color-success)"
                : connectionStatus === "reconnecting"
                ? "var(--color-warning)"
                : "var(--color-error)",
            }}
          >
            {connectionStatus === "connected" ? <Wifi size={11} /> : <WifiOff size={11} />}
            <span className="uppercase text-[10px]">{connectionStatus}</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => {
              const next = theme === "light" ? "dark" : "light";
              setTheme(next);
              localStorage.setItem("theme", next);
            }}
            aria-label="Toggle theme"
            className="p-2 rounded-md transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = "var(--surface-2)")}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
          >
            {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(o => !o)}
              aria-label={`Notifications${criticalCount > 0 ? ` (${criticalCount} critical)` : ""}`}
              className="relative p-2 rounded-md transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = "var(--surface-2)")}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
            >
              <Bell size={15} />
              {criticalCount > 0 && (
                <span
                  className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2"
                  style={{
                    background: "var(--color-error)",
                    borderColor: "var(--surface-0)",
                  }}
                >
                  {criticalCount > 9 ? "9+" : criticalCount}
                </span>
              )}
            </button>
            <NotificationCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>

          {/* Divider */}
          <div className="h-5 w-px mx-0.5" style={{ background: "var(--border-default)" }} />

          {/* User menu */}
          <div className="relative">
            <button
              id="user-menu-trigger"
              onClick={() => setUserMenuOpen(o => !o)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = "var(--surface-2)")}
              onMouseLeave={e => {
                if (!userMenuOpen)
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "User"}
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                  style={{ background: "var(--brand-600)" }}
                >
                  {session?.user?.name?.charAt(0) ?? "G"}
                </div>
              )}
              <span
                className="hidden sm:block text-[13px] font-medium max-w-[100px] truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {session?.user?.name ?? "Guest"}
              </span>
              <ChevronDown
                size={12}
                style={{
                  color: "var(--text-tertiary)",
                  transform: userMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 150ms ease",
                }}
              />
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div
                  className="absolute right-0 top-full mt-1 w-44 z-50 rounded-lg overflow-hidden"
                  style={{
                    background: "var(--surface-elevated)",
                    border: "1px solid var(--border-default)",
                    boxShadow: "var(--shadow-3)",
                  }}
                >
                  {session?.user && (
                    <div className="px-3 py-2.5" style={{ borderBottom: "1px solid var(--border-default)" }}>
                      <p className="text-[12px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {session.user.name}
                      </p>
                      <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                        {session.user.email}
                      </p>
                    </div>
                  )}
                  <div className="py-1">
                    {session ? (
                      <button
                        onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/login" }); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[13px] transition-colors text-left"
                        style={{ color: "var(--text-secondary)" }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-2)";
                          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                        }}
                      >
                        <LogOut size={13} />
                        Sign out
                      </button>
                    ) : (
                      <p className="px-3 py-2 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                        Not signed in
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
