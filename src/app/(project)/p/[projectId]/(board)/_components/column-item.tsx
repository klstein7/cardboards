"use client";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { attachClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { Ellipsis, Pencil, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { type Column } from "~/app/(project)/_types";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useCards, useCurrentBoard, useMoveCard } from "~/lib/hooks";
import { cn } from "~/lib/utils";

import { CardList } from "./card-list";
import { CreateCardDialog } from "./create-card-dialog";
import { EditColumnDialog } from "./edit-column-dialog";

interface ColumnItemProps {
  column: Column;
}

export function ColumnItem({ column }: ColumnItemProps) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [isDropping, setIsDropping] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const cards = useCards(column.id);
  const moveCardMutation = useMoveCard();

  const board = useCurrentBoard();

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
        "flex h-full w-full min-w-[350px] flex-col gap-3 overflow-y-auto rounded-md border bg-secondary/20 p-4 transition-colors",
        isDropping && "ring-2 ring-offset-2 ring-offset-background",
      )}
      style={
        isDropping
          ? ({
              boxShadow: `0 0 0 2px ${board.data?.color ?? "#000000"}, 0 0 0 4px var(--background)`,
              borderColor: board.data?.color ?? "#000000",
              backgroundColor: `${board.data?.color}10`,
            } as React.CSSProperties)
          : undefined
      }
      aria-describedby={`${column.name}-column`}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium uppercase text-muted-foreground">
          {column.name}
        </span>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Ellipsis className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end">
            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
              <div className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                <span>Edit</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <EditColumnDialog
          column={column}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      </div>
      <CardList columnId={column.id} isCompleted={column.isCompleted} />
      {!column.isCompleted && (
        <CreateCardDialog
          trigger={
            <Button variant="outline" className="bg-transparent">
              <Plus className="h-4 w-4" />
              <span>Card</span>
            </Button>
          }
          columnId={column.id}
        />
      )}
    </div>
  );
}
