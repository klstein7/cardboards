import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useCardCountByProjectId(projectId: string) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.card.countByProjectId.queryOptions(projectId),
  });
}
