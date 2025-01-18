// src/app/(project)/p/[projectId]/(board)/_components/card-item.tsx
"use client";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";

import { type Card } from "~/app/(project)/_types";
import { DropIndicator } from "~/components/ui/drop-indicator";
import { cn } from "~/lib/utils";

import { useBoardState } from "./board-state-provider";
import { CardBase } from "./card-base";

interface CardItemProps {
  card: Card;
  index: number;
  isCompleted: boolean;
  columnId: string;
}

export function CardItem({
  card,
  index,
  isCompleted,
  columnId,
}: CardItemProps) {
  const { activeCard, setActiveCard, registerCard, unregisterCard } =
    useBoardState();
  const cardElementRef = useRef<HTMLDivElement>(null);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  const [, setSelectedCardId] = useQueryState("cardId");

  useEffect(() => {
    const cardElement = cardElementRef.current;
    if (!cardElement) return;

    registerCard(card.id, cardElement);

    return combine(
      draggable({
        element: cardElement,
        getInitialData: () => ({
          type: "card",
          payload: card,
          index,
          columnId,
        }),
        onDragStart: () => {
          setActiveCard(card);
        },
        onDrop: () => {
          setActiveCard(null);
        },
      }),
      dropTargetForElements({
        element: cardElement,
        canDrop({ source }) {
          return source.data.type === "card";
        },
        getData: ({ input }) =>
          attachClosestEdge(
            {
              type: "card",
              payload: card,
              columnId,
            },
            {
              element: cardElement,
              input,
              allowedEdges: ["top", "bottom"],
            },
          ),
        onDrag: ({ source, self }) => {
          const sourceData = source.data as { payload: Card };
          if (sourceData.payload.id !== card.id) {
            const edge = extractClosestEdge(self.data);
            setClosestEdge(edge);
          }
        },
        onDragEnter: ({ source, self }) => {
          const sourceData = source.data as { payload: Card };
          if (sourceData.payload.id !== card.id) {
            const edge = extractClosestEdge(self.data);
            setClosestEdge(edge);
          }
        },
        onDragLeave: () => {
          setClosestEdge(null);
        },
        onDrop: () => {
          setClosestEdge(null);
        },
      }),
      () => {
        unregisterCard(card.id);
      },
    );
  }, [card, index, columnId, setActiveCard, registerCard, unregisterCard]);

  return (
    <div
      ref={cardElementRef}
      className={cn(
        "relative flex cursor-pointer select-none flex-col gap-2 p-1 sm:gap-3 sm:p-0",
        activeCard?.id === card.id && "opacity-50",
      )}
      onClick={() => setSelectedCardId(card.id.toString())}
    >
      <CardBase
        card={card}
        isDragging={activeCard?.id === card.id}
        isCompleted={isCompleted}
      />
      {closestEdge && <DropIndicator edge={closestEdge} gap={1} />}
    </div>
  );
}
