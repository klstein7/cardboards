import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/server/api";

import { ProjectProgressChart } from "../_components/project-progress-chart";
import { TaskCompletionTrendChart } from "../_components/task-completion-trend-chart";
import { UserActivityChart } from "../_components/user-activity-chart";

export default async function AnalyticsPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = params;
  const project = await api.project.get(projectId);
  const progress = await api.analytics.getProjectProgress(projectId);
  const trend = await api.analytics.getTaskCompletionTrend(projectId);
  const activity = await api.analytics.getUserActivity(projectId);

  return (
    <div className="flex h-[100dvh] w-full">
      <div className="flex w-full max-w-7xl flex-col gap-6 px-6 pt-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/p/${projectId}`}>
              {project.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Analytics</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
        <h1 className="text-2xl font-bold">Analytics</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Project Progress</CardTitle>
              <CardDescription>Current progress of the project</CardDescription>
            </CardHeader>
            <ProjectProgressChart
              config={progress.config}
              series={progress.series}
            />
          </Card>

          <Card>
            <CardHeader className="text-center">
              <CardTitle>Task Completion Trend</CardTitle>
              <CardDescription>Tasks completed per week</CardDescription>
            </CardHeader>
            <TaskCompletionTrendChart
              config={trend.config}
              series={trend.series}
            />
          </Card>

          <Card>
            <CardHeader className="text-center">
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Cards assigned per user</CardDescription>
            </CardHeader>
            <UserActivityChart
              config={activity.config}
              series={activity.series}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
