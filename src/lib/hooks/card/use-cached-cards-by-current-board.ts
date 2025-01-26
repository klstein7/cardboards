import { useQueryClient } from "@tanstack/react-query";

import { type Card, type Column } from "~/app/(project)/_types";

import { useStrictCurrentBoardId } from "../utils";

export function useCachedCardsByCurrentBoard() {
  const boardId = useStrictCurrentBoardId();

  const queryClient = useQueryClient();

  const columns = queryClient.getQueryData<Column[]>(["columns", boardId]);

  return queryClient
    .getQueriesData({
      queryKey: ["cards"],
      exact: false,
    })
    .flatMap(([_, data]) => data as Card[])
    .filter((card) => columns?.find((column) => column.id === card.columnId));
}
