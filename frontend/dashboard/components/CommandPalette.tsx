"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, Zap, Shield, Server, Box, Activity, Brain, FileSearch, Settings, Command, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

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
    }
  }, [isOpen]);

  const items = [
    { name: "Dashboard", icon: Globe, href: "/dashboard", category: "Navigation" },
    { name: "AI Insights", icon: Brain, href: "/dashboard/ai-insights", category: "Navigation" },
    { name: "Logs Analyzer", icon: FileSearch, href: "/ai", category: "Navigation" },
    { name: "Live Monitoring", icon: Activity, href: "/dashboard/live", category: "Navigation" },
    { name: "Security Center", icon: Shield, href: "/dashboard/security", category: "Navigation" },
    { name: "Infrastructure Analytics", icon: Server, href: "/dashboard/infrastructure-analytics", category: "Navigation" },
    { name: "Deployment Analytics", icon: Box, href: "/dashboard/deployment", category: "Navigation" },
    { name: "Incidents", icon: Zap, href: "/dashboard/incidents", category: "Navigation" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings", category: "Navigation" },
    
    // Quick Actions
    { name: "Restart Node", icon: RefreshCw, href: "#", category: "Quick Actions" },
    { name: "Scale Service", icon: Zap, href: "#", category: "Quick Actions" },
    { name: "Isolate Node", icon: Shield, href: "#", category: "Quick Actions" },
    { name: "View Logs", icon: FileSearch, href: "#", category: "Quick Actions" },
    
    // Recent Searches (Mocked)
    { name: "CPU usage high", icon: Search, href: "#", category: "Recent Searches" },
    { name: "Cluster-B status", icon: Server, href: "#", category: "Recent Searches" },
  ];

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleNavigate = (href: string) => {
    router.push(href);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-[500px] max-w-[calc(100vw-32px)] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700 shadow-premium overflow-hidden transition-colors duration-500"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <Search size={18} className="text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 dark:text-white placeholder:text-slate-400"
              />
              <div className="flex items-center gap-1 text-xs text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                <Command size={10} /> K
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
              {filteredItems.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500 dark:text-slate-400">
                  No results found for "{search}"
                </div>
              ) : (
                <div className="space-y-4">
                  {["Recent Searches", "Quick Actions", "Navigation"].map((category) => {
                    const categoryItems = filteredItems.filter(i => i.category === category);
                    if (categoryItems.length === 0) return null;
                    return (
                      <div key={category} className="space-y-0.5">
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          {category}
                        </div>
                        {categoryItems.map((item) => (
                          <button
                            key={item.name}
                            onClick={() => handleNavigate(item.href)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-left group"
                          >
                            <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                              <item.icon size={14} />
                            </div>
                            <span className="font-medium">{item.name}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              <span>Tip: Use arrow keys to navigate (coming soon)</span>
              <span>ESC to close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
