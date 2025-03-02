import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";

import { type Card } from "~/app/(project)/_types";
import { useBoardState } from "~/app/(project)/p/[projectId]/(board)/_components/board-state-provider";
import { retryFlash } from "~/lib/utils";
import { useTRPC } from "~/trpc/client";

import { useCurrentBoard } from "../board";

// Debounce delay in milliseconds
const MOVE_DEBOUNCE_DELAY = 50;

export function useMoveCard() {
  const trpc = useTRPC();
  const board = useCurrentBoard();
  const queryClient = useQueryClient();
  const { getCard } = useBoardState();

  // Track the latest mutation timestamp for each card
  const latestMutationTimestampRef = useRef<Record<string, number>>({});
  // Debounce timer for each card
  const debounceTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  const mutationResult = useMutation(
    trpc.card.move.mutationOptions({
      onMutate: async (variables) => {
        // Record the timestamp of this mutation for this card
        const currentTimestamp = Date.now();
        latestMutationTimestampRef.current[variables.cardId] = currentTimestamp;

        console.log("Starting optimistic update");
        console.log(`Looking for card ${variables.cardId}`);
        console.log(`In source column ${variables.sourceColumnId}`);

        // Cancel any outgoing refetches to avoid overwriting our optimistic update
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

        // Save the mutation context for potential reversion
        return {
          previousSourceCards,
          previousDestCards,
          timestamp: currentTimestamp,
        };
      },
      onError: (_err, variables, context) => {
        // Only revert if this error handler is for the latest mutation of this card
        if (
          !context ||
          latestMutationTimestampRef.current[variables.cardId] !==
            context.timestamp
        ) {
          return;
        }

        if (context.previousSourceCards) {
          queryClient.setQueryData(
            trpc.card.list.queryKey(variables.sourceColumnId),
            context.previousSourceCards,
          );
        }

        if (variables.destinationColumnId !== variables.sourceColumnId) {
          if (context.previousDestCards) {
            queryClient.setQueryData(
              trpc.card.list.queryKey(variables.destinationColumnId),
              context.previousDestCards,
            );
          }
        }
      },
      onSettled: (result, error, variables, context) => {
        if (!result) return;

        // Only invalidate for the most recent mutation of this card
        if (
          !context ||
          latestMutationTimestampRef.current[variables.cardId] !==
            context.timestamp
        ) {
          return;
        }

        // Use selective invalidation strategies
        void queryClient.invalidateQueries({
          queryKey: trpc.card.list.queryKey(variables.sourceColumnId),
          // Only refetch if there are no active fetches for this query
          refetchType: "inactive",
        });

        if (variables.destinationColumnId !== variables.sourceColumnId) {
          void queryClient.invalidateQueries({
            queryKey: trpc.card.list.queryKey(variables.destinationColumnId),
            // Only refetch if there are no active fetches for this query
            refetchType: "inactive",
          });
        }
      },
    }),
  );

  // Wrapper function to debounce card moves
  const debouncedMoveCard = useCallback(
    (variables: Parameters<typeof mutationResult.mutate>[0]) => {
      const cardId = String(variables.cardId);

      // Clear any existing timer for this card
      if (debounceTimersRef.current[cardId]) {
        clearTimeout(debounceTimersRef.current[cardId]);
      }

      // Set a new timer
      debounceTimersRef.current[cardId] = setTimeout(() => {
        // The actual mutation call happens here after the debounce period
        mutationResult.mutate(variables);
        // Clean up the timer reference
        delete debounceTimersRef.current[cardId];
      }, MOVE_DEBOUNCE_DELAY);
    },
    [mutationResult],
  );

  return {
    ...mutationResult,
    // Replace the regular mutate with our debounced version
    mutate: debouncedMoveCard,
    // Provide the non-debounced version in case it's needed for immediate execution
    mutateImmediate: mutationResult.mutate,
  };
}
