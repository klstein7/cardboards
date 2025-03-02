import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useBoard(boardId: string) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.board.get.queryOptions(boardId),
  });
}
