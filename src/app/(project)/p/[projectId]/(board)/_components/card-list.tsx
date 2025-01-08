"use client";

import { SortableContext } from "@dnd-kit/sortable";

import { useCards, useMoveCard } from "~/lib/hooks";

import { CardItem } from "./card-item";

interface CardListProps {
  columnId: string;
}

export function CardList({ columnId }: CardListProps) {
  const cards = useCards(columnId);

  if (cards.error) throw cards.error;

  if (cards.isPending) return <div>Loading...</div>;

  if (cards.data.length === 0) {
    return <div className="flex flex-col gap-3">No cards</div>;
  }

  return (
    <SortableContext items={cards.data.map((card) => card.id)}>
      <div className="flex flex-col gap-3">
        {cards.data
          .sort((a, b) => a.order - b.order)
          .map((card) => (
            <CardItem key={card.id} card={card} />
          ))}
      </div>
    </SortableContext>
  );
}
