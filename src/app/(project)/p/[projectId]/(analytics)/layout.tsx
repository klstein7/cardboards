import { subDays } from "date-fns";

import { HydrateClient, trpc } from "~/trpc/server";

import { AnalyticsHeader } from "./_components/analytics-header";
import { AnalyticsTabs } from "./_components/analytics-tabs";
import { AnalyticsToolbar } from "./_components/analytics-toolbar";
import { SummaryStats } from "./_components/charts/summary-stats";
import { AnalyticsStoreProvider } from "./_store";

type Params = Promise<{ projectId: string }>;

interface AnalyticsLayoutProps {
  children: React.ReactNode;
  params: Params;
}

export default async function AnalyticsLayout({
  children,
  params,
}: AnalyticsLayoutProps) {
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
            <div className="py-4">
              <SummaryStats projectId={projectId} />
            </div>

            <div className="mt-6">
              <AnalyticsTabs projectId={projectId}>{children}</AnalyticsTabs>
            </div>
          </main>
        </div>
      </HydrateClient>
    </AnalyticsStoreProvider>
  );
}
