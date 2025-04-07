import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useCompletedCardCountByBoardId(boardId: string) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.card.countCompletedByBoardId.queryOptions(boardId),
  });
}
