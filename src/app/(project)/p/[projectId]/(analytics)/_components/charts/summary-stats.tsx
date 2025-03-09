"use client";

import {
  ArrowUpIcon,
  CheckCircleIcon,
  ListTodoIcon,
  UsersIcon,
} from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";
import { useAnalytics } from "~/lib/hooks/analytics";
import { cn } from "~/lib/utils";

import { useAnalyticsStore } from "../../_store/analytics-store";

interface SummaryStatsProps {
  projectId: string;
}

export function SummaryStats({ projectId }: SummaryStatsProps) {
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

  if (isPending) {
    return (
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse bg-card/50">
            <CardContent className="h-24 p-6"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mb-6 text-sm text-destructive">
        Error loading summary stats
      </div>
    );
  }

  const totalTasks =
    priorities.data?.reduce((acc, item) => acc + item.value, 0) ?? 0;
  const activeUsers = activity.data?.length ?? 0;
  const totalBoards = progress.data?.length ?? 0;
  const completionRate = progress.data?.length
    ? Math.round(
        progress.data.reduce((acc, item) => acc + item.value, 0) /
          progress.data.length,
      )
    : 0;

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        icon={<ListTodoIcon className="h-5 w-5 text-primary" />}
        label="Total Tasks"
        value={totalTasks}
      />

      <StatCard
        icon={<CheckCircleIcon className="h-5 w-5 text-green-500" />}
        label="Completion Rate"
        value={`${completionRate}%`}
        highlight={completionRate > 75}
      />

      <StatCard
        icon={<UsersIcon className="h-5 w-5 text-blue-500" />}
        label="Active Users"
        value={activeUsers}
      />

      <StatCard
        icon={<ArrowUpIcon className="h-5 w-5 text-purple-500" />}
        label="Boards"
        value={totalBoards}
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  highlight?: boolean;
}

function StatCard({ icon, label, value, highlight = false }: StatCardProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md">
      <CardContent className="flex p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50">
          {icon}
        </div>
        <div className="ml-4 flex flex-col justify-center">
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
          <span
            className={cn(
              "mt-0.5 text-2xl font-bold",
              highlight && "text-green-500",
            )}
          >
            {value}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
