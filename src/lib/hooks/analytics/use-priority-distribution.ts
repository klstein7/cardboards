import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function usePriorityDistribution(
  projectId: string,
  startDate: Date,
  endDate: Date,
) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.analytics.getPriorityDistribution.queryOptions({
      projectId,
      startDate,
      endDate,
    }),
  });
}
