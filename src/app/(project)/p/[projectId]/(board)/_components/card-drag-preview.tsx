"use client";

import { type Card } from "~/app/(project)/_types";

import { CardBase } from "./card-base";

interface CardDragPreviewProps {
  card: Card;
  isCompleted: boolean;
}

export function CardDragPreview({ card, isCompleted }: CardDragPreviewProps) {
  return (
    <div className="w-[325px] max-w-[325px] rotate-1 transform opacity-95 shadow-xl">
      <CardBase
        card={card}
        isDragging={true}
        isCompleted={isCompleted}
        className="border-2 border-primary/20"
      />
    </div>
  );
}
