import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useDeleteColumn() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.column.delete.mutationOptions({
      onSuccess: (deletedColumn) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.column.list.queryKey(deletedColumn.boardId),
        });
      },
    }),
  });
}
