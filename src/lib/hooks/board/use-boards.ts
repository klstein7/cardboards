import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useBoards(projectId: string) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.board.list.queryOptions(projectId),
  });
}
