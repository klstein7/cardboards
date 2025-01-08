import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type Card } from "~/app/(project)/_types";
import { api } from "~/server/api";

export function useMoveCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.card.move,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ["cards", variables.destinationColumnId],
      });
      await queryClient.cancelQueries({
        queryKey: ["cards", variables.sourceColumnId],
      });

      const previousSourceCards = queryClient.getQueryData<Card[]>([
        "cards",
        variables.sourceColumnId,
      ]);
      const previousDestCards = queryClient.getQueryData<Card[]>([
        "cards",
        variables.destinationColumnId,
      ]);

      queryClient.setQueryData(
        ["cards", variables.sourceColumnId],
        (old: Card[] = []) => {
          const filteredCards = old.filter(
            (card) => card.id !== variables.cardId,
          );
          return filteredCards.map((card, index) => ({
            ...card,
            order: index + 1,
          }));
        },
      );

      queryClient.setQueryData(
        ["cards", variables.destinationColumnId],
        (old: Card[] = []) => {
          const newCards = [...old];
          const cardToMove = previousSourceCards?.find(
            (card) => card.id === variables.cardId,
          );

          if (cardToMove) {
            newCards.splice(variables.newOrder - 1, 0, {
              ...cardToMove,
              columnId: variables.destinationColumnId,
              order: variables.newOrder,
            });

            return newCards.map((card, index) => ({
              ...card,
              order: index + 1,
            }));
          }

          return old;
        },
      );

      return { previousSourceCards, previousDestCards };
    },
    onError: (_err, variables, context) => {
      if (context?.previousSourceCards) {
        queryClient.setQueryData(
          ["cards", variables.sourceColumnId],
          context.previousSourceCards,
        );
      }
      if (context?.previousDestCards) {
        queryClient.setQueryData(
          ["cards", variables.destinationColumnId],
          context.previousDestCards,
        );
      }
    },
    onSettled: (result) => {
      if (!result) return;
      const { previousColumnId, newColumnId } = result;

      void queryClient.invalidateQueries({
        queryKey: ["cards", previousColumnId],
      });
      if (previousColumnId !== newColumnId) {
        void queryClient.invalidateQueries({
          queryKey: ["cards", newColumnId],
        });
      }
    },
  });
}
