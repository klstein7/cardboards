import { useQuery } from "@tanstack/react-query";

import { api } from "~/server/api";

export function usePriorityDistribution(
  projectId: string,
  startDate?: Date,
  endDate?: Date,
) {
  return useQuery({
    queryKey: ["analytics", "priorities", projectId, { startDate, endDate }],
    queryFn: () =>
      api.analytics.getPriorityDistribution(projectId, startDate, endDate),
  });
}
