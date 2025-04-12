import { subDays } from "date-fns";
import { type Metadata } from "next";

import { HydrateClient, trpc } from "~/trpc/server";

import { AnalyticsTabs } from "./_components/analytics-tabs";
import { AnalyticsToolbar } from "./_components/analytics-toolbar";
import { SummaryStats } from "./_components/charts/summary-stats";
import { ScrollReset } from "./_components/scroll-reset";
import { AnalyticsStoreProvider } from "./_store";

type Params = Promise<{ projectId: string }>;

export const metadata: Metadata = {
  title: "Analytics | cardboards",
  description: "View project analytics and performance metrics",
};

interface AnalyticsLayoutProps {
  children: React.ReactNode;
  params: Params;
}

export default async function AnalyticsLayout({
  children,
  params,
}: AnalyticsLayoutProps) {
  const { projectId } = await params;

  const endDate = new Date();
  const startDate = subDays(endDate, 30);

  await trpc.project.get.prefetch(projectId);

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

  return (
    <AnalyticsStoreProvider
      initialStartDate={startDate}
      initialEndDate={endDate}
    >
      <HydrateClient>
        <ScrollReset />
        <div className="flex h-full w-full flex-col overflow-hidden">
          <div className="flex w-full shrink-0 border-b border-t px-4 py-3 sm:px-6 lg:px-8">
            <AnalyticsToolbar projectId={projectId} className="max-w-7xl" />
          </div>

          <main className="flex-1 overflow-auto px-4 pb-6 sm:px-6 lg:px-8">
            <div className="py-4">
              <SummaryStats projectId={projectId} className="max-w-7xl" />
            </div>

            <div className="mt-6">
              <AnalyticsTabs projectId={projectId} className="max-w-7xl">
                {children}
              </AnalyticsTabs>
            </div>
          </main>
        </div>
      </HydrateClient>
    </AnalyticsStoreProvider>
  );
}
