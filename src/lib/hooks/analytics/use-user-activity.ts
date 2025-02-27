import { useQuery } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useUserActivity(
  projectId: string,
  startDate?: Date,
  endDate?: Date,
) {
  return useQuery({
    queryKey: ["analytics", "activity", projectId, { startDate, endDate }],
    queryFn: () => api.analytics.getUserActivity(projectId, startDate, endDate),
  });
}
