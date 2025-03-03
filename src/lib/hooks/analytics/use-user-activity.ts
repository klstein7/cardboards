import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useUserActivity(
  projectId: string,
  startDate?: Date,
  endDate?: Date,
) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.analytics.getUserActivity.queryOptions({
      projectId,
      startDate,
      endDate,
    }),
  });
}
