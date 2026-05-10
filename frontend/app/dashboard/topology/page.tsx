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
} from "reactflow";
import "reactflow/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Database, Globe, Zap, Shield, Cpu, Search, Filter, X, Sparkles } from "lucide-react";
import { useMonitoringStore } from "@/store/useMonitoringStore";

// Custom Node Component
const CustomNode = ({ data }: any) => {
  const Icon = data.icon || Server;
  return (
    <div className={`px-4 py-3 rounded-2xl border ${data.status === 'critical' ? 'border-rose-200 bg-rose-50' : data.status === 'offline' ? 'border-slate-200 bg-slate-50' : 'border-white/80 bg-white/90'} shadow-premium backdrop-blur-xl flex items-center gap-3 min-w-[180px] hover:shadow-lg transition-all`}>
      <div className={`p-2 rounded-lg ${data.status === 'critical' ? 'bg-rose-500 text-white' : data.status === 'offline' ? 'bg-slate-400 text-white' : 'bg-indigo-600 text-white'} ${data.active ? 'animate-pulse' : ''}`}>
        <Icon size={16} />
      </div>
      <div>
        <div className="text-xs font-bold text-slate-900">{data.label}</div>
        <div className="text-[10px] text-slate-500">{data.type || "Service"}</div>
      </div>
      {data.status && (
        <div className={`absolute top-2 right-2 h-2 w-2 rounded-full ${data.status === 'critical' ? 'bg-rose-500' : data.status === 'offline' ? 'bg-slate-400' : 'bg-emerald-500'} ${data.active ? 'animate-ping' : ''}`} />
      )}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

export default function TopologyPage() {
  const { infrastructure, fetchDashboardData } = useMonitoringStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData(true);
    const interval = setInterval(() => fetchDashboardData(false), 5000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Generate nodes and edges dynamically from infrastructure data
  useMemo(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Add a central mock API Gateway if not present
    newNodes.push({
      id: "gateway",
      type: "custom",
      data: { label: "API Gateway", icon: Zap, type: "Core Infrastructure", status: "online", active: true },
      position: { x: 500, y: 200 },
    });

    infrastructure.forEach((node: any, index: number) => {
      const isApi = node.tags?.includes("api") || node.service.includes("api");
      const isDb = node.tags?.includes("db") || node.service.includes("db");
      
      let x = 800;
      let y = 100 + index * 100;
      let icon = Server;
      let type = "Microservice";

      if (isDb) {
        x = 1100;
        icon = Database;
        type = "Database";
      } else if (isApi) {
        x = 800;
        icon = Cpu;
        type = "API Service";
      } else {
        // Assume frontend or other
        x = 200;
        icon = Globe;
        type = "Frontend / Edge";
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

      // Smart Connections
      if (isDb) {
        // Connect APIs to DBs
        infrastructure.forEach((otherNode: any) => {
          if (otherNode.tags?.includes("api") || otherNode.service.includes("api")) {
            newEdges.push({
              id: `e-${otherNode.service}-${node.service}`,
              source: otherNode.service,
              target: node.service,
              animated: true,
              style: { stroke: "#94a3b8" },
            });
          }
        });
      } else if (isApi) {
        // Connect Gateway to APIs
        newEdges.push({
          id: `e-gateway-${node.service}`,
          source: "gateway",
          target: node.service,
          animated: true,
          style: { stroke: "#4f46e5", strokeWidth: 2 },
        });
      } else {
        // Connect Frontends to Gateway
        newEdges.push({
          id: `e-${node.service}-gateway`,
          source: node.service,
          target: "gateway",
          animated: true,
          style: { stroke: "#4f46e5", strokeWidth: 2 },
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [infrastructure, setNodes, setEdges]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="h-[calc(100vh-120px)] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Live Topology</h1>
          <p className="text-sm text-slate-500">Real-time infrastructure visualization from live agents.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search nodes..."
              className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm bg-white transition-all w-64"
            />
          </div>
          <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      {/* Graph Area */}
      <div className="h-full w-full glass-card rounded-3xl border-white/80 shadow-premium overflow-hidden bg-white relative">
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
          <Background color="#94a3b8" gap={16} size={1} />
          <Controls className="bg-white border border-slate-200 rounded-lg shadow-sm" />
          <MiniMap className="bg-white border border-slate-200 rounded-lg shadow-sm" />
        </ReactFlow>

        {/* Floating Legends */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-slate-100 shadow-sm text-xs space-y-2 z-10">
          <div className="font-bold text-slate-700 mb-1">Status</div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" /> Online
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-slate-400" /> Offline
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-rose-500" /> Critical
          </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedNode && selectedNode.data.fullData && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-4 right-4 bottom-4 w-80 bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-premium p-6 z-10 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-600 text-white">
                      {React.createElement(selectedNode.data.icon || Server, { size: 16 })}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{selectedNode.data.label}</h3>
                      <p className="text-[10px] text-slate-400">{selectedNode.data.type}</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600" onClick={() => setSelectedNode(null)}>
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-slate-500">Status:</span>
                    <span className={`ml-2 font-bold uppercase ${selectedNode.data.status === 'offline' ? 'text-slate-400' : 'text-emerald-600'}`}>
                      {selectedNode.data.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500">IP Address:</span>
                    <span className="ml-2 font-mono text-slate-900">{selectedNode.data.fullData.ip || "127.0.0.1"}</span>
                  </div>

                  <div>
                    <span className="text-slate-500">OS:</span>
                    <span className="ml-2 text-slate-900">{selectedNode.data.fullData.os || "Linux"}</span>
                  </div>

                  <div>
                    <span className="text-slate-500">Environment:</span>
                    <span className="ml-2 text-slate-900">{selectedNode.data.fullData.environment || "Production"}</span>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>Uptime</span>
                      <span className="font-semibold text-slate-900">{selectedNode.data.fullData.uptimePercent}%</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Response Time</span>
                      <span className="font-semibold text-slate-900">{selectedNode.data.fullData.responseTimeMs}ms</span>
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-700 mb-1">Tags</div>
                    <div className="flex gap-1 flex-wrap">
                      {(selectedNode.data.fullData.tags || ["backend", "api"]).map((tag: string, j: number) => (
                        <span key={j} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full bg-slate-900 text-white rounded-xl py-2 text-xs font-semibold hover:bg-indigo-600 transition-all">
                View Full Metrics
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
