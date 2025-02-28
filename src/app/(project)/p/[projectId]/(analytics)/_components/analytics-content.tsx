"use client";

import { useMemo, useState } from "react";
import React from "react";

import { type ChartConfig } from "~/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useAnalytics } from "~/lib/hooks/analytics";

import { useAnalyticsStore } from "../_store/analytics-store";
import { ActivityChart } from "./charts/activity-chart";
import { DueDateChart } from "./charts/due-date-chart";
import { PriorityChart } from "./charts/priority-chart";
import { ProgressChart } from "./charts/progress-chart";
import { SummaryStats } from "./charts/summary-stats";
import { TrendChart } from "./charts/trend-chart";

interface AnalyticsContentProps {
  projectId: string;
}

export function AnalyticsContent({ projectId }: AnalyticsContentProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { startDate, endDate } = useAnalyticsStore();

  const {
    progress,
    trend,
    activity,
    priorities,
    dueDates,
    isPending,
    isError,
  } = useAnalytics(projectId, startDate, endDate);

  const progressData = useMemo(() => progress.data ?? [], [progress.data]);
  const trendData = useMemo(() => trend.data ?? [], [trend.data]);
  const activityData = useMemo(() => activity.data ?? [], [activity.data]);
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

  if (isPending) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Error loading analytics data</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const totalTasks = prioritiesData.reduce((acc, item) => acc + item.value, 0);
  const activeUsers = activityData.length;
  const totalBoards = progressData.length;
  const completionRate = progressData.length
    ? Math.round(
        progressData.reduce((acc, item) => acc + item.value, 0) /
          progressData.length,
      )
    : 0;

  return (
    <div className="py-4">
      <SummaryStats
        totalTasks={totalTasks}
        completionRate={completionRate}
        activeUsers={activeUsers}
        totalBoards={totalBoards}
      />

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <TabsList className="bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <TrendChart data={trendData} chartConfig={chartConfig} />

            <div className="grid gap-6 md:grid-cols-2">
              <DueDateChart
                data={dueDatesDataEnhanced}
                chartConfig={chartConfig}
              />

              <PriorityChart
                data={prioritiesDataEnhanced}
                chartConfig={chartConfig}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <ProgressChart data={progressData} chartConfig={chartConfig} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-1">
            <ActivityChart data={activityData} chartConfig={chartConfig} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
