"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Server, Globe, Database, Cpu, Terminal, Wifi, WifiOff } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from "recharts";

// Mock data generator for live effect
const generateData = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: i,
    value: Math.floor(Math.random() * 40) + 30,
  }));
};

export default function LiveMonitoringPage() {
  const [data, setData] = useState(generateData());

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const newData = [...prev.slice(1), { time: prev[prev.length - 1].time + 1, value: Math.floor(Math.random() * 40) + 30 }];
        return newData;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const servers = [
    { name: "api-gateway-01", status: "up", load: "45%", region: "us-east" },
    { name: "auth-service-01", status: "up", load: "22%", region: "us-east" },
    { name: "db-primary", status: "up", load: "68%", region: "us-east" },
    { name: "db-replica-01", status: "up", load: "15%", region: "us-west" },
    { name: "cache-node-01", status: "up", load: "30%", region: "us-east" },
    { name: "analytics-worker-01", status: "warning", load: "85%", region: "eu-central" },
    { name: "legacy-parser", status: "down", load: "0%", region: "us-west" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Live Monitoring</h1>
          <p className="text-sm text-slate-500">Real-time infrastructure pulse and node status.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Streaming
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Throughput */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border-white/80 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Global Throughput</h2>
              <p className="text-xs text-slate-500">Requests per second across all regions.</p>
            </div>
            <div className="text-2xl font-bold text-indigo-600">
              {data[data.length - 1].value} RPS
            </div>
          </div>

          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <YAxis hide domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Region Map Mock */}
        <div className="glass-card rounded-2xl p-6 border-white/80 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Active Regions</h2>
            <p className="text-xs text-slate-500">Traffic distribution.</p>
          </div>
          
          <div className="space-y-3 my-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">us-east-1 (N. Virginia)</span>
              <span className="font-bold text-slate-900">65%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: '65%' }} />
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">us-west-2 (Oregon)</span>
              <span className="font-bold text-slate-900">20%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full">
              <div className="bg-violet-600 h-full rounded-full" style={{ width: '20%' }} />
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">eu-central-1 (Frankfurt)</span>
              <span className="font-bold text-slate-900">15%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full">
              <div className="bg-cyan-500 h-full rounded-full" style={{ width: '15%' }} />
            </div>
          </div>

          <button className="w-full bg-slate-900 text-white rounded-xl py-2 text-xs font-semibold hover:bg-indigo-600 transition-all">
            View Global Map
          </button>
        </div>

        {/* Server Grid */}
        <div className="lg:col-span-3 glass-card rounded-2xl p-6 border-white/80 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Active Nodes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {servers.map((server, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-xl p-4 hover:border-indigo-100 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className={`p-2 rounded-lg ${server.status === 'up' ? 'bg-emerald-50 text-emerald-600' : server.status === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                    <Server size={16} />
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${server.status === 'up' ? 'bg-emerald-50 text-emerald-600' : server.status === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                    {server.status.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{server.name}</h3>
                <div className="text-xs text-slate-500 flex justify-between">
                  <span>Region: {server.region}</span>
                  <span className="font-semibold text-slate-700">Load: {server.load}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
