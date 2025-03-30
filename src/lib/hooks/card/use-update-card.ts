import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type Card } from "~/app/(project)/_types";
import { useTRPC } from "~/trpc/client";

export function useUpdateCard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.card.update.mutationOptions({
      onMutate: async ({ cardId, data }) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: trpc.card.get.queryKey(cardId),
        });

        // Save the previous card value
        const previousCard = queryClient.getQueryData<Card>(
          trpc.card.get.queryKey(cardId),
        );

        // Only attempt optimistic update for the individual card
        if (previousCard) {
          const optimisticCard = {
            ...previousCard,
            ...data,
            updatedAt: new Date(),
          };

          // Update the card data optimistically
          queryClient.setQueryData(
            trpc.card.get.queryKey(cardId),
            optimisticCard,
          );
        }

        return { previousCard };
      },

      onError: (_, { cardId }, context) => {
        // If the mutation fails, restore from context
        if (context?.previousCard) {
          queryClient.setQueryData(
            trpc.card.get.queryKey(cardId),
            context.previousCard,
          );
        }
      },

      onSuccess: async (updatedCard, { cardId, data }) => {
        // When successful, update all relevant queries

        // Always update the individual card
        queryClient.setQueryData(trpc.card.get.queryKey(cardId), updatedCard);

        // If the column changed, invalidate both columns
        if (data.columnId) {
          const newColumnId = data.columnId;

          await queryClient.invalidateQueries({
            queryKey: trpc.card.list.queryKey(newColumnId),
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
          // Only invalidate the current column if no column change
          await queryClient.invalidateQueries({
            queryKey: trpc.card.list.queryKey(updatedCard.columnId),
          });
        }
      },
    }),
  });
}
