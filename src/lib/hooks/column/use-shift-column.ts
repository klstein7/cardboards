import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useShiftColumn() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.column.shift.mutationOptions({
      onSuccess: async ({ boardId }) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.column.list.queryKey(boardId),
        });
      },
    }),
  });
}
