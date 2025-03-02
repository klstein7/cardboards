import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useDeleteBoard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.board.delete.mutationOptions({
      onSuccess: (deletedBoard) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.board.list.queryKey(deletedBoard.projectId),
        });
      },
    }),
  });
}
