import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useTasksPerDueDate(
  projectId: string,
  startDate?: Date,
  endDate?: Date,
) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.analytics.getTasksPerDueDate.queryOptions(projectId),
  });
}
