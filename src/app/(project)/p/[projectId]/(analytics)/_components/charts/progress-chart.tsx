import { LineChartIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { SectionHeader } from "~/components/shared/section-header";
import { Card, CardContent } from "~/components/ui/card";
import { type ChartConfig } from "~/components/ui/chart";

interface ProgressChartProps {
  data: Array<{ name: string; value: number }>;
  chartConfig: ChartConfig;
}

export function ProgressChart({ data, chartConfig }: ProgressChartProps) {
  return (
    <Card>
      <SectionHeader title="Project Progress" icon={LineChartIcon} />
      <CardContent className="h-[400px] p-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.progress?.theme?.light ?? ""}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.progress?.theme?.light ?? ""}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
            />
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--popover-foreground))",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartConfig.progress?.theme?.light ?? ""}
              fillOpacity={1}
              fill="url(#colorProgress)"
              name="Completion %"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
