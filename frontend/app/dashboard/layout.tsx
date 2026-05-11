"use client";

import React, { useState, useEffect } from "react";
import { SidebarNav } from "@/dashboard/components/SidebarNav";
import { TopNavbar } from "@/dashboard/components/TopNavbar";
import { AIAssistant } from "@/dashboard/components/AIAssistant";
import { CommandPalette } from "@/dashboard/components/CommandPalette";
import { useSocket } from "@/hooks/useSocket";
import { useMonitoringStore } from "@/store/useMonitoringStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useMonitoringStore();
  useSocket();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme("dark");
    }
  }, [setTheme]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans relative overflow-hidden transition-colors duration-500">
      {/* Background Orbs */}
      <div className="pointer-events-none fixed -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-400/10 dark:bg-indigo-500/10 opacity-50 blur-3xl" />
      <div className="pointer-events-none fixed right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-violet-400/10 dark:bg-violet-500/10 opacity-30 blur-3xl" />
      
      <div className="lg:flex">
        <SidebarNav isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

        <div className="min-w-0 flex-1">
          <TopNavbar onMenuToggle={() => setMenuOpen(true)} />

          <main className="space-y-6 px-4 py-6 sm:px-6 max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </div>
      <AIAssistant />
      <CommandPalette />
    </div>
  );
}
