"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { type AnalyticsData } from "~/app/(project)/_types";
import { ChartContainer } from "~/components/ui/chart";

export function TaskCompletionTrendChart({
  config,
  series,
}: {
  config: AnalyticsData["config"];
  series: AnalyticsData["series"];
}) {
  return (
    <ChartContainer config={config}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={series[0]?.data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke={`hsl(var(--chart-2))`}
            strokeWidth={2}
            dot={{ fill: `hsl(var(--chart-2))`, strokeWidth: 2 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
