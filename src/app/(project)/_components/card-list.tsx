"use client";

import { useCards, useMoveCard } from "~/lib/hooks";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { CardItem } from "./card-item";
import { useEffect } from "react";
import { type DropData } from "../_types";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { useTaskRegistry } from "../_store/task-registry";
import { retryFlash } from "~/lib/utils";

interface CardListProps {
  columnId: string;
}

export function CardList({ columnId }: CardListProps) {
  const cards = useCards(columnId);

  const moveCardMutation = useMoveCard();

  const { get } = useTaskRegistry();

  useEffect(() => {
    return monitorForElements({
      onDrop: ({ source, location }) => {
        const target = location.current.dropTargets[0];

        if (!target) return;

        const sourceData = source.data as unknown as DropData;
        const targetData = target.data as unknown as DropData;

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
          destinationColumnId:
            targetData.type === "column"
              ? targetData.payload.id
              : targetData.payload.columnId,
          newOrder,
        });

        retryFlash(sourceData.payload.id, {
          getElement: (cardId) => get(cardId),
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
      {cards.data.map((card) => (
        <CardItem key={card.id} card={card} />
      ))}
    </div>
  );
}
