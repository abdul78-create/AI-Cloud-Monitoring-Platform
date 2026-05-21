"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, AlertTriangle, RefreshCw, CheckCircle2, FileSearch, ArrowRight, BrainCircuit, Activity, Server, FileText, Cpu } from "lucide-react";

interface AIAnalysisData {
  summary: string;
  severity: "low" | "medium" | "high" | "critical";
  affectedServices: string[];
  anomalies: string[];
  recommendations: string[];
  telemetryCorrelation: string[];
  stats: {
    linesParsed: number;
    errors: number;
    warnings: number;
  };
}

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export const LogAnalyzerClient = () => {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisData | null>(null);
  
  const inputRef = useRef<HTMLInputElement | null>(null);

  const processFile = async (file?: File) => {
    if (!file) return;
    
    if (!/\.(log|txt)$/i.test(file.name)) {
      const msg = "Only .log and .txt files are supported.";
      setError(msg);
      toast.error(msg);
      return;
    }
    
    setSelectedFile(file);
    setError(null);
    setAiResult(null);
    setIsUploading(true);
    setIsAnalyzing(false);

    try {
      const formData = new FormData();
      formData.append("logFile", file);

      // Simulate network upload progress
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setIsUploading(false);
      setIsAnalyzing(true);

      const response = await fetch(`${API}/api/analyze`, {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to analyze log file.");
      }

      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setAiResult(json.data);
      toast.success("AI Diagnostics completed successfully.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error during upload.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await processFile(event.target.files?.[0]);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    await processFile(event.dataTransfer.files?.[0]);
  };

  // Severity configurations for badges
  const severityConfig = {
    low: { color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950", border: "border-emerald-200 dark:border-emerald-800", label: "Low Priority" },
    medium: { color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950", border: "border-blue-200 dark:border-blue-800", label: "Medium Priority" },
    high: { color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950", border: "border-amber-200 dark:border-amber-800", label: "High Priority" },
    critical: { color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950", border: "border-red-200 dark:border-red-800", label: "Critical Incident" }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <BrainCircuit className="text-blue-600 dark:text-blue-500" size={24} />
          AI Log Intelligence
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Upload application logs for instant AI-driven anomaly detection and telemetry correlations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Upload Control */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Diagnostic Source</h3>
          
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`rounded-lg border-2 border-dashed p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
              dragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50 dark:bg-slate-800/50"
            }`}
            onClick={() => inputRef.current?.click()}
          >
            <UploadCloud className={`mb-3 ${dragging ? "text-blue-600" : "text-slate-400"}`} size={32} />
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
              Drag & drop log file here
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Supported formats: .log, .txt (Max 10MB)
            </p>
            <button className="mt-5 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
              Browse Files
            </button>
            <input ref={inputRef} type="file" accept=".log,.txt" onChange={handleInputChange} className="hidden" />
          </div>

          {/* Progress / Status */}
          <AnimatePresence mode="wait">
            {(isUploading || isAnalyzing) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pt-2"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <RefreshCw size={14} className="animate-spin text-blue-600" />
                  {isUploading ? "Uploading telemetry sequence..." : "AI analyzing log heuristics..."}
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden w-full">
                  <motion.div
                    className="h-full bg-blue-600 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: isAnalyzing ? "100%" : "40%" }}
                    transition={{ duration: isAnalyzing ? 1.5 : 0.8, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400">
                  <AlertTriangle size={16} />
                  Analyzer Fault
                </div>
                <p className="text-xs text-red-600 dark:text-red-300 leading-relaxed">{error}</p>
              </motion.div>
            )}

            {!isUploading && !isAnalyzing && !error && selectedFile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium truncate">
                  <FileText size={14} className="flex-shrink-0" />
                  <span className="truncate">{selectedFile.name}</span>
                </div>
                <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: AI Diagnostic Results */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[460px] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity size={16} className="text-slate-400" />
              Incident Diagnostics Report
            </span>
          </div>

          <div className="flex-1 p-6 relative">
            <AnimatePresence mode="wait">
              {/* Empty State */}
              {!isUploading && !isAnalyzing && !aiResult && !error && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <FileSearch size={28} className="text-slate-400" />
                  </div>
                  <h4 className="text-base font-medium text-slate-900 dark:text-white mb-1">Awaiting Diagnostic Input</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                    Upload a log file from your services to generate an automated root cause analysis.
                  </p>
                </motion.div>
              )}

              {/* Loading State */}
              {(isUploading || isAnalyzing) && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10"
                >
                  <RefreshCw size={32} className="animate-spin text-blue-600 mb-4" />
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Synthesizing Log Vectors</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Applying LLM heuristics to telemetry patterns...</p>
                </motion.div>
              )}

              {/* Report Body */}
              {aiResult && !isUploading && !isAnalyzing && (
                <motion.div
                  key="report"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ staggerChildren: 0.1 }}
                  className="space-y-6"
                >
                  {/* Summary & Severity */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Incident Summary</h4>
                      <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {aiResult.summary}
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Severity Score</h4>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${severityConfig[aiResult.severity].bg} ${severityConfig[aiResult.severity].border} ${severityConfig[aiResult.severity].color}`}>
                        {severityConfig[aiResult.severity].label}
                      </div>
                    </div>
                  </div>

                  {/* Metadata Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1">Lines Parsed</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">{aiResult.stats.linesParsed}</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1">Error Events</div>
                      <div className="text-lg font-bold text-red-600 dark:text-red-400 tabular-nums">{aiResult.stats.errors}</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1">Warning Events</div>
                      <div className="text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums">{aiResult.stats.warnings}</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1">Impacted Nodes</div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400 tabular-nums">{aiResult.affectedServices.length}</div>
                    </div>
                  </div>

                  {/* Root Cause & Anomalies */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Root Cause Analysis</h4>
                    <div className="bg-red-50 dark:bg-red-950/20 border-l-2 border-red-500 rounded-r-lg p-4 space-y-2">
                      {aiResult.anomalies.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <ArrowRight size={14} className="mt-0.5 text-red-500 shrink-0" />
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Telemetry Correlations */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Cpu size={14} /> Telemetry Correlation
                      </h4>
                      <ul className="space-y-3 border-l-2 border-slate-200 dark:border-slate-700 ml-2 pl-3">
                        {aiResult.telemetryCorrelation.map((item, idx) => (
                          <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 relative">
                            <span className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <CheckCircle2 size={14} /> Recommended Actions
                      </h4>
                      <div className="space-y-2">
                        {aiResult.recommendations.map((item, idx) => (
                          <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Affected Services */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                     <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Affected Services</h4>
                     <div className="flex gap-2 flex-wrap">
                       {aiResult.affectedServices.map(svc => (
                         <span key={svc} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-xs font-mono">
                           <Server size={12} /> {svc}
                         </span>
                       ))}
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
