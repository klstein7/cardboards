"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { type AnalyticsData } from "~/app/(project)/_types";
import { ChartContainer } from "~/components/ui/chart";

export function UserActivityChart({
  config,
  series,
}: {
  config: AnalyticsData["config"];
  series: AnalyticsData["series"];
}) {
  return (
    <ChartContainer config={config}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={series[0]?.data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={100} />
          <Tooltip />
          <Bar
            dataKey="value"
            fill={`hsl(var(--chart-1))`}
            radius={[0, 4, 4, 0]}
            barSize={20}
          >
            {series[0]?.data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`hsl(var(--chart-${(index % 5) + 1}))`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
