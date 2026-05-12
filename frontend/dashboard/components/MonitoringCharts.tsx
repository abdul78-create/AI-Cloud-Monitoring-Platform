"use client";

import { useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GlassCard } from "@/components/GlassCard";
import { ApiAnalytics, ApiMetricPoint } from "@/types";
import { useMonitoringStore } from "@/store/useMonitoringStore";

type MonitoringChartsProps = {
  metrics: ApiMetricPoint[];
  analytics: ApiAnalytics | null;
};

export const MonitoringCharts = ({ metrics, analytics }: MonitoringChartsProps) => {
  const theme = useMonitoringStore((state) => state.theme);

  if (!metrics.length) {
    return <div className="rounded-xl border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 text-sm text-slate-500 dark:text-slate-400">Waiting for live chart data...</div>;
  }

  const timeline = useMemo(() => metrics.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    cpu: point.cpu,
    traffic: point.networkTrafficMbps,
    requests: point.requestRateRps
  })), [metrics]);

  const requestBarSeries = useMemo(() => timeline.slice(-6).map((point) => ({ zone: point.time, requests: point.requests })), [timeline]);
  
  const errorAnalyticsSeries = useMemo(() => timeline.slice(-7).map((point, index) => ({
    day: `T-${timeline.length - index}`,
    errorRate: analytics?.errorRatePercent ?? 0.9
  })), [timeline, analytics]);

  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <GlassCard>
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">CPU Usage Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="time" tick={{ fill: textColor, fontSize: 12 }} />
              <YAxis tick={{ fill: textColor, fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', 
                  borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                  borderRadius: '0.5rem',
                  color: theme === 'dark' ? '#f8fafc' : '#0f172a'
                }} 
              />
              <Line type="monotone" dataKey="cpu" stroke="#38bdf8" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Network Traffic</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="time" tick={{ fill: textColor, fontSize: 12 }} />
              <YAxis tick={{ fill: textColor, fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', 
                  borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                  borderRadius: '0.5rem',
                  color: theme === 'dark' ? '#f8fafc' : '#0f172a'
                }} 
              />
              <Area type="monotone" dataKey="traffic" stroke="#818cf8" fill="#818cf8" fillOpacity={0.25} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Server Requests by Region</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={requestBarSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="zone" tick={{ fill: textColor, fontSize: 12 }} />
              <YAxis tick={{ fill: textColor, fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', 
                  borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                  borderRadius: '0.5rem',
                  color: theme === 'dark' ? '#f8fafc' : '#0f172a'
                }} 
              />
              <Bar dataKey="requests" fill="#22d3ee" radius={[8, 8, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Error Analytics</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={errorAnalyticsSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="day" tick={{ fill: textColor, fontSize: 12 }} />
              <YAxis tick={{ fill: textColor, fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', 
                  borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                  borderRadius: '0.5rem',
                  color: theme === 'dark' ? '#f8fafc' : '#0f172a'
                }} 
              />
              <Line type="monotone" dataKey="errorRate" stroke="#f43f5e" strokeWidth={2.5} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </section>
  );
};
