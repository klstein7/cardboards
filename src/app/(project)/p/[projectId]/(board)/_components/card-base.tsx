"use client";

import { useActiveCard } from "~/lib/hooks/utils/use-active-card";
import { cn } from "~/lib/utils";

import { type Card } from "../../../../_types";

interface CardBaseProps {
  card: Card;
  className?: string;
  isDragging?: boolean;
}

export function CardBase({ card, className, isDragging }: CardBaseProps) {
  const { activeCard } = useActiveCard();

  return (
    <div
      className={cn(
        "relative rounded border bg-secondary/20 p-4",
        activeCard?.id === card.id && !isDragging && "opacity-50",
        className,
      )}
    >
      {card.title}
    </div>
  );
}
