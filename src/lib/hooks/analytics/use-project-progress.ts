import { useQuery } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useProjectProgress(
  projectId: string,
  startDate?: Date,
  endDate?: Date,
) {
  return useQuery({
    queryKey: ["analytics", "progress", projectId, { startDate, endDate }],
    queryFn: () =>
      api.analytics.getProjectProgress(projectId, startDate, endDate),
  });
}
