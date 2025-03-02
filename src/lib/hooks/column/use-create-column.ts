import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useCreateColumn() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.column.create.mutationOptions({
      onSuccess: async ({ boardId }) => {
        await queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
      },
    }),
  });
}
