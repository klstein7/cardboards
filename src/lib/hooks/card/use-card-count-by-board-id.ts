import { useQuery } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useCardCountByBoardId(boardId: string) {
  return useQuery({
    queryKey: ["card-count-by-board-id", boardId],
    queryFn: () => api.card.countByBoardId(boardId),
  });
}
