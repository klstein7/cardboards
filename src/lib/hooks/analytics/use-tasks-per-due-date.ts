import { useQuery } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useTasksPerDueDate(
  projectId: string,
  startDate?: Date,
  endDate?: Date,
) {
  return useQuery({
    queryKey: ["analytics", "dueDates", projectId, { startDate, endDate }],
    queryFn: () =>
      api.analytics.getTasksPerDueDate(projectId, startDate, endDate),
  });
}
