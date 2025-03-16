import { useQueryClient } from "@tanstack/react-query";

import { type Card, type Column } from "~/app/(project)/_types";
import { useTRPC } from "~/trpc/client";

import { useStrictCurrentBoardId } from "../utils";

export function useCachedCardsByCurrentBoard() {
  const boardId = useStrictCurrentBoardId();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const columnsQueryKey = trpc.column.list.queryKey(boardId);
  const columns = queryClient.getQueryData<Column[]>(columnsQueryKey);

  const cardQueries = queryClient.getQueriesData<Card[]>({
    queryKey: trpc.card.list.queryKey(),
    exact: false,
  });

  return cardQueries
    .flatMap(([_, data]) => data ?? [])
    .filter(
      (card) =>
        card?.columnId &&
        columns?.some((column) => column.id === card.columnId),
    );
}
