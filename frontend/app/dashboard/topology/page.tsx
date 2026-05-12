"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Database, Globe, Zap, Shield, Cpu, Search, Filter, X, Sparkles, Activity, Maximize2, Minimize2, ZoomIn, ZoomOut, RefreshCw, Network, Brain, FileSearch } from "lucide-react";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Custom Node Component (Flagship Redesign)
const CustomNode = ({ data }: any) => {
  const Icon = data.icon || Server;
  const isDark = true; // Assuming dark mode for the premium feel requested in the prompt
  
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.05 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`px-5 py-4 rounded-2xl border backdrop-blur-xl flex items-center gap-4 min-w-[220px] transition-all duration-300 ${
        data.status === 'critical' 
          ? 'border-rose-500/50 bg-rose-500/5 dark:bg-rose-950/30 shadow-[0_0_10px_rgba(239,68,68,0.05)]' 
          : data.status === 'warning'
            ? 'border-amber-500/50 bg-amber-500/5 dark:bg-amber-950/30 shadow-[0_0_10px_rgba(245,158,11,0.05)]'
            : data.status === 'offline'
              ? 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 shadow-sm'
              : 'border-white/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-premium dark:shadow-[0_0_10px_rgba(79,70,229,0.03)]'
      }`}
    >
      {/* Status Shimmer/Glow & Heartbeat */}
      {data.status !== 'offline' && (
        <div className={`absolute inset-0 rounded-2xl -z-10 ${
          data.status === 'critical' ? 'bg-rose-500/10' : 
          data.status === 'warning' ? 'bg-amber-500/10' : 
          'bg-indigo-500/5'
        }`} />
      )}
      
      {/* Heartbeat dot */}
      {data.status !== 'offline' && (
        <div className="absolute top-3 right-3 flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
            data.status === 'critical' ? 'bg-rose-500' : 
            data.status === 'warning' ? 'bg-amber-500' : 
            'bg-emerald-500'
          }`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            data.status === 'critical' ? 'bg-rose-500' : 
            data.status === 'warning' ? 'bg-amber-500' : 
            'bg-emerald-500'
          }`}></span>
        </div>
      )}

      {/* Icon Container */}
      <div className={`p-3 rounded-xl flex-shrink-0 transition-all ${
        data.status === 'critical' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' : 
        data.status === 'warning' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/10' :
        data.status === 'offline' ? 'bg-slate-400 dark:bg-slate-600 text-white' : 
        'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/10'
      }`}>
        <Icon size={20} />
      </div>

      {/* Label and Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{data.label}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{data.type || "Service"}</div>
      </div>

      {/* Status Indicator Dot */}
      {data.status && (
        <div className="relative flex h-3 w-3 flex-shrink-0">
          {data.active && data.status !== 'offline' && (
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
              data.status === 'critical' ? 'bg-rose-400' : 
              data.status === 'warning' ? 'bg-amber-400' : 
              'bg-emerald-400'
            }`}></span>
          )}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${
            data.status === 'critical' ? 'bg-rose-500' : 
            data.status === 'warning' ? 'bg-amber-500' : 
            data.status === 'offline' ? 'bg-slate-400 dark:bg-slate-600' : 
            'bg-emerald-500'
          }`}></span>
        </div>
      )}
    </motion.div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

