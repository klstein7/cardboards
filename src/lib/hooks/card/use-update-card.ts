import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type Card } from "~/app/(project)/_types";
import { useTRPC } from "~/trpc/client";

export function useUpdateCard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.card.update.mutationOptions({
      onSuccess: async (updatedCard, { cardId, data }) => {
        if (data.columnId) {
          const newColumnId = data.columnId;

          await queryClient.invalidateQueries({
            queryKey: trpc.card.list.queryKey(newColumnId),
          });

          await queryClient.invalidateQueries({
            queryKey: trpc.card.get.queryKey(cardId),
          });

          const oldCard = queryClient.getQueryData<Card>(
            trpc.card.get.queryKey(cardId),
          );

          if (oldCard?.columnId && oldCard.columnId !== newColumnId) {
            await queryClient.invalidateQueries({
              queryKey: trpc.card.list.queryKey(oldCard.columnId),
            });
          }
        } else {
          await queryClient.invalidateQueries({
            queryKey: trpc.card.get.queryKey(cardId),
          });

          await queryClient.invalidateQueries({
            queryKey: trpc.card.list.queryKey(updatedCard.columnId),
          });
        }
      },
    }),
  });
}
