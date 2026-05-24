"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Play, Terminal, X, RefreshCw, Check, ShieldAlert, Lock } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { LogAnalysisResult, Recommendation } from "@/types";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { useLiveEngineStore } from "@/hooks/useLiveEngine";
import toast from "react-hot-toast";

type AIRecommendationPanelProps = {
  recommendations: Recommendation[];
  analysis: LogAnalysisResult | null;
};

export const AIRecommendationPanel = ({ recommendations, analysis }: AIRecommendationPanelProps) => {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const rootCause = useMonitoringStore(s => s.rootCause);
  const playbook = useMonitoringStore(s => s.playbook);
  const currentUserRole = useMonitoringStore(s => s.currentUserRole);
  const addAuditLog = useMonitoringStore(s => s.addAuditLog);

  const handleRunPlaybook = () => {
    if (currentUserRole === "Developer") {
      toast.error("Access Denied: Admin or SRE role permissions required to execute SSH remediation.", { icon: "🚫" });
      return;
    }
    const lowerCause = (rootCause || "").toLowerCase();
    let host = "gateway-node-1.local";
    if (lowerCause.includes("redis") || lowerCause.includes("cache")) {
      host = "cache-node-2.local";
    } else if (lowerCause.includes("db") || lowerCause.includes("primary") || lowerCause.includes("postgres")) {
      host = "db-node-primary.local";
    }

    setTerminalOpen(true);
    setRunning(true);
    setDone(false);
    setTerminalLogs([
      `[SSH] 14:40:02 Connecting to production node ${host}...`,
      `[SSH] 14:40:02 Authenticating as administrator@cloudai.internal using SSH keys...`,
      `[SSH] 14:40:03 Session established. Remote OS: Ubuntu 22.04 LTS (kernel 5.15.0)`
    ]);
  };

  useEffect(() => {
    if (!running) return;

    const lowerCause = (rootCause || "").toLowerCase();
    let commands = [
      `[EXEC] 14:40:03 docker restart auth-service`,
      `[OUT]  auth-service restarted`,
      `[EXEC] 14:40:05 curl -s http://auth-service/health`,
      `[OUT]  {"status":"UP","components":{"db":{"status":"UP"}}}`,
      `[SYS]  14:40:06 Validating memory utilisation of auth pod...`,
      `[SYS]  14:40:07 Utilization normalized to 34%. Anomaly cleared.`,
      `[SUCCESS] Outage resolved. Gateway stream back within SLA.`
    ];

    let hostNode = "gateway-node-1";
    let auditDesc = "Executed API Gateway auto-remediation";

    if (lowerCause.includes("redis") || lowerCause.includes("cache")) {
      hostNode = "cache-node-2";
      auditDesc = "Executed SSH auto-remediation playbook on cache-node-2";
      commands = [
        `[EXEC] 14:40:03 sudo systemctl stop redis-server`,
        `[OUT]  Stopping redis-server: [  OK  ]`,
        `[EXEC] 14:40:04 sudo systemctl start redis-server`,
        `[OUT]  Starting redis-server: [  OK  ]`,
        `[EXEC] 14:40:05 redis-cli ping`,
        `[OUT]  PONG`,
        `[EXEC] 14:40:06 df -h | grep /data`,
        `[OUT]  /dev/xvdb        200G   84G  116G  42% /data`,
        `[SYS]  14:40:07 Running telemetry validation checks...`,
        `[SYS]  14:40:07 Validation successful: memory saturation cleared (42% utilization).`,
        `[SUCCESS] Outage resolved. Notifying control plane gateway...`
      ];
    } else if (lowerCause.includes("db") || lowerCause.includes("primary") || lowerCause.includes("postgres")) {
      hostNode = "db-node-primary";
      auditDesc = "Executed SQL recovery playbook on db-node-primary";
      commands = [
        `[EXEC] 14:40:03 sudo systemctl restart postgresql`,
        `[OUT]  Restarting postgresql database server: [  OK  ]`,
        `[EXEC] 14:40:05 pg_isready -h localhost -p 5432`,
        `[OUT]  localhost:5432 - accepting connections`,
        `[EXEC] 14:40:06 psql -U postgres -c "SELECT count(*) FROM pg_stat_activity WHERE state='active';"`,
        `[OUT]  count: 3 transactions`,
        `[SYS]  14:40:07 Checking row locks and transaction blockages...`,
        `[SYS]  14:40:07 Deadlock contention cleared. Connection pool normal.`,
        `[SUCCESS] Outage resolved. DB primary service fully recovered.`
      ];
    }

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < commands.length) {
        setTerminalLogs(prev => [...prev, commands[currentIdx]]);
        currentIdx++;
      } else {
        setRunning(false);
        setDone(true);
        clearInterval(interval);

        // Resolve incident in store
        useMonitoringStore.setState({
          rootCause: null,
          playbook: null
        });

        // Clear active incidents in live engine store to simulate recovery
        useLiveEngineStore.setState({ incidents: [] });

        // Add audit log
        addAuditLog(auditDesc, "ssh");
        toast.success("AI Playbook executed successfully. Incidents resolved.");
      }
    }, 750);

    return () => clearInterval(interval);
  }, [running, rootCause, addAuditLog]);

  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit size={18} className="text-cyan-300" />
          <h3 className="text-lg font-semibold">AI Recommendations</h3>
        </div>
        {rootCause && playbook && (
          <button
            onClick={handleRunPlaybook}
            title={currentUserRole === "Developer" ? "Requires Admin or SRE permissions" : undefined}
            className="flex items-center gap-1.5 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Play size={12} /> Run Playbook {currentUserRole === "Developer" && <Lock size={11} className="text-white/85" />}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* Active Outage / Root Cause Warning */}
        {rootCause && (
          <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-xs space-y-3 animate-enter">
            <div className="flex items-start gap-2">
              <ShieldAlert className="text-rose-500 mt-0.5 shrink-0" size={15} />
              <div>
                <p className="font-bold text-rose-500 dark:text-rose-400">ACTIVE ANOMALY DETECTED</p>
                <p className="mt-1 text-slate-300 font-medium">{rootCause}</p>
              </div>
            </div>
            
            {playbook && (
              <div className="bg-black/40 p-3 rounded-lg border border-slate-800">
                <p className="font-bold text-slate-400 mb-2 uppercase text-[9px] tracking-wider font-mono">Suggested AI Remediation Steps:</p>
                <div className="font-mono text-[10px] space-y-1 text-slate-300">
                  {playbook.map((stepStr, sIdx) => (
                    <div key={sIdx} className="flex gap-2">
                      <span className="text-cyan-400 font-bold shrink-0">{sIdx + 1}.</span>
                      <span>{stepStr}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                onClick={handleRunPlaybook}
                title={currentUserRole === "Developer" ? "Requires Admin or SRE permissions" : undefined}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-rose-950/20"
              >
                <Terminal size={13} /> Open SSH Runbook Console {currentUserRole === "Developer" && <Lock size={11} className="text-white/85" />}
              </button>
            </div>
          </div>
        )}

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

      {/* SRE SSH terminal simulation modal */}
      <AnimatePresence>
        {terminalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs"
              onClick={() => !running && setTerminalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 p-6 overflow-hidden flex flex-col h-[400px]"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-1 bg-slate-900 rounded border border-slate-800 text-cyan-500 flex items-center justify-center">
                    <Terminal size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-mono text-slate-200">SRE Remote execution console</h3>
                    <p className="text-[10px] text-slate-500 font-mono">SSH session: cache-node-2.production</p>
                  </div>
                </div>
                {!running && (
                  <button 
                    onClick={() => setTerminalOpen(false)} 
                    className="text-slate-500 hover:text-slate-200 p-1 hover:bg-slate-900 rounded transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Console logs */}
              <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1.5 custom-scrollbar pr-2 select-text">
                {terminalLogs.map((log, idx) => {
                  let cls = "text-slate-300";
                  if (log.startsWith("[EXEC]")) cls = "text-cyan-400 font-semibold";
                  else if (log.startsWith("[SUCCESS]")) cls = "text-emerald-400 font-bold";
                  else if (log.startsWith("[SSH]")) cls = "text-slate-500";
                  else if (log.startsWith("[OUT]")) cls = "text-slate-400";
                  return (
                    <div key={idx} className={cls}>
                      {log}
                    </div>
                  );
                })}
                {running && (
                  <div className="flex items-center gap-1.5 text-slate-500 text-[9px] animate-pulse">
                    <RefreshCw size={10} className="animate-spin" /> Executing playbook runbook...
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center font-mono text-[9px] text-slate-600">
                <span>User: admin@enterprise.com</span>
                {done ? (
                  <button
                    onClick={() => setTerminalOpen(false)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold font-sans flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <Check size={11} /> Close session
                  </button>
                ) : (
                  <span>SSH Key verification active</span>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};
