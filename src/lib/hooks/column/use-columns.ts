import { useQuery } from "@tanstack/react-query";

import { api } from "~/server/api";

export function useColumns(boardId: string) {
  return useQuery({
    queryKey: ["columns", boardId],
    queryFn: () => api.column.list(boardId),
    placeholderData: [],
  });
}
