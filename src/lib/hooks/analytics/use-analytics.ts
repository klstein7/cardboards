import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useAnalytics(
  projectId: string,
  startDate?: Date,
  endDate?: Date,
) {
  const trpc = useTRPC();

  const progressQuery = useQuery({
    ...trpc.analytics.getProjectProgress.queryOptions({
      projectId,
      startDate,
      endDate,
    }),
  });

  const trendQuery = useQuery({
    ...trpc.analytics.getTaskCompletionTrend.queryOptions({
      projectId,
      startDate,
      endDate,
    }),
  });

  const activityQuery = useQuery({
    ...trpc.analytics.getUserActivity.queryOptions({
      projectId,
      startDate,
      endDate,
    }),
  });

  const prioritiesQuery = useQuery({
    ...trpc.analytics.getPriorityDistribution.queryOptions({
      projectId,
      startDate,
      endDate,
    }),
  });

  const dueDatesQuery = useQuery({
    ...trpc.analytics.getTasksPerDueDate.queryOptions({
      projectId,
      startDate,
      endDate,
    }),
  });

  const isPending =
    progressQuery.isPending ||
    trendQuery.isPending ||
    activityQuery.isPending ||
    prioritiesQuery.isPending ||
    dueDatesQuery.isPending;

  const isFetching =
    progressQuery.isFetching ||
    trendQuery.isFetching ||
    activityQuery.isFetching ||
    prioritiesQuery.isFetching ||
    dueDatesQuery.isFetching;

  return {
    progress: progressQuery,
    trend: trendQuery,
    activity: activityQuery,
    priorities: prioritiesQuery,
    dueDates: dueDatesQuery,
    isPending,
    isFetching,
    isError:
      progressQuery.isError ||
      trendQuery.isError ||
      activityQuery.isError ||
      prioritiesQuery.isError ||
      dueDatesQuery.isError,
    error:
      progressQuery.error ??
      trendQuery.error ??
      activityQuery.error ??
      prioritiesQuery.error ??
      dueDatesQuery.error,
    refetch: () => {
      void progressQuery.refetch();
      void trendQuery.refetch();
      void activityQuery.refetch();
      void prioritiesQuery.refetch();
      void dueDatesQuery.refetch();
    },
  };
}
