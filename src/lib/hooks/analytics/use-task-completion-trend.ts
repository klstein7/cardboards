import { useQuery } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useTaskCompletionTrend(
  projectId: string,
  startDate?: Date,
  endDate?: Date,
) {
  return useQuery({
    queryKey: ["analytics", "trend", projectId, { startDate, endDate }],
    queryFn: () =>
      api.analytics.getTaskCompletionTrend(projectId, startDate, endDate),
  });
}
