"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { StatsCardData } from "@/types";

/* ── Colour config by tone ── */
const toneConfig = {
  cyan:    { stroke: "#4285f4", fill: "rgba(66,133,244,0.10)",   dark: "#8ab4f8"  },
  violet:  { stroke: "#8b5cf6", fill: "rgba(139,92,246,0.10)",   dark: "#a78bfa"  },
  emerald: { stroke: "#34a853", fill: "rgba(52,168,83,0.10)",    dark: "#81c995"  },
  rose:    { stroke: "#ea4335", fill: "rgba(234,67,53,0.10)",    dark: "#f28b82"  },
};

/* ── Animated number counter ── */
function AnimatedValue({ value }: { value: number | string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef<number>(0);
  const numVal = typeof value === "string" ? parseFloat(value) : value;

  useEffect(() => {
    if (isNaN(numVal) || !ref.current) return;
    const start = prev.current;
    const end = numVal;
    prev.current = end;

    if (start === end) return;

    const duration = 600;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;

      if (ref.current) {
        ref.current.textContent = Number.isInteger(end)
          ? Math.round(current).toString()
          : current.toFixed(1);
      }

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [numVal]);

  return <span ref={ref}>{value}</span>;
}

export const StatsCards = ({ cards }: { cards: StatsCardData[] }) => {
  if (!cards.length) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const config = toneConfig[card.tone] ?? toneConfig.cyan;
        const trendUp = card.trend > 0;
        const trendNeutral = card.trend === 0;

        return (
          <motion.article
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.25, ease: "easeOut" }}
            className="card card-hover p-5 relative overflow-hidden group cursor-default"
          >
            {/* Subtle top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl opacity-60"
              style={{ background: config.stroke }}
            />

            {/* Header row */}
            <div className="flex justify-between items-start mb-3">
              <p
                className="text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: "var(--text-secondary)" }}
              >
                {card.label}
              </p>

              {/* Trend chip */}
              <span
                className="flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded"
                style={{
                  background: trendNeutral
                    ? "var(--surface-2)"
                    : trendUp
                    ? "var(--color-error-bg)"
                    : "var(--color-success-bg)",
                  color: trendNeutral
                    ? "var(--text-tertiary)"
                    : trendUp
                    ? "var(--color-error)"
                    : "var(--color-success)",
                }}
              >
                {trendNeutral ? (
                  <Minus size={10} />
                ) : trendUp ? (
                  <TrendingUp size={10} />
                ) : (
                  <TrendingDown size={10} />
                )}
                {trendNeutral ? "—" : `${trendUp ? "+" : ""}${card.trend}%`}
              </span>
            </div>

            {/* Metric value */}
            <div className="flex items-baseline gap-1">
              <span
                className="text-2xl font-bold tabular-nums tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                <AnimatedValue value={card.value} />
              </span>
              {card.unit && (
                <span className="text-sm font-medium" style={{ color: "var(--text-tertiary)" }}>
                  {card.unit}
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div
              className="mt-3 h-1 rounded-full overflow-hidden"
              style={{ background: "var(--surface-3)" }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(Number(card.value) || 0, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: config.stroke, opacity: 0.7 }}
              />
            </div>

            {/* Sparkline */}
            <div className="mt-3 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={card.points.map((v, i) => ({ i, v }))}>
                  <defs>
                    <linearGradient id={`grad-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={config.stroke} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={config.stroke} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={config.stroke}
                    strokeWidth={1.5}
                    fill={`url(#grad-${card.id})`}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.article>
        );
      })}
    </section>
  );
};
