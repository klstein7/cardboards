import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useBoardCountByProjectId(projectId: string) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.board.countByProjectId.queryOptions(projectId),
  });
}
