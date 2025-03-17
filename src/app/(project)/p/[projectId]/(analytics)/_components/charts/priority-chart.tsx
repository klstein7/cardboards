import { FlagIcon } from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { SectionHeader } from "~/components/shared/section-header";
import { Card, CardContent } from "~/components/ui/card";
import { type ChartConfig } from "~/components/ui/chart";

interface PriorityChartProps {
  data: Array<{ name: string; value: number }>;
  chartConfig: ChartConfig;
}

export function PriorityChart({ data, chartConfig }: PriorityChartProps) {
  return (
    <Card>
      <SectionHeader title="Priority Distribution" icon={FlagIcon} />
      <CardContent className="h-[400px] p-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) =>
                percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ""
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartConfig[entry.name]?.theme?.light ?? "#8884d8"}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--popover-foreground))",
              }}
              formatter={(value: number, name: string) => [
                value,
                chartConfig[name]?.label ?? name,
              ]}
            />
            <Legend
              formatter={(value: string) => chartConfig[value]?.label ?? value}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
