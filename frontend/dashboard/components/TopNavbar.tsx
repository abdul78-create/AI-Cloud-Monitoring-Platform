"use client";

import { useState } from "react";
import { Bell, Menu, Search, Sun, Moon, Wifi, WifiOff, Activity, LogOut } from "lucide-react";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { NotificationCenter } from "./NotificationCenter";
import { useLiveEngineStore } from "@/hooks/useLiveEngine";
import { useSession, signOut } from "next-auth/react";

export const TopNavbar = ({ onMenuToggle }: { onMenuToggle: () => void }) => {
  const { theme, setTheme, connectionStatus } = useMonitoringStore();
  const { data: session } = useSession();
  const [notifOpen, setNotifOpen] = useState(false);
  const { liveMetrics, incidents } = useLiveEngineStore();

  const latest = liveMetrics[liveMetrics.length - 1];
  const criticalCount = incidents.filter(i => i.type === 'critical' || i.type === 'security').length;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 dark:border-white/[0.06] bg-white/80 dark:bg-[#080c14]/80 backdrop-blur-xl shadow-sm shadow-black/[0.03] dark:shadow-none transition-colors duration-300">
      <div className="flex items-center gap-3 px-4 py-2.5 sm:px-6">
        {/* Mobile menu */}
        <button
          onClick={onMenuToggle}
          className="rounded-lg border border-slate-200 dark:border-white/10 p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={16} />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2.5 mr-2">
          <div className="h-7 w-7 rounded-lg bg-slate-900 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Activity size={14} className="text-indigo-400" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">AI Cloud Monitor</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Enterprise Observability</p>
          </div>
        </div>

        {/* Live metric pills (desktop) */}
        {latest && (
          <div className="hidden xl:flex items-center gap-2 flex-1">
            {[
              { label:"CPU",  value:`${latest.cpu.toFixed(0)}%`,   warn: latest.cpu > 80,    crit: latest.cpu > 90 },
              { label:"MEM",  value:`${latest.memory.toFixed(0)}%`, warn: latest.memory > 80, crit: latest.memory > 90 },
              { label:"RPS",  value:`${latest.requestsPerSec}`,    warn: false,              crit: false },
              { label:"LAT",  value:`${latest.latencyMs}ms`,       warn: latest.latencyMs > 200, crit: latest.latencyMs > 500 },
            ].map(({ label, value, warn, crit }) => (
              <div key={label} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
                crit ? 'border-rose-500/30 bg-rose-500/5 text-rose-400' :
                warn ? 'border-amber-500/30 bg-amber-500/5 text-amber-400' :
                'border-white/8 bg-white/[0.03] text-slate-400'
              }`}>
                <span className="text-[9px] font-bold text-slate-500">{label}</span>
                <span className="font-semibold">{value}</span>
                {(warn || crit) && <span className={`h-1 w-1 rounded-full animate-pulse ${crit ? 'bg-rose-400' : 'bg-amber-400'}`} />}
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-xs items-center rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.03] px-3 py-1.5 focus-within:border-indigo-400/50 dark:focus-within:border-indigo-500/30 transition-all">
          <Search size={13} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search services, metrics..."
            className="ml-2 w-full bg-transparent text-xs outline-none placeholder:text-slate-400 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Connection status */}
          <div className={`hidden sm:flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-lg border ${
            connectionStatus === 'connected'
              ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
              : connectionStatus === 'reconnecting'
              ? 'text-amber-400 border-amber-400/20 bg-amber-400/5'
              : 'text-rose-400 border-rose-400/20 bg-rose-400/5'
          }`}>
            {connectionStatus === 'connected' ? <Wifi size={11} /> : <WifiOff size={11} />}
            {connectionStatus.toUpperCase()}
          </div>

          {/* Theme */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white/50 dark:bg-white/[0.03] p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white/50 dark:bg-white/[0.03] p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-all"
              aria-label="Notifications"
            >
              <Bell size={15} />
              {criticalCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-rose-500 border-2 border-white dark:border-[#080c14] flex items-center justify-center text-[8px] font-bold text-white">
                  {criticalCount > 9 ? '9+' : criticalCount}
                </span>
              )}
            </button>
            <NotificationCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>

          {/* User avatar */}
          <div className="relative group">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white/50 dark:bg-white/[0.03] px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-all cursor-pointer">
              {session?.user?.image ? (
                <img src={session.user.image} alt={session.user.name ?? "User"}
                  className="h-6 w-6 rounded-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[9px] font-bold">
                  {session?.user?.name?.charAt(0) ?? "O"}
                </div>
              )}
              <span className="hidden sm:block text-xs text-slate-700 dark:text-slate-300 font-medium max-w-[100px] truncate">
                {session?.user?.name ?? "Ops Admin"}
              </span>
            </div>
            {/* Sign-out dropdown */}
            {session && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-150 z-50 overflow-hidden">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <LogOut size={12} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
