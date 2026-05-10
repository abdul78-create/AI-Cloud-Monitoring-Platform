"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GlassCard } from "@/components/GlassCard";
import { ApiAnalytics, ApiMetricPoint } from "@/types";

type MonitoringChartsProps = {
  metrics: ApiMetricPoint[];
  analytics: ApiAnalytics | null;
};

export const MonitoringCharts = ({ metrics, analytics }: MonitoringChartsProps) => {
  if (!metrics.length) {
    return <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">Waiting for live chart data...</div>;
  }

  const timeline = metrics.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    cpu: point.cpu,
    traffic: point.networkTrafficMbps,
    requests: point.requestRateRps
  }));

  const requestBarSeries = timeline.slice(-6).map((point) => ({ zone: point.time, requests: point.requests }));
  const errorAnalyticsSeries = timeline.slice(-7).map((point, index) => ({
    day: `T-${timeline.length - index}`,
    errorRate: analytics?.errorRatePercent ?? 0.9
  }));

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <GlassCard>
        <h3 className="mb-4 text-lg font-semibold">CPU Usage Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="cpu" stroke="#38bdf8" strokeWidth={2.5} dot={false} animationDuration={700} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="mb-4 text-lg font-semibold">Network Traffic</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="traffic" stroke="#818cf8" fill="#818cf8" fillOpacity={0.25} animationDuration={700} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="mb-4 text-lg font-semibold">Server Requests by Region</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={requestBarSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="zone" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="requests" fill="#22d3ee" radius={[8, 8, 0, 0]} animationDuration={700} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="mb-4 text-lg font-semibold">Error Analytics</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={errorAnalyticsSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="errorRate" stroke="#f43f5e" strokeWidth={2.5} animationDuration={700} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </section>
  );
};
