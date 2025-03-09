"use client";

import { use, useMemo } from "react";

import { ProgressChart } from "~/app/(project)/p/[projectId]/(analytics)/_components/charts/progress-chart";
import { useAnalyticsStore } from "~/app/(project)/p/[projectId]/(analytics)/_store";
import { type ChartConfig } from "~/components/ui/chart";
import { TabsContent } from "~/components/ui/tabs";
import { useAnalytics } from "~/lib/hooks/analytics";

type Params = Promise<{ projectId: string }>;

export default function AnalyticsProgressPage({ params }: { params: Params }) {
  const { projectId } = use(params);
  const { startDate, endDate } = useAnalyticsStore();

  const { progress, isPending, isError } = useAnalytics(
    projectId,
    startDate,
    endDate,
  );

  const progressData = useMemo(() => progress.data ?? [], [progress.data]);

  const chartConfig: ChartConfig = {
    progress: {
      label: "Progress",
      theme: {
        light: "hsl(var(--chart-blue))",
        dark: "hsl(var(--chart-blue))",
      },
    },
  };

  // Since we're using Next.js loading states with loading.tsx,
  // we can simplify this component to just render the chart
  return (
    <TabsContent value="progress" className="space-y-6">
      <ProgressChart data={progressData} chartConfig={chartConfig} />
    </TabsContent>
  );
}
