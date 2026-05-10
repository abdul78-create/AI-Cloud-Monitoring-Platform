"use client";

import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { LogAnalysisResult, Recommendation } from "@/types";

type AIRecommendationPanelProps = {
  recommendations: Recommendation[];
  analysis: LogAnalysisResult | null;
};

export const AIRecommendationPanel = ({ recommendations, analysis }: AIRecommendationPanelProps) => {
  return (
    <GlassCard>
      <div className="mb-4 flex items-center gap-2">
        <BrainCircuit size={18} className="text-cyan-300" />
        <h3 className="text-lg font-semibold">AI Recommendations</h3>
      </div>
      <div className="space-y-3">
        {analysis && (
          <div className="rounded-xl border border-cyan-300/30 bg-cyan-500/10 p-3 text-sm">
            <p className="mb-1 font-semibold text-cyan-200">Live AI Summary</p>
            <p className="text-slate-200">{analysis.summary}</p>
          </div>
        )}
        {recommendations.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 }}
            className="rounded-xl border border-white/10 bg-slate-900/60 p-3"
          >
            <p className="font-semibold text-slate-100">{item.title}</p>
            <p className="mt-1 text-sm text-slate-300">{item.detail}</p>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
};
