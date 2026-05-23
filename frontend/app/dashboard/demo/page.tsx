"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server, Activity, AlertTriangle, Brain, Terminal,
  CheckCircle2, ArrowRight, Play, RotateCcw, ChevronRight,
  Wifi, Zap, Shield, Clock
} from "lucide-react";

// ─── Step Definitions ─────────────────────────────────────────────────────────

interface DemoStep {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  borderColor: string;
  bgColor: string;
  duration: number; // seconds to auto-advance
  events: string[];
  command?: string;
  metric?: { label: string; value: string; status: "ok" | "warn" | "crit" };
}

const STEPS: DemoStep[] = [
  {
    id: 1,
    title: "Install Agent",
    subtitle: "Deploy the lightweight cloudai-agent on your infrastructure",
    icon: Terminal,
    color: "text-indigo-400",
    borderColor: "border-indigo-500/40",
    bgColor: "bg-indigo-500/10",
    duration: 6,
    command: "curl -sSL https://cloudai.monitor/install.sh | bash",
    events: [
      "Downloading cloudai-agent v2.4.1...",
      "Installing systemd service...",
      "Starting agent daemon...",
      "Agent registered: prod-api-cluster",
    ],
    metric: { label: "Agent Status", value: "Online", status: "ok" },
  },
  {
    id: 2,
    title: "Connect Infrastructure",
    subtitle: "Node discovered — telemetry stream begins",
    icon: Wifi,
    color: "text-emerald-400",
    borderColor: "border-emerald-500/40",
    bgColor: "bg-emerald-500/10",
    duration: 5,
    events: [
      "Node prod-api-cluster discovered",
      "CPU stream: 42% ✓",
      "Memory stream: 61% ✓",
      "Disk I/O stream active ✓",
      "WebSocket connection established",
    ],
    metric: { label: "Telemetry Rate", value: "3s intervals", status: "ok" },
  },
  {
    id: 3,
    title: "Trigger Incident",
    subtitle: "Simulate a critical CPU spike across the cluster",
    icon: Zap,
    color: "text-amber-400",
    borderColor: "border-amber-500/40",
    bgColor: "bg-amber-500/10",
    duration: 5,
    events: [
      "Metric anomaly detected: CPU → 98%",
      "Threshold breached: > 90% for 30s",
      "Alert engine evaluating rules...",
      "Incident INC-2847 created",
    ],
    metric: { label: "CPU Usage", value: "98%", status: "crit" },
  },
  {
    id: 4,
    title: "Alert Fires",
    subtitle: "Multi-channel notifications dispatched instantly",
    icon: AlertTriangle,
    color: "text-rose-400",
    borderColor: "border-rose-500/40",
    bgColor: "bg-rose-500/10",
    duration: 5,
    events: [
      "Slack: #platform-alerts notified",
      "PagerDuty: On-call engineer paged",
      "Webhook: External system triggered",
      "Alert suppression cooldown: 5 min",
    ],
    metric: { label: "Alert Severity", value: "CRITICAL", status: "crit" },
  },
  {
    id: 5,
    title: "AI Root Cause Analysis",
    subtitle: "LLM-powered correlation traces the failure origin",
    icon: Brain,
    color: "text-violet-400",
    borderColor: "border-violet-500/40",
    bgColor: "bg-violet-500/10",
    duration: 6,
    events: [
      "Analyzing 47 correlated events...",
      "Root cause: Runaway worker process",
      "Confidence: 92%",
      "Related deployment: v3.2.1 (12 min ago)",
      "Suggested action: Restart worker pool",
    ],
    metric: { label: "RCA Confidence", value: "92%", status: "ok" },
  },
  {
    id: 6,
    title: "SSH Remediation",
    subtitle: "Execute whitelisted command on affected node",
    icon: Terminal,
    color: "text-blue-400",
    borderColor: "border-blue-500/40",
    bgColor: "bg-blue-500/10",
    duration: 5,
    command: "systemctl restart worker-pool.service",
    events: [
      "SSH connection: prod-api-cluster:22",
      "Command whitelisted ✓",
      "Executing: systemctl restart worker-pool",
      "Exit code: 0 ✓",
    ],
    metric: { label: "SSH Execution", value: "Success", status: "ok" },
  },
  {
    id: 7,
    title: "Service Recovered",
    subtitle: "Telemetry normalizes — incident auto-resolved",
    icon: CheckCircle2,
    color: "text-emerald-400",
    borderColor: "border-emerald-500/40",
    bgColor: "bg-emerald-500/10",
    duration: 4,
    events: [
      "CPU normalized: 98% → 34%",
      "Memory stable: 61%",
      "Incident INC-2847: Resolved",
      "Total MTTR: 4m 12s",
    ],
    metric: { label: "CPU Usage", value: "34%", status: "ok" },
  },
];

// ─── Terminal Log Line ─────────────────────────────────────────────────────────

