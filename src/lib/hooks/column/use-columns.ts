import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useColumns(boardId: string) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.column.list.queryOptions(boardId),
    placeholderData: [],
  });
}
