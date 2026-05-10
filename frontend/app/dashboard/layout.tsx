"use client";

import React, { useState } from "react";
import { SidebarNav } from "@/dashboard/components/SidebarNav";
import { TopNavbar } from "@/dashboard/components/TopNavbar";
import { AIAssistant } from "@/dashboard/components/AIAssistant";
import { CommandPalette } from "@/dashboard/components/CommandPalette";
import { useSocket } from "@/hooks/useSocket";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  useSocket();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative overflow-hidden">
      {/* Background Orbs */}
      <div className="pointer-events-none fixed -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-400/10 opacity-50 blur-3xl" />
      <div className="pointer-events-none fixed right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-violet-400/10 opacity-30 blur-3xl" />
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
