"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MetricPoint } from "@/types";

export const MemoryChart = ({ data }: { data: MetricPoint[] }) => (
  <div className="h-64 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 12 }} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
        <Tooltip />
        <Area type="monotone" dataKey="memory" stroke="#22d3ee" fillOpacity={1} fill="url(#memoryGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);
