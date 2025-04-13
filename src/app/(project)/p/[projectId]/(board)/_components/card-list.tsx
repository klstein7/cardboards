// src/app/(project)/p/[projectId]/(board)/_components/card-list.tsx
"use client";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Plus } from "lucide-react";
import { useEffect } from "react";

import {
  type Card,
  type CardDragData,
  type CardDropData,
  type ColumnDropData,
  type DragData,
} from "~/app/(project)/_types";
import { Button } from "~/components/ui/button";
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
  }, [cards.data, columnId, moveCardMutation, queryClient]);

  if (cards.error) {
    return <div>Error: {cards.error.message}</div>;
  }

  if (cards.isPending)
    return (
      <div className="flex flex-col space-y-4 p-2">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );

  if (!cards.data.length)
    return (
      <div className="flex h-36 flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted bg-card/20 px-3 py-6 text-xs text-muted-foreground transition-all hover:border-muted/70 hover:bg-card/30 sm:px-4 sm:py-8 sm:text-sm">
        <FileText className="h-6 w-6 opacity-50 sm:h-8 sm:w-8" />
        <p className="text-center font-medium">No cards in this column</p>
        {!isCompleted && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 h-8 text-xs font-medium text-muted-foreground hover:bg-secondary/60"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add card
          </Button>
        )}
      </div>
    );

  const sortedCards = cards.data.sort((a, b) => a.order - b.order);

  return (
    <div className="flex max-w-full flex-col p-2">
      <AnimatePresence initial={false}>
        {sortedCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              index < sortedCards.length - 1 ? "mb-3" : "",
              moveCardMutation.isPending && "opacity-80",
            )}
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
