import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useDuplicateCard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.card.duplicate.mutationOptions({
      onSuccess: async ({ columnId }) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.card.list.queryKey(columnId),
        });
      },
    }),
  });
}
