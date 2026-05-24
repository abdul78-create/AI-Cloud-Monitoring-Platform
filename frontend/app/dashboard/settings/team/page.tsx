"use client";

import React from "react";
import { Users, Shield, UserPlus, MoreHorizontal, CheckCircle2 } from "lucide-react";

const MEMBERS = [
  { id: 1, name: "Abdul", email: "abdul@cloudai.dev", role: "Owner", status: "Active" },
  { id: 2, name: "Sarah Connor", email: "sarah@acmecorp.com", role: "Admin", status: "Active" },
  { id: 3, name: "John Doe", email: "john.doe@acmecorp.com", role: "Engineer", status: "Active" },
  { id: 4, name: "Emily Chen", email: "emily@acmecorp.com", role: "Viewer", status: "Invited" },
];

export default function TeamSettingsPage() {
  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="heading-page">Team & RBAC</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your organization members, roles, and access policies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-5 border-t-4 border-t-violet-500">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white mb-2">
            <Users size={18} className="text-violet-500" />
            <h3 className="font-semibold text-sm">Total Members</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">4 <span className="text-sm font-normal text-slate-500">/ 10</span></p>
          <div className="mt-4 text-xs text-slate-500">
            You have 6 seats remaining on the Pro Plan.
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white mb-2">
            <Shield size={18} className="text-emerald-500" />
            <h3 className="font-semibold text-sm">SSO / SAML</h3>
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500" /> Enforced
          </p>
          <div className="mt-4 text-xs text-slate-500">
            Connected to Okta (acmecorp.okta.com)
          </div>
        </div>
      </div>

      <div className="card border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Organization Members</h3>
            <p className="text-xs text-slate-500 mt-0.5">Invite new engineers to this workspace</p>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-md transition-colors shadow-sm">
            <UserPlus size={14} />
            Invite Member
          </button>
        </div>
        
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-900/40 text-slate-500 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-5 py-3 font-semibold text-xs tracking-wider uppercase">User</th>
              <th className="px-5 py-3 font-semibold text-xs tracking-wider uppercase">Role</th>
              <th className="px-5 py-3 font-semibold text-xs tracking-wider uppercase">Status</th>
              <th className="px-5 py-3 font-semibold text-xs tracking-wider uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {MEMBERS.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-xs">{m.name}</p>
                      <p className="text-slate-500 text-[11px]">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <select 
                    defaultValue={m.role}
                    disabled={m.role === 'Owner'}
                    className="bg-transparent border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-violet-500 outline-none cursor-pointer disabled:opacity-50"
                  >
                    <option>Owner</option>
                    <option>Admin</option>
                    <option>Engineer</option>
                    <option>Viewer</option>
                  </select>
                </td>
                <td className="px-5 py-3">
                  {m.status === 'Active' ? (
                    <span className="badge badge-live text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Active</span>
                  ) : (
                    <span className="badge text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Invited</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                    <MoreHorizontal size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
