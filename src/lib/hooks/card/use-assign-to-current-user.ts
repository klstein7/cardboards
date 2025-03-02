import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useAssignToCurrentUser() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.card.assignToCurrentUser.mutationOptions({
      onSuccess: (updatedCard) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.card.list.queryKey(updatedCard.columnId),
        });

        void queryClient.invalidateQueries({
          queryKey: trpc.card.get.queryKey(updatedCard.id),
        });
      },
    }),
  });
}
