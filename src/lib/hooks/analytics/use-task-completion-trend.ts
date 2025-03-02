import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useTaskCompletionTrend(
  projectId: string,
  startDate?: Date,
  endDate?: Date,
) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.analytics.getTaskCompletionTrend.queryOptions(projectId),
  });
}
