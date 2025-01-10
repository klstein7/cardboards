"use client";

import {
  closestCenter,
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { useColumns, useMoveCard } from "~/lib/hooks";
import { useActiveCard } from "~/lib/hooks/utils/use-active-card";

import { type Card, type DragData, type DropData } from "../../../../_types";
import { CardBase } from "./card-base";
import { ColumnItem } from "./column-item";

interface ColumnListProps {
  boardId: string;
}

export function ColumnList({ boardId }: ColumnListProps) {
  const columns = useColumns(boardId);

  const queryClient = useQueryClient();

  const moveCardMutation = useMoveCard();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const { activeCard, setActiveCard } = useActiveCard();

  if (columns.isError) throw columns.error;

  if (columns.isPending) return <div>Loading...</div>;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={({ active }) => {
        const activeData = active.data.current as DragData;
        setActiveCard(activeData.payload);
      }}
      onDragOver={({ active, over }) => {
        if (!over) return;

        const activeData = active.data.current as DragData;
        const overData = over.data.current as DropData;

        if (activeData.type !== "card") return;

        const overColumnId =
          overData.type === "card"
            ? overData.payload.columnId
            : overData.payload.id;

        if (activeData.payload.columnId === overColumnId) return;

        console.log(
          `DragOver: Moving card ${activeData.payload.id} from column ${activeData.payload.columnId} to ${overColumnId}`,
        );

        queryClient.setQueryData(
          ["cards", activeData.payload.columnId],
          (old: Card[] = []) => {
            const newCards = old
              .filter((card) => card.id !== activeData.payload.id)
              .map((card, index) => ({
                ...card,
                order: index,
              }));
            console.log(`Source column cards count: ${newCards.length}`);
            return newCards;
          },
        );

        queryClient.setQueryData(
          ["cards", overColumnId],
          (old: Card[] = []) => {
            const newCards = [...old, activeData.payload].map(
              (card, index) => ({
                ...card,
                columnId: overColumnId,
                order: index,
              }),
            );
            console.log(`Destination column cards count: ${newCards.length}`);
            return newCards;
          },
        );
      }}
      onDragEnd={({ active, over }) => {
        if (!over) return;

        const activeData = active.data.current as DragData;
        const overData = over.data.current as DropData;

        if (activeData.type !== "card") return;

        const overColumnId =
          overData.type === "card"
            ? overData.payload.columnId
            : overData.payload.id;

        const destinationCards =
          queryClient.getQueryData<Card[]>(["cards", overColumnId]) ?? [];

        console.log(
          `Current cards in column: ${destinationCards.map((c) => c.id).join(", ")}`,
        );

        let newOrder;
        if (overData.type === "card") {
          newOrder = destinationCards.findIndex(
            (card) => card.id === overData.payload.id,
          );
          console.log(
            `Dropping on card ${overData.payload.id} at position ${newOrder}`,
          );
        } else {
          newOrder = destinationCards.length - 1;
          console.log(`Dropping at end of column, position ${newOrder}`);
        }

        console.log(
          `DragEnd: Card ${activeData.payload.id} final position: ${newOrder}`,
        );
        console.log(
          `Moving from ${activeData.payload.columnId} to ${overColumnId}`,
        );

        moveCardMutation.mutate({
          cardId: activeData.payload.id,
          sourceColumnId: activeData.payload.columnId,
          destinationColumnId: overColumnId,
          newOrder,
        });

        setActiveCard(null);
      }}
    >
      <div className="flex items-start gap-6">
        {columns.data.map((column) => (
          <ColumnItem key={column.id} column={column} />
        ))}
      </div>
      {activeCard && (
        <DragOverlay>
          <CardBase card={activeCard} isDragging />
        </DragOverlay>
      )}
    </DndContext>
  );
}