function TerminalLine({ text, delay }: { text: string; delay: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={visible ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-2 font-mono text-xs"
    >
      <span className="text-emerald-500 mt-0.5 shrink-0">›</span>
      <span className="text-slate-300">{text}</span>
    </motion.div>
  );
}

// ─── Step Card ─────────────────────────────────────────────────────────────────

function StepIndicator({
  step,
  currentStep,
  completedSteps,
  onClick,
}: {
  step: DemoStep;
  currentStep: number;
  completedSteps: number[];
  onClick: () => void;
}) {
  const Icon = step.icon;
  const isActive = currentStep === step.id;
  const isDone = completedSteps.includes(step.id);

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
        isActive
          ? `${step.bgColor} ${step.borderColor} border`
          : isDone
          ? "opacity-60 hover:opacity-80"
          : "opacity-40 hover:opacity-60"
      }`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
          isDone ? "bg-emerald-500/20" : step.bgColor
        }`}
      >
        {isDone ? (
          <CheckCircle2 size={14} className="text-emerald-400" />
        ) : (
          <Icon size={14} className={step.color} />
        )}
      </div>
      <div className="min-w-0">
        <p className={`text-xs font-semibold truncate ${isActive ? "text-white" : "text-slate-400"}`}>
          {step.title}
        </p>
      </div>
      {isActive && <ChevronRight size={12} className="text-slate-500 ml-auto shrink-0" />}
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function GuidedDemoPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [finished, setFinished] = useState(false);

  const step = STEPS.find((s) => s.id === currentStep)!;
  const Icon = step.icon;

  const goToStep = useCallback((id: number) => {
    setCurrentStep(id);
    setProgress(0);
    setIsPlaying(false);
  }, []);

  const advance = useCallback(() => {
    setCompletedSteps((prev) => Array.from(new Set([...prev, currentStep])));
    if (currentStep < STEPS.length) {
      setCurrentStep((s) => s + 1);
      setProgress(0);
    } else {
      setFinished(true);
      setIsPlaying(false);
    }
  }, [currentStep]);

  // Auto-advance timer
  useEffect(() => {
    if (!isPlaying) return;
    const totalMs = step.duration * 1000;
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setProgress(Math.min((elapsed / totalMs) * 100, 100));
      if (elapsed >= totalMs) {
        clearInterval(timer);
        advance();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, step.duration, advance]);

  const reset = () => {
    setCurrentStep(1);
    setCompletedSteps([]);
    setProgress(0);
    setIsPlaying(false);
    setFinished(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Guided Demo</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Interactive walkthrough of the full incident lifecycle — from agent install to resolution.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw size={12} />
            Reset
          </button>
          <button
            onClick={() => setIsPlaying((p) => !p)}
            disabled={finished}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              isPlaying
                ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            <Play size={12} />
            {isPlaying ? "Pause" : "Auto-Play"}
          </button>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="flex items-center gap-3">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`h-1 flex-1 rounded-full transition-colors ${
              completedSteps.includes(s.id)
                ? "bg-emerald-500"
                : s.id === currentStep
                ? "bg-indigo-500"
                : "bg-slate-200 dark:bg-slate-800"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500 -mt-3">
        Step {currentStep} of {STEPS.length} — {completedSteps.length} completed
      </p>

      {finished ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-12 flex flex-col items-center justify-center text-center gap-6"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Demo Complete</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">
              You just observed the full incident lifecycle: from infrastructure onboarding to AI-assisted recovery. Total simulated MTTR: <strong className="text-emerald-400">4m 12s</strong>.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={reset}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw size={14} />
              Run Again
            </button>
            <a
              href="/dashboard/incidents"
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <Zap size={14} />
              View Incidents
            </a>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          {/* Step list sidebar */}
          <div className="card p-3 space-y-1 h-fit">
            {STEPS.map((s) => (
              <StepIndicator
                key={s.id}
                step={s}
                currentStep={currentStep}
                completedSteps={completedSteps}
                onClick={() => goToStep(s.id)}
              />
            ))}
          </div>

          {/* Main content panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Step header card */}
              <div className={`card p-6 border ${step.borderColor}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${step.bgColor} flex items-center justify-center`}>
                    <Icon size={24} className={step.color} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">
                        Step {currentStep}/{STEPS.length}
                      </span>
                      {step.metric && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            step.metric.status === "crit"
                              ? "bg-rose-500/15 text-rose-400"
                              : step.metric.status === "warn"
                              ? "bg-amber-500/15 text-amber-400"
                              : "bg-emerald-500/15 text-emerald-400"
                          }`}
                        >
                          {step.metric.label}: {step.metric.value}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{step.title}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{step.subtitle}</p>
                  </div>
                </div>

                {/* Auto-play progress */}
                {isPlaying && (
                  <div className="h-0.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${step.color.replace("text-", "bg-")} rounded-full`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Command block */}
              {step.command && (
                <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900/50">
                    <div className="w-3 h-3 rounded-full bg-rose-500/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                    <span className="text-[10px] text-slate-500 ml-2 font-mono">bash</span>
                  </div>
                  <div className="p-4">
                    <span className="text-emerald-400 font-mono text-xs">$ </span>
                    <span className="text-slate-200 font-mono text-xs">{step.command}</span>
                  </div>
                </div>
              )}

              {/* Event log */}
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Event Log
                  </span>
                </div>
                <div className="space-y-2">
                  {step.events.map((evt, i) => (
                    <TerminalLine key={i} text={evt} delay={i * 400} />
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => currentStep > 1 && goToStep(currentStep - 1)}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                >
                  ← Previous
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock size={12} />
                  ~{step.duration}s auto-advance
                </div>

                <button
                  onClick={advance}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                >
                  {currentStep === STEPS.length ? "Finish" : "Next"}
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
