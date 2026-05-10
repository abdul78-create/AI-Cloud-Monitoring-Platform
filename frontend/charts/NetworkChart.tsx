"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MetricPoint } from "@/types";

export const NetworkChart = ({ data }: { data: MetricPoint[] }) => (
  <div className="h-64 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 12 }} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="network" stroke="#818cf8" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
