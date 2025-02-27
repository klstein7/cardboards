import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { subDays } from "date-fns";

import { api } from "~/server/api";

import { AnalyticsContent } from "../_components/analytics-content";
import { AnalyticsHeader } from "../_components/analytics-header";
import { AnalyticsToolbar } from "../_components/analytics-toolbar";
import { AnalyticsStoreProvider } from "../_store";

type Params = Promise<{ projectId: string }>;

export default async function AnalyticsPage({ params }: { params: Params }) {
  const queryClient = new QueryClient();

  const { projectId } = await params;
  const project = await api.project.get(projectId);

  // Default date range (30 days)
  const endDate = new Date();
  const startDate = subDays(endDate, 30);

  // Fetch all the analytics data with date range
  const progressData = await api.analytics.getProjectProgress(
    projectId,
    startDate,
    endDate,
  );
  const trendData = await api.analytics.getTaskCompletionTrend(
    projectId,
    startDate,
    endDate,
  );
  const activityData = await api.analytics.getUserActivity(
    projectId,
    startDate,
    endDate,
  );
  const prioritiesData = await api.analytics.getPriorityDistribution(
    projectId,
    startDate,
    endDate,
  );
  const dueDatesData = await api.analytics.getTasksPerDueDate(
    projectId,
    startDate,
    endDate,
  );

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["project", projectId],
      queryFn: () => Promise.resolve(project),
    }),
    queryClient.prefetchQuery({
      queryKey: ["analytics", "progress", projectId, { startDate, endDate }],
      queryFn: () => Promise.resolve(progressData),
    }),
    queryClient.prefetchQuery({
      queryKey: ["analytics", "trend", projectId, { startDate, endDate }],
      queryFn: () => Promise.resolve(trendData),
    }),
    queryClient.prefetchQuery({
      queryKey: ["analytics", "activity", projectId, { startDate, endDate }],
      queryFn: () => Promise.resolve(activityData),
    }),
    queryClient.prefetchQuery({
      queryKey: ["analytics", "priorities", projectId, { startDate, endDate }],
      queryFn: () => Promise.resolve(prioritiesData),
    }),
    queryClient.prefetchQuery({
      queryKey: ["analytics", "dueDates", projectId, { startDate, endDate }],
      queryFn: () => Promise.resolve(dueDatesData),
    }),
  ]);

  return (
    <AnalyticsStoreProvider
      initialStartDate={startDate}
      initialEndDate={endDate}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="flex h-[100dvh] w-full flex-col">
          <AnalyticsHeader projectId={projectId} projectName={project.name} />

          <div className="flex w-full border-b border-t px-4 py-3 sm:px-6 lg:px-8">
            <AnalyticsToolbar projectId={projectId} />
          </div>

          <main className="flex-1 overflow-auto px-4 pb-6 sm:px-6 lg:px-8">
            <AnalyticsContent projectId={projectId} />
          </main>
        </div>
      </HydrationBoundary>
    </AnalyticsStoreProvider>
  );
}
