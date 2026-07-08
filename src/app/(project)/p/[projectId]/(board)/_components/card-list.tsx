// src/app/(project)/p/[projectId]/(board)/_components/card-list.tsx
"use client";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

import {
  type Card,
  type CardDragData,
  type CardDropData,
  type ColumnDropData,
  type DragData,
} from "~/app/(project)/_types";
import { useCards, useMoveCard } from "~/lib/hooks";
import { cn, triggerPostMoveFlash } from "~/lib/utils";
import { useTRPC } from "~/trpc/client";

import { CardItem } from "./card-item";
import { CardSkeleton } from "./card-skeleton";

interface CardListProps {
  columnId: string;
  isCompleted: boolean;
}

export function CardList({ columnId, isCompleted }: CardListProps) {
  const cards = useCards(columnId);
  const moveCardMutation = useMoveCard();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const emptyLabel = isCompleted ? "Nothing completed" : "No entries";

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        const sourceData = source.data as unknown as DragData;
        return sourceData.type === "card" && sourceData.columnId === columnId;
      },
      onDrop({ location, source }) {
        const hasCardTarget = location.current.dropTargets.some(
          (target) => target.data.type === "card",
        );
        if (hasCardTarget) {
          const target = location.current.dropTargets.find(
            (target) => target.data.type === "card",
          );

          if (!target) return;

          const edge = extractClosestEdge(target.data);

          const sourceData = source.data as unknown as DragData;
          const targetData = target.data as unknown as CardDropData;

          const isSameColumn = sourceData.columnId === targetData.columnId;
          const sourceOrder = sourceData.payload.order;
          const targetOrder = targetData.payload.order;

          let newOrder: number;
          if (edge === "top") {
            if (isSameColumn && sourceOrder < targetOrder) {
              newOrder = targetOrder - 1;
            } else if (isSameColumn && sourceOrder > targetOrder) {
              newOrder = targetOrder;
            } else {
              newOrder = targetOrder;
            }
          } else {
            if (isSameColumn && sourceOrder < targetOrder) {
              newOrder = targetOrder;
            } else if (isSameColumn && sourceOrder > targetOrder) {
              newOrder = targetOrder + 1;
            } else {
              newOrder = targetOrder + 1;
            }
          }

          moveCardMutation.mutate({
            cardId: sourceData.payload.id,
            sourceColumnId: sourceData.columnId,
            destinationColumnId: targetData.columnId,
            newOrder,
          });

          setTimeout(() => {
            const movedCard = document.querySelector(
              `[data-card-id="${sourceData.payload.id}"]`,
            );
            if (movedCard) {
              triggerPostMoveFlash(movedCard as HTMLElement);
            }
          }, 100);
        } else {
          const target = location.current.dropTargets.find(
            (target) => target.data.type === "column",
          );

          if (!target) return;

          const edge = extractClosestEdge(target.data);

          const targetData = target.data as unknown as ColumnDropData;
          const sourceData = source.data as unknown as CardDragData;

          const targetCards =
            queryClient.getQueryData<Card[]>(
              trpc.card.list.queryOptions(targetData.payload.id).queryKey,
            ) ?? [];

          const newOrder = edge === "top" ? 0 : targetCards.length;

          moveCardMutation.mutate({
            cardId: sourceData.payload.id,
            sourceColumnId: sourceData.columnId,
            destinationColumnId: targetData.columnId,
            newOrder,
          });

          setTimeout(() => {
            const movedCard = document.querySelector(
              `[data-card-id="${sourceData.payload.id}"]`,
            );
            if (movedCard) {
              triggerPostMoveFlash(movedCard as HTMLElement);
            }
          }, 100);
        }
      },
    });
  }, [cards.data, columnId, moveCardMutation, queryClient, trpc.card.list]);

  if (cards.error) {
    return <div>Error: {cards.error.message}</div>;
  }

  if (cards.isPending)
    return (
      <div className="flex flex-col divide-y divide-border/60">
        {[0, 1, 2].map((index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );

  if (!cards.data.length)
    return (
      <p className="px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {emptyLabel}
      </p>
    );

  const sortedCards = cards.data.sort((a, b) => a.order - b.order);

  return (
    <div className="flex max-w-full flex-col divide-y divide-border/60">
      <AnimatePresence initial={false}>
        {sortedCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(moveCardMutation.isPending && "opacity-80")}
          >
            <CardItem
              card={card}
              index={index}
              columnId={columnId}
              isCompleted={isCompleted}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
