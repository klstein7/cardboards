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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { type ChartConfig } from "~/components/ui/chart";

interface TrendChartProps {
  data: Array<{ name: string; value: number }>;
  chartConfig: ChartConfig;
}

export function TrendChart({ data, chartConfig }: TrendChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Task Completion Trend</CardTitle>
        <CardDescription>Tasks completed over the time period</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
          >
            <defs>
              <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.trend?.theme?.light ?? ""}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.trend?.theme?.light ?? ""}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={60}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={40}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--popover-foreground))",
              }}
              formatter={(value) => [value, "Tasks Completed"]}
            />
            <Legend verticalAlign="top" height={36} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartConfig.trend?.theme?.light ?? ""}
              fillOpacity={1}
              fill="url(#colorTrend)"
              name="Tasks Completed"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
