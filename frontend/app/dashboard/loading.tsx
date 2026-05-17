"use client";

import React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-5 animate-pulse w-full">
      {/* ── Header skeleton ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="h-6 w-52 bg-[var(--surface-3)] rounded-md mb-2" />
          <div className="h-4 w-80 bg-[var(--surface-2)] rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-28 bg-[var(--surface-2)] rounded-md" />
          <div className="h-8 w-28 bg-[var(--surface-2)] rounded-md" />
        </div>
      </div>

      {/* ── Stats cards skeleton ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="card p-5 h-28 flex flex-col justify-between"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <div className="flex justify-between items-center">
              <div className="h-6 w-6 rounded-lg bg-[var(--surface-2)]" />
              <div className="h-4 w-10 rounded bg-[var(--surface-2)]" />
            </div>
            <div>
              <div className="h-3 w-16 bg-[var(--surface-2)] rounded mb-2" />
              <div className="h-6 w-20 bg-[var(--surface-3)] rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts + AI Insights skeleton ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main chart skeleton */}
        <div className="lg:col-span-2 card p-5 h-[300px] flex flex-col justify-between" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="h-4 w-44 bg-[var(--surface-3)] rounded mb-1.5" />
              <div className="h-3 w-28 bg-[var(--surface-2)] rounded" />
            </div>
            <div className="h-7 w-40 bg-[var(--surface-2)] rounded-md" />
          </div>
          <div className="flex-1 bg-[var(--surface-2)] rounded-lg w-full h-full opacity-60" />
        </div>

        {/* AI Insights skeleton */}
        <div className="card p-5 h-[300px] flex flex-col" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="h-4 w-28 bg-[var(--surface-3)] rounded mb-1.5" />
          <div className="h-3 w-36 bg-[var(--surface-2)] rounded mb-4" />
          <div className="space-y-2 flex-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-[var(--surface-2)] w-full opacity-70" />
            ))}
          </div>
        </div>
      </div>

      {/* ── Health + Alerts skeleton ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5 h-[240px] flex flex-col" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="h-4 w-36 bg-[var(--surface-3)] rounded mb-1.5" />
          <div className="h-3 w-40 bg-[var(--surface-2)] rounded mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-[var(--surface-2)] w-full" />
            ))}
          </div>
        </div>

        <div className="card p-5 h-[240px] flex flex-col" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="h-4 w-28 bg-[var(--surface-3)] rounded mb-1.5" />
          <div className="h-3 w-32 bg-[var(--surface-2)] rounded mb-4" />
          <div className="space-y-2 flex-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-[var(--surface-2)] w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
