"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { useMonitoringStore } from "@/store/useMonitoringStore";

export const LogAnalyzerClient = () => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const runLogAnalysis = useMonitoringStore((state) => state.runLogAnalysis);
  const aiResult = useMonitoringStore((state) => state.aiResult);
  const isUploading = useMonitoringStore((state) => state.isUploading);
  const uploadProgress = useMonitoringStore((state) => state.uploadProgress);
  const isAnalyzing = useMonitoringStore((state) => state.isAnalyzing);

  const processFile = async (file?: File) => {
    if (!file) return;
    if (!/\.(log|txt)$/i.test(file.name)) {
      toast.error("Only .log and .txt files are supported.");
      return;
    }
    try {
      await runLogAnalysis(file);
      toast.success("AI analysis completed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
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
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <h2 className="text-3xl font-semibold">AI Log Analyzer</h2>
      <GlassCard>
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`rounded-xl border border-dashed p-6 text-center transition ${dragging ? "border-cyan-300 bg-cyan-400/10" : "border-white/20 bg-white/5"}`}
        >
          <UploadCloud className="mx-auto mb-3 text-cyan-300" />
          <p className="mb-2 text-slate-200">Drag & drop log file here</p>
          <p className="mb-4 text-xs text-slate-400">Supported: .log, .txt</p>
          <button className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900" onClick={() => inputRef.current?.click()}>
            Browse File
          </button>
          <input ref={inputRef} type="file" accept=".log,.txt" onChange={handleInputChange} className="hidden" />
        </div>

        {(isUploading || isAnalyzing) && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-slate-300">{isUploading ? "Uploading logs..." : "Analyzing with AI model..."}</p>
            <div className="h-2 rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-indigo-400"
                initial={{ width: 0 }}
                animate={{ width: `${isAnalyzing ? 100 : uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </GlassCard>

      <GlassCard>
        {(isUploading || isAnalyzing) && <p>Analyzing logs with Ollama...</p>}
        {!isUploading && !isAnalyzing && !aiResult && <p className="text-slate-400">Your AI summary will appear here.</p>}
        {aiResult && (
          <div className="space-y-4">
            <div>
              <p className="mb-1 font-semibold text-cyan-300">Summary</p>
              <p>{aiResult.summary}</p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-cyan-300">Detected Anomalies</p>
              <ul className="list-disc space-y-1 pl-5">
                {aiResult.anomalies.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1 font-semibold text-cyan-300">Optimization Suggestions</p>
              <ul className="list-disc space-y-1 pl-5">
                {aiResult.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1 font-semibold text-cyan-300">Threat Signals</p>
              <ul className="list-disc space-y-1 pl-5">
                {aiResult.threats.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </GlassCard>
    </main>
  );
};
