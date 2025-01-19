// src/app/(project)/p/[projectId]/(board)/_components/card-list.tsx
"use client";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { useEffect } from "react";

import {
  type Card,
  type CardDragData,
  type CardDropData,
  type ColumnDropData,
  type DragData,
} from "~/app/(project)/_types";
import { useCards, useMoveCard } from "~/lib/hooks";

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

          console.log(edge);
          console.log("newOrder", newOrder);

          void moveCardMutation.mutateAsync({
            cardId: sourceData.payload.id,
            sourceColumnId: sourceData.columnId,
            destinationColumnId: targetData.columnId,
            newOrder,
          });
        } else {
          const target = location.current.dropTargets.find(
            (target) => target.data.type === "column",
          );

          if (!target) return;

          const edge = extractClosestEdge(target.data);

          const targetData = target.data as unknown as ColumnDropData;
          const sourceData = source.data as unknown as CardDragData;

          console.log("targetData", targetData);

          const targetCards =
            queryClient.getQueryData<Card[]>([
              "cards",
              targetData.payload.id,
            ]) ?? [];

          console.log("targetCards", targetCards);

          const newOrder = edge === "top" ? 0 : targetCards.length;

          console.log("edge", edge);
          console.log("newOrder", newOrder);

          void moveCardMutation.mutateAsync({
            cardId: sourceData.payload.id,
            sourceColumnId: sourceData.columnId,
            destinationColumnId: targetData.columnId,
            newOrder,
          });
        }
      },
    });
  }, [cards.data, columnId, moveCardMutation, queryClient]);

  if (cards.error) throw cards.error;
  if (cards.isPending)
    return (
      <div className="flex flex-col [&>*:not(:first-child)]:mt-[-1px]">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  if (!cards.data.length)
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-muted px-2 py-4 text-xs text-muted-foreground sm:px-4 sm:py-6 sm:text-sm">
        <FileText className="h-6 w-6 opacity-50 sm:h-8 sm:w-8" />
        <p>No cards</p>
        <p>Add a card to get started</p>
      </div>
    );

  return (
    <div className="flex max-w-full flex-col [&>*:not(:first-child)]:mt-[-1px]">
      {cards.data
        .sort((a, b) => a.order - b.order)
        .map((card, index) => (
          <CardItem
            key={card.id}
            card={card}
            index={index}
            columnId={columnId}
            isCompleted={isCompleted}
          />
        ))}
    </div>
  );
}
