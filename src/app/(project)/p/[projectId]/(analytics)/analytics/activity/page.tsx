"use client";

import { use, useMemo } from "react";

import { ActivityChart } from "~/app/(project)/p/[projectId]/(analytics)/_components/charts/activity-chart";
import { useAnalyticsStore } from "~/app/(project)/p/[projectId]/(analytics)/_store";
import { type ChartConfig } from "~/components/ui/chart";
import { TabsContent } from "~/components/ui/tabs";
import { useAnalytics } from "~/lib/hooks/analytics";

type Params = Promise<{ projectId: string }>;

export default function AnalyticsActivityPage({ params }: { params: Params }) {
  const { projectId } = use(params);
  const { startDate, endDate } = useAnalyticsStore();

  const { activity } = useAnalytics(projectId, startDate, endDate);

  const activityData = useMemo(() => activity.data ?? [], [activity.data]);

  const chartConfig: ChartConfig = {
    activity: {
      label: "Activity",
      theme: {
        light: "hsl(var(--chart-purple))",
        dark: "hsl(var(--chart-purple))",
      },
    },
  };

  // Since we're now using Next.js loading states with loading.tsx,
  // we can simplify this component to just render the chart
  return (
    <TabsContent value="activity" className="space-y-6">
      <div className="grid gap-6 md:grid-cols-1">
        <ActivityChart data={activityData} chartConfig={chartConfig} />
      </div>
    </TabsContent>
  );
}
