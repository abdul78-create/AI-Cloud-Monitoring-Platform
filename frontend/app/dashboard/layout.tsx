"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
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

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.15, ease: "easeOut" } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12, ease: "easeIn" } },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useMonitoringStore();
  const pathname = usePathname();

  useSocket();
  useLiveEngine(); // Mount the real-time simulation engine

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    setTheme(saved ?? "dark");
  }, [setTheme]);

  return (
    <div
      style={{ background: "var(--surface-1)", color: "var(--text-primary)" }}
      className="min-h-screen font-sans relative transition-colors duration-300"
    >
      <div className="lg:flex">
        <SidebarNav isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="min-w-0 flex-1 flex flex-col min-h-screen">
          <TopNavbar onMenuToggle={() => setMenuOpen(true)} />
          <main className="flex-1 px-4 py-6 sm:px-6 max-w-[1600px] mx-auto w-full space-y-6">
            <ErrorBoundary>
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full h-full"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </ErrorBoundary>
          </main>
        </div>
      </div>
      <AIAssistant />
      <CommandPalette />
    </div>
  );
}

