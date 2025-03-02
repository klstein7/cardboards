import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useCreateCardComment() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.cardComment.create.mutationOptions({
      onSuccess: ({ cardId }) => {
        void queryClient.invalidateQueries({
          queryKey: ["card-comments", cardId],
        });
      },
    }),
  });
}
