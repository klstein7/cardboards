// src/app/(project)/p/[projectId]/(board)/_components/card-list.tsx
"use client";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import invariant from "tiny-invariant";

import {
  type Card,
  type CardDragData,
  type CardDropData,
  type Column,
  type ColumnDropData,
  type DragData,
  type DropData,
  type Position,
} from "~/app/(project)/_types";
import { useCards, useMoveCard } from "~/lib/hooks";

import { CardItem } from "./card-item";

interface CardListProps {
  columnId: string;
}

export function CardList({ columnId }: CardListProps) {
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
              // Moving up in same column
              newOrder = targetOrder - 1;
            } else if (isSameColumn && sourceOrder > targetOrder) {
              // Moving down in same column
              newOrder = targetOrder;
            } else {
              // Different column, dropping above target
              newOrder = targetOrder;
            }
          } else {
            if (isSameColumn && sourceOrder < targetOrder) {
              // Moving up in same column
              newOrder = targetOrder;
            } else if (isSameColumn && sourceOrder > targetOrder) {
              // Moving down in same column
              newOrder = targetOrder + 1;
            } else {
              // Different column, dropping below target
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

  const getItemPosition = useCallback(
    (index: number): Position => {
      if (!cards.data?.length) return "only";
      if (cards.data.length === 1) return "only";
      if (index === 0) return "first";
      if (index === cards.data.length - 1) return "last";
      return "middle";
    },
    [cards.data?.length],
  );

  if (cards.error) throw cards.error;
  if (cards.isPending) return <div>Loading...</div>;
  if (!cards.data.length)
    return <div className="flex flex-col gap-3">No cards</div>;

  return (
    <div className="flex flex-col [&>*:not(:first-child)]:mt-[-1px]">
      {cards.data
        .sort((a, b) => a.order - b.order)
        .map((card, index) => (
          <CardItem
            key={card.id}
            card={card}
            index={index}
            position={getItemPosition(index)}
            columnId={columnId}
          />
        ))}
    </div>
  );
}
