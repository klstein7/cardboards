import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type Card } from "~/app/(project)/_types";
import { useTRPC } from "~/trpc/client";

export function useUpdateCard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.card.update.mutationOptions({
      onSuccess: (updatedCard, { cardId, data }) => {
        // If the card moved to a new column
        if (data.columnId) {
          const newColumnId = data.columnId;

          void queryClient.invalidateQueries({
            queryKey: trpc.card.list.queryKey(newColumnId),
          });

          void queryClient.invalidateQueries({
            queryKey: trpc.card.get.queryKey(cardId),
          });

          // If we have the old column ID, invalidate that too
          const oldCard = queryClient.getQueryData<Card>(
            trpc.card.get.queryKey(cardId),
          );

          if (oldCard?.columnId && oldCard.columnId !== newColumnId) {
            void queryClient.invalidateQueries({
              queryKey: trpc.card.list.queryKey(oldCard.columnId),
            });
          }
        } else {
          // Just invalidate the card itself
          void queryClient.invalidateQueries({
            queryKey: trpc.card.get.queryKey(cardId),
          });

          // And its column
          void queryClient.invalidateQueries({
            queryKey: trpc.card.list.queryKey(updatedCard.columnId),
          });
        }
      },
    }),
  });
}
