import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useGenerateBoard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.board.generate.mutationOptions({
      onSuccess: async ({ projectId }) => {
        await queryClient.invalidateQueries({
          queryKey: ["boards", projectId],
        });
      },
    }),
  });
}
