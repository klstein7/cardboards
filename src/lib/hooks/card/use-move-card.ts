import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { toast } from "sonner";

import { type Card } from "~/app/(project)/_types";
import { useTRPC } from "~/trpc/client";

import { applyOptimisticCardMove } from "./card-move";

export function useMoveCard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const mutationSequenceRef = useRef(0);
  const latestMutationRef = useRef<Record<number, number>>({});
  const latestMutationByColumnRef = useRef<Map<string, number>>(new Map());
  const pendingMovesByColumnRef = useRef<Map<string, number>>(new Map());
  const moveRequestChainsRef = useRef<Map<number, Promise<void>>>(new Map());

  const mutationOptions = trpc.card.move.mutationOptions({
    onMutate: async (variables) => {
      const mutationSequence = ++mutationSequenceRef.current;
      latestMutationRef.current[variables.cardId] = mutationSequence;
      const affectedColumnIds = [
        ...new Set([variables.sourceColumnId, variables.destinationColumnId]),
      ];

      affectedColumnIds.forEach((columnId) => {
        const pendingMoves = pendingMovesByColumnRef.current.get(columnId);
        pendingMovesByColumnRef.current.set(columnId, (pendingMoves ?? 0) + 1);
        latestMutationByColumnRef.current.set(columnId, mutationSequence);
      });

      await Promise.all(
        affectedColumnIds.map((columnId) =>
          queryClient.cancelQueries({
            queryKey: trpc.card.list.queryKey(columnId),
          }),
        ),
      );

      const previousSourceCards = queryClient.getQueryData<Card[]>(
        trpc.card.list.queryKey(variables.sourceColumnId),
      );
      const previousDestinationCards =
        variables.sourceColumnId === variables.destinationColumnId
          ? previousSourceCards
          : queryClient.getQueryData<Card[]>(
              trpc.card.list.queryKey(variables.destinationColumnId),
            );

      const canApplyOptimisticMove =
        previousSourceCards &&
        (variables.sourceColumnId === variables.destinationColumnId ||
          previousDestinationCards);
      const optimisticMove = canApplyOptimisticMove
        ? applyOptimisticCardMove({
            ...variables,
            sourceCards: previousSourceCards,
            destinationCards: previousDestinationCards ?? [],
          })
        : null;

      if (optimisticMove) {
        queryClient.setQueryData<Card[]>(
          trpc.card.list.queryKey(variables.sourceColumnId),
          optimisticMove.sourceCards,
        );

        if (optimisticMove.destinationCards) {
          queryClient.setQueryData<Card[]>(
            trpc.card.list.queryKey(variables.destinationColumnId),
            optimisticMove.destinationCards,
          );
        }
      }

      return {
        previousSourceCards,
        previousDestinationCards,
        mutationSequence,
        affectedColumnIds,
      };
    },
    onError: (error, variables, context) => {
      if (
        !context ||
        latestMutationRef.current[variables.cardId] !== context.mutationSequence
      ) {
        return;
      }

      const hasOverlappingMove = context.affectedColumnIds.some(
        (columnId) => (pendingMovesByColumnRef.current.get(columnId) ?? 0) > 1,
      );
      const hasNewerMove = context.affectedColumnIds.some(
        (columnId) =>
          (latestMutationByColumnRef.current.get(columnId) ?? 0) >
          context.mutationSequence,
      );
      const shouldDeferRollback = hasOverlappingMove || hasNewerMove;

      if (!shouldDeferRollback) {
        if (context.previousSourceCards) {
          queryClient.setQueryData(
            trpc.card.list.queryKey(variables.sourceColumnId),
            context.previousSourceCards,
          );
        }

        if (variables.destinationColumnId !== variables.sourceColumnId) {
          if (context.previousDestinationCards) {
            queryClient.setQueryData(
              trpc.card.list.queryKey(variables.destinationColumnId),
              context.previousDestinationCards,
            );
          }
        }
      }

      toast.error("Card move failed", {
        description:
          error instanceof Error
            ? `${error.message}. ${shouldDeferRollback ? "Refreshing the affected lanes." : "Your board was restored."}`
            : shouldDeferRollback
              ? "Refreshing the affected lanes."
              : "Your board was restored.",
      });
    },
    onSettled: (_result, _error, variables, context) => {
      const affectedColumnIds = context?.affectedColumnIds ?? [
        ...new Set([variables.sourceColumnId, variables.destinationColumnId]),
      ];
      const columnsReadyToReconcile = affectedColumnIds.filter((columnId) => {
        const remainingMoves = Math.max(
          0,
          (pendingMovesByColumnRef.current.get(columnId) ?? 1) - 1,
        );

        if (remainingMoves === 0) {
          pendingMovesByColumnRef.current.delete(columnId);
          latestMutationByColumnRef.current.delete(columnId);
          return true;
        }

        pendingMovesByColumnRef.current.set(columnId, remainingMoves);
        return false;
      });

      void Promise.all(
        columnsReadyToReconcile.map((columnId) =>
          queryClient.invalidateQueries({
            queryKey: trpc.card.list.queryKey(columnId),
            refetchType: "active",
          }),
        ),
      );

      if (
        context &&
        latestMutationRef.current[variables.cardId] === context.mutationSequence
      ) {
        delete latestMutationRef.current[variables.cardId];
      }
    },
  });
  const executeMove = mutationOptions.mutationFn;

  return useMutation({
    ...mutationOptions,
    mutationFn: async (variables) => {
      if (!executeMove) throw new Error("Card move mutation is unavailable");

      const previousRequest =
        moveRequestChainsRef.current.get(variables.cardId) ?? Promise.resolve();
      const request = previousRequest.then(() => executeMove(variables));
      const settledRequest = request.then(
        () => undefined,
        () => undefined,
      );

      moveRequestChainsRef.current.set(variables.cardId, settledRequest);
      void settledRequest.then(() => {
        if (
          moveRequestChainsRef.current.get(variables.cardId) === settledRequest
        ) {
          moveRequestChainsRef.current.delete(variables.cardId);
        }
      });

      return request;
    },
  });
}
