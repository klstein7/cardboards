"use client";

import { type api } from "~/server/api";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useRef, useState } from "react";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { type DragData } from "../_types";
import { DropIndicator } from "./drop-indicator";
import { useCardRegistry } from "../_store/card-registry";

interface CardItemProps {
  card: Awaited<ReturnType<typeof api.card.list>>[number];
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
            } satisfies DragData,
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
