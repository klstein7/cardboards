import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/client";

export function useUpdateCard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.card.update.mutationOptions({
      onSuccess: async ({ columnId: newColumnId, id: cardId }, variables) => {
        const oldColumnId = variables.data.columnId;

        await queryClient.invalidateQueries({
          queryKey: ["cards", newColumnId],
        });

        await queryClient.invalidateQueries({
          queryKey: ["card", cardId],
        });

        if (oldColumnId && oldColumnId !== newColumnId) {
          await queryClient.invalidateQueries({
            queryKey: ["cards", oldColumnId],
          });
        }
      },
    }),
  });
}
