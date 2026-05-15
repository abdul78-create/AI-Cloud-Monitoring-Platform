"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SidebarNav } from "@/dashboard/components/SidebarNav";
import { TopNavbar } from "@/dashboard/components/TopNavbar";
import { useSocket } from "@/hooks/useSocket";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { useLiveEngine } from "@/hooks/useLiveEngine";

const AIAssistant = dynamic(
  () => import("@/dashboard/components/AIAssistant").then(m => m.AIAssistant),
  { ssr: false }
);
const CommandPalette = dynamic(
  () => import("@/dashboard/components/CommandPalette").then(m => m.CommandPalette),
  { ssr: false }
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useMonitoringStore();

  useSocket();
  useLiveEngine(); // Mount the real-time simulation engine

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    setTheme(saved ?? "dark");
  }, [setTheme]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080c14] text-slate-900 dark:text-slate-50 font-sans relative transition-colors duration-300">
      <div className="lg:flex">
        <SidebarNav isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="min-w-0 flex-1 flex flex-col min-h-screen">
          <TopNavbar onMenuToggle={() => setMenuOpen(true)} />
          <main className="flex-1 px-4 py-6 sm:px-6 max-w-[1600px] mx-auto w-full space-y-6">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
      <AIAssistant />
      <CommandPalette />
    </div>
  );
}
