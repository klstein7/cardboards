"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { type Card } from "../../../../_types";
import { CardBase } from "./card-base";

interface CardItemProps {
  card: Card;
}

export function CardItem({ card }: CardItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: card.id,
      data: {
        type: "card",
        payload: card,
      },
      transition: {
        duration: 100,
        easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      aria-describedby={`${card.title}-card`}
    >
      <CardBase card={card} />
    </div>
  );
}
