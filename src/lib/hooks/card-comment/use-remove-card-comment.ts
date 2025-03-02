import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useRemoveCardComment() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.cardComment.remove.mutationOptions({
      onSuccess: (removedComment) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.cardComment.list.queryKey(removedComment.cardId),
        });
      },
    }),
  });
}
