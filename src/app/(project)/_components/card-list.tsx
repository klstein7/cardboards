"use client";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { useEffect } from "react";

import { useCards, useMoveCard } from "~/lib/hooks";
import { retryFlash } from "~/lib/utils";

import { useCardRegistry } from "../_store/card-registry";
import { type DropData } from "../_types";
import { CardItem } from "./card-item";

interface CardListProps {
  columnId: string;
}

export function CardList({ columnId }: CardListProps) {
  const cards = useCards(columnId);

  const moveCardMutation = useMoveCard();

  const { get } = useCardRegistry();

  useEffect(() => {
    return monitorForElements({
      onDrop: ({ source, location }) => {
        const isColumnDroppable =
          location.current.dropTargets.length === 1 &&
          location.current.dropTargets.some(
            (target) => (target.data as unknown as DropData).type === "column",
          );

        if (isColumnDroppable) return;

        const target = location.current.dropTargets[0];

        if (!target) return;

        const sourceData = source.data as unknown as DropData;
        const targetData = target.data as unknown as DropData;

        if (sourceData.type !== "card" || targetData.type !== "card") return;

        const closestEdge = extractClosestEdge(
          targetData as unknown as Record<string, unknown>,
        );

        const newOrder = getReorderDestinationIndex({
          startIndex: sourceData.payload.order,
          indexOfTarget: targetData.payload.order,
          closestEdgeOfTarget: closestEdge,
          axis: "vertical",
        });

        moveCardMutation.mutate({
          cardId: sourceData.payload.id,
          destinationColumnId: targetData.payload.columnId,
          sourceColumnId: sourceData.payload.columnId,
          newOrder,
        });

        retryFlash(sourceData.payload.id, {
          getElement: (cardId) => get(cardId),
          isCrossColumnMove:
            sourceData.payload.columnId !== targetData.payload.columnId,
        });
      },
    });
  }, [columnId]);

  if (cards.error) throw cards.error;

  if (cards.isPending) return <div>Loading...</div>;

  if (cards.data.length === 0) {
    return <div className="flex flex-col gap-3">No cards</div>;
  }

  return (
    <div className="flex flex-col divide-y border-y">
      {cards.data
        .sort((a, b) => a.order - b.order)
        .map((card) => (
          <CardItem key={card.id} card={card} />
        ))}
    </div>
  );
}
