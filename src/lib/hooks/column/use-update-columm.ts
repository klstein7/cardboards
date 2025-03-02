import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useUpdateColumn() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.column.update.mutationOptions({
      onSuccess: (updatedColumn) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.column.list.queryKey(updatedColumn.boardId),
        });
      },
    }),
  });
}
