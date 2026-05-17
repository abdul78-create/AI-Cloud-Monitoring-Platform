"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { UploadCloud, AlertTriangle, RefreshCw, CheckCircle2, FileSearch, ArrowRight, BrainCircuit, Sparkles, Shield } from "lucide-react";
import { useMonitoringStore } from "@/store/useMonitoringStore";

export const LogAnalyzerClient = () => {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const runLogAnalysis = useMonitoringStore((state) => state.runLogAnalysis);
  const aiResult = useMonitoringStore((state) => state.aiResult);
  const isUploading = useMonitoringStore((state) => state.isUploading);
  const uploadProgress = useMonitoringStore((state) => state.uploadProgress);
  const isAnalyzing = useMonitoringStore((state) => state.isAnalyzing);

  const processFile = async (file?: File) => {
    if (!file) return;
    setSelectedFile(file);
    setError(null);
    if (!/\.(log|txt)$/i.test(file.name)) {
      setError("Only .log and .txt files are supported.");
      toast.error("Only .log and .txt files are supported.");
      return;
    }
    try {
      await runLogAnalysis(file);
      toast.success("AI analysis completed.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      toast.error(msg);
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

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div>
        <h1 className="heading-page flex items-center gap-2">
          <FileSearch style={{ color: "var(--text-secondary)" }} size={20} />
          AI Logs Analyzer
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
          Upload high-volume diagnostic log files for instant AI anomaly detection and telemetry correlations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* ── Left Side: Upload Control ── */}
        <div className="card p-5 space-y-4">
          <h3 className="heading-section">Diagnostic Source</h3>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className="rounded-lg border border-dashed p-6 text-center transition-colors cursor-pointer flex flex-col items-center justify-center"
            style={{
              borderColor: dragging ? "var(--brand-600)" : "var(--border-default)",
              background: dragging ? "var(--brand-50)" : "var(--surface-1)",
            }}
            onClick={() => inputRef.current?.click()}
          >
            <UploadCloud className="mb-2" style={{ color: "var(--brand-600)" }} size={24} />
            <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>
              Drag & drop log file here
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
              Supported formats: .log, .txt (Max 10MB)
            </p>
            <button className="btn btn-outlined py-1.5 px-3 text-xs font-semibold mt-4">
              Browse File
            </button>
            <input ref={inputRef} type="file" accept=".log,.txt" onChange={handleInputChange} className="hidden" />
          </div>

          {/* Progress loader */}
          {(isUploading || isAnalyzing) && (
            <div className="space-y-2">
              <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                <RefreshCw size={12} className="animate-spin" />
                {isUploading ? `Uploading telemetry (${uploadProgress}%)…` : "Running intelligent LLM scan…"}
              </p>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "var(--brand-600)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${isAnalyzing ? 100 : uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Error fallback */}
          {error && (
            <div
              className="p-3.5 rounded-lg flex flex-col gap-2"
              style={{ background: "var(--color-error-bg)", border: "1px solid var(--color-error-border)" }}
            >
              <div className="flex items-center gap-2 text-xs font-bold" style={{ color: "var(--color-error)" }}>
                <AlertTriangle size={13} />
                <span>Analyzer Fault</span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{error}</p>
              <button
                onClick={() => processFile(selectedFile || undefined)}
                className="btn btn-outlined py-1 px-2.5 text-[10px] font-bold self-start mt-1 flex items-center gap-1"
              >
                <RefreshCw size={10} /> Retry Upload
              </button>
            </div>
          )}

          {/* Success processed badge */}
          {!isUploading && !isAnalyzing && !error && selectedFile && (
            <div
              className="p-3 rounded-lg flex items-center gap-2 text-xs font-semibold"
              style={{ background: "var(--color-success-bg)", border: "1px solid var(--color-success-border)", color: "var(--color-success)" }}
            >
              <CheckCircle2 size={13} />
              <span>Loaded {selectedFile.name}</span>
            </div>
          )}
        </div>

        {/* ── Right Side: AI Diagnostic Results ── */}
        <div className="lg:col-span-2 card p-5 flex flex-col min-h-[360px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <BrainCircuit size={14} style={{ color: "var(--brand-600)" }} />
              Diagnostic Report
            </span>
            {aiResult && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded"
                style={{ background: "var(--color-success-bg)", color: "var(--color-success)" }}
              >
                <Sparkles size={10} /> Analysis Completed
              </span>
            )}
          </div>

          {/* Analyzer Empty State */}
          {!isUploading && !isAnalyzing && !aiResult && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-xs" style={{ color: "var(--text-tertiary)" }}>
              <FileSearch size={32} className="opacity-30 mb-2" />
              <p className="font-semibold" style={{ color: "var(--text-secondary)" }}>No diagnostic log analyzed yet</p>
              <p className="max-w-[280px] mt-1">Upload a log file in the left panel to correlate operational telemetry with AI insights.</p>
            </div>
          )}

          {/* Loading status */}
          {(isUploading || isAnalyzing) && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-xs gap-3" style={{ color: "var(--text-tertiary)" }}>
              <RefreshCw size={24} className="animate-spin text-blue-500 opacity-60" />
              <p className="font-semibold" style={{ color: "var(--text-secondary)" }}>Parsing diagnostic structure…</p>
            </div>
          )}

          {/* Report body */}
          {aiResult && !isUploading && !isAnalyzing && (
            <div className="space-y-4 text-xs">
              {/* Summary panel */}
              <div className="p-3 rounded-lg" style={{ background: "var(--surface-1)", border: "1px solid var(--border-default)" }}>
                <p className="font-bold mb-1.5 flex items-center gap-1" style={{ color: "var(--text-primary)" }}>
                  Summary Overview
                </p>
                <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>{aiResult.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Anomalies list */}
                <div className="p-3.5 rounded-lg" style={{ background: "var(--color-warning-bg)", border: "1px solid var(--color-warning-border)" }}>
                  <p className="font-bold mb-2 flex items-center gap-1" style={{ color: "var(--color-warning)" }}>
                    <AlertTriangle size={12} />
                    Correlated Anomalies
                  </p>
                  <ul className="space-y-1.5">
                    {aiResult.anomalies.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        <ArrowRight size={10} className="shrink-0 mt-0.5 opacity-60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Threat Signals */}
                <div className="p-3.5 rounded-lg" style={{ background: "var(--color-error-bg)", border: "1px solid var(--color-error-border)" }}>
                  <p className="font-bold mb-2 flex items-center gap-1" style={{ color: "var(--color-error)" }}>
                    <Shield size={12} />
                    Active Threat Signals
                  </p>
                  <ul className="space-y-1.5">
                    {aiResult.threats.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        <ArrowRight size={10} className="shrink-0 mt-0.5 opacity-60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Optimization suggestions */}
              <div className="p-3.5 rounded-lg" style={{ background: "var(--brand-50)", border: "1px solid var(--border-default)" }}>
                <p className="font-bold mb-2 flex items-center gap-1" style={{ color: "var(--brand-600)" }}>
                  <Sparkles size={12} />
                  Operational Recommendations
                </p>
                <ul className="space-y-1.5">
                  {aiResult.recommendations.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      <ArrowRight size={10} className="shrink-0 mt-0.5 opacity-60" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