export default function TopologyPage() {
  const { infrastructure, fetchDashboardData } = useMonitoringStore();
  const addTimelineEvent = useMonitoringStore((state) => state.addTimelineEvent);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleAction = (actionName: string) => {
    if (!selectedNode) return;
    addTimelineEvent({
      type: "info",
      message: `Action '${actionName}' triggered on node '${selectedNode.data.label}'.`,
    });
  };

  const [throttledInfrastructure, setThrottledInfrastructure] = useState(infrastructure);

  useEffect(() => {
    const handler = setTimeout(() => {
      setThrottledInfrastructure(infrastructure);
    }, 1000);
    return () => clearTimeout(handler);
  }, [infrastructure]);

  useEffect(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // Generate nodes and edges dynamically from infrastructure data
  useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Add a central mock API Gateway
    newNodes.push({
      id: "gateway",
      type: "custom",
      data: { label: "Edge Gateway", icon: Zap, type: "Core Infrastructure", status: "online", active: true },
      position: { x: 500, y: 300 },
    });

    throttledInfrastructure.forEach((node: any, index: number) => {
      const isApi = node.tags?.includes("api") || node.service?.includes("api");
      const isDb = node.tags?.includes("db") || node.service?.includes("db");
      const isAi = node.tags?.includes("ai") || node.service?.includes("ai");
      
      let x = 800;
      let y = 100 + index * 120;
      let icon = Server;
      let type = "Microservice";

      // Infrastructure Grouping (Zones)
      if (isDb) {
        x = 1200;
        y = 200 + (index % 3) * 150;
        icon = Database;
        type = "Database Cluster";
      } else if (isAi) {
        x = 850;
        y = 400 + (index % 2) * 150;
        icon = Brain;
        type = "AI Processing";
      } else if (isApi) {
        x = 850;
        y = 100 + (index % 3) * 150;
        icon = Cpu;
        type = "API Service";
      } else {
        // Assume frontend or edge
        x = 150;
        y = 200 + (index % 3) * 150;
        icon = Globe;
        type = "Edge Interface";
      }

      // Filter by search query
      if (searchQuery && !node.service.toLowerCase().includes(searchQuery.toLowerCase())) {
        return;
      }

      newNodes.push({
        id: node.service,
        type: "custom",
        data: { 
          label: node.service, 
          icon: icon, 
          type: type, 
          status: node.status,
          active: node.status === 'online',
          fullData: node
        },
        position: { x, y },
      });

      // Premium Animated Connections (Edges)
      if (isDb) {
        // Connect APIs and AI to DBs
        throttledInfrastructure.forEach((otherNode: any) => {
          if (otherNode.tags?.includes("api") || otherNode.tags?.includes("ai") || otherNode.service.includes("api")) {
            newEdges.push({
              id: `e-${otherNode.service}-${node.service}`,
              source: otherNode.service,
              target: node.service,
              animated: true,
              style: { stroke: node.status === 'online' ? "#4f46e5" : "#94a3b8", strokeWidth: 2, opacity: 0.6 },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#4f46e5" },
            });
          }
        });
      } else if (isApi || isAi) {
        // Connect Gateway to APIs and AI
        newEdges.push({
          id: `e-gateway-${node.service}`,
          source: "gateway",
          target: node.service,
          animated: true,
          style: { stroke: "#4f46e5", strokeWidth: 2, strokeDasharray: "5,5" },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#4f46e5" },
        });
      } else {
        // Connect Frontends to Gateway
        newEdges.push({
          id: `e-${node.service}-gateway`,
          source: node.service,
          target: "gateway",
          animated: true,
          style: { stroke: "#10b981", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [throttledInfrastructure, searchQuery, setNodes, setEdges]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <ErrorBoundary>
      <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-950 p-6' : 'h-[calc(100vh-120px)]'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <Network className="text-indigo-600 dark:text-indigo-400" />
            Infrastructure Topology
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Live visual map of your distributed system and service dependencies.</p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all w-full sm:w-64 shadow-sm"
            />
          </div>
          <button className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm">
            <Filter size={14} /> Filter
          </button>
          <button 
            onClick={toggleFullscreen}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Graph Area */}
      <div className={`relative w-full rounded-3xl border border-slate-100 dark:border-slate-800 shadow-premium overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500 ${isFullscreen ? 'h-[calc(100%-80px)]' : 'h-[calc(100%-80px)]'}`}>
        {/* Infrastructure Zones (Visual Separation) */}
        <div className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-30">
          <div className="absolute left-0 top-0 bottom-0 w-[250px] border-r border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider transform -rotate-90">Edge / Frontend</span>
          </div>
          <div className="absolute left-[250px] right-[400px] top-0 bottom-0 flex items-center justify-center">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider">Processing & APIs</span>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-[400px] border-l border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider transform rotate-90">Data Persistence</span>
          </div>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#94a3b8" gap={16} size={1} style={{ opacity: 0.2 }} />
          <Controls className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-slate-900 dark:text-white" />
          <MiniMap 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm"
            nodeColor={(n) => {
              if (n.data?.status === 'critical') return '#ef4444';
              if (n.data?.status === 'warning') return '#f59e0b';
              return '#4f46e5';
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        </ReactFlow>

        {/* Floating Legends */}
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm text-xs space-y-2 z-10 transition-colors duration-500">
          <div className="font-bold text-slate-700 dark:text-slate-200 mb-1">Node Status</div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Healthy
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Warning
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Critical
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <div className="h-2.5 w-2.5 rounded-full bg-slate-400 dark:bg-slate-600" /> Offline
          </div>
        </div>

        {/* Detail Panel (Redesigned side panel) */}
        <AnimatePresence>
          {selectedNode && selectedNode.data.fullData && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-4 right-4 bottom-4 w-[380px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-premium p-6 z-10 flex flex-col justify-between transition-colors duration-500"
            >
              <div className="overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl text-white ${
                      selectedNode.data.status === 'critical' ? 'bg-rose-500' :
                      selectedNode.data.status === 'warning' ? 'bg-amber-500' :
                      'bg-indigo-600'
                    }`}>
                      {React.createElement(selectedNode.data.icon || Server, { size: 20 })}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedNode.data.label}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{selectedNode.data.type}</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors" onClick={() => setSelectedNode(null)}>
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-5 text-sm">
                  {/* Status Banner */}
                  <div className={`rounded-xl p-3 flex items-center justify-between ${
                    selectedNode.data.status === 'offline' ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' :
                    selectedNode.data.status === 'critical' ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400' :
                    'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <span className="text-xs font-bold uppercase">System Status</span>
                    <span className="font-bold text-xs">{selectedNode.data.status?.toUpperCase()}</span>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-5">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">IP Address</span>
                      <span className="font-mono text-slate-900 dark:text-white text-xs">{selectedNode.data.fullData.ip || "10.0.4.12"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Environment</span>
                      <span className="text-slate-900 dark:text-white font-medium">{selectedNode.data.fullData.environment || "Production"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Region</span>
                      <span className="text-slate-900 dark:text-white font-medium">us-east-1</span>
                    </div>
                  </div>

                  {/* Metrics Cards */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Live Telemetry</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Uptime</div>
                        <div className="text-lg font-bold text-slate-900 dark:text-white">{selectedNode.data.fullData.uptimePercent || "99.9"}%</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Latency</div>
                        <div className="text-lg font-bold text-slate-900 dark:text-white">{selectedNode.data.fullData.responseTimeMs || "12"}ms</div>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700 space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500 dark:text-slate-400">CPU Load</span>
                          <span className="font-bold text-slate-900 dark:text-white">45%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full" style={{ width: '45%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500 dark:text-slate-400">Memory Usage</span>
                          <span className="font-bold text-slate-900 dark:text-white">62%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-violet-600 dark:bg-violet-400 h-full rounded-full" style={{ width: '62%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Insights Section */}
                  <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/50">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 mb-2">
                      <Sparkles size={14} />
                      <span className="text-xs font-bold uppercase">AI Analysis</span>
                    </div>
                    <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                      This node is operating within normal parameters. No anomalies detected in the last 24 hours. Traffic patterns suggest a 10% increase in load expected in the next hour.
                    </p>
                  </div>

                  {/* Tags */}
                  <div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Tags</div>
                    <div className="flex gap-1.5 flex-wrap">
                      {(selectedNode.data.fullData.tags || ["backend", "api", "load-balancer"]).map((tag: string, j: number) => (
                        <span key={j} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Quick Actions</div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button 
                    onClick={() => handleAction("Restart Node")}
                    className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:border-rose-200 dark:hover:border-rose-800 hover:text-rose-600 dark:hover:text-rose-400 transition-all shadow-sm"
                  >
                    <RefreshCw size={14} /> Restart
                  </button>
                  <button 
                    onClick={() => handleAction("Scale Service")}
                    className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-200 dark:hover:border-indigo-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
                  >
                    <Zap size={14} /> Scale
                  </button>
                  <button 
                    onClick={() => handleAction("Isolate Node")}
                    className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-200 dark:hover:border-amber-800 hover:text-amber-600 dark:hover:text-amber-400 transition-all shadow-sm"
                  >
                    <Shield size={14} /> Isolate
                  </button>
                  <button 
                    onClick={() => handleAction("View Logs")}
                    className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
                  >
                    <FileSearch size={14} /> Logs
                  </button>
                </div>
                <button className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl py-3 text-xs font-semibold hover:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:text-white transition-all shadow-sm">
                  View Deep Analytics
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </ErrorBoundary>
  );
}
