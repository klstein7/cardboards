import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type Column } from "~/app/(project)/_types";
import { api } from "~/server/api";

export function useShiftColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.column.shift,
    onMutate: async ({ columnId, data: { direction } }) => {
      const queries = queryClient.getQueriesData<Column[]>({
        queryKey: ["columns"],
      });
      const [, columns] =
        queries.find(([_, data]) => data?.some((c) => c.id === columnId)) ?? [];
      const column = columns?.find((c) => c.id === columnId);
      if (!column?.boardId) return;

      await queryClient.cancelQueries({
        queryKey: ["columns", column.boardId],
      });

      const previousColumns = queryClient.getQueryData<Column[]>([
        "columns",
        column.boardId,
      ]);
      if (!previousColumns) return;

      const currentIndex = previousColumns.findIndex((c) => c.id === columnId);
      if (currentIndex === -1) return;

      if (
        (direction === "up" && currentIndex === 0) ||
        (direction === "down" && currentIndex === previousColumns.length - 1)
      ) {
        return;
      }

      const newColumns = [...previousColumns];
      const adjacentIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;
      const isMovingToLast =
        direction === "down" && adjacentIndex === previousColumns.length - 1;
      const isMovingFromLast =
        direction === "up" && currentIndex === previousColumns.length - 1;

      const temp = { ...newColumns[currentIndex]! };
      newColumns[currentIndex] = {
        ...newColumns[adjacentIndex]!,
        order: temp.order,
        isCompleted: isMovingFromLast,
      };
      newColumns[adjacentIndex] = {
        ...temp,
        order: newColumns[adjacentIndex]!.order,
        isCompleted: isMovingToLast,
      };

      queryClient.setQueryData(["columns", column.boardId], newColumns);

      return { previousColumns, boardId: column.boardId };
    },
    onError: (_err, _variables, context) => {
      if (context?.boardId) {
        queryClient.setQueryData(
          ["columns", context.boardId],
          context.previousColumns,
        );
      }
    },
    onSuccess: async ({ boardId }) => {
      await queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
    },
  });
}
