import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useCreateBoard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.board.create.mutationOptions({
      onSuccess: ({ projectId }) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.board.list.queryKey(projectId),
        });
      },
    }),
  });
}
