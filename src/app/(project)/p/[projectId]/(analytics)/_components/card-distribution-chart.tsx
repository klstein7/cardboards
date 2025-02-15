"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { type AnalyticsData } from "~/app/(project)/_types";
import { ChartContainer } from "~/components/ui/chart";

export function CardDistributionChart({
  config,
  series,
}: {
  config: AnalyticsData["config"];
  series: AnalyticsData["series"];
}) {
  return (
    <ChartContainer config={config}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={series[0]?.data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={(entry: { name: string; value: number }) => entry.name}
            labelLine={true}
          >
            {series[0]?.data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`hsl(var(--chart-${(index % 5) + 1}))`}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
