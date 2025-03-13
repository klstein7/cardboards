"use client";

import { ChartGridSkeleton, TrendChartSkeleton } from "../_components";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      {/* Main trend chart */}
      <TrendChartSkeleton />

      {/* Chart grid */}
      <ChartGridSkeleton />
    </div>
  );
}
