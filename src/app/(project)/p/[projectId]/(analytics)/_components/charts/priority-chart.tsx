import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { type ChartConfig } from "~/components/ui/chart";

interface PriorityChartProps {
  data: Array<{ name: string; value: number }>;
  chartConfig: ChartConfig;
}

export function PriorityChart({ data, chartConfig }: PriorityChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Priority Distribution</CardTitle>
        <CardDescription>Tasks by priority level</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={140}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              startAngle={0}
              endAngle={360}
              label={({
                name,
                value,
                percent,
              }: {
                name: string;
                value: number;
                percent: number;
              }) =>
                percent > 0.05
                  ? `${value} (${(percent * 100).toFixed(0)}%)`
                  : ""
              }
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={chartConfig[entry.name]?.theme?.light ?? "#ccc"}
                />
              ))}
            </Pie>
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              formatter={(value: string) => value.replace("Priority: ", "")}
            />
            <Tooltip
              formatter={(value: string, name: string) => [
                value,
                name.replace("Priority: ", ""),
              ]}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--popover-foreground))",
              }}
              itemStyle={{
                color: "hsl(var(--popover-foreground))",
              }}
              labelStyle={{
                color: "hsl(var(--popover-foreground))",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
