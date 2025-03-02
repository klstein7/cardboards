import { useQueryClient } from "@tanstack/react-query";

import { type Card, type Column } from "~/app/(project)/_types";
import { useTRPC } from "~/trpc/client";

import { useStrictCurrentBoardId } from "../utils";

export function useCachedCardsByCurrentBoard() {
  const boardId = useStrictCurrentBoardId();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  // Get columns from cache using the tRPC query key
  const columnsQueryKey = trpc.column.list.queryKey(boardId);
  const columns = queryClient.getQueryData<Column[]>(columnsQueryKey);

  // Find all card queries in the cache using the tRPC query key pattern
  const cardQueries = queryClient.getQueriesData<Card[]>({
    queryKey: ["cards"], // Use the base part of the query key for matching
    exact: false, // We want to match all card list queries
  });

  // Extract and filter the cards to only include those from the current board's columns
  return cardQueries
    .flatMap(([_, data]) => data ?? [])
    .filter(
      (card) =>
        card?.columnId &&
        columns?.some((column) => column.id === card.columnId),
    );
}
