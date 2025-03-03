import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type Column } from "~/app/(project)/_types";
import { useTRPC } from "~/trpc/client";

export function useShiftColumn() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.column.shift.mutationOptions({
      onMutate: async ({ columnId, data: { direction } }) => {
        const queries = queryClient.getQueriesData<Column[]>({
          queryKey: trpc.column.list.queryKey(),
          exact: false,
        });

        const matchingQuery = queries.find(([, columns]) =>
          columns?.some((c: Column) => c.id === columnId),
        );

        console.log(matchingQuery);

        if (!matchingQuery) return;

        const [queryKey] = matchingQuery;
        const queryKeyArray = queryKey as unknown[];

        let boardId: string | undefined;

        if (
          Array.isArray(queryKeyArray) &&
          queryKeyArray.length > 1 &&
          typeof queryKeyArray[1] === "object" &&
          queryKeyArray[1] !== null
        ) {
          const queryData = queryKeyArray[1] as { input?: unknown };
          if (queryData.input && typeof queryData.input === "string") {
            boardId = queryData.input;
          }
        }

        if (!boardId) return;

        await queryClient.cancelQueries({
          queryKey: trpc.column.list.queryKey(boardId),
        });

        const previousColumns = queryClient.getQueryData<Column[]>(
          trpc.column.list.queryKey(boardId),
        );

        if (!previousColumns) return { previousColumns: undefined };

        queryClient.setQueryData<Column[]>(
          trpc.column.list.queryKey(boardId),
          (old = []) => {
            const newColumns = [...old];
            const fromIndex = newColumns.findIndex((c) => c.id === columnId);

            if (fromIndex === -1) return old;

            let toIndex;
            if (direction === "up") {
              toIndex = Math.max(0, fromIndex - 1);
            } else {
              toIndex = Math.min(newColumns.length - 1, fromIndex + 1);
            }

            if (fromIndex === toIndex) return old;

            const removed = newColumns.splice(fromIndex, 1)[0];
            if (!removed) return old;

            newColumns.splice(toIndex, 0, removed);

            return newColumns.map((c, index) => ({
              ...c,
              order: index,
              isCompleted: newColumns.length === index + 1,
            }));
          },
        );

        return { previousColumns, boardId };
      },
      onError: (_err, _variables, context) => {
        const contextBoardId = context?.boardId;
        if (contextBoardId && context?.previousColumns) {
          queryClient.setQueryData(
            trpc.column.list.queryKey(contextBoardId),
            context.previousColumns,
          );

          void queryClient.invalidateQueries({
            queryKey: trpc.column.list.queryKey(contextBoardId),
          });
        }
      },
      onSettled: (_data, _error, _variables, context) => {
        const boardId = context?.boardId;
        if (boardId) {
          void queryClient.invalidateQueries({
            queryKey: trpc.column.list.queryKey(boardId),
          });
        }
      },
    }),
  });
}
