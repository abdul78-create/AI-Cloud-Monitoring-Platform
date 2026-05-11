"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, AlertTriangle, AlertOctagon, Sparkles, Info, Trash2 } from "lucide-react";
import { useMonitoringStore } from "@/store/useMonitoringStore";

type NotificationCenterProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const NotificationCenter = ({ isOpen, onClose }: NotificationCenterProps) => {
  const { alerts } = useMonitoringStore();
  
  // Use store alerts or fallback to mock notifications for rich variety
  const notifications = alerts.length > 0 ? alerts.map(a => ({
    id: a.id,
    title: a.category ? a.category.toUpperCase() : "ALERT",
    message: a.message,
    severity: a.severity,
    time: "2m ago",
    read: false
  })) : [
    { id: "1", title: "API Gateway", message: "High latency detected on /auth endpoint", severity: "warning", time: "2m ago", read: false },
    { id: "2", title: "Auth Service", message: "Memory usage exceeded 85%", severity: "critical", time: "5m ago", read: false },
    { id: "3", title: "Database", message: "Backup completed successfully", severity: "success", time: "1h ago", read: true },
    { id: "4", title: "AI Insight", message: "Predicted traffic surge in next 30 mins", severity: "ai", time: "10m ago", read: false },
  ];

  const getIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertOctagon size={16} className="text-rose-500" />;
      case "warning": return <AlertTriangle size={16} className="text-amber-500" />;
      case "success": return <Check size={16} className="text-emerald-500" />;
      case "ai": return <Sparkles size={16} className="text-indigo-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  const getBg = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/50";
      case "warning": return "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50";
      case "success": return "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50";
      case "ai": return "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50";
      default: return "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for closing */}
          <div className="fixed inset-0 z-30" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-3 w-96 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-premium z-40 overflow-hidden transition-colors duration-500"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl transition-colors duration-500">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Notification Center
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full font-medium">
                    {notifications.filter(n => !n.read).length}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Real-time infrastructure alerts</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Clear all">
                  <Trash2 size={14} />
                </button>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <Bell size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative ${!notif.read ? 'bg-indigo-50/20 dark:bg-indigo-900/10' : ''}`}
                    >
                      {!notif.read && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-indigo-600" />
                      )}
                      <div className="flex gap-3">
                        <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center border transition-colors ${getBg(notif.severity)}`}>
                          {getIcon(notif.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{notif.title}</h4>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap ml-2">{notif.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{notif.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center bg-white/50 dark:bg-slate-900/50 transition-colors duration-500">
              <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                View All Notifications
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
