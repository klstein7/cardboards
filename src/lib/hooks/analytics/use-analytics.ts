import { useQuery } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useAnalytics(
  projectId: string,
  startDate?: Date,
  endDate?: Date,
) {
  const progressQuery = useQuery({
    queryKey: ["analytics", "progress", projectId, { startDate, endDate }],
    queryFn: () =>
      api.analytics.getProjectProgress(projectId, startDate, endDate),
  });

  const trendQuery = useQuery({
    queryKey: ["analytics", "trend", projectId, { startDate, endDate }],
    queryFn: () =>
      api.analytics.getTaskCompletionTrend(projectId, startDate, endDate),
  });

  const activityQuery = useQuery({
    queryKey: ["analytics", "activity", projectId, { startDate, endDate }],
    queryFn: () => api.analytics.getUserActivity(projectId, startDate, endDate),
  });

  const prioritiesQuery = useQuery({
    queryKey: ["analytics", "priorities", projectId, { startDate, endDate }],
    queryFn: () =>
      api.analytics.getPriorityDistribution(projectId, startDate, endDate),
  });

  const dueDatesQuery = useQuery({
    queryKey: ["analytics", "dueDates", projectId, { startDate, endDate }],
    queryFn: () =>
      api.analytics.getTasksPerDueDate(projectId, startDate, endDate),
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
