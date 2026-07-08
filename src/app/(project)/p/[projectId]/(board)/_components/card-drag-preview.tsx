"use client";

import { type Card } from "~/app/(project)/_types";

import { CardBase } from "./card-base";

interface CardDragPreviewProps {
  card: Card;
  isCompleted: boolean;
}

export function CardDragPreview({ card, isCompleted }: CardDragPreviewProps) {
  return (
    <div className="w-[280px] max-w-[280px] rotate-1 transform opacity-95">
      <CardBase
        card={card}
        isDragging={true}
        isCompleted={isCompleted}
        className="border border-primary/40 bg-popover"
      />
    </div>
  );
}
