"use client";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { useEffect, useRef, useState } from "react";

import { useCardRegistry } from "../_store/card-registry";
import { type DragData, type DropData } from "../_types";
import { type Card } from "../_types";
import { DropIndicator } from "./drop-indicator";

interface CardItemProps {
  card: Card;
}

export function CardItem({ card }: CardItemProps) {
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const { register, unregister } = useCardRegistry();

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    const element = elementRef.current;

    console.log("Registering card", card.id);

    register(card.id, element);

    return combine(
      draggable({
        element,
        getInitialData: () =>
          ({
            type: "card",
            payload: card,
          }) satisfies DragData,
      }),
      dropTargetForElements({
        element,
        getData: ({ input }) =>
          attachClosestEdge(
            {
              type: "card",
              payload: card,
            } satisfies DropData,
            {
              element,
              input,
              allowedEdges: ["top", "bottom"],
            },
          ),
        onDrag: ({ self, source }) => {
          const data = source.data as unknown as DragData;
          if (data.payload.id === card.id) {
            return;
          }
          setClosestEdge(extractClosestEdge(self.data));
        },
        onDragEnter: ({ self, source }) => {
          const data = source.data as unknown as DragData;
          if (data.payload.id === card.id) {
            return;
          }
          setClosestEdge(extractClosestEdge(self.data));
        },
        onDragLeave: () => {
          setClosestEdge(null);
        },
        onDrop: () => {
          setClosestEdge(null);
        },
      }),
      () => {
        console.log("Unregistering card", card.id);
        unregister(card.id);
      },
    );
  }, [card]);

  return (
    <div ref={elementRef} className="relative border-x bg-secondary/20 p-4">
      {card.title}
      {closestEdge && <DropIndicator edge={closestEdge} gap={2} />}
    </div>
  );
}
