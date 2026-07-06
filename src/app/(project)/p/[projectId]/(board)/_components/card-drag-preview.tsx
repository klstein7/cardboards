"use client";

import { type Card } from "~/app/(project)/_types";

import { CardBase } from "./card-base";

interface CardDragPreviewProps {
  card: Card;
  isCompleted: boolean;
}

export function CardDragPreview({ card, isCompleted }: CardDragPreviewProps) {
  return (
    <div className="w-[300px] max-w-[300px] rotate-1 transform opacity-95">
      <CardBase
        card={card}
        isDragging={true}
        isCompleted={isCompleted}
        className="border border-primary/40 bg-popover p-3 pl-4"
      />
    </div>
  );
}
