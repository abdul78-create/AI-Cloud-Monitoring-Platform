"use client";

import { useState } from "react";
import { Bell, Menu, Search, Sun, Moon } from "lucide-react";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { NotificationCenter } from "./NotificationCenter";

type TopNavbarProps = {
  onMenuToggle: () => void;
};

export const TopNavbar = ({ onMenuToggle }: TopNavbarProps) => {
  const { theme, setTheme } = useMonitoringStore();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-white/80 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl shadow-sm shadow-slate-100/50 dark:shadow-none transition-colors duration-500">
      <div className="flex items-center gap-4 px-4 py-3 sm:px-6">
        <button onClick={onMenuToggle} className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 lg:hidden" aria-label="Open menu">
          <Menu size={18} />
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              AI
            </div>
            <div>
              <p className="truncate text-sm font-semibold sm:text-base text-slate-900 dark:text-white">AI Cloud Monitoring</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Enterprise Observability</p>
            </div>
          </div>

          <div className="hidden max-w-md flex-1 items-center rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 md:flex focus-within:border-indigo-300 dark:focus-within:border-indigo-500 focus-within:shadow-sm focus-within:shadow-indigo-100/50 transition-all">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search services, metrics, alerts..."
              className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-slate-400 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
              className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/50 p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/50 p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900" />
              </button>
              <NotificationCenter isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
            </div>
            
            <div className="flex items-center gap-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/50 px-2 py-1.5 hover:bg-white dark:hover:bg-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500 transition-all cursor-pointer">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-medium">
                OA
              </div>
              <span className="hidden text-sm text-slate-700 dark:text-slate-300 font-medium sm:inline">Ops Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
