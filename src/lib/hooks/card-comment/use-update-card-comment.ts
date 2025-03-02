import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useUpdateCardComment() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.cardComment.update.mutationOptions({
      onSuccess: async ({ cardId }) => {
        await queryClient.invalidateQueries({
          queryKey: ["card-comments", cardId],
        });
      },
    }),
  });
}
