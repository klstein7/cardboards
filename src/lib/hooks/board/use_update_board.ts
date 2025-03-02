import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useUpdateBoard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.board.update.mutationOptions({
      onSuccess: async (updatedBoard) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.board.list.queryKey(updatedBoard.projectId),
        });

        await queryClient.invalidateQueries({
          queryKey: trpc.board.get.queryKey(updatedBoard.id),
        });
      },
    }),
  });
}
