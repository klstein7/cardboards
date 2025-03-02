import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type Card } from "~/app/(project)/_types";
import { useBoardState } from "~/app/(project)/p/[projectId]/(board)/_components/board-state-provider";
import { retryFlash } from "~/lib/utils";
import { useTRPC } from "~/trpc/client";

import { useCurrentBoard } from "../board";

export function useMoveCard() {
  const trpc = useTRPC();
  const board = useCurrentBoard();
  const queryClient = useQueryClient();
  const { getCard } = useBoardState();

  return useMutation(
    trpc.card.move.mutationOptions({
      onMutate: async (variables) => {
        console.log("Starting optimistic update");
        console.log(`Looking for card ${variables.cardId}`);
        console.log(`In source column ${variables.sourceColumnId}`);

        await queryClient.cancelQueries({
          queryKey: trpc.card.list.queryKey(variables.sourceColumnId),
        });

        await queryClient.cancelQueries({
          queryKey: trpc.card.list.queryKey(variables.destinationColumnId),
        });

        const previousSourceCards = queryClient.getQueryData<Card[]>(
          trpc.card.list.queryKey(variables.sourceColumnId),
        );
        const previousDestCards = queryClient.getQueryData<Card[]>(
          trpc.card.list.queryKey(variables.destinationColumnId),
        );

        if (!previousSourceCards || !previousDestCards) return;

        const sourceCard = previousSourceCards.find(
          (card) => card.id === variables.cardId,
        );

        if (!sourceCard) return;

        if (variables.destinationColumnId !== variables.sourceColumnId) {
          queryClient.setQueryData<Card[]>(
            trpc.card.list.queryKey(variables.sourceColumnId),
            (old = []) => {
              return old
                .filter((card) => card.id !== variables.cardId)
                .map((card, index) => ({ ...card, order: index }));
            },
          );

          queryClient.setQueryData<Card[]>(
            trpc.card.list.queryKey(variables.destinationColumnId),
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
            trpc.card.list.queryKey(variables.sourceColumnId),
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
            trpc.card.list.queryKey(variables.sourceColumnId),
            context.previousSourceCards,
          );
        }

        if (variables.destinationColumnId !== variables.sourceColumnId) {
          if (context?.previousDestCards) {
            queryClient.setQueryData(
              trpc.card.list.queryKey(variables.destinationColumnId),
              context.previousDestCards,
            );
          }
        }
      },
      onSettled: (result, error, variables) => {
        if (!result) return;
        void queryClient.invalidateQueries({
          queryKey: trpc.card.list.queryKey(variables.sourceColumnId),
        });
        if (variables.destinationColumnId !== variables.sourceColumnId) {
          void queryClient.invalidateQueries({
            queryKey: trpc.card.list.queryKey(variables.destinationColumnId),
          });
        }
      },
    }),
  );
}
