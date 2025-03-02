import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useProjectUserCountByProjectId(projectId: string) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.projectUser.countByProjectId.queryOptions(projectId),
  });
}
