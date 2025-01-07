import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/server/api";

type Card = Awaited<ReturnType<typeof api.card.list>>[number];

export function useMoveCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.card.move,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ["cards", variables.destinationColumnId],
      });

      const previousSourceCards = queryClient.getQueryData<Card[]>([
        "cards",
        variables.cardId,
      ]);
      const previousDestCards = queryClient.getQueryData<Card[]>([
        "cards",
        variables.destinationColumnId,
      ]);

      queryClient.setQueryData(
        ["cards", variables.destinationColumnId],
        (old: Card[] = []) => {
          const newCards = [...old];
          const cardToMove = old.find((card) => card.id === variables.cardId);

          if (cardToMove) {
            const filteredCards = newCards.filter(
              (card) => card.id !== variables.cardId,
            );

            filteredCards.splice(variables.newOrder - 1, 0, {
              ...cardToMove,
              order: variables.newOrder,
            });

            return filteredCards.map((card, index) => ({
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
          ["cards", variables.cardId],
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
