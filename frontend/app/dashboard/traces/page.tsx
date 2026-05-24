"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Network, Activity, Clock, ArrowRight, AlertTriangle, 
  CheckCircle2, Globe, Database, Server, Cpu, Layers, 
  Terminal, Search, Copy, CornerDownRight, ArrowDown
} from "lucide-react";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { useLiveEngineStore } from "@/hooks/useLiveEngine";
import toast from "react-hot-toast";

interface Span {
  name: string;
  service: string;
  latencyMs: number;
  status: "success" | "warning" | "error" | "retry";
  message?: string;
  icon: React.ElementType;
}

interface Trace {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  status: number;
  latencyMs: number;
  timestamp: string;
  spans: Span[];
}

export default function TraceViewPage() {
  const { incidents } = useLiveEngineStore();
  const isErrorInjected = useMonitoringStore(s => s.isErrorInjected);
  const [selectedTraceId, setSelectedTraceId] = useState<string>("tr_01");
  const [searchQuery, setSearchQuery] = useState("");

  const staticTraces = useMemo<Trace[]>(() => {
    // Check if there are active anomalies
    const isRedisDegraded = incidents.some(i => i.service.toLowerCase().includes("redis") || i.service.toLowerCase().includes("cache"));
    const isDbPrimaryDegraded = incidents.some(i => i.service.toLowerCase().includes("db") || i.service.toLowerCase().includes("primary"));
    const isApiGatewayDegraded = incidents.some(i => i.service.toLowerCase().includes("gateway") || i.service.toLowerCase().includes("api"));

    return [
      {
        id: "tr_01",
        method: "POST",
        path: "/api/v1/checkout",
        status: isErrorInjected ? 504 : (isRedisDegraded || isDbPrimaryDegraded ? 500 : 200),
        latencyMs: isErrorInjected ? 5020 : (isRedisDegraded ? 1850 : (isDbPrimaryDegraded ? 2980 : 340)),
        timestamp: "Just now",
        spans: [
          { name: "Client Browser request", service: "browser", latencyMs: 12, status: "success", icon: Globe },
          { 
            name: "API Gateway proxy routing", 
            service: "api-gateway", 
            latencyMs: isErrorInjected ? 5000 : 42, 
            status: isErrorInjected ? "error" : (isApiGatewayDegraded ? "warning" : "success"),
            message: isErrorInjected ? "Gateway Timeout (504): upstream service connection failed." : undefined,
            icon: Cpu 
          },
          { name: "Auth session verification", service: "auth-service", latencyMs: 25, status: isErrorInjected ? "retry" : "success", icon: Server },
          { 
            name: "Cache lookup (cart items)", 
            service: "redis-cache", 
            latencyMs: isRedisDegraded ? 850 : 8, 
            status: isRedisDegraded ? "warning" : "success",
            message: isRedisDegraded ? "High latency check on cache keys: connection pool saturation. Retry loop #2 triggered." : undefined,
            icon: Database 
          },
          { 
            name: "Commit order transactional write", 
            service: "db-primary", 
            latencyMs: isDbPrimaryDegraded ? 2100 : 255, 
            status: isDbPrimaryDegraded ? "error" : "success",
            message: isDbPrimaryDegraded ? "Critical error: lock contention on transaction table 'orders'." : undefined,
            icon: Database 
          }
        ]
      },
      {
        id: "tr_02",
        method: "GET",
        path: "/api/v1/auth/session",
        status: 200,
        latencyMs: 42,
        timestamp: "2 mins ago",
        spans: [
          { name: "Client Browser request", service: "browser", latencyMs: 8, status: "success", icon: Globe },
          { name: "API Gateway proxy routing", service: "api-gateway", latencyMs: 12, status: "success", icon: Cpu },
          { name: "Auth session verification", service: "auth-service", latencyMs: 22, status: "success", icon: Server }
        ]
      },
      {
        id: "tr_03",
        method: "GET",
        path: "/api/v1/catalog/items",
        status: isRedisDegraded ? 200 : 200,
        latencyMs: isRedisDegraded ? 920 : 64,
        timestamp: "5 mins ago",
        spans: [
          { name: "Client Browser request", service: "browser", latencyMs: 14, status: "success", icon: Globe },
          { name: "API Gateway proxy routing", service: "api-gateway", latencyMs: 18, status: "success", icon: Cpu },
          { 
            name: "Query catalog cache cache-redis", 
            service: "redis-cache", 
            latencyMs: isRedisDegraded ? 880 : 32, 
            status: isRedisDegraded ? "warning" : "success",
            message: isRedisDegraded ? "Degraded span: evictions pool threshold exceeded. Falling back to DB read." : undefined,
            icon: Database 
          }
        ]
      },
      {
        id: "tr_04",
        method: "POST",
        path: "/api/v1/auth/login",
        status: 401,
        latencyMs: 120,
        timestamp: "8 mins ago",
        spans: [
          { name: "Client Browser request", service: "browser", latencyMs: 10, status: "success", icon: Globe },
          { name: "API Gateway proxy routing", service: "api-gateway", latencyMs: 15, status: "success", icon: Cpu },
          { 
            name: "Credentials validation run", 
            service: "auth-service", 
            latencyMs: 95, 
            status: "error",
            message: "Authentication failure: invalid password hash.",
            icon: Server 
          }
        ]
      }
    ];
  }, [incidents, isErrorInjected]);

  const filteredTraces = useMemo(() => {
    if (!searchQuery.trim()) return staticTraces;
    const query = searchQuery.toLowerCase();
    return staticTraces.filter(t => 
      t.path.toLowerCase().includes(query) || 
      t.id.toLowerCase().includes(query) ||
      t.method.toLowerCase().includes(query)
    );
  }, [staticTraces, searchQuery]);

  const selectedTrace = useMemo(() => {
    return staticTraces.find(t => t.id === selectedTraceId) || staticTraces[0];
  }, [staticTraces, selectedTraceId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
          <Network className="text-indigo-500" />
          Distributed Tracing
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Detailed end-to-end timing breakdown across microservices, databases, and third-party APIs.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Traces List */}
        <div className="xl:col-span-1 card p-4 space-y-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search traces (e.g. /checkout)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--surface-1)] border border-[var(--border-default)] rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none text-[var(--text-primary)]"
            />
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto custom-scrollbar">
            {filteredTraces.map((trace) => {
              const isSelected = trace.id === selectedTraceId;
              const isError = trace.status >= 500 || trace.status === 504;
              const isWarn = trace.latencyMs > 500 && !isError;
              
              return (
                <button
                  key={trace.id}
                  onClick={() => setSelectedTraceId(trace.id)}
                  className="w-full text-left p-3 rounded-xl border flex flex-col gap-2 transition-all"
                  style={{
                    background: isSelected ? "var(--brand-50)" : "var(--surface-1)",
                    borderColor: isSelected ? "var(--brand-600)" : "var(--border-default)",
                  }}
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        trace.method === "POST" ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400" : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                      }`}>
                        {trace.method}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                        {trace.path}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">{trace.timestamp}</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono w-full">
                    <span className={`font-bold ${isError ? "text-rose-500" : isWarn ? "text-amber-500" : "text-emerald-500"}`}>
                      Status: {trace.status}
                    </span>
                    <span className={`font-semibold ${isError ? "text-rose-400" : isWarn ? "text-amber-400" : "text-slate-400"}`}>
                      {trace.latencyMs} ms
                    </span>
                  </div>
                </button>
              );
            })}
            {filteredTraces.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">No traces match your search.</div>
            )}
          </div>
        </div>

        {/* Right Column: Spans Timeline Details */}
        <div className="xl:col-span-2 space-y-5">
          {selectedTrace ? (
            <div className="card p-6 space-y-6">
              
              {/* Trace Header */}
              <div className="flex justify-between items-start flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded border">
                      Trace ID: {selectedTrace.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      selectedTrace.status >= 500 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                    }`}>
                      {selectedTrace.status >= 500 ? "FAILING" : "SUCCESSFUL"}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
                    <span className="text-cyan-500">{selectedTrace.method}</span>
                    {selectedTrace.path}
                  </h2>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Duration</p>
                    <p className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">{selectedTrace.latencyMs}ms</p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedTrace.id);
                      toast.success(`Copied Correlation ID: ${selectedTrace.id}`);
                    }}
                    className="p-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-all flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Copy size={13} /> Copy ID
                  </button>
                </div>
              </div>

              {/* Distributed Trace Path Visualizer */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visual Request Path</h3>
                <div className="flex items-center gap-2 flex-wrap bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {selectedTrace.spans.map((span, idx) => {
                    const Icon = span.icon;
                    const isError = span.status === "error";
                    const isWarn = span.status === "warning";
                    const isRetry = span.status === "retry";
                    
                    return (
                      <React.Fragment key={span.name}>
                        <div className={`flex items-center gap-2 p-2 rounded-lg border ${
                          isError ? "border-rose-500/40 bg-rose-500/5 text-rose-500 shadow-sm" : 
                          isWarn ? "border-amber-500/40 bg-amber-500/5 text-amber-500 shadow-sm" :
                          isRetry ? "border-indigo-500/40 bg-indigo-500/5 text-indigo-500 animate-pulse" :
                          "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                        }`}>
                          <Icon size={14} className={isError ? "animate-pulse" : ""} />
                          <div className="text-[10px]">
                            <p className="font-bold">{span.service.toUpperCase()}</p>
                            <p className="font-mono text-[8px] opacity-75">{span.latencyMs}ms</p>
                          </div>
                        </div>
                        {idx < selectedTrace.spans.length - 1 && (
                          <ArrowRight size={13} className="text-slate-400 shrink-0" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
              {/* Spans Waterfall Timing */}
              <div className="space-y-4 pt-1">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Waterfall Timeline Spans</h3>
                
                <div className="relative space-y-4 font-mono text-[11px] min-h-[120px]">
                  {/* Vertical SLA Timeout Line */}
                  {selectedTrace.latencyMs >= 5000 && (
                    <div 
                      className="absolute top-0 bottom-0 border-l-2 border-dashed border-red-500/50 z-20 pointer-events-none flex flex-col items-center"
                      style={{ left: `${(5000 / selectedTrace.latencyMs) * 100}%` }}
                    >
                      <span className="bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm rotate-90 transform origin-left translate-y-12 select-none whitespace-nowrap">
                        SLA GATEWAY LIMIT: 5000ms
                      </span>
                    </div>
                  )}

                  {selectedTrace.spans.map((span, idx) => {
                    const isError = span.status === "error";
                    const isWarn = span.status === "warning";
                    const isRetry = span.status === "retry";

                    // Calculate offset percentage
                    const totalL = selectedTrace.spans.reduce((a, b) => a + b.latencyMs, 0);
                    let previousL = 0;
                    for (let i = 0; i < idx; i++) {
                      previousL += selectedTrace.spans[i].latencyMs;
                    }
                    const offsetPct = (previousL / totalL) * 100;
                    const durationPct = Math.max(2, (span.latencyMs / totalL) * 100);

                    return (
                      <div key={span.name} className="space-y-1 relative z-10">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-1.5 flex-wrap">
                            <CornerDownRight size={12} className="text-slate-400" />
                            {span.name}
                            {isRetry && (
                              <span className="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 text-[9px] px-1.5 py-0.2 rounded font-bold animate-pulse">
                                RETRY #1 (BACKOFF 1000ms)
                              </span>
                            )}
                            {isWarn && (
                              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 text-[9px] px-1.5 py-0.2 rounded font-bold">
                                DEGRADED SPAN
                              </span>
                            )}
                          </span>
                          <span className={`font-mono text-[10px] font-bold ${
                            isError ? "text-rose-500" : isWarn ? "text-amber-500" : isRetry ? "text-indigo-500" : "text-emerald-500"
                          }`}>
                            {span.latencyMs}ms
                          </span>
                        </div>

                        {/* Waterfall Timing Bar */}
                        <div className="h-6 bg-slate-100 dark:bg-slate-900 rounded-lg relative overflow-hidden border border-slate-200/40 dark:border-slate-800/80">
                          <div 
                            className={`h-full rounded-md ${
                              isError ? "bg-gradient-to-r from-rose-500 to-red-600 shadow-md shadow-rose-950/20" :
                              isWarn ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-amber-950/20" :
                              isRetry ? "bg-gradient-to-r from-indigo-500 to-violet-500 animate-pulse" :
                              "bg-gradient-to-r from-indigo-600 to-indigo-500"
                            }`}
                            style={{ 
                              left: `${offsetPct}%`, 
                              width: `${durationPct}%`,
                              position: "absolute"
                            }}
                          />
                        </div>

                        {/* Span warning / details details */}
                        {span.message && (
                          <div className={`p-2.5 rounded-lg border text-[10px] font-medium flex items-start gap-2 mt-1 ${
                            isError ? "border-rose-500/25 bg-rose-500/5 text-rose-600 dark:text-rose-400" :
                            "border-amber-500/25 bg-amber-500/5 text-amber-600 dark:text-amber-400"
                          }`}>
                            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                            <div>{span.message}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Log stream correlation link */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex justify-between items-center text-xs flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-emerald-500" />
                  <span className="text-slate-300">Correlate with stdout diagnostic logs for Trace ID:</span>
                  <span className="font-mono bg-slate-900 border border-slate-800 text-emerald-400 font-bold px-1.5 py-0.5 rounded">{selectedTrace.id}</span>
                </div>
                <button
                  onClick={() => {
                    window.location.href = `/dashboard/live?traceId=${selectedTrace.id}`;
                    toast.success("Filtering diagnostics logs console by Correlation ID");
                  }}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold font-sans transition-colors"
                >
                  View Correlated Logs
                </button>
              </div>

            </div>
          ) : (
            <div className="card py-16 text-center text-slate-500">Select a trace to view deep distributed waterfalls.</div>
          )}
        </div>

      </div>
    </div>
  );
}
