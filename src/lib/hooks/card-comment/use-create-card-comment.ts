import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useCreateCardComment() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.cardComment.create.mutationOptions({
      onSuccess: (comment) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.cardComment.list.queryKey(comment.cardId),
        });
      },
    }),
  });
}
