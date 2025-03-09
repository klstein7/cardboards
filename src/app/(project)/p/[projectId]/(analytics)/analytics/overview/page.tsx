"use client";

import { use, useMemo } from "react";

import { DueDateChart } from "~/app/(project)/p/[projectId]/(analytics)/_components/charts/due-date-chart";
import { PriorityChart } from "~/app/(project)/p/[projectId]/(analytics)/_components/charts/priority-chart";
import { TrendChart } from "~/app/(project)/p/[projectId]/(analytics)/_components/charts/trend-chart";
import { useAnalyticsStore } from "~/app/(project)/p/[projectId]/(analytics)/_store";
import { type ChartConfig } from "~/components/ui/chart";
import { TabsContent } from "~/components/ui/tabs";
import { useAnalytics } from "~/lib/hooks/analytics";

type Params = Promise<{ projectId: string }>;

export default function AnalyticsOverviewPage({ params }: { params: Params }) {
  const { projectId } = use(params);
  const { startDate, endDate } = useAnalyticsStore();

  const { trend, priorities, dueDates, isPending, isError } = useAnalytics(
    projectId,
    startDate,
    endDate,
  );

  const trendData = useMemo(() => trend.data ?? [], [trend.data]);
  const prioritiesData = useMemo(
    () => priorities.data ?? [],
    [priorities.data],
  );
  const dueDatesData = useMemo(() => dueDates.data ?? [], [dueDates.data]);

  const prioritiesDataEnhanced = useMemo(
    () => [
      { name: "Priority: Low", value: prioritiesData[0]?.value ?? 0 },
      { name: "Priority: Medium", value: prioritiesData[1]?.value ?? 0 },
      { name: "Priority: High", value: prioritiesData[2]?.value ?? 0 },
      { name: "Priority: Urgent", value: prioritiesData[3]?.value ?? 0 },
      { name: "Priority: None", value: prioritiesData[4]?.value ?? 0 },
    ],
    [prioritiesData],
  );

  const dueDatesDataEnhanced = useMemo(
    () => [
      { name: "Due: Overdue", value: dueDatesData[0]?.value ?? 0 },
      { name: "Due: Today", value: dueDatesData[1]?.value ?? 0 },
      { name: "Due: This Week", value: dueDatesData[2]?.value ?? 0 },
      { name: "Due: Later", value: dueDatesData[3]?.value ?? 0 },
      { name: "Due: None", value: dueDatesData[4]?.value ?? 0 },
    ],
    [dueDatesData],
  );

  const chartConfig: ChartConfig = {
    progress: {
      label: "Progress",
      theme: {
        light: "hsl(var(--chart-blue))",
        dark: "hsl(var(--chart-blue))",
      },
    },
    trend: {
      label: "Tasks Completed",
      theme: {
        light: "hsl(var(--chart-green))",
        dark: "hsl(var(--chart-green))",
      },
    },
    activity: {
      label: "Activity",
      theme: {
        light: "hsl(var(--chart-purple))",
        dark: "hsl(var(--chart-purple))",
      },
    },
    "Priority: Low": {
      label: "Low",
      theme: {
        light: "hsl(var(--priority-low))",
        dark: "hsl(var(--priority-low))",
      },
    },
    "Priority: Medium": {
      label: "Medium",
      theme: {
        light: "hsl(var(--priority-medium))",
        dark: "hsl(var(--priority-medium))",
      },
    },
    "Priority: High": {
      label: "High",
      theme: {
        light: "hsl(var(--priority-high))",
        dark: "hsl(var(--priority-high))",
      },
    },
    "Priority: Urgent": {
      label: "Urgent",
      theme: {
        light: "hsl(var(--priority-urgent))",
        dark: "hsl(var(--priority-urgent))",
      },
    },
    "Priority: None": {
      label: "None",
      theme: {
        light: "hsl(var(--priority-none))",
        dark: "hsl(var(--priority-none))",
      },
    },
    "Due: Overdue": {
      label: "Overdue",
      theme: {
        light: "hsl(var(--due-overdue))",
        dark: "hsl(var(--due-overdue))",
      },
    },
    "Due: Today": {
      label: "Today",
      theme: {
        light: "hsl(var(--due-today))",
        dark: "hsl(var(--due-today))",
      },
    },
    "Due: This Week": {
      label: "This Week",
      theme: {
        light: "hsl(var(--due-week))",
        dark: "hsl(var(--due-week))",
      },
    },
    "Due: Later": {
      label: "Later",
      theme: {
        light: "hsl(var(--due-later))",
        dark: "hsl(var(--due-later))",
      },
    },
    "Due: None": {
      label: "None",
      theme: {
        light: "hsl(var(--due-none))",
        dark: "hsl(var(--due-none))",
      },
    },
  };

  return (
    <TabsContent value="overview" className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <TrendChart data={trendData} chartConfig={chartConfig} />

        <div className="grid gap-6 md:grid-cols-2">
          <DueDateChart data={dueDatesDataEnhanced} chartConfig={chartConfig} />

          <PriorityChart
            data={prioritiesDataEnhanced}
            chartConfig={chartConfig}
          />
        </div>
      </div>
    </TabsContent>
  );
}
