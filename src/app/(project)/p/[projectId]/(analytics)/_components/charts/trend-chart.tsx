import { TrendingUpIcon } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { SectionHeader } from "~/components/shared/section-header";
import { Card, CardContent } from "~/components/ui/card";
import { type ChartConfig } from "~/components/ui/chart";

interface TrendChartProps {
  data: Array<{ name: string; value: number }>;
  chartConfig: ChartConfig;
}

export function TrendChart({ data, chartConfig }: TrendChartProps) {
  return (
    <Card>
      <SectionHeader title="Task Completion Trend" icon={TrendingUpIcon} />
      <CardContent className="h-[400px] p-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
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
            <Line
              type="monotone"
              dataKey="value"
              stroke={chartConfig.trend?.theme?.light ?? ""}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Tasks Completed"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
