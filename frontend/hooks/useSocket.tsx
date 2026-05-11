"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { toast } from "react-hot-toast";
import { AlertOctagon, X, AlertTriangle, Sparkles, Check } from "lucide-react";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const useSocket = () => {
  const { metrics, infrastructure } = useMonitoringStore();

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("[SOCKET] Connected to backend");
    });

    socket.on("metrics", (data) => {
      useMonitoringStore.setState((state) => ({
        metrics: [...state.metrics, data].slice(-20)
      }));
    });

    socket.on("alert", (data) => {
      useMonitoringStore.setState((state) => ({
        alerts: [data, ...state.alerts].slice(-10)
      }));
      
      // Premium Custom Toast
      const severity = data.severity || "critical";
      const isCritical = severity === "critical";
      const isWarning = severity === "warning";
      const isAI = severity === "ai";
      
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-premium rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 transition-all duration-300 ${
          isCritical ? 'border-rose-200 dark:border-rose-800' :
          isWarning ? 'border-amber-200 dark:border-amber-800' :
          isAI ? 'border-indigo-200 dark:border-indigo-800' :
          'border-emerald-200 dark:border-emerald-800'
        }`}>
          <div className="flex-1 w-0">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border transition-colors ${
                  isCritical ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-500 border-rose-100 dark:border-rose-900/50' :
                  isWarning ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-500 border-amber-100 dark:border-amber-900/50' :
                  isAI ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 border-indigo-100 dark:border-indigo-900/50' :
                  'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 border-emerald-100 dark:border-emerald-900/50'
                }`}>
                  {isCritical ? <AlertOctagon size={20} className="animate-pulse" /> :
                   isWarning ? <AlertTriangle size={20} /> :
                   isAI ? <Sparkles size={20} /> :
                   <Check size={20} />}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-bold ${
                  isCritical ? 'text-rose-600' :
                  isWarning ? 'text-amber-600' :
                  isAI ? 'text-indigo-600' :
                  'text-emerald-600'
                }`}>
                  {severity.toUpperCase()} ALERT
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Alert on {data.hostname || 'system'}: {data.metric || 'metric'} exceeded threshold!
                </p>
              </div>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-transparent rounded-md inline-flex text-slate-400 hover:text-slate-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <X size={16} />
            </button>
          </div>
        </div>
      ), { duration: 5000 });
    });

    socket.on("infrastructure", (data) => {
      useMonitoringStore.setState({ infrastructure: data });
    });

    socket.on("disconnect", () => {
      console.log("[SOCKET] Disconnected from backend");
    });

    return () => {
      socket.disconnect();
    };
  }, []);
};
