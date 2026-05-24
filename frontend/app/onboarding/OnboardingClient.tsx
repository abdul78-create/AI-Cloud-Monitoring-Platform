"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Globe, Shield, Zap, Users, Building, Server, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";

export default function OnboardingClient() {
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState("");
  const [logLines, setLogLines] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const steps = [
    { id: 1, name: "Workspace" },
    { id: 2, name: "Team" },
    { id: 3, name: "Connect" },
  ];

  React.useEffect(() => {
    if (step !== 3) return;
    
    setLogLines([]);
    setIsConnected(false);
    
    const lines = [
      "[SYS] 14:38:01 Initializing cloudai-agent daemon...",
      "[SYS] 14:38:02 Connecting to control plane gateway at agent.aicloud.com...",
      "[SYS] 14:38:03 Tunnel established. SSL Handshake completed.",
      "[SYS] 14:38:03 Verifying authorization token key: bf7c5a6... OK",
      "[SYS] 14:38:04 Host metadata: Ubuntu 22.04 LTS | 4 vCPU | 8GB RAM",
      "[SUCCESS] Node cache-node-1 connected. Metric ingestion active!"
    ];

    let index = 0;
    const timer = setInterval(() => {
      if (index < lines.length) {
        setLogLines(p => [...p, lines[index]]);
        index++;
      } else {
        setIsConnected(true);
        clearInterval(timer);
      }
    }, 700);

    return () => clearInterval(timer);
  }, [step]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-400/10 opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-violet-400/10 opacity-30 blur-3xl" />

      {/* Content */}
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-premium p-8 relative z-10">
        
        {/* Progress */}
        <div className="flex justify-between mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= s.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {step > s.id ? <Check size={14} /> : s.id}
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 ${step > s.id ? 'bg-indigo-600' : 'bg-slate-100'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 text-xs font-medium text-indigo-600 mb-2">
                  <Sparkles size={12} />
                  <span>Welcome to the Future</span>
                </div>
                <h1 className="text-2xl font-bold font-display text-slate-900">Create your Workspace</h1>
                <p className="text-sm text-slate-500">Set up your organization to start monitoring.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">Organization Name</label>
                <input
                  type="text"
                  placeholder="Acme Corp"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm bg-white/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">Region</label>
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm bg-white/50 transition-all">
                  <option>US East (N. Virginia)</option>
                  <option>EU Central (Frankfurt)</option>
                  <option>Asia Pacific (Singapore)</option>
                </select>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!orgName}
                className="w-full bg-indigo-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-2xl font-bold font-display text-slate-900">Invite your Team</h1>
                <p className="text-sm text-slate-500">Add collaborators to {orgName}.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">Team Members</label>
                <input
                  type="text"
                  placeholder="alex@acme.com, sarah@acme.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm bg-white/50 transition-all"
                />
                <p className="text-xs text-slate-400">Separate emails with commas.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">Role</label>
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm bg-white/50 transition-all">
                  <option>Viewer (Read only)</option>
                  <option>Developer (Edit metrics)</option>
                  <option>Admin (Full access)</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-slate-200 text-slate-700 rounded-xl py-3 text-sm font-semibold hover:bg-slate-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-indigo-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-100"
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h1 className="text-2xl font-bold font-display text-slate-900">Connect your First Node</h1>
                <p className="text-sm text-slate-500">Run the agent on your server to start monitoring.</p>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 text-xs font-mono text-white relative">
                <div className="flex justify-between items-center mb-2 text-slate-500 border-b border-slate-800 pb-1.5">
                  <span>Terminal</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText("curl -sS https://agent.aicloud.com/install.sh | sh -s -- --token bf7c5a6d8f");
                      toast.success("Command copied to clipboard!");
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <code className="text-blue-400">curl -sS https://agent.aicloud.com/install.sh | sh -s -- --token bf7c5a6d8f...</code>
              </div>

              {/* simulated logs console */}
              <div className="bg-slate-950 rounded-xl p-4 h-32 overflow-y-auto font-mono text-[10px] space-y-1 border border-slate-800">
                {logLines.map((line, idx) => {
                  const isSuccess = line.startsWith("[SUCCESS]");
                  return (
                    <div key={idx} className={isSuccess ? "text-emerald-400 font-bold" : "text-slate-300"}>
                      {line}
                    </div>
                  );
                })}
                {!isConnected && (
                  <div className="text-slate-500 animate-pulse">_</div>
                )}
              </div>

              <div className="text-center">
                {isConnected ? (
                  <p className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
                    <Check size={14} className="bg-emerald-100 rounded-full p-0.5" /> Agent connected successfully!
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                    <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-ping" />
                    Waiting for agent telemetry...
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border border-slate-200 text-slate-700 rounded-xl py-3 text-sm font-semibold hover:bg-slate-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => window.location.href = "/dashboard"}
                  disabled={!isConnected}
                  className="flex-1 bg-indigo-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Go to Dashboard <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
