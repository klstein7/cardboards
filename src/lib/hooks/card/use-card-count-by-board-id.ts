import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useCardCountByBoardId(boardId: string) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.card.countByBoardId.queryOptions(boardId),
  });
}
