import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function PlacementReports() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
              Placement Reports
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Deep-dive analytics & exportable insights (coming soon).
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {["Yearly Trend", "Department Heatmap", "Package Segmentation"].map(
              (t) => (
                <div
                  key={t}
                  className="relative group rounded-2xl border border-gray-600/40 bg-gray-800/50 backdrop-blur-xl p-5 h-48 flex flex-col justify-between shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-300 mb-2">
                    {t}
                  </h2>
                  <p className="text-[11px] text-gray-400 leading-snug">
                    Visualization placeholder. Integrate charts similar to dashboard
                    components.
                  </p>
                  <span className="mt-2 text-[10px] px-2 py-1 rounded bg-indigo-600/30 border border-indigo-400/20 w-max">
                    Planned
                  </span>
                </div>
              )
            )}
          </div>
          <div className="rounded-2xl border border-gray-600/40 bg-gray-900/50 backdrop-blur-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-3">Overview</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              This section will consolidate multi-year placement performance,
              comparative analytics by cohort, and success distributions. Future
              enhancements include drill-down exploration, cohort filters,
              interactive benchmarks, and exportable infographic snapshots.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}