import { useQueryClient } from "@tanstack/react-query";

import { type Card, type Column } from "~/app/(project)/_types";

import { useStrictCurrentBoardId } from "../utils";

export function useCachedCardsByCurrentBoard() {
  const boardId = useStrictCurrentBoardId();
  const queryClient = useQueryClient();

  // Get columns from cache
  const columnsQueryKey = ["columns", boardId];
  const columns = queryClient.getQueryData<Column[]>(columnsQueryKey);

  // Find all card queries in the cache
  const cardQueries = queryClient.getQueriesData({
    queryKey: ["cards"],
    exact: false,
  });

  // Extract and filter the cards
  return cardQueries
    .flatMap(([_, data]) => data as Card[])
    .filter((card) => columns?.find((column) => column.id === card.columnId));
}
