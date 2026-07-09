"use client";

import { type Card } from "~/app/(project)/_types";

import { CardBase } from "./card-base";

interface CardDragPreviewProps {
  card: Card;
  isCompleted: boolean;
  width: number;
}

export function CardDragPreview({
  card,
  isCompleted,
  width,
}: CardDragPreviewProps) {
  return (
    <div
      className="origin-center scale-[1.015] cursor-grabbing overflow-hidden border border-primary/35 bg-popover opacity-[0.98]"
      style={{ width }}
    >
      <CardBase
        card={card}
        isDragging={true}
        isCompleted={isCompleted}
        className="bg-popover"
      />
    </div>
  );
}
