"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Key } from "lucide-react";
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

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { theme, setTheme } = useMonitoringStore();
  const pathname = usePathname();

  useSocket();
  useLiveEngine(); // Mount the real-time simulation engine

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    setTheme(saved ?? "dark");
  }, [setTheme]);

  // Global keyboard shortcut event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "SELECT"
      ) {
        return;
      }
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        setShortcutsOpen(o => !o);
      } else if (e.key === "Escape") {
        setShortcutsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {shortcutsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 cursor-pointer"
              onClick={() => setShortcutsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[380px] z-50 card p-6"
              style={{ background: "var(--surface-elevated)", borderColor: "var(--border-default)", boxShadow: "var(--shadow-4)" }}
            >
              <div className="flex justify-between items-center mb-4">
                <p className="heading-section flex items-center gap-1.5">
                  <Key size={14} style={{ color: "var(--brand-600)" }} />
                  Keyboard Shortcuts
                </p>
                <span className="text-[10px] uppercase font-bold" style={{ color: "var(--text-tertiary)" }}>
                  Press Esc to close
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                {[
                  { key: "?",       desc: "Toggle keyboard shortcuts guide" },
                  { key: "Ctrl + K", desc: "Open global command palette" },
                  { key: "Esc",      desc: "Close dialogs or drawers" },
                  { key: "G + D",    desc: "Navigate to main Dashboard" },
                  { key: "G + L",    desc: "Navigate to Live Telemetry stream" },
                  { key: "G + A",    desc: "Navigate to AI Insights" },
                  { key: "G + S",    desc: "Navigate to Settings page" },
                ].map(item => (
                  <div key={item.key} className="flex justify-between items-center py-0.5">
                    <span style={{ color: "var(--text-secondary)" }}>{item.desc}</span>
                    <kbd
                      className="px-2 py-0.5 rounded text-[10px] font-bold font-mono border"
                      style={{
                        background: "var(--surface-2)",
                        borderColor: "var(--border-default)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
