"use client";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { attachClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { type Column } from "~/app/(project)/_types";
import { Button } from "~/components/ui/button";
import { useCards, useMoveCard } from "~/lib/hooks";
import { cn } from "~/lib/utils";

import { CardList } from "./card-list";
import { CreateCardDialog } from "./create-card-dialog";

interface ColumnItemProps {
  column: Column;
}

export function ColumnItem({ column }: ColumnItemProps) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [isDropping, setIsDropping] = useState(false);

  const cards = useCards(column.id);
  const moveCardMutation = useMoveCard();

  useEffect(() => {
    const columnElement = columnRef.current;
    if (!columnElement) return;

    return combine(
      dropTargetForElements({
        element: columnElement,
        canDrop({ source }) {
          return source.data.type === "card";
        },
        getData({ input }) {
          return attachClosestEdge(
            {
              type: "column",
              payload: column,
              columnId: column.id,
            },
            {
              element: columnElement,
              input,
              allowedEdges: ["top", "bottom"],
            },
          );
        },
        onDragEnter() {
          setIsDropping(true);
        },
        onDragLeave() {
          setIsDropping(false);
        },
        onDrop() {
          setIsDropping(false);
        },
      }),
    );
  }, [cards.data?.length, column, moveCardMutation]);

  if (cards.isError) throw cards.error;

  return (
    <div
      ref={columnRef}
      className={cn(
        "flex flex-1 flex-col gap-3 rounded-md border bg-secondary/20 p-4",
        isDropping &&
          "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
      aria-describedby={`${column.name}-column`}
    >
      <span className="text-sm font-medium uppercase text-muted-foreground">
        {column.name}
      </span>
      <CardList columnId={column.id} isCompleted={column.isCompleted} />
      <CreateCardDialog
        trigger={
          <Button variant="outline" className="bg-transparent">
            <Plus className="h-4 w-4" />
            <span>Card</span>
          </Button>
        }
        columnId={column.id}
      />
    </div>
  );
}
