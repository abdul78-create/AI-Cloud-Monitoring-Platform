"use client";

import { Bell, Menu, Search } from "lucide-react";

type TopNavbarProps = {
  onMenuToggle: () => void;
};

export const TopNavbar = ({ onMenuToggle }: TopNavbarProps) => {
  return (
    <header className="sticky top-0 z-20 border-b border-white/80 bg-white/70 backdrop-blur-xl shadow-sm shadow-slate-100/50">
      <div className="flex items-center gap-4 px-4 py-3 sm:px-6">
        <button onClick={onMenuToggle} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden" aria-label="Open menu">
          <Menu size={18} />
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              AI
            </div>
            <div>
              <p className="truncate text-sm font-semibold sm:text-base text-slate-900">AI Cloud Monitoring</p>
              <p className="text-xs text-slate-500 hidden sm:block">Enterprise Observability</p>
            </div>
          </div>

          <div className="hidden max-w-md flex-1 items-center rounded-xl border border-slate-200/60 bg-white/50 px-3 py-1.5 md:flex focus-within:border-indigo-300 focus-within:shadow-sm focus-within:shadow-indigo-100/50 transition-all">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search services, metrics, alerts..."
              className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-slate-400 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="relative rounded-xl border border-slate-200/60 bg-white/50 p-2 text-slate-600 hover:bg-white hover:text-indigo-600 hover:border-indigo-200 transition-all">
              <Bell size={18} />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-white" />
            </button>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white/50 px-2 py-1.5 hover:bg-white hover:border-indigo-200 transition-all cursor-pointer">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-medium">
                OA
              </div>
              <span className="hidden text-sm text-slate-700 font-medium sm:inline">Ops Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
