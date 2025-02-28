import {
  Bar,
  BarChart,
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

interface ProgressChartProps {
  data: Array<{ name: string; value: number }>;
  chartConfig: ChartConfig;
}

export function ProgressChart({ data, chartConfig }: ProgressChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Completion Progress by Board</CardTitle>
        <CardDescription>Percent of tasks completed per board</CardDescription>
      </CardHeader>
      <CardContent className="h-[600px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 120, right: 30, top: 20, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number) => [`${value}%`, "Completion"]}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--popover-foreground))",
              }}
            />
            <Legend />
            <Bar
              dataKey="value"
              fill={chartConfig.progress?.theme?.light ?? ""}
              radius={[0, 4, 4, 0]}
              barSize={24}
              name="Completion Rate"
              background={{ fill: "rgba(0,0,0,0.05)" }}
              label={{
                position: "right",
                formatter: (value: number) => `${value}%`,
                fill: "hsl(var(--foreground))",
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
