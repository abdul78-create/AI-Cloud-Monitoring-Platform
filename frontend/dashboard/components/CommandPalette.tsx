"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, Zap, Shield, Server, Box, Activity, Brain, FileSearch, Settings, Command, RefreshCw, Moon, Sun, Trash2, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { useLiveEngineStore } from "@/hooks/useLiveEngine";
import toast from "react-hot-toast";

interface PaletteItem {
  name: string;
  aliases: string[];
  icon: React.ElementType;
  category: "Pages" | "Incidents" | "Services" | "Metrics" | "Actions" | "Docs" | "Integrations";
  action: () => void;
}

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  
  const { 
    theme, setTheme, 
    clearAiResult, socket, 
    serviceHealth, infrastructure, 
    integrationStates, isErrorInjected, 
    setIsErrorInjected 
  } = useMonitoringStore();

  const { incidents } = useLiveEngineStore();

  // Load click frequencies from localStorage on mount/open
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem("palette_command_clicks");
      if (saved) {
        try {
          setClickCounts(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [isOpen]);

  // Record command invocation clicks to rank frequently used commands first (Predictive Ranking)
  const handleItemExecute = React.useCallback((item: PaletteItem) => {
    const updated = { ...clickCounts, [item.name]: (clickCounts[item.name] || 0) + 1 };
    setClickCounts(updated);
    localStorage.setItem("palette_command_clicks", JSON.stringify(updated));
    item.action();
    setIsOpen(false);
  }, [clickCounts]);

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

  const items = useMemo<PaletteItem[]>(() => {
    const list: PaletteItem[] = [
      // 1. Pages (Navigation)
      { name: "Navigate to Overview Dashboard", aliases: ["dashboard", "home", "overview"], icon: Globe, category: "Pages", action: () => router.push("/dashboard") },
      { name: "Navigate to Live Telemetry Stream", aliases: ["live", "telemetry", "stream", "realtime"], icon: Activity, category: "Pages", action: () => router.push("/dashboard/live") },
      { name: "Navigate to AI Operations Center", aliases: ["open ai ops", "ai", "aiops", "anomalies", "forecast"], icon: Brain, category: "Pages", action: () => router.push("/dashboard/ai-ops") },
      { name: "Navigate to Topology Map", aliases: ["show topology", "topology", "map", "infrastructure"], icon: Globe, category: "Pages", action: () => router.push("/dashboard/topology") },
      { name: "Navigate to Alerts History", aliases: ["open alert history", "alerts", "history", "notifications"], icon: Bell, category: "Pages", action: () => router.push("/dashboard/alerts") },
      { name: "Navigate to System Settings", aliases: ["settings", "config", "rbac", "keys"], icon: Settings, category: "Pages", action: () => router.push("/dashboard/settings") },
      { name: "Navigate to Documentation", aliases: ["docs", "help", "guide", "install"], icon: FileSearch, category: "Pages", action: () => router.push("/docs") },

      // 2. Actions (Direct Execution)
      {
        name: "Action: Restart Redis Cluster Node (cache-redis)",
        aliases: ["restart redis", "reboot redis", "fix cache", "redis"],
        icon: RefreshCw,
        category: "Actions",
        action: () => {
          const role = useMonitoringStore.getState().currentUserRole;
          if (role === "Developer") {
            toast.error("Access Denied: Admin or SRE role required to restart nodes.", { icon: "🚫" });
            return;
          }
          const toastId = toast.loading("Initiating remote restart sequence on 'cache-redis'...");
          useMonitoringStore.setState((state) => ({
            infrastructure: state.infrastructure.map((n) =>
              n.service === "cache-redis" ? { ...n, status: "down" } : n
            )
          }));
          useMonitoringStore.getState().addAuditLog("Command Palette executed: host restart on cache-redis", "node");
          setTimeout(() => {
            useMonitoringStore.setState((state) => ({
              infrastructure: state.infrastructure.map((n) =>
                n.service === "cache-redis" ? { ...n, status: "healthy" } : n
              )
            }));
            toast.success("Redis Cluster Node 'cache-redis' successfully restarted.", { id: toastId });
          }, 3000);
        }
      },
      {
        name: "Action: Trigger Incident Replay Scenario",
        aliases: ["trigger replay", "replay", "simulate incident", "outage"],
        icon: Zap,
        category: "Actions",
        action: () => {
          useMonitoringStore.setState({
            rootCause: "cache-redis latency breach (850ms) due to client connection pool exhaustion",
            playbook: [
              "redis-cli ping",
              "sudo systemctl restart redis-server",
              "redis-cli info stats | grep connections"
            ]
          });
          useLiveEngineStore.setState({
            incidents: [
              {
                id: "inc-manual-replay",
                type: "critical",
                title: "Redis Response Latency Breach",
                message: "redis-cache p99 latency crossed SLA threshold: 850ms in us-east-1",
                service: "cache-redis",
                timestamp: new Date().toISOString()
              }
            ]
          });
          useMonitoringStore.getState().addAuditLog("Triggered demo incident scenario replay: Redis latency breach", "system");
          toast.success("Incident replay scenario triggered! Inspect the AI Recommendations panel.");
        }
      },
      {
        name: theme === "dark" ? "Switch theme to Light Mode" : "Switch theme to Dark Mode",
        aliases: ["theme", "color", "dark mode", "light mode"],
        icon: theme === "dark" ? Sun : Moon,
        category: "Actions",
        action: () => {
          const next = theme === "dark" ? "light" : "dark";
          setTheme(next);
          toast.success(`Theme switched to ${next} mode`);
        }
      },
      {
        name: isErrorInjected ? "Deactivate API Outage Simulation" : "Simulate API Outage (Inject 504 Error)",
        aliases: ["outage", "simulate", "error", "fail", "degrade", "504"],
        icon: Shield,
        category: "Actions",
        action: () => {
          setIsErrorInjected(!isErrorInjected);
          toast.success(!isErrorInjected ? "Simulated API outage activated" : "Simulated API outage cleared");
        }
      },
      {
        name: "Purge AI Diagnostics Cache Buffer",
        aliases: ["clear ai", "purge", "reset buffer"],
        icon: Trash2,
        category: "Actions",
        action: () => {
          clearAiResult();
          toast.success("AI diagnostics buffer purged");
        }
      },
      {
        name: "Force Telemetry Socket Reconnect",
        aliases: ["connect socket", "reconnect", "websocket"],
        icon: RefreshCw,
        category: "Actions",
        action: () => {
          if (socket) {
            socket.connect();
            toast.success("WebSocket connection event triggered");
          } else {
            toast.error("WebSocket client not initialized");
          }
        }
      }
    ];

    // 3. Dynamic Incidents
    incidents.slice(0, 5).forEach((inc) => {
      list.push({
        name: `Investigate Incident: [${inc.service}] ${inc.title}`,
        aliases: [inc.service, "incident", inc.type],
        icon: Zap,
        category: "Incidents",
        action: () => {
          router.push("/dashboard/incidents");
          toast.success(`Opening incident trace for ${inc.service}`);
        }
      });
    });

    // 4. Dynamic Services
    (serviceHealth || []).forEach((svc) => {
      list.push({
        name: `Service Diagnostics: ${svc.name} (${svc.status})`,
        aliases: [svc.name, "service", svc.status.toLowerCase()],
        icon: Server,
        category: "Services",
        action: () => {
          router.push(`/dashboard/topology?service=${svc.name}`);
          toast.success(`Focusing topology map on ${svc.name}`);
        }
      });
    });

    // 5. Dynamic Infrastructure Nodes
    (infrastructure || []).forEach((node) => {
      list.push({
        name: `Node Details & Shell: ${node.service} (${node.status})`,
        aliases: [node.service, "node", "server", node.status.toLowerCase()],
        icon: Box,
        category: "Services",
        action: () => {
          router.push(`/dashboard/topology?node=${node.service}`);
          toast.success(`Opening SSH console overlay for ${node.service}`);
        }
      });
    });

    // 6. Metrics Charts Commands
    list.push({ name: "Focus CPU Metric Chart", aliases: ["cpu", "metric", "chart"], icon: Activity, category: "Metrics", action: () => { router.push("/dashboard/live"); toast.success("Focusing CPU metrics timeline"); } });
    list.push({ name: "Focus Memory Metric Chart", aliases: ["memory", "ram", "chart"], icon: Activity, category: "Metrics", action: () => { router.push("/dashboard/live"); toast.success("Focusing Memory metrics timeline"); } });
    list.push({ name: "Focus Network Bandwidth Chart", aliases: ["network", "bandwidth", "chart"], icon: Activity, category: "Metrics", action: () => { router.push("/dashboard/live"); toast.success("Focusing Network bandwidth timeline"); } });

    // 7. Docs headers
    list.push({ name: "Docs: Installation & CLI Commands", aliases: ["install", "agent", "command", "bash"], icon: FileSearch, category: "Docs", action: () => router.push("/docs#installation") });
    list.push({ name: "Docs: Architecture Diagrams & Sequences", aliases: ["architecture", "flow", "sequence"], icon: FileSearch, category: "Docs", action: () => router.push("/docs#architecture") });
    list.push({ name: "Docs: API Exporters & Integrations", aliases: ["api", "export", "prometheus"], icon: FileSearch, category: "Docs", action: () => router.push("/docs#api") });

    // 8. Integrations
    Object.keys(integrationStates || {}).forEach((key) => {
      const stateVal = integrationStates[key];
      list.push({
        name: `Integration: Configure ${key.toUpperCase()} (${stateVal})`,
        aliases: [key, "integration", stateVal],
        icon: Globe,
        category: "Integrations",
        action: () => {
          router.push("/dashboard/integrations");
          toast.success(`Opening settings page for ${key.toUpperCase()}`);
        }
      });
    });

    return list;
  }, [router, theme, setTheme, clearAiResult, socket, serviceHealth, infrastructure, incidents, integrationStates, isErrorInjected, setIsErrorInjected]);

  const filteredItems = useMemo(() => {
    const getScore = (item: PaletteItem) => clickCounts[item.name] || 0;

    let list: PaletteItem[] = [];
    if (!search.trim()) {
      list = [...items];
    } else {
      const query = search.toLowerCase().trim();
      list = items.filter((item) =>
        item.name.toLowerCase().includes(query) ||
        item.aliases.some((alias) => alias.toLowerCase().includes(query)) ||
        item.category.toLowerCase().includes(query)
      );
    }
    const sorted = [...list].sort((a, b) => getScore(b) - getScore(a));
    return search.trim() ? sorted : sorted.slice(0, 10);
  }, [items, search, clickCounts]);

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
          handleItemExecute(selected);
        }
      }
    };

    window.addEventListener("keydown", handleKeyboardSelection);
    return () => window.removeEventListener("keydown", handleKeyboardSelection);
  }, [isOpen, filteredItems, selectedIndex, handleItemExecute]);

  const categoriesList = ["Pages", "Incidents", "Services", "Metrics", "Actions", "Docs", "Integrations"] as const;

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
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-[520px] max-w-[calc(100vw-24px)] rounded-xl border shadow-premium overflow-hidden flex flex-col"
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
                placeholder="Search commands, aliases, incidents, docs or configs..."
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
            <div className="max-h-[340px] overflow-y-auto p-1.5 custom-scrollbar" style={{ background: "var(--surface-0)" }}>
              {filteredItems.length === 0 ? (
                <div className="text-center py-6 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  No matches found for "{search}"
                </div>
              ) : (
                <div className="space-y-3">
                  {categoriesList.map((category) => {
                    const categoryItems = filteredItems.filter(i => i.category === category);
                    if (categoryItems.length === 0) return null;
                    return (
                      <div key={category} className="space-y-0.5">
                        <div className="px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-500">
                          {category}
                        </div>
                        {categoryItems.map((item) => {
                          const overallIndex = filteredItems.indexOf(item);
                          const isSelected = overallIndex === selectedIndex;

                          return (
                            <button
                              key={item.name}
                              onClick={() => handleItemExecute(item)}
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
