"use client";

import React from "react";
import { CreditCard, Zap, Server, Activity, ArrowUpRight } from "lucide-react";

export default function BillingSettingsPage() {
  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="heading-page">Billing & Usage</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your subscription plan, payment methods, and monitor infrastructure telemetry quotas.
        </p>
      </div>

      {/* Current Plan Overview */}
      <div className="card p-6 border-2 border-violet-500 bg-violet-50/50 dark:bg-violet-900/10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-[10px] font-bold uppercase tracking-widest mb-3">
              Current Plan
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Pro Team <Zap size={20} className="text-violet-500 fill-violet-500/20" />
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Billed $49/user/month. Next invoice on June 1, 2026.
            </p>
          </div>
          <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-semibold text-slate-900 dark:text-white shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Manage Subscription
          </button>
        </div>
      </div>

      {/* Usage Meters */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Current Billing Cycle Usage</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Telemetry Events */}
          <div className="card p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Activity size={16} className="text-sky-500" />
                <h4 className="font-semibold text-sm">Telemetry Events</h4>
              </div>
              <span className="text-xs font-mono text-slate-500">8.4M / 100M</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-sky-500 rounded-full" style={{ width: '8.4%' }} />
            </div>
            <p className="text-xs text-slate-500">8.4% of your monthly quota used.</p>
          </div>

          {/* Log Retention */}
          <div className="card p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Server size={16} className="text-emerald-500" />
                <h4 className="font-semibold text-sm">Log Storage</h4>
              </div>
              <span className="text-xs font-mono text-slate-500">242 GB / 500 GB</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '48.4%' }} />
            </div>
            <p className="text-xs text-slate-500">48.4% of your storage limit used.</p>
          </div>
        </div>
      </div>

      {/* Payment Method & Invoices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card border border-slate-200 dark:border-slate-800">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Payment Method</h3>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-6 bg-slate-200 dark:bg-slate-800 rounded flex items-center justify-center border border-slate-300 dark:border-slate-700">
                <CreditCard size={14} className="text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Visa ending in 4242</p>
                <p className="text-xs text-slate-500">Expires 12/2028</p>
              </div>
            </div>
            <button className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700">Update</button>
          </div>
        </div>

        <div className="card border border-slate-200 dark:border-slate-800">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Invoices</h3>
          </div>
          <div className="p-4 space-y-3">
            {[
              { date: "May 1, 2026", amount: "$196.00", status: "Paid" },
              { date: "Apr 1, 2026", amount: "$196.00", status: "Paid" },
            ].map((invoice, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-slate-600 dark:text-slate-400">{invoice.date}</span>
                  <span className="badge badge-live text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{invoice.status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-900 dark:text-white">{invoice.amount}</span>
                  <button className="text-slate-400 hover:text-violet-600 transition-colors">
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
