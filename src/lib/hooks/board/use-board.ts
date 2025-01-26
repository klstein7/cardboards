import { useQuery } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: ["board", boardId],
    queryFn: () => api.board.get(boardId),
  });
}
