import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useProjectProgress(
  projectId: string,
  startDate?: Date,
  endDate?: Date,
) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.analytics.getProjectProgress.queryOptions(projectId),
  });
}
