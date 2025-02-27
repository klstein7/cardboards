"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useAnalytics } from "~/lib/hooks/analytics";

import { useAnalyticsStore } from "../_store/analytics-store";

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

  // Chart colors
  const COLORS = {
    progress: "hsl(var(--chart-blue))",
    trend: "hsl(var(--chart-green))",
    activity: "hsl(var(--chart-purple))",
    priority: [
      "hsl(var(--priority-low))",
      "hsl(var(--priority-medium))",
      "hsl(var(--priority-high))",
      "hsl(var(--priority-urgent))",
      "hsl(var(--priority-none))",
    ],
    dueDate: [
      "hsl(var(--due-overdue))",
      "hsl(var(--due-today))",
      "hsl(var(--due-week))",
      "hsl(var(--due-later))",
      "hsl(var(--due-none))",
    ],
  };

  // Wait for data to load
  if (isPending) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Handle errors
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

  // Extract data from queries
  const progressData = progress.data ?? [];
  const trendData = trend.data ?? [];
  const activityData = activity.data ?? [];
  const prioritiesData = priorities.data ?? [];
  const dueDatesData = dueDates.data ?? [];

  // Calculate summary stats
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
      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="flex flex-col p-4">
            <span className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </span>
            <span className="mt-1 text-2xl font-bold">{totalTasks}</span>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="flex flex-col p-4">
            <span className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </span>
            <span className="mt-1 text-2xl font-bold">{completionRate}%</span>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="flex flex-col p-4">
            <span className="text-sm font-medium text-muted-foreground">
              Active Users
            </span>
            <span className="mt-1 text-2xl font-bold">{activeUsers}</span>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="flex flex-col p-4">
            <span className="text-sm font-medium text-muted-foreground">
              Boards
            </span>
            <span className="mt-1 text-2xl font-bold">{totalBoards}</span>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
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

        {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {/* Task Completion Trend - Larger Card */}
            <Card className="xl:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Task Completion Trend</CardTitle>
                <CardDescription>
                  Tasks completed over the time period
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorTrend"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={COLORS.trend}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={COLORS.trend}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        border: "none",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={COLORS.trend}
                      fillOpacity={1}
                      fill="url(#colorTrend)"
                      name="Tasks Completed"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Due Dates Pie Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Due Date Status</CardTitle>
                <CardDescription>Tasks by deadline status</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dueDatesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        percent > 0.05
                          ? `${name}: ${(percent * 100).toFixed(0)}%`
                          : ""
                      }
                      labelLine={{ stroke: "#ccc", strokeWidth: 0.5 }}
                    >
                      {dueDatesData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS.dueDate[index % COLORS.dueDate.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [value, "Tasks"]}
                      contentStyle={{
                        borderRadius: "8px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        border: "none",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconSize={10}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Priority Distribution</CardTitle>
                <CardDescription>Tasks by priority level</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prioritiesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        percent > 0.05
                          ? `${name}: ${(percent * 100).toFixed(0)}%`
                          : ""
                      }
                      labelLine={{ stroke: "#ccc", strokeWidth: 0.5 }}
                    >
                      {prioritiesData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS.priority[index % COLORS.priority.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [value, "Tasks"]}
                      contentStyle={{
                        borderRadius: "8px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        border: "none",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconSize={10}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Progress Tab Content */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Completion Progress by Board</CardTitle>
              <CardDescription>
                Percent of tasks completed per board
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={progressData}
                  layout="vertical"
                  margin={{ left: 120, right: 30, top: 20, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke="#f0f0f0"
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
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Completion"]}
                    contentStyle={{
                      borderRadius: "8px",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                      border: "none",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill={COLORS.progress}
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                    name="Completion"
                    background={{ fill: "#f9fafb" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab Content */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>User Activity</CardTitle>
                <CardDescription>
                  Detailed breakdown of user contributions
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activityData}
                    layout="vertical"
                    margin={{ left: 100, right: 30, top: 10, bottom: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={90}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        border: "none",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill={COLORS.activity}
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                      name="Cards Assigned"
                      background={{ fill: "#f9fafb" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Tasks by Priority</CardTitle>
                <CardDescription>Priority distribution</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prioritiesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={130}
                      dataKey="value"
                      nameKey="name"
                      paddingAngle={2}
                      label={({ name, percent }) =>
                        percent > 0.05
                          ? `${name}: ${(percent * 100).toFixed(0)}%`
                          : ""
                      }
                      labelLine={{ stroke: "#ccc", strokeWidth: 0.5 }}
                    >
                      {prioritiesData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS.priority[index % COLORS.priority.length]}
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [value, "Tasks"]}
                      contentStyle={{
                        borderRadius: "8px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        border: "none",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      layout="horizontal"
                      iconSize={10}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
