"use client";

import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { StatsCardData } from "@/types";

const toneMap = {
  cyan: "from-cyan-400/20 to-cyan-600/10 border-cyan-300/30",
  violet: "from-violet-400/20 to-violet-600/10 border-violet-300/30",
  emerald: "from-emerald-400/20 to-emerald-600/10 border-emerald-300/30",
  rose: "from-rose-400/20 to-rose-600/10 border-rose-300/30"
};

const strokeMap = {
  cyan: "#22d3ee",
  violet: "#a78bfa",
  emerald: "#34d399",
  rose: "#fb7185"
};

export const StatsCards = ({ cards }: { cards: StatsCardData[] }) => {
  if (!cards.length) {
    return <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">No metrics available yet.</div>;
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <motion.article
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06 }}
          className={`rounded-2xl border bg-gradient-to-br p-4 ${toneMap[card.tone]} backdrop-blur-xl`}
        >
          <p className="text-sm text-slate-300">{card.label}</p>
          <div className="mt-2 flex items-end justify-between">
            <p className="text-3xl font-bold">
              {card.value}
              <span className="ml-1 text-base font-medium text-slate-300">{card.unit}</span>
            </p>
            <p className={`text-sm ${card.trend >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{card.trend >= 0 ? "+" : ""}{card.trend}%</p>
          </div>

          <div className="mt-4 h-1.5 rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(card.value, 100)}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-indigo-400"
            />
          </div>

          <div className="mt-4 h-16">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={card.points.map((value, i) => ({ i, value }))}>
                <Area type="monotone" dataKey="value" stroke={strokeMap[card.tone]} fill={strokeMap[card.tone]} fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.article>
      ))}
    </section>
  );
};
