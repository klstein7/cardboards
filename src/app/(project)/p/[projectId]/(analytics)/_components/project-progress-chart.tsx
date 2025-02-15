"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { type AnalyticsData } from "~/app/(project)/_types";
import { ChartContainer } from "~/components/ui/chart";

export function ProjectProgressChart({
  config,
  series,
}: {
  config: AnalyticsData["config"];
  series: AnalyticsData["series"];
}) {
  return (
    <ChartContainer config={config}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={series[0]?.data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={`hsl(var(--chart-1))`}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={`hsl(var(--chart-1))`}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis unit="%" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            stroke={`hsl(var(--chart-1))`}
            fillOpacity={1}
            fill="url(#progressGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
