import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useDeleteBoard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.board.delete.mutationOptions({
      onSuccess: async ({ projectId }) => {
        await queryClient.invalidateQueries({
          queryKey: ["boards", projectId],
        });
      },
    }),
  });
}
