import { subDays } from "date-fns";

import { HydrateClient, trpc } from "~/trpc/server";

import { AnalyticsContent } from "../_components/analytics-content";
import { AnalyticsHeader } from "../_components/analytics-header";
import { AnalyticsToolbar } from "../_components/analytics-toolbar";
import { AnalyticsStoreProvider } from "../_store";

type Params = Promise<{ projectId: string }>;

export default async function AnalyticsPage({ params }: { params: Params }) {
  const { projectId } = await params;

  // Default date range (30 days)
  const endDate = new Date();
  const startDate = subDays(endDate, 30);

  // Prefetch project data
  await trpc.project.get.prefetch(projectId);

  // Prefetch all analytics data with date range
  await Promise.all([
    trpc.analytics.getProjectProgress.prefetch({
      projectId,
      startDate,
      endDate,
    }),
    trpc.analytics.getTaskCompletionTrend.prefetch({
      projectId,
      startDate,
      endDate,
    }),
    trpc.analytics.getUserActivity.prefetch({
      projectId,
      startDate,
      endDate,
    }),
    trpc.analytics.getPriorityDistribution.prefetch({
      projectId,
      startDate,
      endDate,
    }),
    trpc.analytics.getTasksPerDueDate.prefetch({
      projectId,
      startDate,
      endDate,
    }),
  ]);

  // Get project data for rendering the header
  const project = await trpc.project.get(projectId);

  return (
    <AnalyticsStoreProvider
      initialStartDate={startDate}
      initialEndDate={endDate}
    >
      <HydrateClient>
        <div className="flex h-[100dvh] w-full flex-col">
          <AnalyticsHeader projectId={projectId} projectName={project.name} />

          <div className="flex w-full border-b border-t px-4 py-3 sm:px-6 lg:px-8">
            <AnalyticsToolbar projectId={projectId} />
          </div>

          <main className="flex-1 overflow-auto px-4 pb-6 sm:px-6 lg:px-8">
            <AnalyticsContent projectId={projectId} />
          </main>
        </div>
      </HydrateClient>
    </AnalyticsStoreProvider>
  );
}
