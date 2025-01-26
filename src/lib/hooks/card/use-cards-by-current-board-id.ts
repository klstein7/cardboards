import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";

import { type Card, type Column } from "~/app/(project)/_types";

import { useCurrentBoardId, useDebouncedSearch } from "..";

export function useCardsByCurrentBoardId() {
  const queryClient = useQueryClient();

  const boardId = useCurrentBoardId();

  const debouncedSearch = useDebouncedSearch();

  const { data: columns } = useQuery<Column[]>({
    queryKey: ["columns", boardId],
    enabled: !!boardId,
    initialData: () => queryClient.getQueryData<Column[]>(["columns", boardId]),
  });

  const cardQueries = useQueries({
    queries: (columns ?? []).map((column) => ({
      queryKey: ["cards", column.id, debouncedSearch],
      initialData: () =>
        queryClient.getQueryData<Card[]>(["cards", column.id, debouncedSearch]),
      enabled: !!boardId,
    })),
  });

  if (!boardId) return [];

  return cardQueries.flatMap((query) => query.data ?? []);
}
