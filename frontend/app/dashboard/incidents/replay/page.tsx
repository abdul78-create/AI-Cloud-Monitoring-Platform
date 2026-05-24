"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, RotateCcw, AlertTriangle, Cpu, Terminal, 
  ShieldCheck, ArrowRight, Activity, Clock 
} from "lucide-react";
import { useRouter } from "next/navigation";

const REPLAY_EVENTS = [
  { time: "00:00", type: "info", title: "Deployment starts", desc: "v2.4.1 rolled out to prod-cluster-east", icon: ArrowRight },
  { time: "00:18", type: "warning", title: "Latency spike detected", desc: "API Gateway p95 latency increased to 450ms", icon: Activity },
  { time: "00:41", type: "critical", title: "Alert triggered", desc: "node_cpu_seconds_total > 90% on api-node-02", icon: AlertTriangle },
  { time: "01:02", type: "ai", title: "AI RCA generated", desc: "Root cause: Memory leak in worker thread pool. 94% confidence.", icon: Cpu },
  { time: "01:20", type: "action", title: "SSH remediation executed", desc: "systemctl restart worker-pool.service", icon: Terminal },
  { time: "01:55", type: "success", title: "Service recovered", desc: "CPU normalized to 41%. Latency < 40ms.", icon: ShieldCheck },
];

export default function IncidentReplayPage() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [activeEventIdx, setActiveEventIdx] = useState(-1);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (playing) {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            setPlaying(false);
            return 100;
          }
          return p + 0.5; // slow progress
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [playing]);

  useEffect(() => {
    // Map progress to events (6 events total)
    const newIdx = Math.min(
      Math.floor((progress / 100) * REPLAY_EVENTS.length), 
      REPLAY_EVENTS.length - 1
    );
    setActiveEventIdx(newIdx);
  }, [progress]);

  const reset = () => {
    setPlaying(false);
    setProgress(0);
    setActiveEventIdx(-1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <button 
            onClick={() => router.push('/dashboard/incidents')}
            className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white mb-4 inline-block font-semibold transition-colors"
          >
            ← Back to Incidents
          </button>
          <h1 className="heading-page">Incident Replay Mode</h1>
          <p className="text-sm text-slate-500 mt-1">
            Deterministic post-mortem playback for INC-8492
          </p>
        </div>
        
        {/* Playback Controls */}
        <div className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setPlaying(!playing)}
            className="p-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
            <span className="text-xs font-bold uppercase tracking-wider pr-1">
              {playing ? "Pause" : "Play"}
            </span>
          </button>
          <button 
            onClick={reset}
            className="p-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            title="Restart Replay"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card p-5 border-t-4 border-t-violet-500">
        <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono mb-2">
          <span>00:00</span>
          <span>01:55</span>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-violet-500 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="card p-8">
        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-10 py-2">
          {REPLAY_EVENTS.map((evt, idx) => {
            const isActive = idx === activeEventIdx;
            const isPast = idx < activeEventIdx;
            const isVisible = idx <= activeEventIdx;

            const colorClass = 
              evt.type === 'critical' ? 'bg-rose-500 text-white' :
              evt.type === 'warning' ? 'bg-amber-500 text-white' :
              evt.type === 'ai' ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]' :
              evt.type === 'action' ? 'bg-sky-500 text-white' :
              evt.type === 'success' ? 'bg-emerald-500 text-white' :
              'bg-slate-400 text-white';

            return (
              <div key={idx} className="relative pl-8">
                {/* Timeline Dot */}
                <div 
                  className={`absolute -left-[17px] top-1 h-8 w-8 rounded-full border-4 border-white dark:border-slate-950 flex items-center justify-center transition-all duration-500 ${
                    isVisible ? colorClass : 'bg-slate-200 dark:bg-slate-800 text-transparent scale-75'
                  }`}
                >
                  <evt.icon size={12} />
                </div>

                {/* Content */}
                <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-4 grayscale'}`}>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-400 flex items-center gap-1.5">
                      <Clock size={12} />
                      {evt.time}
                    </span>
                    {isActive && (
                      <span className="badge badge-live text-[9px] uppercase tracking-wider animate-pulse">Current</span>
                    )}
                  </div>
                  
                  <div className={`p-4 rounded-xl border mt-2 ${
                    isActive ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10 shadow-lg' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50'
                  }`}>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      {evt.title}
                    </h3>
                    <p className={`text-xs ${evt.type === 'action' ? 'font-mono text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {evt.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
