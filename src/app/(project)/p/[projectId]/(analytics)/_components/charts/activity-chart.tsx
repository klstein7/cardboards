import { BarChartIcon } from "lucide-react";
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

import { SectionHeader } from "~/components/shared/section-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { type ChartConfig } from "~/components/ui/chart";

interface ActivityChartProps {
  data: Array<{ name: string; value: number }>;
  chartConfig: ChartConfig;
}

export function ActivityChart({ data, chartConfig }: ActivityChartProps) {
  return (
    <Card>
      <SectionHeader title="User Activity" icon={BarChartIcon} />
      <CardContent className="h-[600px] p-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 100, right: 80, top: 20, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis type="number" axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
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
            <Bar
              dataKey="value"
              fill={chartConfig.activity?.theme?.light ?? ""}
              radius={[0, 4, 4, 0]}
              barSize={24}
              name="Tasks Completed"
              background={{ fill: "rgba(0,0,0,0.05)" }}
              label={{
                position: "right",
                formatter: (value: number) => value,
                fill: "hsl(var(--foreground))",
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
