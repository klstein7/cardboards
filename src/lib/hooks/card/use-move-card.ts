import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type Card } from "~/app/(project)/_types";
import { useBoardState } from "~/app/(project)/p/[projectId]/(board)/_components/board-state-provider";
import { retryFlash } from "~/lib/utils";
import { api } from "~/server/api";

import { useCurrentBoard } from "../board";
import { useDebouncedSearch } from "../utils";

export function useMoveCard() {
  const board = useCurrentBoard();
  const queryClient = useQueryClient();
  const debouncedSearch = useDebouncedSearch();
  const { getCard } = useBoardState();

  return useMutation({
    mutationFn: api.card.move,
    onMutate: async (variables) => {
      console.log("Starting optimistic update");
      console.log(`Looking for card ${variables.cardId}`);
      console.log(`In source column ${variables.sourceColumnId}`);

      await queryClient.cancelQueries({ queryKey: ["cards"] });

      const previousSourceCards = queryClient.getQueryData<Card[]>([
        "cards",
        variables.sourceColumnId,
        debouncedSearch,
      ]);
      const previousDestCards = queryClient.getQueryData<Card[]>([
        "cards",
        variables.destinationColumnId,
        debouncedSearch,
      ]);

      if (!previousSourceCards || !previousDestCards) return;

      const sourceCard = previousSourceCards.find(
        (card) => card.id === variables.cardId,
      );

      if (!sourceCard) return;

      if (variables.destinationColumnId !== variables.sourceColumnId) {
        queryClient.setQueryData<Card[]>(
          ["cards", variables.sourceColumnId, debouncedSearch],
          (old = []) => {
            return old
              .filter((card) => card.id !== variables.cardId)
              .map((card, index) => ({ ...card, order: index }));
          },
        );

        queryClient.setQueryData<Card[]>(
          ["cards", variables.destinationColumnId, debouncedSearch],
          (old = []) => {
            return [
              ...old.slice(0, variables.newOrder),
              {
                ...sourceCard,
                order: variables.newOrder,
                columnId: variables.destinationColumnId,
              },
              ...old.slice(variables.newOrder),
            ].map((card, index) => ({ ...card, order: index }));
          },
        );
      } else {
        queryClient.setQueryData<Card[]>(
          ["cards", variables.sourceColumnId, debouncedSearch],
          (old = []) => {
            const filteredOld = old.filter(
              (card) => card.id !== variables.cardId,
            );
            return [
              ...filteredOld.slice(0, variables.newOrder),
              {
                ...sourceCard,
                order: variables.newOrder,
              },
              ...filteredOld.slice(variables.newOrder),
            ].map((card, index) => ({ ...card, order: index }));
          },
        );
      }

      retryFlash(variables.cardId, {
        getElement: () => getCard(variables.cardId),
        isCrossColumnMove:
          variables.destinationColumnId !== variables.sourceColumnId,
        color: board.data?.color,
      });

      return { previousSourceCards, previousDestCards };
    },
    onError: (_err, variables, context) => {
      if (context?.previousSourceCards) {
        queryClient.setQueryData(
          ["cards", variables.sourceColumnId, debouncedSearch],
          context.previousSourceCards,
        );
      }

      if (variables.destinationColumnId !== variables.sourceColumnId) {
        if (context?.previousDestCards) {
          queryClient.setQueryData(
            ["cards", variables.destinationColumnId, debouncedSearch],
            context.previousDestCards,
          );
        }
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
