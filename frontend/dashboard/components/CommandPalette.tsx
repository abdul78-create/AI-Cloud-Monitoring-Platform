"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, Zap, Shield, Server, Box, Activity, Brain, FileSearch, Settings, Command, RefreshCw, Moon, Sun, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import toast from "react-hot-toast";

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { theme, setTheme, clearAiResult, socket } = useMonitoringStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSelectedIndex(0);
      setSearch("");
    }
  }, [isOpen]);

  const items = useMemo(() => [
    // Navigation
    { name: "Jump to Overview", icon: Globe, category: "Navigation", action: () => router.push("/dashboard") },
    { name: "Live Telemetry Stream", icon: Activity, category: "Navigation", action: () => router.push("/dashboard/live") },
    { name: "AI Log Analyzer", icon: FileSearch, category: "Navigation", action: () => router.push("/ai") },
    { name: "AI Insights Center", icon: Brain, category: "Navigation", action: () => router.push("/dashboard/ai-insights") },
    { name: "Incident Intelligence", icon: Zap, category: "Navigation", action: () => router.push("/dashboard/incidents") },
    { name: "Control Settings Panel", icon: Settings, category: "Navigation", action: () => router.push("/dashboard/settings") },
    
    // Quick Actions
    {
      name: "Reconnect Telemetry Stream",
      icon: RefreshCw,
      category: "Quick Actions",
      action: () => {
        if (socket) {
          socket.connect();
          toast.success("Telemetry reconnection request emitted.");
        } else {
          toast.error("WebSocket server stream uninitialized.");
        }
      }
    },
    {
      name: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
      icon: theme === "dark" ? Sun : Moon,
      category: "Quick Actions",
      action: () => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        setTheme(nextTheme);
        toast.success(`Theme updated to ${nextTheme} mode.`);
      }
    },
    {
      name: "Clear AI Insights Cache",
      icon: Trash2,
      category: "Quick Actions",
      action: () => {
        clearAiResult();
        toast.success("AI diagnostics buffer purged.");
      }
    }
  ], [router, theme, setTheme, clearAiResult, socket]);

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  // Reset selection index when search query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Handle arrow keys and enter
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyboardSelection = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          selected.action();
          setIsOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyboardSelection);
    return () => window.removeEventListener("keydown", handleKeyboardSelection);
  }, [isOpen, filteredItems, selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs cursor-pointer"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-[460px] max-w-[calc(100vw-24px)] rounded-xl border shadow-premium overflow-hidden flex flex-col"
            style={{
              background: "var(--surface-elevated)",
              borderColor: "var(--border-default)",
              boxShadow: "var(--shadow-4)"
            }}
          >
            {/* Search Input Area */}
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-1)" }}>
              <Search size={15} style={{ color: "var(--text-tertiary)" }} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search commands, environments or jump to views…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-xs"
                style={{ color: "var(--text-primary)", caretColor: "var(--brand-600)" }}
              />
              <div className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border"
                style={{ background: "var(--surface-2)", borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
              >
                <Command size={8} /> K
              </div>
            </div>

            {/* Results list */}
            <div className="max-h-[280px] overflow-y-auto p-1.5 custom-scrollbar" style={{ background: "var(--surface-0)" }}>
              {filteredItems.length === 0 ? (
                <div className="text-center py-6 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  No match found for "{search}"
                </div>
              ) : (
                <div className="space-y-3">
                  {["Navigation", "Quick Actions"].map((category) => {
                    const categoryItems = filteredItems.filter(i => i.category === category);
                    if (categoryItems.length === 0) return null;
                    return (
                      <div key={category} className="space-y-0.5">
                        <div className="px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                          {category}
                        </div>
                        {categoryItems.map((item) => {
                          // Find index in overall filteredItems list
                          const overallIndex = filteredItems.indexOf(item);
                          const isSelected = overallIndex === selectedIndex;

                          return (
                            <button
                              key={item.name}
                              onClick={() => {
                                item.action();
                                setIsOpen(false);
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all text-left"
                              style={{
                                background: isSelected ? "var(--brand-50)" : "transparent",
                                color: isSelected ? "var(--brand-600)" : "var(--text-secondary)",
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-1 rounded flex items-center justify-center flex-shrink-0"
                                  style={{
                                    background: isSelected ? "var(--surface-0)" : "var(--surface-1)",
                                    color: isSelected ? "var(--brand-600)" : "var(--text-tertiary)",
                                    border: `1px solid ${isSelected ? "var(--border-default)" : "var(--border-subtle)"}`
                                  }}
                                >
                                  <item.icon size={12} />
                                </div>
                                <span className="font-semibold">{item.name}</span>
                              </div>
                              {isSelected && (
                                <span className="text-[10px] font-bold" style={{ color: "var(--brand-600)" }}>
                                  Enter ↵
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Accessible Footer */}
            <div className="px-4 py-2 border-t flex justify-between items-center text-[10px] font-semibold"
              style={{ borderColor: "var(--border-subtle)", background: "var(--surface-1)", color: "var(--text-tertiary)" }}
            >
              <div className="flex items-center gap-2">
                <span>↑↓ to navigate</span>
                <span>•</span>
                <span>↵ to select</span>
              </div>
              <span>ESC to close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
