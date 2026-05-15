"use client";

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useMonitoringStore } from "@/store/useMonitoringStore";
import { toast } from "react-hot-toast";
import { AlertOctagon, X, AlertTriangle, Sparkles, Check, Zap } from "lucide-react";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const useSocket = () => {
  const addTimelineEvent = useMonitoringStore((state) => state.addTimelineEvent);
  const setConnectionStatus = useMonitoringStore((state) => state.setConnectionStatus);
  const lastAlertTimeRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 5000,
    });
    useMonitoringStore.setState({ socket });

    socket.on("connect", () => {
      console.log("[SOCKET] Connected to backend");
      setConnectionStatus("connected");
    });

    socket.on("metrics", (data) => {
      if (useMonitoringStore.getState().isSimulating) return;
      useMonitoringStore.setState((state) => ({
        metrics: [...state.metrics, data].slice(-20)
      }));
    });

    socket.on("alert", (data) => {
      useMonitoringStore.setState((state) => ({
        alerts: [data, ...state.alerts].slice(-10)
      }));
      
      const severity = data.severity || "critical";
      const now = Date.now();
      const lastAlertTime = lastAlertTimeRef.current[severity] || 0;
      
      // Throttle toasts by severity (1 per 3 seconds max)
      if (now - lastAlertTime < 3000) return;
      lastAlertTimeRef.current[severity] = now;

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
      if (useMonitoringStore.getState().isSimulating) return;
      useMonitoringStore.setState({ infrastructure: data });
    });

    socket.on("simulation_update", (simulation: any) => {
      console.log("[SOCKET] Simulation update received");
      
      const currentMetrics = useMonitoringStore.getState().metrics;
      const currentInfra = useMonitoringStore.getState().infrastructure;
      const currentAlerts = useMonitoringStore.getState().alerts;
      const currentTimeline = useMonitoringStore.getState().timeline;
      
      const updatedMetrics = simulation.metrics ? [...currentMetrics, { ...currentMetrics[currentMetrics.length - 1], ...simulation.metrics, timestamp: new Date().toISOString() }] as any : currentMetrics;
      
      const updatedInfra = currentInfra.map(node => {
        const update = simulation.infraUpdates?.find((u: any) => u.service === node.service);
        return update ? { ...node, ...update } : node;
      });
      
      const updatedAlerts = simulation.newAlerts ? [...simulation.newAlerts, ...currentAlerts] : currentAlerts;
      
      const updatedTimeline = simulation.timelineEvents ? [...currentTimeline, ...simulation.timelineEvents] : currentTimeline;

      useMonitoringStore.setState({
        metrics: updatedMetrics,
        infrastructure: updatedInfra,
        alerts: updatedAlerts,
        timeline: updatedTimeline,
        rootCause: simulation.rootCause || null,
        playbook: simulation.playbook || null
      });
      if (simulation.playbook && simulation.playbook.length > 0) {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-premium rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 transition-all duration-300`}>
            <div className="flex-1 w-0">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center border bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 border-emerald-100 dark:border-emerald-900/50">
                    <Zap size={20} />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-emerald-600">Auto-Remediation Triggered</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Executing: {simulation.playbook.join(", ")}
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
        ));
        
        useMonitoringStore.getState().addTimelineEvent({
          type: "ai",
          message: `Auto-remediation engine executed playbook: ${simulation.playbook.join(", ")}`
        });
      }
    });

    socket.on("connect_error", () => {
      setConnectionStatus("disconnected");
    });

    socket.on("disconnect", () => {
      console.log("[SOCKET] Disconnected from backend");
      setConnectionStatus("disconnected");
    });

    socket.on("reconnect_attempt", () => {
      setConnectionStatus("reconnecting");
    });

    socket.on("reconnect", () => {
      setConnectionStatus("connected");
      addTimelineEvent({
        type: "info",
        message: "Socket connection restored. Auto-recovery active.",
      });
    });

    // Simulate self-healing for demo purposes
    const selfHealingInterval = setInterval(() => {
      const { infrastructure } = useMonitoringStore.getState();
      const downNodes = infrastructure.filter(n => n.status === 'down');
      if (downNodes.length > 0) {
        const randomNode = downNodes[Math.floor(Math.random() * downNodes.length)];
        // Simulate recovery
        useMonitoringStore.setState((state) => ({
          infrastructure: state.infrastructure.map(n => 
            n.service === randomNode.service ? { ...n, status: 'healthy' } : n
          )
        }));
        
        toast.custom((t) => (
          <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 p-4 rounded-xl flex items-center gap-2">
            <Check size={16} className="text-emerald-500" />
            <div>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Self-Healing Resolved</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">Node {randomNode.service} recovered successfully.</p>
            </div>
          </div>
        ));

        addTimelineEvent({
          type: "info",
          message: `Self-healing system automatically recovered node '${randomNode.service}'.`,
        });
      }
    }, 30000);

    return () => {
      socket.disconnect();
      clearInterval(selfHealingInterval);
    };
  }, [setConnectionStatus, addTimelineEvent]);
};
