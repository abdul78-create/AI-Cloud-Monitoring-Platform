"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SidebarNav } from "@/dashboard/components/SidebarNav";
import { TopNavbar } from "@/dashboard/components/TopNavbar";
import { useSocket } from "@/hooks/useSocket";
import { useMonitoringStore } from "@/store/useMonitoringStore";

const AIAssistant = dynamic(() => import("@/dashboard/components/AIAssistant").then(mod => mod.AIAssistant), { ssr: false });
const CommandPalette = dynamic(() => import("@/dashboard/components/CommandPalette").then(mod => mod.CommandPalette), { ssr: false });

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
      {/* Background Orbs (Made subtle) */}
      <div className="pointer-events-none fixed -left-20 -top-20 h-96 w-96 rounded-full bg-slate-400/5 dark:bg-indigo-500/5 opacity-50 blur-3xl" />
      <div className="pointer-events-none fixed right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-slate-400/5 dark:bg-violet-500/5 opacity-30 blur-3xl" />
      
      <div className="lg:flex">
        <SidebarNav isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

        <div className="min-w-0 flex-1">
          <TopNavbar onMenuToggle={() => setMenuOpen(true)} />

          <main className="space-y-6 px-4 py-6 sm:px-6 max-w-7xl mx-auto">
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
