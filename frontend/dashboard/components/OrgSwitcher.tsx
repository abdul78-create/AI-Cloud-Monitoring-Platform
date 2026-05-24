"use client";

import React, { useState, useRef, useEffect } from "react";
import { Activity, ChevronsUpDown, Check, PlusCircle, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ORGS = [
  { id: "personal", name: "Personal Workspace", plan: "Free" },
  { id: "engineering", name: "Engineering", plan: "Pro" },
  { id: "production", name: "Production", plan: "Enterprise" },
  { id: "staging", name: "Staging", plan: "Pro" },
  { id: "security", name: "Security Team", plan: "Enterprise" },
];

export function OrgSwitcher() {
  const [open, setOpen] = useState(false);
  const [activeOrgId, setActiveOrgId] = useState("engineering");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeOrg = ORGS.find(o => o.id === activeOrgId) || ORGS[1];

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors group"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-6 w-6 rounded flex items-center justify-center flex-shrink-0 bg-slate-900 dark:bg-white text-white dark:text-slate-900">
            <Activity size={14} />
          </div>
          <div className="text-left overflow-hidden">
            <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate leading-tight">
              {activeOrg.name}
            </p>
            <p className="text-[10px] text-slate-500 truncate leading-none mt-0.5">
              {activeOrg.plan} Plan
            </p>
          </div>
        </div>
        <ChevronsUpDown size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-1.5 space-y-0.5 max-h-64 overflow-y-auto">
              <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Workspaces
              </div>
              {ORGS.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    setActiveOrgId(org.id);
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      {org.name.charAt(0)}
                    </div>
                    <span className="text-[13px] text-slate-700 dark:text-slate-200 truncate">{org.name}</span>
                  </div>
                  {activeOrgId === org.id && <Check size={14} className="text-violet-600 dark:text-violet-400" />}
                </button>
              ))}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 p-1.5 space-y-0.5 bg-slate-50 dark:bg-slate-900/50">
              <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[13px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                <Settings size={14} />
                Workspace Settings
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[13px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                <PlusCircle size={14} />
                Create Workspace
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
